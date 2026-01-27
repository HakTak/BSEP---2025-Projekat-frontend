import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage('Greška: Token nije pronađen. Link je nevažeći.');
            setIsError(true);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!formData.newPassword || !formData.confirmPassword) {
            setMessage('Oba polja za lozinku su obavezna');
            setIsError(true);
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('Lozinke se ne poklapaju');
            setIsError(true);
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage('Lozinka mora biti duža od 6 karaktera');
            setIsError(true);
            return;
        }

        try {
            setIsLoading(true);
            const token = searchParams.get('token')?.trim();
            
            await api.post('/auth/reset-password', {
                token: token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            setMessage('Lozinka je uspešno promenjena! Preusmere te na prijavu za 3 sekunde...');
            setIsError(false);
            setIsSuccess(true);

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error('Greška pri resetovanju lozinke:', error);
            setMessage(
                error.response?.data?.message || 
                'Greška pri resetovanju lozinke. Token je istekao ili nevažeći.'
            );
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Resetovanje Lozinke</h1>
            <p>Unesite novu lozinku</p>

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
                {isSuccess ? (
                    <div>
                        <p style={{
                            fontSize: '18px',
                            padding: '15px',
                            borderRadius: '4px',
                            backgroundColor: '#e6ffe6',
                            color: '#27ae60',
                            fontWeight: 'bold'
                        }}>
                            ✓ {message}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Nova Lozinka:
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #bdc3c7',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Unesi novu lozinku"
                            />
                        </div>

                        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                                Potvrdi Lozinku:
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #bdc3c7',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                                placeholder="Potvrdi lozinku"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                padding: '10px 30px',
                                fontSize: '16px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                backgroundColor: isLoading ? '#95a5a6' : '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Promenavam...' : 'Promeni Lozinku'}
                        </button>
                    </form>
                )}

                {message && !isSuccess && (
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

export default ResetPasswordPage;
