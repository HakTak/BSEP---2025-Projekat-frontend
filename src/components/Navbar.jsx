import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api'; // Pretpostavljam da ti je api.js u services folderu

const Navbar = () => {
    const navigate = useNavigate();

    // Proveravamo da li je korisnik ulogovan (da li ima token)
    const isAuthenticated = !!localStorage.getItem("access_token");

    const handleLogout = async () => {
        try {
            // Opciono: Poziv backendu da ubije sesiju (ako si implementirao endpoint)
            // Koristimo 'api' da bi Authorization header bio automatski dodat
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Greška prilikom logout-a na serveru", error);
        } finally {
            // OBAVEZNO: Brišemo token bez obzira da li je server vratio grešku
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token"); // Ako koristiš

            // Preusmeravanje na login
            navigate("/login");
        }
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>
                <div style={styles.leftSection}>
                    <Link to="/" style={styles.brand}>
                        PKI Sistem
                    </Link>
                    <Link to="/subjects" style={styles.link}>
                        Subjekti
                    </Link>
                    <Link to="/issue-certificate" style={styles.link}>
                        Izdavanje Sertifikata
                    </Link>
                    <Link to="/certificates" style={styles.link}>
                        Sertifikati
                    </Link>
                    <Link to="/csr-form" style={styles.link}>
                        CSR
                    </Link>
                </div>

                <div style={styles.rightSection}>
                    {isAuthenticated ? (
                        <button onClick={handleLogout} style={styles.logoutBtn}>
                            Odjavi se
                        </button>
                    ) : (
                        <Link to="/login" style={styles.link}>
                            Prijavi se
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

// Izdvojio sam stilove da kod bude čitliji
const styles = {
    nav: {
        padding: '15px',
        background: '#2c3e50',
        marginBottom: '20px',
        color: 'white'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between', // Razdvaja levo i desno
        alignItems: 'center'
    },
    leftSection: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
    },
    rightSection: {
        display: 'flex',
        gap: '15px'
    },
    brand: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '18px'
    },
    link: {
        color: '#ecf0f1',
        textDecoration: 'none',
        fontSize: '16px'
    },
    logoutBtn: {
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px'
    }
};

export default Navbar;