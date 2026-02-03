import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TestPage = () => {
    // Čuvamo rezultate za svaki endpoint posebno
    const [results, setResults] = useState({
        hello: null,
        demo: null,
        admin: null,
        userOrAdmin: null
    });

    // Čuvamo informacije o trenutnom korisniku (dekodiran token)
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        // Kada se stranica učita, pokušavamo da dekodiramo token da vidimo ko smo
        const token = localStorage.getItem("access_token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserInfo(payload);
            } catch (e) {
                console.error("Greška pri parsiranju tokena", e);
            }
        }
    }, []);

    // Generička funkcija za testiranje endpointa
    const testEndpoint = async (key, url) => {
        // Resetujemo status za taj ključ pre poziva
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
                if (status === 403) msg = "ZABRANJENO (Nemate rolu)";
                else if (status === 401) msg = "Niste ulogovani";
                else msg = error.response.data || "Greška na serveru";
            }

            setResults(prev => ({
                ...prev,
                [key]: { success: false, message: msg, status: status }
            }));
        }
    };

    return (
        <div style={styles.container}>
            <h1>RBAC Test Tabla</h1>

            {/* --- SEKCIJA 1: INFORMACIJE O TOKENU --- */}
            <div style={styles.infoBox}>
                <h3>Trenutni Token Info</h3>
                {userInfo ? (
                    <div style={{ textAlign: 'left' }}>
                        <p><strong>Username:</strong> {userInfo.preferred_username}</p>
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Keycloak Role (realm_access):</strong> {JSON.stringify(userInfo.realm_access?.roles)}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>*Backend konverter ovo pretvara u ROLE_ADMIN, ROLE_USER itd.</p>
                    </div>
                ) : (
                    <p style={{ color: 'red' }}>Nema tokena (Niste ulogovani)</p>
                )}
            </div>

            {/* --- SEKCIJA 2: TESTIRANJE ENDPOINTA --- */}
            <div style={styles.grid}>

                {/* 1. /api/hello */}
                <TestCard
                    title="/api/hello"
                    desc="Običan endpoint (zavisi od security configa da li je public)"
                    onClick={() => testEndpoint('hello', '/hello')}
                    result={results.hello}
                />

                {/* 2. /api/demo */}
                <TestCard
                    title="/api/demo"
                    desc="Zahteva: isAuthenticated()"
                    onClick={() => testEndpoint('demo', '/demo')}
                    result={results.demo}
                />

                {/* 3. /api/user-or-admin */}
                <TestCard
                    title="/api/user-or-admin"
                    desc="Zahteva: ROLE_USER ili ROLE_ADMIN"
                    onClick={() => testEndpoint('userOrAdmin', '/user-or-admin')}
                    result={results.userOrAdmin}
                />

                {/* 4. /api/admin-only */}
                <TestCard
                    title="/api/admin-only"
                    desc="Zahteva: ROLE_ADMIN"
                    onClick={() => testEndpoint('admin', '/admin-only')}
                    result={results.admin}
                />

            </div>
        </div>
    );
};

// Pomoćna komponenta za karticu
const TestCard = ({ title, desc, onClick, result }) => (
    <div style={styles.card}>
        <h3>{title}</h3>
        <p style={{ fontSize: '14px', color: '#555' }}>{desc}</p>

        <button onClick={onClick} style={styles.button}>Testiraj</button>

        {result && (
            <div style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: result.loading ? '#eee' : (result.success ? '#d4edda' : '#f8d7da'),
                color: result.loading ? '#333' : (result.success ? '#155724' : '#721c24'),
                border: `1px solid ${result.loading ? '#ccc' : (result.success ? '#c3e6cb' : '#f5c6cb')}`
            }}>
                {result.loading ? "Šaljem..." : (
                    <>
                        <strong>Status: {result.status}</strong><br />
                        {result.message}
                    </>
                )}
            </div>
        )}
    </div>
);

const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' },
    infoBox: { padding: '15px', border: '1px solid #3498db', borderRadius: '5px', backgroundColor: '#eaf6ff', marginBottom: '30px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { border: '1px solid #ccc', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

export default TestPage;