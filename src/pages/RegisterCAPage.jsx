import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import CertificateCard from '../components/CertificateCard';

const RegisterCAPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [issuers, setIssuers] = useState([]);
    const [selectedIssuerSerial, setSelectedIssuerSerial] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const scrollRef = useRef(null);

    const [userData, setUserData] = useState({ email: '', firstName: '', lastName: '', organization: '' });
    const [certData, setCertData] = useState({
        commonName: '', organization: '', organizationalUnit: '',
        country: '', email: '', validFrom: '', validTo: '', issuerSerialNumber: ''
    });

    useEffect(() => {
        const fetchIssuers = async () => {
            try {
                // Admin vidi sve CA sertifikate
                const response = await api.get('/certificates/getAll');
                const valid = response.data.filter(c =>
                    (c.type === 'INTERMEDIATE') && !c.revoked && new Date(c.validTo) > new Date()
                );
                setIssuers(valid);
            } catch (error) {
                console.error("Greška pri učitavanju izdavaoca", error);
            }
        };
        fetchIssuers();

        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e) => { e.preventDefault(); el.scrollLeft += e.deltaY; };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
        if (name === 'organization') setCertData(prev => ({ ...prev, organization: value }));
        if (name === 'email') setCertData(prev => ({ ...prev, email: value }));
    };

    const handleCertChange = (e) => {
        const { name, value } = e.target;
        setCertData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectIssuer = (serial) => {
        setSelectedIssuerSerial(serial);
        setCertData(prev => ({ ...prev, issuerSerialNumber: serial }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIssuerSerial) {
            setMessage({ type: 'error', text: 'Morate izabrati izdavaoca!' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/auth/register-ca', {
                userRequest: { ...userData },
                certificateRequest: {
                    ...certData,
                    validFrom: new Date(certData.validFrom).toISOString(),
                    validTo: new Date(certData.validTo).toISOString()
                }
            });
            setMessage({ type: 'success', text: 'CA entitet uspešno registrovan!' });
            setTimeout(() => navigate('/certificates'), 2000);
        } catch (error) {
            const errorMsg = error.response?.data || "Greška.";
            setMessage({ type: 'error', text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Registracija Novog CA Entiteta</h2>
            <p style={styles.subHeader}>Kreira novi nalog i izdaje INTERMEDIATE sertifikat.</p>

            {message.text && (
                <div style={{
                    ...styles.messageBox,
                    backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                    color: message.type === 'success' ? '#155724' : '#721c24'
                }}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.sectionTitle}>1. Podaci o novom CA Korisniku</div>
                <div style={styles.grid}>
                    <input style={styles.input} name="email" type="email" placeholder="Email" value={userData.email} onChange={handleUserChange} required />
                    <input style={styles.input} name="organization" placeholder="Organizacija" value={userData.organization} onChange={handleUserChange} required />
                    <input style={styles.input} name="firstName" placeholder="Ime" value={userData.firstName} onChange={handleUserChange} required />
                    <input style={styles.input} name="lastName" placeholder="Prezime" value={userData.lastName} onChange={handleUserChange} required />
                </div>

                <div style={styles.sectionTitle}>2. Izaberi Izdavaoca</div>
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

                <div style={styles.sectionTitle}>3. Detalji Sertifikata</div>
                <div style={styles.grid}>
                    <input style={styles.input} name="commonName" placeholder="Common Name" value={certData.commonName} onChange={handleCertChange} required />
                    <input style={styles.input} name="organization" placeholder="Organization" value={certData.organization} onChange={handleCertChange} required />
                    <input style={styles.input} name="organizationalUnit" placeholder="Org. Unit (OU)" value={certData.organizationalUnit} onChange={handleCertChange} required />
                    <input style={styles.input} name="country" placeholder="Country (npr. RS)" value={certData.country} onChange={handleCertChange} maxLength={2} required />
                </div>

                <div style={styles.grid}>
                    <div>
                        <label style={styles.label}>Važi od:</label>
                        <input style={styles.input} name="validFrom" type="datetime-local" value={certData.validFrom} onChange={handleCertChange} required />
                    </div>
                    <div>
                        <label style={styles.label}>Važi do:</label>
                        <input style={styles.input} name="validTo" type="datetime-local" value={certData.validTo} onChange={handleCertChange} required />
                    </div>
                </div>

                <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                    {loading ? 'Registracija...' : 'Registruj CA i Izdaj Sertifikat'}
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
    sectionTitle: { borderBottom: '2px solid #3498db', paddingBottom: '10px', color: '#3498db', fontWeight: 'bold', fontSize: '18px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    input: { padding: '12px', border: '1px solid #bdc3c7', borderRadius: '5px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '13px', color: '#34495e' },
    button: { padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
    messageBox: { padding: '15px', borderRadius: '5px', textAlign: 'center' }
};

export default RegisterCAPage;