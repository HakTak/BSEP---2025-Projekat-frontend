import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { hasRole, isAuthenticated } from '../utils/auth';

const TestPage = () => {
    // Rezultati testiranja
    const [results, setResults] = useState({
        hello: null,
        demo: null,
        admin: null,
        userOrAdmin: null,
        passwordCheck: null // <--- NOVO: Za proveru statusa lozinke
    });

    // Podaci o korisniku iz tokena
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                // Dekodiranje JWT-a (payload je drugi deo tokena)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo(payload);
                console.log("Ceo Token Payload:", payload); // Pogledaj u konzoli browsera (F12)
            } catch (e) {
                console.error("Greška pri parsiranju tokena", e);
            }
        }
    }, []);

    const testEndpoint = async (key, url) => {
        setResults(prev => ({ ...prev, [key]: { loading: true } }));

        try {
            const response = await api.get(url);
            setResults(prev => ({
                ...prev,
                [key]: { success: true, message: response.data, status: response.status }
            }));
        } catch (error) {
            let msg = "Greška";
            let status = "Network Error";

            if (error.response) {
                status = error.response.status;
                // Specifična provera za naš CA slučaj
                if (status === 403 && error.response.data === "PASSWORD_CHANGE_REQUIRED") {
                    msg = "🚨 MORATE PROMENITI LOZINKU! (Backend blokira pristup)";
                } else if (status === 403) {
                    msg = "ZABRANJENO (Nemate rolu)";
                } else if (status === 401) {
                    msg = "Niste ulogovani";
                } else {
                    msg = typeof error.response.data === 'string'
                        ? error.response.data
                        : JSON.stringify(error.response.data);
                }
            }

            setResults(prev => ({
                ...prev,
                [key]: { success: false, message: msg, status: status }
            }));
        }
    };

    return (
        <div style={styles.container}>
            <h1>RBAC & Custom Attributes Test</h1>

            {/* --- SEKCIJA 1: VIZUELNA PROVERA TOKENA --- */}
            <div style={styles.infoBox}>
                <h3>🔍 Sadržaj Tokena (JWT Claims)</h3>
                {userInfo ? (
                    <div style={{ textAlign: 'left', fontFamily: 'monospace' }}>
                        <p><strong>Username:</strong> {userInfo.preferred_username}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>

                        {/* OVO SU TVOJI NOVI ATRIBUTI */}
                        <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #e67e22', borderRadius: '5px', margin: '10px 0' }}>
                            <p style={{ color: '#e67e22', fontWeight: 'bold' }}>CUSTOM ATRIBUTI (Iz Mappera):</p>
                            <p><strong>role:</strong> {userInfo.role || "❌ Nije pronađeno"}</p>
                            <p><strong>mustChangePassword:</strong> {userInfo.mustChangePassword || "❌ Nije pronađeno"}</p>
                        </div>

                        <p><strong>Keycloak Realm Roles:</strong> {JSON.stringify(userInfo.realm_access?.roles)}</p>
                    </div>
                ) : (
                    <p style={{ color: 'red' }}>Nema tokena (Niste ulogovani)</p>
                )}
            </div>

            {/* --- SEKCIJA 2: TESTIRANJE --- */}
            <div style={styles.grid}>

                {/* 1. Hello (Public) */}
                <TestCard
                    title="/api/hello"
                    desc="Javni endpoint"
                    onClick={() => testEndpoint('hello', '/hello')}
                    result={results.hello}
                />

                {/* 3. Demo (Authenticated) */}
                {isAuthenticated() && (
                    <TestCard
                        title="/api/demo"
                        desc="Zahteva samo login"
                        onClick={() => testEndpoint('demo', '/demo')}
                        result={results.demo}
                    />
                )}

                {/* 4. Admin Only */}
                {hasRole('ADMIN') && (
                    <TestCard
                        title="/api/admin-only"
                        desc="Zahteva ROLE_ADMIN"
                        onClick={() => testEndpoint('admin', '/admin-only')}
                        result={results.admin}
                    />
                )}

            </div>
        </div>
    );
};

const TestCard = ({ title, desc, onClick, result, highlight }) => (
    <div style={{ ...styles.card, borderColor: highlight ? '#e67e22' : '#ccc' }}>
        <h3>{title}</h3>
        <p style={{ fontSize: '14px', color: '#555' }}>{desc}</p>
        <button onClick={onClick} style={{ ...styles.button, backgroundColor: highlight ? '#e67e22' : '#007bff' }}>
            Testiraj
        </button>

        {result && (
            <div style={{
                marginTop: '10px', padding: '10px', borderRadius: '5px', wordBreak: 'break-word',
                backgroundColor: result.loading ? '#eee' : (result.success ? '#d4edda' : '#f8d7da'),
                color: result.loading ? '#333' : (result.success ? '#155724' : '#721c24'),
                border: `1px solid ${result.loading ? '#ccc' : (result.success ? '#c3e6cb' : '#f5c6cb')}`
            }}>
                {result.loading ? "Šaljem..." : (
                    <><strong>Status: {result.status}</strong><br />{result.message}</>
                )}
            </div>
        )}
    </div>
);

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' },
    infoBox: { padding: '15px', border: '1px solid #3498db', borderRadius: '5px', backgroundColor: '#eaf6ff', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', backgroundColor: 'white' },
    button: { width: '100%', padding: '10px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }
};

export default TestPage;