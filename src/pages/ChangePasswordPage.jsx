import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { mustChangePassword } from "../utils/auth";

const ChangePasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isChecking, setIsChecking] = useState(true);
    const [passwordFeedback, setPasswordFeedback] = useState([]);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!mustChangePassword()) {
            navigate("/");
        } else {
            setIsChecking(false);
        }
    }, [navigate]);

    const evaluatePassword = (pwd) => {
        const checks = [
            { test: pwd.length >= 8,                                        msg: "Minimalno 8 karaktera" },
            { test: !/\s/.test(pwd),                                        msg: "Ne sme sadržati razmake" },
            { test: /[A-Z]/.test(pwd),                                      msg: "Barem jedno veliko slovo (A-Z)" },
            { test: /[a-z]/.test(pwd),                                      msg: "Barem jedno malo slovo (a-z)" },
            { test: /[0-9]/.test(pwd),                                      msg: "Barem jedan broj (0-9)" },
            { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?/]/.test(pwd),     msg: "Barem jedan specijalni simbol" },
        ];
        setPasswordStrength(checks.filter(c => c.test).length);
        setPasswordFeedback(checks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Lozinke se ne poklapaju");
            return;
        }

        if (passwordStrength < 6) {
            setError("Lozinka ne ispunjava sve uslove");
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
                        onChange={e => { setPassword(e.target.value); evaluatePassword(e.target.value); }}
                        required
                    />

                    {/* Estimator – prikazuje se čim korisnik počne da kuca */}
                    {password.length > 0 && (
                        <div style={{ marginTop: "10px" }}>
                            {/* Progress bar */}
                            <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} style={{
                                        flex: 1, height: "6px", borderRadius: "3px",
                                        backgroundColor: i <= passwordStrength
                                            ? passwordStrength <= 2 ? "#e74c3c"
                                            : passwordStrength <= 4 ? "#f39c12"
                                            : "#27ae60"
                                            : "#ecf0f1"
                                    }} />
                                ))}
                            </div>

                            {/* Tekst jačine */}
                            <div style={{
                                fontSize: "13px", fontWeight: "bold", marginBottom: "8px",
                                color: passwordStrength <= 2 ? "#e74c3c" : passwordStrength <= 4 ? "#f39c12" : "#27ae60"
                            }}>
                                {passwordStrength <= 2 && "Slaba lozinka"}
                                {passwordStrength > 2 && passwordStrength <= 4 && "Srednja lozinka"}
                                {passwordStrength === 6 && "Jaka lozinka ✓"}
                            </div>

                            {/* Lista uslova */}
                            <div style={{ backgroundColor: "#f8f9fa", borderRadius: "6px", padding: "10px", fontSize: "13px" }}>
                                {passwordFeedback.map((item, idx) => (
                                    <div key={idx} style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        marginBottom: "4px",
                                        color: item.test ? "#27ae60" : "#e74c3c"
                                    }}>
                                        <span>{item.test ? "✓" : "✗"}</span>
                                        <span>{item.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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