import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Activate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Aktivacioni token nije pronađen!');
      setLoading(false);
      return;
    }

    // Pozivamo backend za aktivaciju
    axios
      .post(`http://localhost:8080/api/auth/activate?token=${token}`)
      .then((response) => {
        setMessage(response.data.message);
        setLoading(false);
        // Redirekcija na login nakon 3 sekunde
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Greška pri aktivaciji');
        setLoading(false);
      });
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      {loading && <p>Aktiviram nalog...</p>}
      {message && (
        <div style={{ color: 'green', fontSize: '18px' }}>
          <p>{message}</p>
          <p>Preusmereavam na login...</p>
        </div>
      )}
      {error && (
        <div style={{ color: 'red', fontSize: '18px' }}>
          <p>{error}</p>
          <p><a href="/register">Nazad na registraciju</a></p>
        </div>
      )}
    </div>
  );
}
