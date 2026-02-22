import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { isAuthenticated, hasRole } from '../utils/auth';

const Navbar = () => {
    const navigate = useNavigate();
    const loggedIn = isAuthenticated();
    const isAdmin = hasRole('ADMIN');
    const isCAUser = hasRole('CA_USER');
    const isUser = hasRole('USER');


    const handleLogout = async () => {
        try {
            await api.put("/user/logout");
        } catch (error) {
            console.error("Greška prilikom logout-a na serveru", error);
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        }
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <div style={styles.leftSection}>
                    <Link to="/" style={styles.brand}>PKI Sistem</Link>

                    {loggedIn && (
                        <>
                            <Link to="/certificates" style={styles.link}>Sertifikati</Link>

                            {isUser && (
                                <Link to="/csr-form" style={styles.link}>CSR Form</Link>
                            )}

                            <Link to="/my-sessions" style={styles.link}>Moje Sesije</Link>

                            {(isCAUser || isAdmin) && (
                                <>
                                    <Link to="/issue-certificate" style={styles.link}>Izdavanje Sertifikata</Link>
                                    <Link to="/csr" style={styles.link}>CSRs</Link>
                                </>
                            )}

                            {isAdmin && (
                                <Link to="/register-ca" style={styles.link}>Register CA</Link>
                            )}
                        </>
                    )}
                </div>

                <div style={styles.rightSection}>
                    {loggedIn ? (
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Odjavi se
                        </button>
                    ) : (
                        <>
                            <Link to="/login" style={styles.link}>Prijavi se</Link>
                            <Link to="/register" style={styles.link}>Registruj se</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        padding: '10px 15px',
        background: '#2c3e50',
        marginBottom: '20px',
        color: 'white'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    leftSection: {
        display: 'flex',
        gap: '5px',
        alignItems: 'center'
    },
    rightSection: {
        display: 'flex',
        gap: '5px'
    },
    brand: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '18px',
        padding: '5px'
    },
    link: {
        color: '#ecf0f1',
        textDecoration: 'none',
        fontSize: '16px',
        padding: '0 5px'
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px'
    }
};

export default Navbar;