import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { mustChangePassword } from "../utils/auth";

const ChangePasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // Dodajemo state da znamo da li je provera završena pre prikaza
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!mustChangePassword()) {
            // Ako ne mora da menja lozinku, vraćamo ga na početnu
            navigate("/");
        } else {
            // Ako mora, dozvoljavamo prikaz forme
            setIsChecking(false);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju");
            return;
        }

        try {
            await api.post("/auth/change-password", {
                newPassword: password,
                confirmPassword: confirmPassword
            });

            setSuccess("Lozinka uspešno promenjena. Molimo prijavite se ponovo.");

            setTimeout(() => {
                localStorage.removeItem("access_token");
                navigate("/login");
            }, 2000);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Greška pri promeni lozinke"
            );
        }
    };

    // Dok proveravamo uslov, ne prikazujemo ništa (ili loader)
    if (isChecking) {
        return null;
    }

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2 style={{ color: "#d35400" }}>⚠️ Promena lozinke</h2>
            <p>Admin je zahtevao da promenite lozinku pri prvom logovanju.</p>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label>Nova lozinka:</label>
                    <input
                        type="password"
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Potvrdi lozinku:</label>
                    <input
                        type="password"
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={{ color: "red", backgroundColor: "#ffe6e6", padding: "10px" }}>{error}</p>}
                {success && <p style={{ color: "green", backgroundColor: "#e6fffa", padding: "10px" }}>{success}</p>}

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}>
                    Promeni lozinku
                </button>
            </form>
        </div>
    );
};

export default ChangePasswordPage;