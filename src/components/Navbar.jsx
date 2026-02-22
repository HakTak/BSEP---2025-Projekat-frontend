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
                        CSR Form
                    </Link>
                    <Link to="/csr" style={styles.link}>
                        CSRs
                    </Link>
                    <Link to="/templates" style={styles.link}>
                        Sabloni
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

const styles = {
    nav: {
        padding: '10px 15px', // Slightly reduced vertical padding
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
        // Reduced gap to 5px for minimal spacing between brand and links
        gap: '5px', 
        alignItems: 'center'
    },
    rightSection: {
        display: 'flex',
        // Reduced gap for the right side as well
        gap: '5px' 
    },
    brand: {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '18px',
        padding: '5px' // Tiny bit of clickable area
    },
    link: {
        color: '#ecf0f1',
        textDecoration: 'none',
        fontSize: '16px',
        // Adding a very small horizontal padding ensures they don't touch 
        // characters, but stay as close as possible.
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