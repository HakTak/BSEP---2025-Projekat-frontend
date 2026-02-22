import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Tvoj axios instance
import { hasRole } from '../utils/auth'; // Tvoj auth utility
import { useNavigate } from 'react-router-dom';

const CertificateIssuePage = () => {
    const navigate = useNavigate();
    // const isAdmin = hasRole('ADMIN');

    // State za formu
    const [formData, setFormData] = useState({
        commonName: '',
        organization: '',
        organizationalUnit: '',
        country: '',
        email: '',
        validFrom: '',
        validTo: '',
        issuerSerialNumber: '',
        subjectUserId: '', // Ovo bi idealno bio dropdown korisnika
        ca: false,
        keyUsage: [] // Lista integera
    });

    // State za logiku prikaza
    const [isRootIssue, setIsRootIssue] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State za učitavanje dostupnih šablona (ako koristiš)
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');

    // KeyUsage mapiranje (BouncyCastle standardni int indeksi, prilagodi ako tvoj backend koristi druge)
    const keyUsageOptions = [
    { id: 0, label: "Digital Signature",  value: 128 },
    { id: 1, label: "Non Repudiation",    value: 64  },
    { id: 2, label: "Key Encipherment",   value: 32  },
    { id: 3, label: "Data Encipherment",  value: 16  },
    { id: 4, label: "Key Agreement",      value: 8   },
    { id: 5, label: "Key Cert Sign",      value: 4   },
    { id: 6, label: "CRL Sign",           value: 2   },
    { id: 7, label: "Encipher Only",      value: 1   },
    { id: 8, label: "Decipher Only",      value: 32768 }
];


    useEffect(() => {
    const serial = formData.issuerSerialNumber.trim();
    if (!serial || isRootIssue) {
        setAvailableTemplates([]);
        setSelectedTemplateId('');
        return;
    }
    api.get(`/templates/issuer/${serial}`)
        .then(res => setAvailableTemplates(res.data))
        .catch(() => setAvailableTemplates([]));
    }, [formData.issuerSerialNumber, isRootIssue]);

    // Handler za tekstualna polja
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handler za KeyUsage checkbox-ove
    const handleKeyUsageChange = (usageId) => {
        setFormData(prev => {
            const currentUsages = prev.keyUsage;
            if (currentUsages.includes(usageId)) {
                return { ...prev, keyUsage: currentUsages.filter(id => id !== usageId) };
            } else {
                return { ...prev, keyUsage: [...currentUsages, usageId] };
            }
        });
    };
    
    // Handler za odabir šablona (ako koristiš)
    const handleTemplateSelect = (e) => {
    const id = e.target.value;
    setSelectedTemplateId(id);

    if (!id) {
        // Korisnik odabrao "bez šablona" – resetuj keyUsage
        setFormData(prev => ({ ...prev, templateId: null, keyUsage: [] }));
        return;
    }

    const template = availableTemplates.find(t => t.id === parseInt(id));
    if (!template) return;

    // Raspakiraj keyUsage int u listu bitova
    const checkedIds = keyUsageOptions
        .filter(opt => (template.keyUsage & opt.value) !== 0)
        .map(opt => opt.id);
    setFormData(prev => ({
        ...prev,
        templateId: template.id,
        keyUsage: checkedIds
    }));
    };

    // Handler za "Root" toggle (samo za admine)
    const handleRootToggle = (e) => {
        const checked = e.target.checked;
        setIsRootIssue(checked);
        // Ako je root, issuer nije potreban, i obično je CA
        if (checked) {
            setFormData(prev => ({ ...prev, issuerSerialNumber: '', cA: true }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Priprema datuma za Java ZonedDateTime (dodajemo vremensku zonu ako fali)
        // HTML datetime-local vraća "yyyy-MM-ddThh:mm". Java ZonedDateTime traži i zonu.
        // Najjednostavnije je dodati ":00Z" za UTC ili poslati ISO string.
        const requestData = {
            ...formData,
            templateId: formData.templateId || null,
            validFrom: new Date(formData.validFrom).toISOString(),
            validTo: new Date(formData.validTo).toISOString(),
            subjectUserId: parseInt(formData.subjectUserId), // Backend očekuje Long
            // Ako je root, ignorišemo issuerSerialNumber
            issuerSerialNumber: isRootIssue ? null : formData.issuerSerialNumber
        };

        const endpoint = isRootIssue ? '/certificates/issue-root' : '/certificates/issue-intermediate';

        try {
            console.log(requestData)
            const response = await api.post(endpoint, requestData);
            setMessage({
                type: 'success',
                text: `Sertifikat uspešno izdat! Serial Number: ${response.data.serialNumber}`
            });
            // Reset forme (opciono)
            // setFormData({...});
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data || "Došlo je do greške prilikom izdavanja.";
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Izdavanje Sertifikata</h2>

            {/* Prikaz poruka o uspehu/grešci */}
            {message.text && (
                <div style={{
                    ...styles.messageBox,
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>

                {/* --- SEKCIJA: TIP IZDAVANJA --- */}
                {hasRole('ADMIN') && (
                    <div style={styles.row}>
                        <label style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isRootIssue}
                                onChange={handleRootToggle}
                            />
                            <strong> Izdaj kao ROOT sertifikat (Self-signed)</strong>
                        </label>
                    </div>
                )}

                {/* --- SEKCIJA: PODACI O SUBJEKTU --- */}
                <div style={styles.sectionTitle}>Podaci o subjektu</div>

                <div style={styles.grid}>
                    <input
                        style={styles.input}
                        name="commonName"
                        placeholder="Common Name (CN)"
                        value={formData.commonName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="organization"
                        placeholder="Organization (O)"
                        value={formData.organization}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="organizationalUnit"
                        placeholder="Org. Unit (OU)"
                        value={formData.organizationalUnit}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="country"
                        placeholder="Country Code (npr. RS)"
                        value={formData.country}
                        onChange={handleChange}
                        maxLength={2}
                        required
                    />
                    <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="Email adresa"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="subjectUserId"
                        type="number"
                        placeholder="ID Korisnika (User ID)"
                        value={formData.subjectUserId}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* --- SEKCIJA: VALIDNOST I ISSUER --- */}
                <div style={styles.sectionTitle}>Validnost i Izdavalac</div>

                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Važi od:</label>
                        <input
                            style={styles.input}
                            name="validFrom"
                            type="datetime-local"
                            value={formData.validFrom}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Važi do:</label>
                        <input
                            style={styles.input}
                            name="validTo"
                            type="datetime-local"
                            value={formData.validTo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Issuer se unosi samo ako NIJE root */}
                {!isRootIssue && (
                    <div style={{ marginTop: '15px' }}>
                        <label style={styles.label}>Serijski broj izdavaoca (Issuer Serial Number):</label>
                        <input
                            style={{ ...styles.input, width: '100%' }}
                            name="issuerSerialNumber"
                            placeholder="Unesite serijski broj CA sertifikata koji potpisuje"
                            value={formData.issuerSerialNumber}
                            onChange={handleChange}
                            required={!isRootIssue}
                        />
                    </div>
                )}
                {/* Ako nije root, možemo ponuditi šablone vezane za tog izdavaoca*/}
                {!isRootIssue && availableTemplates.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <label style={styles.label}>Šablon (opciono):</label>
                    <select
                        style={{ ...styles.input, width: '100%' }}
                        value={selectedTemplateId}
                        onChange={handleTemplateSelect}
                    >
                        <option value="">— Bez šablona —</option>
                        {availableTemplates.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name} (max {t.ttlDays} dana, CN: {t.cnRegex || 'bez validacije'})
                            </option>
                        ))}
                    </select>
                    {selectedTemplateId && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#888' }}>
                            ℹ️ Key Usage i TTL su preuzeti iz šablona. CN mora odgovarati regex-u.
                        </div>
                    )}
                </div>
            )}

                {/* --- SEKCIJA: KONFIGURACIJA SERTIFIKATA --- */}
                <div style={styles.sectionTitle}>Konfiguracija</div>

                <div style={styles.row}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="ca"
                            checked={formData.ca}
                            onChange={handleChange}
                        />
                        Ovaj sertifikat je CA (Certificate Authority)
                    </label>
                </div>

                <label style={styles.label}>Key Usage:</label>
                <div style={styles.keyUsageGrid}>
                    {keyUsageOptions.map(option => (
                        <label key={option.id} style={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.keyUsage.includes(option.id)}
                                onChange={() => handleKeyUsageChange(option.id)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <button
                    type="submit"
                    style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                >
                    {loading ? 'Izdavanje u toku...' : (isRootIssue ? 'Izdaj ROOT Sertifikat' : 'Izdaj Sertifikat')}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '30px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff' },
    header: { textAlign: 'center', color: '#2c3e50', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    keyUsageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '5px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#555' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '5px', marginTop: '15px', marginBottom: '10px', color: '#3498db', fontWeight: 'bold' },
    row: { display: 'flex', alignItems: 'center' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' },
    button: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '20px' },
    messageBox: { padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid transparent' }
};

export default CertificateIssuePage;