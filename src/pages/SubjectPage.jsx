import { useState, useEffect } from 'react';
import subjectService from '../services/subjectService';

const SubjectPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [formData, setFormData] = useState({
        email: '',
        commonName: '',
        organization: ''
    });

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await subjectService.getAll();
            setSubjects(response.data);
        } catch (error) {
            console.error("Greška pri učitavanju:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await subjectService.create(formData);
            alert("Subjekt uspešno dodat!");
            loadSubjects(); // Osveži tabelu
            setFormData({ email: '', commonName: '', organization: '' }); // Resetuj formu
        } catch (error) {
            console.error(error);
            alert("Greška pri čuvanju. Proveri konzolu.");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Upravljanje Subjektima (Sertifikati)</h2>

            {/* --- FORMA ZA DODAVANJE --- */}
            <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                <h3>Dodaj novog subjekta</h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div>
                        <input
                            type="text"
                            name="commonName"
                            placeholder="Common Name (Ime)"
                            value={formData.commonName}
                            onChange={handleChange}
                            required
                            style={{ padding: '8px' }}
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ padding: '8px' }}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            name="organization"
                            placeholder="Organizacija (npr. FTN)"
                            value={formData.organization}
                            onChange={handleChange}
                            required
                            style={{ padding: '8px' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Sačuvaj
                    </button>
                </form>
            </div>

            {/* --- TABELA PRIKAZA --- */}
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f2f2f2' }}>
                    <tr>
                        <th>ID</th>
                        <th>Common Name</th>
                        <th>Email</th>
                        <th>Organizacija</th>
                    </tr>
                </thead>
                <tbody>
                    {subjects.length > 0 ? (
                        subjects.map((sub) => (
                            <tr key={sub.id}>
                                <td>{sub.id}</td>
                                <td>{sub.commonName}</td>
                                <td>{sub.email}</td>
                                <td>{sub.organization}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>Nema podataka.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SubjectPage;