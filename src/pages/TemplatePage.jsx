import { useState, useEffect } from 'react';
import api from '../services/api';

const KEY_USAGE_OPTIONS = [
    { bit: 0, label: "Digital Signature",  value: 128 },
    { bit: 1, label: "Non Repudiation",    value: 64  },
    { bit: 2, label: "Key Encipherment",   value: 32  },
    { bit: 3, label: "Data Encipherment",  value: 16  },
    { bit: 4, label: "Key Agreement",      value: 8   },
    { bit: 5, label: "Key Cert Sign",      value: 4   },
    { bit: 6, label: "CRL Sign",           value: 2   },
    { bit: 7, label: "Encipher Only",      value: 1   },
];

const emptyForm = {
    name: '',
    issuerSerialNumber: '',
    cnRegex: '',
    sanRegex: '',
    ttlDays: '',
    keyUsageBits: [],  // lokalni state – lista odabranih value-a
    extendedKeyUsage: ''
};

const TemplatePage = () => {
    const [templates, setTemplates] = useState([]);
    const [formData, setFormData] = useState(emptyForm);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await api.get('/templates/my');
            setTemplates(res.data);
        } catch (err) {
            console.error('Greška pri učitavanju šablona:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // OR-uje sve odabrane bitove u jedan int koji backend očekuje
    const handleKeyUsageChange = (value) => {
        setFormData(prev => {
            const exists = prev.keyUsageBits.includes(value);
            return {
                ...prev,
                keyUsageBits: exists
                    ? prev.keyUsageBits.filter(v => v !== value)
                    : [...prev.keyUsageBits, value]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Kombinuj sve odabrane bitove u jedan int
        const keyUsageInt = formData.keyUsageBits.reduce((acc, val) => acc | val, 0);

        const payload = {
            name: formData.name,
            issuerSerialNumber: formData.issuerSerialNumber,
            cnRegex: formData.cnRegex || null,
            sanRegex: formData.sanRegex || null,
            ttlDays: parseInt(formData.ttlDays),
            keyUsage: keyUsageInt,
            extendedKeyUsage: formData.extendedKeyUsage || null
        };

        try {
            await api.post('/templates', payload);
            setMessage({ type: 'success', text: 'Šablon uspešno kreiran!' });
            setFormData(emptyForm);
            loadTemplates();
        } catch (err) {
            const msg = err.response?.data || 'Greška pri kreiranju šablona';
            setMessage({ type: 'error', text: typeof msg === 'string' ? msg : JSON.stringify(msg) });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Da li ste sigurni da želite da obrišete šablon?')) return;
        try {
            await api.delete(`/templates/${id}`);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert('Greška pri brisanju šablona');
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Šabloni za Sertifikate</h2>

            {/* Forma za kreiranje */}
            <div style={styles.card}>
                <div style={styles.sectionTitle}>Kreiraj novi šablon</div>

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
                    <div style={styles.grid}>
                        <div>
                            <label style={styles.label}>Naziv šablona *</label>
                            <input
                                style={styles.input}
                                name="name"
                                placeholder="npr. Web Server Template"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Issuer Serial Number *</label>
                            <input
                                style={styles.input}
                                name="issuerSerialNumber"
                                placeholder="Serijski broj CA sertifikata"
                                value={formData.issuerSerialNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label style={styles.label}>CN Regex (validacija)</label>
                            <input
                                style={styles.input}
                                name="cnRegex"
                                placeholder="npr. .*\.ftn\.com"
                                value={formData.cnRegex}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>SAN Regex (validacija)</label>
                            <input
                                style={styles.input}
                                name="sanRegex"
                                placeholder="npr. .*\.ftn\.com"
                                value={formData.sanRegex}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Maks. trajanje (dani) *</label>
                            <input
                                style={styles.input}
                                name="ttlDays"
                                type="number"
                                placeholder="npr. 365"
                                value={formData.ttlDays}
                                onChange={handleChange}
                                required
                                min={1}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>Extended Key Usage</label>
                            <input
                                style={styles.input}
                                name="extendedKeyUsage"
                                placeholder="npr. serverAuth,clientAuth"
                                value={formData.extendedKeyUsage}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <label style={{ ...styles.label, marginTop: '15px' }}>Key Usage (podrazumevane vrednosti):</label>
                    <div style={styles.keyUsageGrid}>
                        {KEY_USAGE_OPTIONS.map(opt => (
                            <label key={opt.bit} style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={formData.keyUsageBits.includes(opt.value)}
                                    onChange={() => handleKeyUsageChange(opt.value)}
                                />
                                {opt.label}
                            </label>
                        ))}
                    </div>

                    <button
                        type="submit"
                        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? 'Kreiranje...' : 'Kreiraj Šablon'}
                    </button>
                </form>
            </div>

            {/* Lista šablona */}
            <div style={styles.card}>
                <div style={styles.sectionTitle}>Moji šabloni</div>
                {templates.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center' }}>Nemate kreiranih šablona.</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Naziv</th>
                                <th style={styles.th}>Issuer CN</th>
                                <th style={styles.th}>CN Regex</th>
                                <th style={styles.th}>TTL (dani)</th>
                                <th style={styles.th}>Key Usage</th>
                                <th style={styles.th}>Akcija</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(t => (
                                <tr key={t.id} style={styles.tableRow}>
                                    <td style={styles.td}>{t.name}</td>
                                    <td style={styles.td}>{t.issuerCommonName}</td>
                                    <td style={styles.td}>{t.cnRegex || '—'}</td>
                                    <td style={styles.td}>{t.ttlDays}</td>
                                    <td style={styles.td}>{t.keyUsage}</td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            style={styles.deleteButton}
                                        >
                                            Obriši
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '900px', margin: '30px auto', padding: '20px' },
    header: { textAlign: 'center', color: '#2c3e50', marginBottom: '20px' },
    card: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', padding: '20px', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    keyUsageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '5px' },
    input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#555' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '15px', color: '#3498db', fontWeight: 'bold', fontSize: '16px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' },
    button: { padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' },
    messageBox: { padding: '15px', borderRadius: '4px', marginBottom: '10px', border: '1px solid transparent' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#f8f9fa' },
    th: { padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontSize: '13px' },
    td: { padding: '10px', borderBottom: '1px solid #dee2e6', fontSize: '13px' },
    tableRow: { ':hover': { backgroundColor: '#f5f5f5' } },
    deleteButton: { padding: '4px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default TemplatePage;