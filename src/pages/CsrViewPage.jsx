import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const STATUS_COLOR = {
    PENDING: '#b35c00',
    APPROVED: '#1e7e34',
    REJECTED: '#a71d2a'
};

const CsrPage = () => {
    const [csrs, setCsrs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/certificatse/getAllCACsr')
            .then(res => setCsrs(res.data))
            .catch(err => console.error('Error loading CSRs:', err));
    }, []);

    // const handleClick = (csr) => {
    //     navigate('/csr/detail', { state: { csr } });
    // };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: '20px' }}>Pregled CSR-ova</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                justifyItems: 'center'
            }}>
                {csrs.map(csr => (
                    <div
                        key={csr.id}
                        onClick={() => handleClick(csr)}
                        style={{
                            width: '180px',
                            aspectRatio: '1 / 1.414',
                            backgroundColor: '#ffffff',
                            color: '#111111',
                            borderRadius: '6px',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: '1px solid #dcdcdc',
                            fontSize: '11px',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ borderBottom: '1px solid #222', paddingBottom: '4px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>CSR</div>
                        </div>

                        <div style={{ marginTop: '6px', lineHeight: '1.4' }}>
                            <div><strong>CN:</strong> {csr.commonName}</div>
                            <div><strong>Org:</strong> {csr.organization}</div>
                            <div><strong>OU:</strong> {csr.organizationalUnit}</div>
                            <div><strong>Country:</strong> {csr.country}</div>
                            <div><strong>Email:</strong> {csr.email}</div>
                            <div><strong>Issuer Certificate SN:</strong> {csr.issuerSerialNumber}</div>
                            <div><strong>CSR Issued At:</strong> {csr.issuedAt?.split('T')[0]}</div>
                            <div><strong>Certificate expiry:</strong> {csr.expiresAt?.split('T')[0]}</div>
                            <div><strong>Public Key:</strong> {csr.publicKey}</div>
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '6px' }}>
                            <span style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                color: 'white',
                                backgroundColor: STATUS_COLOR[csr.status] || '#333',
                                fontSize: '10px'
                            }}>
                                {csr.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CsrPage;
