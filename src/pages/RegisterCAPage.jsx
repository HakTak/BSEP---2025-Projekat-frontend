import { useState } from 'react';
import api from '../services/api';

const AdminRegisterCAUserPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        organization: ''
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

        if (!formData.email || !formData.firstName || !formData.lastName || !formData.organization) {
            setMessage('Sva polja su obavezna');
            setIsError(true);
            return;
        }

        try {
            setIsLoading(true);

            await api.post('/auth/register-ca', {
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                organization: formData.organization
            });

            setMessage('CA korisnik je uspešno registrovan.');
            setIsError(false);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                organization: ''
            });
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                'Greška pri registraciji CA korisnika'
            );
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Registracija CA korisnika</h1>
            <p>Samo ADMIN može da registruje CA_USER nalog</p>

            <div style={{
                marginTop: '40px',
                padding: '30px',
                border: '1px solid #bdc3c7',
                borderRadius: '8px',
                display: 'inline-block',
                backgroundColor: '#fff',
                minWidth: '400px'
            }}>
                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        name="firstName"
                        placeholder="Ime"
                        value={formData.firstName}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        name="lastName"
                        placeholder="Prezime"
                        value={formData.lastName}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        name="organization"
                        placeholder="Organizacija"
                        value={formData.organization}
                        onChange={handleChange}
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={buttonStyle}
                    >
                        {isLoading ? 'Učitavanje...' : 'Registruj CA korisnika'}
                    </button>
                </form>

                {message && (
                    <p style={{
                        marginTop: '20px',
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

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #bdc3c7'
};

const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#2980b9',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer'
};

export default AdminRegisterCAUserPage;
