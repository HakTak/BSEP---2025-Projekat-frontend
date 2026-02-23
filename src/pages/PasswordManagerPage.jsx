import { useState, useEffect } from "react";
import { getUserEmail } from "../utils/auth";
import api from "../services/api";

// ── Crypto helpers ────────────────────────────────────────────────────────
const ab2b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const b642ab = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;

async function importPublicKey(b64) {
  return crypto.subtle.importKey("spki", b642ab(b64),
    { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}
async function importPrivateKey(b64) {
  return crypto.subtle.importKey("pkcs8", b642ab(b64),
    { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}
async function encryptPassword(plaintext, pubKeyB64) {
  const key = await importPublicKey(pubKeyB64);
  const enc = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, new TextEncoder().encode(plaintext));
  return ab2b64(enc);
}

async function decryptPassword(ciphertextB64, privKeyB64) {
  const clean = privKeyB64
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const key = await importPrivateKey(clean);
  const dec = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, b642ab(ciphertextB64));
  return new TextDecoder().decode(dec);
}

// ── Styles ────────────────────────────────────────────────────────────────
const s = {
  page: { maxWidth: '960px', margin: '30px auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#111' },
  sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '5px', marginBottom: '14px', color: '#3498db', fontWeight: 'bold' },
  section: { backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  input: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', fontFamily: 'monospace', fontSize: '12px' },
  textarea: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', fontFamily: 'monospace', fontSize: '12px', minHeight: '70px', resize: 'vertical' },
  btn: { padding: '8px 16px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnSmall: { padding: '4px 10px', backgroundColor: '#1a6fc4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { textAlign: 'left', padding: '8px 10px', backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd', fontWeight: 'bold' },
  td: { padding: '8px 10px', borderBottom: '1px solid #eee', verticalAlign: 'middle' },
  badge: (isOwner) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold',
    backgroundColor: isOwner ? '#d4edda' : '#cce5ff',
    color: isOwner ? '#155724' : '#004085'
  }),
  alert: (type) => ({
    padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px',
    backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
    color: type === 'error' ? '#721c24' : '#155724',
    border: `1px solid ${type === 'error' ? '#f5c6cb' : '#c3e6cb'}`
  }),
};

// ── Certificate Card ──────────────────────────────────────────────────────
function CertCard({ cert, selected, onSelect }) {
  const now = new Date();
  const isExpired = new Date(cert.validTo) < now;

  return (
    <div
      onClick={() => !isExpired && onSelect(cert)}
      style={{
        width: '180px',
        aspectRatio: '1 / 1.414',
        backgroundColor: '#ffffff',
        color: '#111111',
        borderRadius: '6px',
        boxShadow: selected ? '0 0 0 2px #1a6fc4, 0 3px 10px rgba(0,0,0,0.15)' : '0 3px 10px rgba(0,0,0,0.15)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: selected ? '2px solid #1a6fc4' : '1px solid #dcdcdc',
        fontSize: '11px',
        flexShrink: 0,
        cursor: isExpired ? 'not-allowed' : 'pointer',
        opacity: isExpired ? 0.5 : 1,
        transition: 'box-shadow 0.15s, border 0.15s',
      }}
    >
      <div style={{ borderBottom: '1px solid #222', paddingBottom: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>CERTIFICATE</div>
      </div>

      <div style={{ marginTop: '6px', lineHeight: '1.4', flex: 1 }}>
        <div><strong>SN:</strong> <span style={{ wordBreak: 'break-all' }}>{cert.serialNumber}</span></div>
        <div><strong>CN:</strong> {cert.commonName}</div>
        <div><strong>Org:</strong> {cert.organization}</div>
        <div><strong>OU:</strong> {cert.organizationalUnit}</div>
        <div><strong>Country:</strong> {cert.country}</div>
        <div><strong>ValidFrom:</strong> {cert.validFrom?.split('T')[0]}</div>
        <div><strong>ValidTo:</strong> {cert.validTo?.split('T')[0]}</div>
        <div><strong>Type:</strong> {cert.type}</div>
      </div>

      <div style={{ marginTop: '6px', textAlign: 'right' }}>
        <span style={{
          padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold',
          color: 'white', fontSize: '10px',
          backgroundColor: isExpired ? '#dc3545' : (selected ? '#1a6fc4' : '#28a745'),
        }}>
          {isExpired ? 'Expired' : (selected ? '✓ Selected' : 'Valid')}
        </span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export default function PasswordManager() {
  const currentUserEmail = getUserEmail();

  const [privKey, setPrivKey] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [shares, setShares] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(true);
  const [eeCerts, setEeCerts] = useState([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [decryptedMap, setDecryptedMap] = useState({});
  const [form, setForm] = useState({ siteName: "", userName: "", password: "" });
  const [selectedCert, setSelectedCert] = useState(null);
  const [msg, setMsg] = useState(null);

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3500); };

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await api.get("/passwordManager/getUserShareEntries");
        setShares(response.data);
      } catch (err) {
        console.error("Failed to load shares:", err);
        flash("Failed to load shares.", "error");
      } finally {
        setSharesLoading(false);
      }
    };
    fetchShares();
  }, []);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const response = await api.get("/certificates/getAllEE");
        console.log(currentUserEmail)
        setEeCerts(response.data.filter(cert => !cert.revoked && cert.email !== currentUserEmail));
      } catch (err) {
        console.error("Failed to load certificates:", err);
        flash("Failed to load certificates.", "error");
      } finally {
        setCertsLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleDecryptRow = async (share) => {
    if (!privKey) return flash("Paste your private key first.", "error");
    if (!share.encryptedPassword) return flash("No encrypted password stored for this entry yet.", "error");
    try {
      const plain = await decryptPassword(share.encryptedPassword, privKey);
      setDecryptedMap(prev => ({ ...prev, [share.id]: plain }));
    } catch {
      flash("Decryption failed — wrong key or corrupted data.", "error");
    }
  };

  const handleShare = async () => {
    if (!form.siteName || !form.userName || !form.password)
      return flash("Fill in site name, username and password.", "error");
    if (!selectedCert)
      return flash("Select a recipient certificate.", "error");
    if (!pubKey)
      return flash("Paste your own public key first.", "error");

    try {
      const encryptedForRecipient = await encryptPassword(form.password, selectedCert.publicKey);
      const encryptedForOwner = await encryptPassword(form.password, pubKey);

      const payload = {
        siteName: form.siteName,
        userName: form.userName,
        owner: currentUserEmail,
        passwordEntries: [
          { email: selectedCert.email, encryptedPassword: encryptedForRecipient },
          { email: currentUserEmail, encryptedPassword: encryptedForOwner },
        ]
      };

      const response = await api.post("/passwordManager/createShareEntry", payload);
      console.log("Share created:", response.data);
      flash(`Shared with ${selectedCert.currentUserEmail} successfully!`);

      const refreshed = await api.get("/passwordManager/getUserShareEntries");
      setShares(refreshed.data);
      setForm({ siteName: "", userName: "", password: "" });
      setSelectedCert(null);

    } catch (err) {
      console.error("Failed to create share:", err);
      flash("Failed to create share.", "error");
    }
  };

  return (
    <div style={s.page}>
      <h2 style={{ marginBottom: '6px' }}>Password Manager</h2>

      {msg && <div style={s.alert(msg.type)}>{msg.text}</div>}

      {/* ── KEYS ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Your Keys</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={s.label}>Private Key (for decrypting)</label>
            <textarea style={s.textarea} value={privKey} onChange={e => setPrivKey(e.target.value.trim())} placeholder="Paste your private key (PKCS8 Base64)..." />
          </div>
          <div>
            <label style={s.label}>Public Key (for encrypting your own copy)</label>
            <textarea style={s.textarea} value={pubKey} onChange={e => setPubKey(e.target.value.trim())} placeholder="Paste your public key (SPKI Base64)..." />
          </div>
        </div>
      </div>

      {/* ── SHARE ENTRIES ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Shared Credentials</div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Site</th>
              <th style={s.th}>Username</th>
              <th style={s.th}>Owner</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Password</th>
            </tr>
          </thead>
          <tbody>
            {sharesLoading ? (
              <tr><td colSpan="5" style={{ padding: '12px', color: '#888', fontSize: '13px' }}>Loading shares...</td></tr>
            ) : shares.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '12px', color: '#888', fontSize: '13px' }}>No shared credentials found.</td></tr>
            ) : shares.map(share => (
              <tr key={share.id}>
                <td style={s.td}>{share.siteName}</td>
                <td style={s.td}>{share.userName}</td>
                <td style={s.td}>{share.owner}</td>
                <td style={s.td}>
                  <span style={s.badge(share.owner === currentUserEmail)}>
                    {share.owner === currentUserEmail ? "Owner" : "Shared with me"}
                  </span>
                </td>
                <td style={s.td}>
                  {decryptedMap[share.id] ? (
                    <span style={{ fontFamily: 'monospace', color: '#155724', backgroundColor: '#d4edda', padding: '2px 8px', borderRadius: '4px' }}>
                      {decryptedMap[share.id]}
                    </span>
                  ) : (
                    <button style={s.btnSmall} onClick={() => handleDecryptRow(share)}>🔓 Reveal</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── NEW SHARE ── */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Share New Credential</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={s.label}>Site Name</label>
            <input style={s.input} value={form.siteName} onChange={e => setForm(p => ({ ...p, siteName: e.target.value }))} placeholder="e.g. GitHub" />
          </div>
          <div>
            <label style={s.label}>Username / Email</label>
            <input style={s.input} value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))} placeholder="e.g. john@email.com" />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password to share..." />
          </div>
        </div>

        <label style={s.label}>
          Select Recipient Certificate
          {selectedCert && (
            <span style={{ marginLeft: '10px', color: '#1a6fc4', fontWeight: 'normal', fontSize: '12px' }}>
              ✓ {selectedCert.commonName}
            </span>
          )}
        </label>
        <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 12px' }}>
          Expired and revoked certificates are not shown.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', backgroundColor: '#f9f9f9', border: '1px solid #eee', borderRadius: '6px', marginBottom: '16px', minHeight: '60px' }}>
          {certsLoading ? (
            <p style={{ fontSize: '13px', color: '#888' }}>Loading certificates...</p>
          ) : eeCerts.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#888' }}>No valid EE certificates found.</p>
          ) : (
            eeCerts.map(cert => (
              <CertCard
                key={cert.serialNumber}
                cert={cert}
                selected={selectedCert?.serialNumber === cert.serialNumber}
                onSelect={setSelectedCert}
              />
            ))
          )}
        </div>

        <button style={s.btn} onClick={handleShare}>🔒 Encrypt & Share</button>
      </div>
    </div>
  );
}