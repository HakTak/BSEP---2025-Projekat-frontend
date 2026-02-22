import { useState, useEffect, useRef } from "react";
import api from '../services/api';
import CertificateCard from '../components/CertificateCard';

const CsrStructure = { csrPem: "", issuerSerialNumber: null, expiresAt: "" };

export default function CsrUploadPage() {
  const scrollContainerRef = useRef(null);
  const [formData, setFormData] = useState(CsrStructure);
  const [intermediates, setIntermediates] = useState([]);
  const [selectedCaSerial, setSelectedCaSerial] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await api.get("/certificates/getAllCA");
        const valid = response.data.filter(ca => !ca.revoked && new Date(ca.validTo) > new Date());
        setIntermediates(valid);
      } catch (error) {
        console.error("Error loading certificates:", error);
      }
    };
    loadCertificates();

    const container = scrollContainerRef.current;
    if (!container) return;
    const onWheel = (e) => { e.preventDefault(); container.scrollLeft += e.deltaY; };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => setFormData(prev => ({ ...prev, csrPem: event.target.result }));
    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.csrPem) { alert("Upload CSR first"); return; }
    if (!selectedCaSerial) { alert("Select a signing CA"); return; }

    const selectedCA = intermediates.find(ca => ca.serialNumber === selectedCaSerial);
    const userExpiry = new Date(formData.expiresAt);
    const caExpiry = new Date(selectedCA.validTo);

    if (userExpiry > caExpiry) {
      alert(`Expiration cannot be later than CA's: ${caExpiry.toISOString().split('T')[0]}`);
      return;
    }
    if (userExpiry < new Date()) { alert("Expiration cannot be in the past"); return; }

    try {
      setLoading(true);
      await api.post("/certificates/submitCsr", {
        csrPem: formData.csrPem,
        issuerSerialNumber: selectedCaSerial,
        expiresAt: formData.expiresAt
      });
      alert("CSR submitted successfully!");
      setFormData(CsrStructure);
      setFileName("");
      setSelectedCaSerial(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Submit CSR error:", err);
      alert("Failed to submit CSR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Certificate Signing Request</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* CSR FILE UPLOAD */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Upload CSR (.csr file)</label>
          <input ref={fileInputRef} type="file" accept=".csr" onChange={handleFileUpload} />
          {fileName && <p style={{ fontSize: '12px', marginTop: '6px', color: '#555' }}>Loaded: {fileName}</p>}
        </div>

        {/* CA SELECTOR */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Select Signing Certificate</label>
          <div ref={scrollContainerRef} style={{ display: 'flex', overflowX: 'auto', gap: '12px', paddingBottom: '8px', paddingTop: '4px' }}>
            {intermediates.map(ca => (
              <CertificateCard
                key={ca.serialNumber}
                cert={ca}
                selected={selectedCaSerial === ca.serialNumber}
                onClick={() => setSelectedCaSerial(ca.serialNumber)}
                showStatus={true}
              />
            ))}
          </div>
        </div>

        {/* EXPIRATION DATE */}
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Certificate Expiration</label>
          <input
            type="datetime-local" name="expiresAt"
            value={formData.expiresAt} onChange={handleChange}
            required
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{
          padding: '12px', backgroundColor: '#27ae60', color: 'white',
          border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
        }}>
          {loading ? "Submitting..." : "Submit CSR"}
        </button>
      </form>
    </div>
  );
}