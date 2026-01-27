import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!email) {
            setMessage('Email je obavezan');
            setIsError(true);
            return;
        }

        try {
            setIsLoading(true);
            await api.post('/auth/forgot-password', { email });
            
            setMessage('Link za oporavak lozinke je poslat na vašu email adresu. Proverite inbox!');
            setIsError(false);
            setIsSubmitted(true);
            setEmail('');
        } catch (error) {
            console.error('Greška pri slanju linka:', error);
            setMessage(
                error.response?.data?.message || 
                'Greška pri slanju linka. Pokušaj ponovo.'
            );
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Oporavak Lozinke</h1>
            <p>Unesite vašu email adresu da primate link za resetovanje lozinke</p>

            <div style={{
                marginTop: '40px',
                padding: '30px',
                border: '1px solid #bdc3c7',
                borderRadius: '8px',
                display: 'inline-block',
                backgroundColor: '#fff',
                minWidth: '400px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Email:
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #bdc3c7',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="tvoj@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '10px 30px',
                                fontSize: '16px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                backgroundColor: isLoading ? '#95a5a6' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Slanje...' : 'Pošalji Link'}
                        </button>
                    </form>
                ) : (
                    <div>
                        <p style={{
                            fontSize: '16px',
                            padding: '15px',
                            borderRadius: '4px',
                            backgroundColor: '#e6ffe6',
                            color: '#27ae60',
                            fontWeight: 'bold',
                            marginBottom: '20px'
                        }}>
                            ✓ {message}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                padding: '10px 20px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            Nazad na Prijavu
                        </button>
                    </div>
                )}

                {message && !isSubmitted && (
                    <p style={{
                        marginTop: '20px',
                        padding: '10px',
                        borderRadius: '4px',
                        backgroundColor: isError ? '#ffe6e6' : '#e6ffe6',
                        color: isError ? '#c0392b' : '#27ae60',
                        fontWeight: 'bold'
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
