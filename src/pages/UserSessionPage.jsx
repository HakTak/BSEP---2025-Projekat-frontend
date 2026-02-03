import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserSessionsPage = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/user/sessions');
            setSessions(response.data);
        } catch (err) {
            console.error("Greška:", err);
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (sessionId) => {
        if (!window.confirm("Da li ste sigurni da želite da opozovete sesiju?")) return;
        try {
            await api.post(`/user/sessions/revoke/${sessionId}`);
            // Optimistično ažuriranje
            setSessions(prevSessions => prevSessions.map(session => {
                if (session.sessionId === sessionId) {
                    return { ...session, isRevoked: true };
                }
                return session;
            }));
        } catch (err) {
            alert("Greška pri opozivu.");
        }
    };

    const formatTime = (timeArray) => {
        if (!timeArray) return "N/A";
        return new Date(timeArray).toLocaleString('sr-RS');
    };

    if (loading) return <div>Učitavanje...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif', color: '#333' }}>
            <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', color: '#000' }}>Aktivne Sesije</h2>

            {sessions.length === 0 ? (
                <p>Nema aktivnih sesija.</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
                        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <tr>
                                <th style={thStyle}>Uređaj</th>
                                <th style={thStyle}>IP Adresa</th>
                                <th style={thStyle}>Kreirano</th>
                                <th style={thStyle}>Poslednja aktivnost</th>
                                <th style={thStyle}>Ističe (Važi do)</th> {/* NOVO */}
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Akcija</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, index) => {
                                const isRevokedVal = session.isRevoked || session.revoked;

                                return (
                                    <tr key={session.sessionId} style={{
                                        borderBottom: '1px solid #eee',
                                        backgroundColor: '#ffffff',
                                        color: '#000000'
                                    }}>
                                        <td style={tdStyle}>
                                            <strong style={{ color: '#000' }}>{session.userAgent}</strong>
                                        </td>
                                        <td style={tdStyle}>{session.ipAddress}</td>
                                        <td style={tdStyle}>{formatTime(session.createdAt)}</td>
                                        <td style={tdStyle}>{formatTime(session.lastActive)}</td>

                                        {/* NOVO POLJE: ISTIČE */}
                                        <td style={tdStyle}>
                                            {formatTime(session.expiresAt)}
                                        </td>

                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: '5px 10px',
                                                borderRadius: '15px',
                                                backgroundColor: isRevokedVal ? '#dc3545' : '#28a745',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '12px'
                                            }}>
                                                {isRevokedVal ? "OPOZVANO" : "AKTIVNO"}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {!isRevokedVal && (
                                                <button onClick={() => handleRevoke(session.sessionId)} style={btnStyle}>
                                                    Odjavi
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const thStyle = { padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' };
const tdStyle = { padding: '15px', verticalAlign: 'middle', color: '#333' };
const btnStyle = { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default UserSessionsPage;