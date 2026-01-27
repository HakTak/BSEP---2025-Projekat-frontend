import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ActivatePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Aktivujem nalog...');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('ActivatePage se učitava!');
        console.log('Query params:', Object.fromEntries(searchParams));
        
        const activateAccount = async () => {
            try {
                const token = searchParams.get('token')?.trim();
                console.log('Token iz URL-a:', token);
                console.log('Dužina tokena:', token?.length);
                console.log('Token u hexadecimal:', token ? btoa(token) : 'nema tokena');

                if (!token) {
                    setMessage('Greška: Token nije pronađen u liku.');
                    setIsError(true);
                    setIsLoading(false);
                    return;
                }

                console.log('Šaljem request sa tokenom...');
                const response = await api.post(`/auth/activate?token=${token}`);
                console.log('Odgovor sa servera:', response.data);

                setMessage('Nalog je uspešno aktiviran! Preusmere te na prijavu za 15 sekunde...');
                setIsError(false);
                setIsLoading(false);

                setTimeout(() => {
                    navigate('/login');
                }, 15000);
            } catch (error) {
                console.error('Greška pri aktivaciji:', error);
                console.error('Error response:', error.response?.data);
                setMessage(
                    error.response?.data?.message || 
                    'Greška pri aktivaciji naloga. Token je istekao ili nevažeći.'
                );
                setIsError(true);
                setIsLoading(false);
            }
        };

        activateAccount();
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Aktivacija Naloga</h1>

            <div style={{
                marginTop: '40px',
                padding: '40px',
                border: '1px solid #bdc3c7',
                borderRadius: '8px',
                display: 'inline-block',
                backgroundColor: '#fff',
                minWidth: '400px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {isLoading && (
                    <div style={{
                        fontSize: '18px',
                        color: '#3498db',
                        marginBottom: '20px'
                    }}>
                        <p>{message}</p>
                        <div style={{
                            display: 'inline-block',
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                    </div>
                )}

                {!isLoading && (
                    <div>
                        <p style={{
                            fontSize: '18px',
                            padding: '15px',
                            borderRadius: '4px',
                            backgroundColor: isError ? '#ffe6e6' : '#e6ffe6',
                            color: isError ? '#c0392b' : '#27ae60',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>
                            {message}
                        </p>

                        {isError && (
                            <button
                                onClick={() => navigate('/register')}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Nazad na Registraciju
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivatePage;