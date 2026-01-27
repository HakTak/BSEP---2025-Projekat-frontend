import { useState } from 'react';
import api from '../services/api';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        organization: '',
        password: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

        // Validacija
        if (!formData.email || !formData.firstName || !formData.lastName || 
            !formData.organization || !formData.password || !formData.confirmPassword) {
            setMessage('Sva polja su obavezna');
            setIsError(true);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage('Lozinke se ne poklapaju');
            setIsError(true);
            return;
        }

        if (formData.password.length < 8) {
            setMessage('Lozinka mora biti duža od 8 karaktera');
            setIsError(true);
            return;
        }

        try {
            setIsLoading(true);
            console.log('Slanje podataka za registraciju:', formData);
            const response = await api.post('/auth/register', {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                firstName: formData.firstName,
                lastName: formData.lastName,
                organization: formData.organization,
                
            });

            setMessage('Registracija uspešna! Proveri email za potvrdu.');
            setIsError(false);
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: '',
                organization: '',
            });
        } catch (error) {
            console.error('Greška pri registraciji:', error);
            setMessage(error.response?.data?.message || 'Greška pri registraciji. Pokušaj ponovo.');
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Registracija</h1>
            <p>Napravi novi nalog u PKI Sistemu</p>

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
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Email:
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
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

                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Ime:
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Tvoje ime"
                        />
                    </div>

                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Prezime:
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Tvoje prezime"
                        />
                    </div>

                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Organizacija:
                        </label>
                        <input
                            type="text"
                            name="organization"
                            value={formData.organization}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Nazwa tvoje organizacije"
                        />
                    </div>

                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Lozinka:
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '1px solid #bdc3c7',
                                borderRadius: '4px',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Unesi lozinku"
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
                        {isLoading ? 'Učitavanje...' : 'Registruj se'}
                    </button>
                </form>

                {message && (
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

export default RegisterPage;