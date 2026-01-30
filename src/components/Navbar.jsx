import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '15px', background: '#2c3e50', marginBottom: '20px', color: 'white' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px' }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                    PKI Sistem
                </Link>
                <Link to="/subjects" style={{ color: '#ecf0f1', textDecoration: 'none' }}>
                    Subjekti
                </Link>
                <Link to="/register" style={{ color: '#ecf0f1', textDecoration: 'none' }}>
                    Registracija
                </Link>
                <Link to="/forgot-password" style={{ color: '#ecf0f1', textDecoration: 'none' }}>
                    Zaboravljena Lozinka
                </Link>
                {/* Kasnije ćeš ovde dodati Login, Certificates, itd. */}
            </div>
        </nav>
    );
};

export default Navbar;