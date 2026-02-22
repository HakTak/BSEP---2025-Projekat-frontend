import { useState, useEffect, useRef } from "react";
import api from '../services/api';

// DTO SHAPE
const CsrStructure = {
  csrPem: "",
  issuerSerialNumber: null,
  expiresAt: ""
};




export default function CsrUploadPage() {
  const scrollContainerRef = useRef(null);
  const [formData, setFormData] = useState(CsrStructure);
  const [intermediates, setIntermediates] = useState([]);
  const [selectedCaSerial, setSelectedCaSerial] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const loadCertificates = async () => {
    try {
      const response = await api.get(
        "/certificates/getAllCA"
      );

      setIntermediates(response.data);

    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  useEffect(() => {
    // Load mock intermediates
    loadCertificates();
    const validIntermediates = intermediates.filter(ca => !ca.revoked);
    setIntermediates(validIntermediates);

    const container = scrollContainerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault(); // now works because listener is non-passive
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        csrPem: event.target.result
      }));
    };
    reader.readAsText(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.csrPem) {
      alert("Upload CSR first");
      return;
    }
    if (!selectedCaSerial) {
      alert("Select a signing CA");
      return;
    }
    console.log(formData.issuerSerialNumber)
    const selectedCA = intermediates.find(ca => ca.serialNumber === selectedCaSerial);

    const userExpiry = new Date(formData.expiresAt);
    const caExpiry = new Date(selectedCA.validTo);

    if (userExpiry > caExpiry) {
      alert(`Certificate expiration cannot be later than the signing CA's expiration: ${caExpiry.toISOString().split('T')[0]}`);
      return;
    }

    if (userExpiry < new Date()) {
      alert("Certificate expiration cannot be in the past");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        csrPem: formData.csrPem,
        issuerSerialNumber: selectedCaSerial,
        expiresAt: formData.expiresAt
      };

      try {
        const response = await api.post(
          "/certificates/submitCsr",
          payload
        );

        console.log("CSR submit success:", response.data);

      } catch (err) {
        console.error("Submit CSR error:", err);
      }

      // Reset form
      setFormData(CsrStructure);
      setFileName("");
      setSelectedCaSerial(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to submit CSR");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen p-8 bg-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl shadow-lg border p-8 bg-white/90 backdrop-blur">
          <h2 className="text-2xl font-bold mb-6">Create Certificate Signing Request</h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CSR FILE UPLOAD */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload CSR
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csr"
                onChange={handleFileUpload}
                className="block w-full text-sm"
              />
              {fileName && (
                <p className="text-xs mt-2 text-gray-600">
                  Loaded: {fileName}
                </p>
              )}
            </div>

            {/* INTERMEDIATE CA CARD SCROLLER */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Select Signing Certificate
              </label>
              <div
                ref={scrollContainerRef}
                style={{
                  display: "flex",
                  overflowX: "auto",
                  gap: "12px",
                  paddingBottom: "8px",
                  paddingTop: "4px",
                  scrollbarWidth: "thin",
                }}
              >
                {intermediates.map((ca) => {
                  const status = ca.revoked
                    ? "Revoked"
                    : new Date(ca.validTo) < new Date()
                      ? "Expired"
                      : "Valid";

                  return (
                    <div
                      key={ca.serialNumber}
                      onClick={() => setSelectedCaSerial(ca.serialNumber)}
                      style={{
                        minWidth: "180px",
                        maxWidth: "180px",
                        aspectRatio: "1 / 1.414",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "8px",
                        fontSize: "9px",
                        borderRadius: "6px",
                        color: "#111",
                        border:
                          selectedCaSerial === ca.serialNumber
                            ? "3px solid #1e7e34"
                            : "1px solid #ccc",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      {/* HEADER */}
                      <div style={{ borderBottom: "1px solid #222", paddingBottom: "4px", textAlign: "center", fontSize: "10px", fontWeight: "bold" }}>
                        CERTIFICATE
                      </div>

                      {/* BODY */}
                      <div style={{ marginTop: "4px", lineHeight: 1.2 }}>
                        <div><strong>CN:</strong> {ca.commonName}</div>
                        <div><strong>SN:</strong> <span style={{ wordBreak: 'break-all' }}>{ca.serialNumber}</span></div>
                        <div><strong>Org:</strong> {ca.organization}</div>
                        <div><strong>OU:</strong> {ca.organizationalUnit}</div>
                        <div><strong>Country:</strong> {ca.country}</div>
                        <div><strong>IssuerSN:</strong> {ca.issuerSerialNumber}</div>
                        <div><strong>ValidFrom:</strong> {ca.validFrom?.split("T")[0]}</div>
                        <div><strong>ValidTo:</strong> {ca.validTo?.split("T")[0]}</div>
                        <div><strong>Type:</strong> {ca.type}</div>
                        <div><strong>Public Key:</strong> <span style={{ wordBreak: 'break-all' }}>{ca.publicKey}</span></div>
                      </div>

                      {/* STATUS */}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "8px",
                            color: "#fff",
                          }}
                        >
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXPIRATION DATE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Certificate Expiration
              </label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border"
              />
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 rounded-2xl shadow font-semibold transition hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Submitting..." : "Submit CSR"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
