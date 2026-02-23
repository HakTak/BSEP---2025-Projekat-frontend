import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [error, setError] = useState("");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  // Replace with your Google reCAPTCHA site key
  const RECAPTCHA_SITE_KEY = "6LfLGlgsAAAAACUANxKcTSZ0Sasjxm-XS4aysOV9";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!recaptchaValue) {
      setError("Please verify that you are a human!");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8180/realms/sertifikat/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "password",
            client_id: "my-client",
            username: email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      localStorage.setItem("access_token", data.access_token);

      const payload = JSON.parse(atob(data.access_token.split(".")[1]));

      if (
        payload.role === "CA_USER" &&
        (payload.mustChangePassword === true || payload.mustChangePassword === "true")
      ) {
        navigate("/change-password");
      } else {
        navigate("/");
      }


    } catch (err) {
      setError(err.message);
    }
  };


  const handleForgotPassword = async (e) => {

    if (!forgotEmail) {
        setForgotMessage({ type: 'error', text: 'Unesite email adresu' });
        return;
    }

    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage({ type: '', text: '' });

    console.log('📧 Slanje forgot-password zahteva za:', forgotEmail);

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: forgotEmail })
        });

        console.log('📨 Response status:', response.status);
        const data = await response.json();
        console.log('📨 Response body:', data);

        if (!response.ok) throw new Error('Greška pri slanju emaila');

        setForgotMessage({ 
            type: 'success', 
            text: 'Email za oporavak je poslat! Proveri inbox.' 
        });
        setForgotEmail('');
    } catch (err) {
      console.error('Zabod :', err.message);
        setForgotMessage({ type: 'error', text: err.message });
    } finally {
        setForgotLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <label style={styles.label}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <label style={styles.label}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <div style={{ marginTop: "20px" }}>
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(value) => setRecaptchaValue(value)}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>
          Login
        </button>
        {/* Forgot Password link */}
<p
    onClick={() => { setShowForgotPassword(!showForgotPassword); setForgotMessage({ type: '', text: '' }); }}
    style={{ 
        textAlign: 'center', 
        marginTop: '10px', 
        color: '#007bff', 
        cursor: 'pointer', 
        fontSize: '14px' 
    }}
>
    Zaboravili ste lozinku?
</p>

{/* Forgot Password forma – prikazuje se samo kad korisnik klikne */}
{showForgotPassword && (
    <div style={{ 
        marginTop: '15px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        border: '1px solid #dee2e6'
    }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>
            Unesite email adresu i poslaćemo vam link za resetovanje lozinke:
        </p>
        {/* IZMENA: div umesto form */}
        <div>
            <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="tvoj@email.com"
                style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
            />
            {/* IZMENA: onClick umesto type="submit" */}
            <button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                style={{
                    ...styles.button,
                    marginTop: '10px',
                    backgroundColor: forgotLoading ? '#95a5a6' : '#27ae60',
                    width: '100%',
                    opacity: forgotLoading ? 0.7 : 1
                }}
            >
                {forgotLoading ? 'Slanje...' : 'Pošalji link'}
            </button>
        </div>

        {forgotMessage.text && (
            <p style={{
                marginTop: '10px',
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: forgotMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                color: forgotMessage.type === 'success' ? '#155724' : '#721c24',
                fontSize: '13px',
                textAlign: 'center'
            }}>
                {forgotMessage.text}
            </p>
        )}
    </div>
)}

      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginTop: "10px",
    marginBottom: "5px",
  },
  input: {
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};

export default LoginPage;
