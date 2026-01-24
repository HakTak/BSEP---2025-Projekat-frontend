import { useState } from 'react';
import api from '../services/api'; // Uvozimo našu konfigurisanu axios instancu

const HomePage = () => {
    const [message, setMessage] = useState('');

    const testBackend = async () => {
        try {
            // Pošto u services/api.js već imamo baseURL: '/api',
            // ovde samo kucamo nastavak putanje '/hello'.
            // Ovo se na kraju pretvara u: https://localhost:8443/api/hello
            const response = await api.get('/hello');
            setMessage(response.data);
        } catch (error) {
            console.error("Greska:", error);
            setMessage("Greska u komunikaciji (proveri konzolu - F12)");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Dobrodošli u PKI Sistem</h1>
            <p>Siguran sistem za upravljanje digitalnim sertifikatima.</p>

            {/* SEKCIJA ZA TESTIRANJE KONEKCIJE */}
            <div style={{
                marginTop: '40px',
                padding: '20px',
                border: '1px dashed #7f8c8d',
                borderRadius: '8px',
                display: 'inline-block',
                backgroundColor: '#f9f9f9'
            }}>
                <h3>Status Sistema</h3>
                <p>Klikni ispod da proveriš vezu sa HTTPS serverom:</p>

                <button
                    onClick={testBackend}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Testiraj HTTPS Vezu
                </button>

                <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    color: message.startsWith('Greska') ? 'red' : 'green'
                }}>
                    {message && `Odgovor sa servera: ${message}`}
                </p>
            </div>
        </div>
    );
};

export default HomePage;