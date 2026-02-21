import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../utils/auth';

const RegisterCAPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [issuers, setIssuers] = useState([]); // Lista sertifikata koji mogu da potpišu
    const [message, setMessage] = useState({ type: '', text: '' });

    // State za CreateCARequest (Podaci o korisniku)
    const [userData, setUserData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        organization: ''
    });

    // State za CertificateIssueDTO (Podaci o sertifikatu)
    const [certData, setCertData] = useState({
        commonName: '',
        organization: '',
        organizationalUnit: '',
        country: '',
        email: '',
        validFrom: '',
        validTo: '',
        issuerSerialNumber: ''
    });
    // Učitavanje validnih izdavaoca (CA sertifikata) pri startu
    useEffect(() => {
        const fetchIssuers = async () => {
            try {
                if (!hasRole('ADMIN')) {
                    navigate("/")
                    return;
                }
                // Pretpostavka: imaš endpoint koji vraća sve sertifikate
                const response = await api.get('/certificates/getAll');
                // Filtriramo samo ROOT i INTERMEDIATE jer samo oni mogu da izdaju nove
                const caCerts = response.data.filter(c => c.type === 'ROOT' || c.type === 'INTERMEDIATE');

                // Filtriramo samo one koji nisu povučeni i nisu istekli
                const validCaCerts = caCerts.filter(c => !c.isRevoked); // Dodaj i proveru datuma ako treba

                setIssuers(validCaCerts);
                // Default: selektuj prvog izdavaoca ako postoji
                if (validCaCerts.length > 0) {
                    setCertData(prev => ({ ...prev, issuerSerialNumber: validCaCerts[0].serialNumber }));
                }
            } catch (error) {
                console.error("Greška pri učitavanju izdavaoca", error);
            }
        };
        fetchIssuers();
    }, [navigate]);

    // Handler za User podatke (uz automatsko popunjavanje cert podataka)
    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));

        // Automatska sinhronizacija: Ako menjaš org/email u user delu, kopiraj u cert deo
        if (name === 'organization') {
            setCertData(prev => ({ ...prev, organization: value }));
        }
        if (name === 'email') {
            setCertData(prev => ({ ...prev, email: value }));
        }
    };

    // Handler za Cert podatke
    const handleCertChange = (e) => {
        const { name, value } = e.target;
        setCertData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validacija
        if (!certData.issuerSerialNumber) {
            setMessage({ type: 'error', text: 'Morate izabrati izdavaoca (Issuer)!' });
            setLoading(false);
            return;
        }

        // Priprema Composite Objekta
        const compositeRequest = {
            userRequest: {
                ...userData
            },
            certificateRequest: {
                ...certData,
                // Konverzija datuma u ISO format za ZonedDateTime
                validFrom: new Date(certData.validFrom).toISOString(),
                validTo: new Date(certData.validTo).toISOString()
            }
        };

        try {
            await api.post('/auth/register-ca', compositeRequest);
            setMessage({ type: 'success', text: 'Novi CA entitet uspešno registrovan i sertifikat izdat!' });

            // Opciono: Reset forme ili redirekcija
            setTimeout(() => navigate('/certificates'), 2000);

        } catch (error) {
            const errorMsg = error.response?.data || "Došlo je do greške.";
            setMessage({ type: 'error', text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Registracija Novog CA Entiteta</h2>
            <p style={styles.subHeader}>Ova akcija kreira novi nalog i izdaje INTERMEDIATE sertifikat.</p>

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

                {/* --- SEKCIJA 1: PODACI O KORISNIKU (CreateCARequest) --- */}
                <div style={styles.sectionTitle}>1. Podaci o novom CA Korisniku</div>
                <div style={styles.grid}>
                    <input
                        style={styles.input}
                        name="email"
                        type="email"
                        placeholder="Email Adresa"
                        value={userData.email}
                        onChange={handleUserChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="organization"
                        placeholder="Naziv Organizacije"
                        value={userData.organization}
                        onChange={handleUserChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="firstName"
                        placeholder="Ime"
                        value={userData.firstName}
                        onChange={handleUserChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="lastName"
                        placeholder="Prezime"
                        value={userData.lastName}
                        onChange={handleUserChange}
                        required
                    />
                </div>

                {/* --- SEKCIJA 2: PODACI O SERTIFIKATU (CertificateIssueDTO) --- */}
                <div style={styles.sectionTitle}>2. Detalji Sertifikata</div>

                {/* Odabir Izdavaoca */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={styles.label}>Ko potpisuje ovaj sertifikat (Issuer)?</label>
                    <select
                        style={styles.select}
                        name="issuerSerialNumber"
                        value={certData.issuerSerialNumber}
                        onChange={handleCertChange}
                        required
                    >
                        <option value="">-- Izaberite CA --</option>
                        {issuers.map(issuer => (
                            <option key={issuer.serialNumber} value={issuer.serialNumber}>
                                {issuer.commonName} ({issuer.serialNumber}) - {issuer.type}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={styles.grid}>
                    <input
                        style={styles.input}
                        name="commonName"
                        placeholder="Common Name (npr. MojaFirma CA)"
                        value={certData.commonName}
                        onChange={handleCertChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="organization"
                        placeholder="Organization (O)"
                        value={certData.organization} // Sinhronizovano sa user delom
                        onChange={handleCertChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="organizationalUnit"
                        placeholder="Org. Unit (OU)"
                        value={certData.organizationalUnit}
                        onChange={handleCertChange}
                        required
                    />
                    <input
                        style={styles.input}
                        name="country"
                        placeholder="Country Code (npr. RS)"
                        value={certData.country}
                        onChange={handleCertChange}
                        maxLength={2}
                        required
                    />
                </div>

                {/* Datumi */}
                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Važi od:</label>
                        <input
                            style={styles.input}
                            name="validFrom"
                            type="datetime-local"
                            value={certData.validFrom}
                            onChange={handleCertChange}
                            required
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Važi do:</label>
                        <input
                            style={styles.input}
                            name="validTo"
                            type="datetime-local"
                            value={certData.validTo}
                            onChange={handleCertChange}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                >
                    {loading ? 'Registracija u toku...' : 'Registruj CA i Izdaj Sertifikat'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: { maxWidth: '800px', margin: '30px auto', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderRadius: '10px', backgroundColor: '#fff' },
    header: { textAlign: 'center', color: '#2c3e50', marginBottom: '5px' },
    subHeader: { textAlign: 'center', color: '#7f8c8d', marginBottom: '25px', fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    sectionTitle: { borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '10px', color: '#3498db', fontWeight: 'bold', fontSize: '18px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    input: { padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    select: { padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', width: '100%', backgroundColor: 'white' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#34495e' },
    button: { padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px', transition: 'background 0.3s' },
    messageBox: { padding: '15px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }
};

export default RegisterCAPage;