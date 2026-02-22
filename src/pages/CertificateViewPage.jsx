import { useState, useEffect } from 'react';
import api from '../services/api';
import CertificateCard from '../components/CertificateCard';

const REVOCATION_REASONS = {
    "0": "Unspecified", "1": "Key Compromise", "2": "CA Compromise",
    "3": "Affiliation Changed", "4": "Superseded", "5": "Cessation Of Operation",
    "6": "Certificate Hold", "9": "Privilege Withdrawn", "10": "AA Compromise"
};

const CertificatePage = () => {
    const [certificates, setCertificates] = useState([]);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [revokeReason, setRevokeReason] = useState("0");

    useEffect(() => { loadCertificates(); }, []);

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

    const handleRightClick = (e, cert) => {
        e.preventDefault();
        if (cert.revoked) return;
        setMenuPosition({ x: e.pageX, y: e.pageY });
        setSelectedCertificate(cert);
        setShowMenu(true);
    };

    const handleDownload = async (serialNumber) => {
        try {
            const response = await api.get(`/certificates/download/${serialNumber}`, { responseType: 'blob' });
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
        try {
            await api.put("/certificates/revoke", {
                serialNumber: selectedCertificate.serialNumber,
                reason: revokeReason
            });
            setCertificates(prev =>
                prev.map(c => c.serialNumber === selectedCertificate.serialNumber
                    ? { ...c, revoked: true, revocationReason: revokeReason } : c)
            );
        } catch (err) {
            console.error("Revoke error:", err);
        }
        setShowDialog(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: '20px' }}>Pregled Sertifikata</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {certificates.map(cert => (
                    <div key={cert.serialNumber} onContextMenu={(e) => handleRightClick(e, cert)}>
                        <CertificateCard
                            cert={cert}
                            showDownload={true}
                            onDownload={handleDownload}
                        />
                    </div>
                ))}
            </div>

            {showMenu && (
                <div style={{
                    position: "absolute", top: menuPosition.y, left: menuPosition.x,
                    background: "white", border: "1px solid #ccc", color: '#111111',
                    padding: "6px", borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", zIndex: 2000
                }}>
                    <div style={{ cursor: "pointer", padding: "4px 10px" }}
                        onClick={() => { setShowMenu(false); setShowDialog(true); }}>
                        Revoke Certificate
                    </div>
                </div>
            )}

            {showDialog && (
                <div style={{
                    position: "fixed", top: 0, left: 0, color: '#111111',
                    width: "100%", height: "100%", background: "rgba(0,0,0,0.4)",
                    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 3000
                }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "8px", width: "320px" }}>
                        <h3>Revoke Certificate</h3>
                        <div style={{ fontSize: "12px", marginBottom: "10px" }}>SN: {selectedCertificate?.serialNumber}</div>
                        <select style={{ width: "100%", marginBottom: "15px" }}
                            value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)}>
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