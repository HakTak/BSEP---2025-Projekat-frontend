import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);
    const navigate = useNavigate();
    // Dodaj pored postojećih state-ova
    const [passwordFeedback, setPasswordFeedback] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const evaluatePassword = (pwd) => {
    const checks = [
        { test: pwd.length >= 8,                                          msg: "Minimalno 8 karaktera" },
        { test: !/\s/.test(pwd),                                          msg: "Ne sme sadržati razmake" },
        { test: /[A-Z]/.test(pwd),                                        msg: "Barem jedno veliko slovo (A-Z)" },
        { test: /[a-z]/.test(pwd),                                        msg: "Barem jedno malo slovo (a-z)" },
        { test: /[0-9]/.test(pwd),                                        msg: "Barem jedan broj (0-9)" },
        { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/]/.test(pwd),       msg: "Barem jedan specijalni simbol" },
    ];
    setPasswordStrength(checks.filter(c => c.test).length);
    setPasswordFeedback(checks);
    };

    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setMessage({ type: 'error', text: 'Neispravan ili nedostajući token!' });
        }
    }, [token]);

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            setMessage({ type: 'error', text: 'Sva polja su obavezna' });
            return;
        }
        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Lozinke se ne poklapaju' });
            return;
        }
        if (passwordStrength < 6) {
            setMessage({ type: 'error', text: 'Lozinka ne ispunjava sve uslove' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    newPassword: password,
                    confirmPassword: confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Greška pri resetovanju lozinke');
            }

            setMessage({ type: 'success', text: 'Lozinka uspešno promenjena! Preusmeravanje na login...' });
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div style={styles.container}>
                <h2 style={{ color: '#e74c3c' }}> Neispravan link</h2>
                <p>Link za resetovanje lozinke je neispravan ili je istekao.</p>
                <button onClick={() => navigate('/login')} style={styles.button}>
                    Nazad na login
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}> Resetovanje lozinke</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Unesite novu lozinku.</p>

            <div>
                <label style={styles.label}>Nova lozinka:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); evaluatePassword(e.target.value); }}
                    placeholder="Unesite novu lozinku"
                    style={styles.input}
                />
                {/* Estimator – prikazuje se čim korisnik počne da kuca */}
{password.length > 0 && (
    <div style={{ marginBottom: '15px' }}>
        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{
                    flex: 1, height: '6px', borderRadius: '3px',
                    backgroundColor: i <= passwordStrength
                        ? passwordStrength <= 2 ? '#e74c3c'
                        : passwordStrength <= 4 ? '#f39c12'
                        : '#27ae60'
                        : '#ecf0f1'
                }} />
            ))}
        </div>

        {/* Tekst jačine */}
        <div style={{
            fontSize: '13px', fontWeight: 'bold', marginBottom: '8px',
            color: passwordStrength <= 2 ? '#e74c3c' : passwordStrength <= 4 ? '#f39c12' : '#27ae60'
        }}>
            {passwordStrength <= 2 && 'Slaba lozinka'}
            {passwordStrength > 2 && passwordStrength <= 4 && 'Srednja lozinka'}
            {passwordStrength === 6 && 'Jaka lozinka ✓'}
        </div>

        {/* Lista uslova */}
        <div style={{ backgroundColor: '#f8f9fa', borderRadius: '6px', padding: '10px', fontSize: '13px' }}>
            {passwordFeedback.map((item, idx) => (
                <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '4px',
                    color: item.test ? '#27ae60' : '#e74c3c'
                }}>
                    <span>{item.test ? '✓' : '✗'}</span>
                    <span>{item.msg}</span>
                </div>
            ))}
        </div>
    </div>
)}

                <label style={styles.label}>Potvrdi lozinku:</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Potvrdite novu lozinku"
                    style={styles.input}
                />

                {message.text && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24',
                        fontSize: '14px'
                    }}>
                        {message.text}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Resetovanje...' : 'Resetuj lozinku'}
                </button>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: '50px auto',
        padding: '30px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        marginTop: '15px',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginBottom: '10px'
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px'
    }
};

export default ResetPasswordPage;