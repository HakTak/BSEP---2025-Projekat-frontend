import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { hasRole } from '../utils/auth';
import CertificateCard from '../components/CertificateCard';

const CertificateIssuePage = () => {
    const [formData, setFormData] = useState({
        commonName: '', organization: '', organizationalUnit: '',
        country: '', email: '', validFrom: '', validTo: '',
        issuerSerialNumber: '', subjectUserId: '', ca: false, keyUsage: []
    });
    const [isRootIssue, setIsRootIssue] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [issuers, setIssuers] = useState([]);
    const [selectedIssuerSerial, setSelectedIssuerSerial] = useState(null);
    const scrollRef = useRef(null);

    const keyUsageOptions = [
        { id: 0, label: "Digital Signature" }, { id: 1, label: "Non Repudiation" },
        { id: 2, label: "Key Encipherment" }, { id: 3, label: "Data Encipherment" },
        { id: 4, label: "Key Agreement" }, { id: 5, label: "Key Cert Sign" },
        { id: 6, label: "CRL Sign" }, { id: 7, label: "Encipher Only" }, { id: 8, label: "Decipher Only" }
    ];

    useEffect(() => {
        const loadIssuers = async () => {
            try {
                // Korisnikovi sertifikati - isti endpoint kao /certificates
                const response = await api.get('/certificates/getAll');
                const valid = response.data.filter(c =>
                    (c.type === 'INTERMEDIATE' || c.type === 'ROOT') && !c.revoked && new Date(c.validTo) > new Date()
                );
                setIssuers(valid);
            } catch (err) {
                console.error("Greška pri učitavanju izdavaoca", err);
            }
        };
        if (!isRootIssue) loadIssuers();
    }, [isRootIssue]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e) => { e.preventDefault(); el.scrollLeft += e.deltaY; };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleKeyUsageChange = (id) => {
        setFormData(prev => ({
            ...prev,
            keyUsage: prev.keyUsage.includes(id)
                ? prev.keyUsage.filter(x => x !== id)
                : [...prev.keyUsage, id]
        }));
    };

    const handleRootToggle = (e) => {
        setIsRootIssue(e.target.checked);
        setSelectedIssuerSerial(null);
        if (e.target.checked) setFormData(prev => ({ ...prev, issuerSerialNumber: '', ca: true }));
    };

    const handleSelectIssuer = (serial) => {
        setSelectedIssuerSerial(serial);
        setFormData(prev => ({ ...prev, issuerSerialNumber: serial }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const requestData = {
            ...formData,
            validFrom: new Date(formData.validFrom).toISOString(),
            validTo: new Date(formData.validTo).toISOString(),
            subjectUserId: parseInt(formData.subjectUserId),
            issuerSerialNumber: isRootIssue ? null : formData.issuerSerialNumber
        };

        const endpoint = isRootIssue ? '/certificates/issue-root' : '/certificates/issue-intermediate';

        try {
            const response = await api.post(endpoint, requestData);
            setMessage({ type: 'success', text: `Sertifikat uspešno izdat! SN: ${response.data.serialNumber}` });
        } catch (error) {
            const errorMsg = error.response?.data || "Greška pri izdavanju.";
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Izdavanje Sertifikata</h2>

            {message.text && (
                <div style={{
                    ...styles.messageBox,
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                {hasRole('ADMIN') && (
                    <label style={styles.checkboxLabel}>
                        <input type="checkbox" checked={isRootIssue} onChange={handleRootToggle} />
                        <strong> Izdaj kao ROOT sertifikat (Self-signed)</strong>
                    </label>
                )}

                <div style={styles.sectionTitle}>Podaci o subjektu</div>
                <div style={styles.grid}>
                    <input style={styles.input} name="commonName" placeholder="Common Name (CN)" value={formData.commonName} onChange={handleChange} required />
                    <input style={styles.input} name="organization" placeholder="Organization (O)" value={formData.organization} onChange={handleChange} required />
                    <input style={styles.input} name="organizationalUnit" placeholder="Org. Unit (OU)" value={formData.organizationalUnit} onChange={handleChange} required />
                    <input style={styles.input} name="country" placeholder="Country (npr. RS)" value={formData.country} onChange={handleChange} maxLength={2} required />
                    <input style={styles.input} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                </div>

                <div style={styles.sectionTitle}>Validnost</div>
                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Važi od:</label>
                        <input style={styles.input} name="validFrom" type="datetime-local" value={formData.validFrom} onChange={handleChange} required />
                    </div>
                    <div>
                        <label style={styles.label}>Važi do:</label>
                        <input style={styles.input} name="validTo" type="datetime-local" value={formData.validTo} onChange={handleChange} required />
                    </div>
                </div>

                {!isRootIssue && (
                    <>
                        <div style={styles.sectionTitle}>Izaberi Izdavaoca</div>
                        <div ref={scrollRef} style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px' }}>
                            {issuers.length === 0
                                ? <p style={{ color: '#888' }}>Nema dostupnih CA sertifikata.</p>
                                : issuers.map(cert => (
                                    <CertificateCard
                                        key={cert.serialNumber}
                                        cert={cert}
                                        selected={selectedIssuerSerial === cert.serialNumber}
                                        onClick={() => handleSelectIssuer(cert.serialNumber)}
                                        showStatus={true}
                                    />
                                ))
                            }
                        </div>
                        <div style={styles.sectionTitle}>Konfiguracija</div>
                        <label style={styles.checkboxLabel}>
                            <input type="checkbox" name="ca" checked={formData.ca} onChange={handleChange} />
                            Check Intermediate certificate
                        </label>
                    </>
                )}
                <label style={styles.label}>Key Usage:</label>
                <div style={styles.keyUsageGrid}>
                    {keyUsageOptions.map(option => (
                        <label key={option.id} style={styles.checkboxLabel}>
                            <input type="checkbox" checked={formData.keyUsage.includes(option.id)} onChange={() => handleKeyUsageChange(option.id)} />
                            {option.label}
                        </label>
                    ))}
                </div>

                <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                    {loading ? 'Izdavanje...' : (isRootIssue ? 'Izdaj ROOT' : 'Izdaj Sertifikat')}
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
    keyUsageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#555' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '5px', marginTop: '10px', color: '#3498db', fontWeight: 'bold' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' },
    button: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
    messageBox: { padding: '15px', borderRadius: '4px', marginBottom: '20px' }
};

export default CertificateIssuePage;