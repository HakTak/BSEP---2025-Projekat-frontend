import { useState } from 'react';
import api from '../services/api'; // Ovo je sada onaj "pametni" api iz tačke 1

const HomePage = () => {
    const [message, setMessage] = useState('');

    const testBackend = async () => {
        try {
            // api.get automatski dodaje Authorization header
            const response = await api.get('/hello'); // Pretpostavljam da imaš /hello endpoint
            setMessage(response.data);
        } catch (error) {
            console.error("Greška:", error);
            if (error.response && error.response.status === 401) {
                setMessage("Greška: Niste ulogovani (401).");
            } else if (error.code === "ERR_NETWORK") {
                setMessage("Greška: Backend nije dostupan. Proveri da li radi server.");
            } else {
                setMessage("Došlo je do greške: " + error.message);
            }
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Dobrodošli u PKI Sistem</h1>
            <p>Siguran sistem za upravljanje digitalnim sertifikatima.</p>

            <div style={{
                marginTop: '40px',
                padding: '20px',
                border: '1px dashed #7f8c8d',
                borderRadius: '8px',
                display: 'inline-block',
                backgroundColor: '#f9f9f9'
            }}>
                <h3>Status Sistema</h3>
                <p>Klikni ispod da proveriš vezu (zahteva login):</p>

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
                    Testiraj Zaštićeni Endpoint
                </button>

                <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    color: message.startsWith('Greška') ? 'red' : 'green'
                }}>
                    {message && `Odgovor sa servera: ${message}`}
                </p>
            </div>
        </div>
    );
};

export default HomePage;