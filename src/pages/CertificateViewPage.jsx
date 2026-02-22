import { useState, useEffect } from 'react';
import api from '../services/api';

const REVOCATION_REASONS = {
    "0": "Unspecified",
    "1": "Key Compromise",
    "2": "CA Compromise",
    "3": "Affiliation Changed",
    "4": "Superseded",
    "5": "Cessation Of Operation",
    "6": "Certificate Hold",
    "9": "Privilege Withdrawn",
    "10": "AA Compromise"
};

const CertificatePage = () => {
    const [certificates, setCertificates] = useState([]);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [revokeReason, setRevokeReason] = useState("unspecified");

    useEffect(() => {
        loadCertificates();
    }, []);

    const loadCertificates = async () => {
        try {
            const response = await api.get("/certificates/getAll");
            setCertificates(response.data);
        } catch (error) {
            console.error("Error loading certificates:", error);
        }
    };

    useEffect(() => {
        const closeMenu = () => setShowMenu(false);
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    const getStatus = (cert) => {
        if (cert.revoked) return 'Revoked';
        if (new Date(cert.validTo) < new Date()) return 'Expired';
        return 'Valid';
    };

    const getStatusColor = (status) => {
        if (status === 'Valid') return '#1e7e34';
        if (status === 'Expired') return '#a71d2a';
        if (status === 'Revoked') return '#b35c00';
        return '#333';
    };

    const handleRightClick = (e, cert) => {
        e.preventDefault();
        setMenuPosition({ x: e.pageX, y: e.pageY });
        if (cert.revoked) return;
        setSelectedCertificate(cert);
        setShowMenu(true);
    };

    const openRevokeDialog = () => {
        setShowMenu(false);
        setShowDialog(true);
    };

    const handleDownload = async (serialNumber) => {
        try {
            const response = await api.get(`/certificates/download/${serialNumber}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${serialNumber}.cer`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download error:", err);
            alert("Failed to download certificate");
        }
    };

    const submitRevoke = async () => {
        const payload = {
            serialNumber: selectedCertificate.serialNumber,
            reason: revokeReason
        };
        try {
            const response = await api.put("/certificates/revoke", payload);
            console.log("Revoke success:", response.data);
            setCertificates(prev =>
                prev.map(c =>
                    c.serialNumber === selectedCertificate.serialNumber
                        ? { ...c, revoked: true, revocationReason: revokeReason }
                        : c
                )
            );
        } catch (err) {
            console.error("Revoke error:", err);
        }
        setShowDialog(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: '20px' }}>Pregled Sertifikata</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                justifyItems: 'center'
            }}>
                {certificates.map(cert => {
                    const status = getStatus(cert);
                    return (
                        <div
                            key={cert.serialNumber}
                            onContextMenu={(e) => handleRightClick(e, cert)}
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
                                cursor: 'context-menu'
                            }}
                        >
                            <div style={{ borderBottom: '1px solid #222', paddingBottom: '4px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>CERTIFICATE</div>
                            </div>

                            <div style={{ marginTop: '6px', lineHeight: '1.4' }}>
                                <div><strong>SN:</strong> {cert.serialNumber}</div>
                                <div><strong>Org:</strong> {cert.organization}</div>
                                <div><strong>OU:</strong> {cert.organizationalUnit}</div>
                                <div><strong>Country:</strong> {cert.country}</div>
                                <div><strong>Issuer:</strong> {cert.issuerSerialNumber}</div>
                                <div><strong>ValidFrom:</strong> {cert.validFrom?.split('T')[0]}</div>
                                <div><strong>ValidTo:</strong> {cert.validTo?.split('T')[0]}</div>
                                <div><strong>Type:</strong> {cert.type}</div>
                            </div>

                            <div style={{ marginTop: '6px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: getStatusColor(status),
                                        fontSize: '10px'
                                    }}>
                                        {cert.revoked
                                            ? `${status} (${REVOCATION_REASONS[cert.revocationReason] || 'Unknown'})`
                                            : status}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDownload(cert.serialNumber)}
                                    style={{
                                        marginTop: '6px',
                                        display: 'block',
                                        width: '100%',
                                        padding: '3px 0',
                                        backgroundColor: '#1a6fc4',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showMenu && (
                <div style={{
                    position: "absolute",
                    top: menuPosition.y,
                    left: menuPosition.x,
                    background: "white",
                    border: "1px solid #ccc",
                    color: '#111111',
                    padding: "6px",
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    zIndex: 2000
                }}>
                    <div
                        style={{ cursor: "pointer", padding: "4px 10px" }}
                        onClick={openRevokeDialog}
                    >
                        Revoke Certificate
                    </div>
                </div>
            )}

            {showDialog && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    color: '#111111',
                    width: "100%",
                    height: "100%",
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 3000
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "8px",
                        width: "320px"
                    }}>
                        <h3>Revoke Certificate</h3>
                        <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                            SN: {selectedCertificate?.serialNumber}
                        </div>
                        <select
                            style={{ width: "100%", marginBottom: "15px" }}
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                        >
                            <option value="0">Unspecified</option>
                            <option value="1">Key Compromise</option>
                            <option value="2">CA Compromise</option>
                            <option value="3">Affiliation Changed</option>
                            <option value="4">Superseded</option>
                            <option value="5">Cessation Of Operation</option>
                            <option value="6">Certificate Hold</option>
                            <option value="9">Privilege Withdrawn</option>
                            <option value="10">AA Compromise</option>
                        </select>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button onClick={() => setShowDialog(false)}>Cancel</button>
                            <button onClick={submitRevoke}>Revoke</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificatePage;