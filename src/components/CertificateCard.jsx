import React, { useState } from 'react'

const CertificateCard = ({ cert, selected, onClick, showStatus = true, showDownload = false, onDownload }) => {
    const [copied, setCopied] = React.useState(false);

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

    const status = getStatus(cert);

    const handleCopyPublicKey = (e) => {
        e.stopPropagation();
        if (!cert.publicKey) return;
        navigator.clipboard.writeText(cert.publicKey).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const field = (label, value) => (
        <div style={{ display: 'flex', gap: '3px', overflow: 'hidden' }}>
            <strong style={{ flexShrink: 0 }}>{label}:</strong>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {value || '-'}
            </span>
        </div>
    );

    const copyableField = (label, value) => (
        <div style={{ display: 'flex', gap: '3px', overflow: 'hidden', alignItems: 'center' }}>
            <strong style={{ flexShrink: 0 }}>{label}:</strong>
            <span
                title={value || '-'}
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: '#1a6fc4',
                    textDecoration: 'underline dotted'
                }}
            >
                {value || '-'}
            </span>
        </div>
    );

    return (
        <div
            onClick={onClick}
            style={{
                width: '170px',
                backgroundColor: '#ffffff',
                color: '#111111',
                borderRadius: '6px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                border: selected ? '3px solid #1e7e34' : '1px solid #dcdcdc',
                fontSize: '10px',
                cursor: onClick ? 'pointer' : 'default',
                boxSizing: 'border-box',
                flexShrink: 0
            }}
        >
            <div style={{ borderBottom: '1px solid #222', paddingBottom: '4px', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>CERTIFICATE</div>
            </div>

            <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginBottom: '6px',
                color: '#1a1a1a'
            }}>
                {cert.commonName || cert.serialNumber}
            </div>

            <div style={{ lineHeight: '1.6' }}>
                {field('SN', cert.serialNumber)}
                {field('Org', cert.organization)}
                {field('OU', cert.organizationalUnit)}
                {field('Country', cert.country)}
                {field('Issuer SN', cert.issuerSerialNumber)}
                {field('From', cert.validFrom?.split('T')[0])}
                {field('To', cert.validTo?.split('T')[0])}
                {field('Type', cert.type)}
                {copyableField('PubKey', cert.publicKey)}
            </div>

            {/* COPY PUBLIC KEY DUGME */}
            {cert.publicKey && (
                <button
                    onClick={handleCopyPublicKey}
                    style={{
                        marginTop: '6px',
                        display: 'block',
                        width: '100%',
                        padding: '3px 0',
                        backgroundColor: copied ? '#1e7e34' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {copied ? '✓ Kopirano!' : 'Copy Public Key'}
                </button>
            )}

            <div style={{ marginTop: '6px' }}>
                {showStatus && (
                    <div style={{ textAlign: 'right', marginBottom: showDownload ? '4px' : 0 }}>
                        <span style={{
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: getStatusColor(status),
                            fontSize: '9px'
                        }}>
                            {status}
                        </span>
                    </div>
                )}
                {showDownload && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(cert.serialNumber); }}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '3px 0',
                            backgroundColor: '#1a6fc4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '9px',
                            cursor: 'pointer'
                        }}
                    >
                        Download
                    </button>
                )}
            </div>
        </div>
    );
};

export default CertificateCard;