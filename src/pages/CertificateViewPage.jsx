import { useState, useEffect } from 'react';
import api from '../services/api';

const CertificatePage = () => {
    const [certificates, setCertificates] = useState([]);

    // RIGHT CLICK MENU STATE
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showMenu, setShowMenu] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    // DIALOG STATE
    const [showDialog, setShowDialog] = useState(false);
    const [revokeReason, setRevokeReason] = useState("unspecified");

    useEffect(() => {
        setCertificates([
    {
    serialNumber: "INT001",
    commonName: "Intermediate CA 1",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca1@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-01-01T00:00:00",
    validTo: "2034-01-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT002",
    commonName: "Intermediate CA 2",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca2@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-02-01T00:00:00",
    validTo: "2034-02-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: true,
    revocationReason: "Unspecified"
  },
  {
    serialNumber: "INT004",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT005",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT006",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT007",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT008",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT009",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT0010",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
  },
  {
    serialNumber: "INT011",
    commonName: "Intermediate CA 3",
    organization: "Example Corp",
    organizationalUnit: "IT",
    country: "RS",
    email: "ca3@example.com",
    issuerSerialNumber: "ROOT001",
    validFrom: "2024-03-01T00:00:00",
    validTo: "2034-03-01T00:00:00",
    type: "INTERMEDIATE_CA",
    isRevoked: false,
    revocationReason: ""
   }]);
    loadCertificates();
    }, []);

    const loadCertificates = async () => {
            try {
                const response = await api.get(
                    "/certificates/getAll"
                );

                setCertificates(response.data);

            } catch (error) {
                console.error("Error loading certificates:", error);
            }
        };

    // CLOSE MENU WHEN CLICK ANYWHERE
    useEffect(() => {
        const closeMenu = () => setShowMenu(false);
        window.addEventListener("click", closeMenu);
        return () => window.removeEventListener("click", closeMenu);
    }, []);

    const getStatus = (cert) => {
        if (cert.isRevoked) return 'Revoked';
        if (new Date(cert.validTo) < new Date()) return 'Expired';
        return 'Valid';
    };

    const getStatusColor = (status) => {
        if (status === 'Valid') return '#1e7e34';
        if (status === 'Expired') return '#a71d2a';
        if (status === 'Revoked') return '#b35c00';
        return '#333';
    };

    // RIGHT CLICK HANDLER
    const handleRightClick = (e, cert) => {
        e.preventDefault();
        setMenuPosition({ x: e.pageX, y: e.pageY });
        if (cert.isRevoked) return
        setSelectedCertificate(cert);
        setShowMenu(true);
    };

    const openRevokeDialog = () => {
        setShowMenu(false);
        setShowDialog(true);
    };

    // MOCK REVOKE FUNCTION
    const submitRevoke = async () => {
    const payload = {
        serialNumber: selectedCertificate.serialNumber,
        reason: revokeReason
    };

    try {
        const response = await api.put(
            "/certificates/revoke",
            payload
        );

        console.log("Revoke success:", response.data);

        setCertificates(prev =>
            prev.map(c =>
                c.serialNumber === selectedCertificate.serialNumber
                    ? { 
                        ...c, 
                        isRevoked: true,
                        revocationReason: revokeReason
                      }
                    : c
            )
        );

        
    } catch (err) {
        console.error("Revoke error:", err);
    }
    setShowDialog(false);
    };

    return (
        <div
            style={{
                padding: '20px',
                fontFamily: 'Arial, sans-serif',
                minHeight: '100vh'
            }}
        >
            <h2 style={{ marginBottom: '20px' }}>Pregled Sertifikata</h2>

            {/* GRID */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '16px',
                    justifyItems: 'center'
                }}
            >
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
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                    CERTIFICATE
                                </div>
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

                            <div style={{ textAlign: 'right', marginTop: '6px' }}>
                                <span
                                    style={{
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: getStatusColor(status),
                                        fontSize: '10px'
                                    }}
                                >
                                    { cert.isRevoked ? `${status} (${cert.revocationReason})` : status }
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* RIGHT CLICK MENU */}
            {showMenu && (
                <div
                    style={{
                        position: "absolute",
                        top: menuPosition.y,
                        left: menuPosition.x,
                        background: "white",
                        border: "1px solid #ccc",
                        color:'#111111',
                        padding: "6px",
                        borderRadius: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        zIndex: 2000
                    }}
                >
                    <div
                        style={{ cursor: "pointer", padding: "4px 10px" }}
                        onClick={openRevokeDialog}
                    >
                        Revoke Certificate
                    </div>
                </div>
            )}

            {/* REVOKE DIALOG */}
            {showDialog && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        color:'#111111',
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 3000
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "320px"
                        }}
                    >
                        <h3>Revoke Certificate</h3>

                        <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                            SN: {selectedCertificate?.serialNumber}
                        </div>

                        <select
                            style={{ width: "100%", marginBottom: "15px" }}
                            value={revokeReason}
                            onChange={(e) => setRevokeReason(e.target.value)}
                        >
                            <option value="Unspecified">Unspecified</option>
                            <option value="Key Compromise">Key Compromise</option>
                            <option value="CA ACompromise">CA Compromise</option>
                            <option value="Affiliation Changed">Affiliation Changed</option>
                            <option value="Superseded">Superseded</option>
                            <option value="Cessation Of Operation">Cessation Of Operation</option>
                            <option value="Certificate Hold">Certificate Hold</option>
                            <option value="Privilege Withdrawn">Privilege Withdrawn</option>
                            <option value="AA Compromise">AA Compromise</option>
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
