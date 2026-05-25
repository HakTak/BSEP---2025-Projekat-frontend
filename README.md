# PKI Frontend - Public Key Infrastructure

> Academic project for *Security in Electronic Commerce Systems*, 2025

<p align="left">
  <a href="https://github.com/HakTak/pki-password-vault-backend"><img src="https://img.shields.io/badge/Repository-Backend-4A5D4E?style=for-the-badge&logo=github" alt="Backend Repo"/></a>
</p>

---

## 📖 Quick Start

**⏭️ Skip shared information below** if you already know the PKI project structure. Jump directly to **[Frontend-Specific Section](#-frontend-specific-section)** below.

---

## 🔗 Shared Project Information

### About the Project

Complete implementation of a **Public Key Infrastructure (PKI)** system for managing digital certificates with:

- 🔐 **Secure Authentication** - JWT, reCAPTCHA, multi-device sessions
- 📜 **Certificate Management** - Issuance, viewing, revocation
- 🔑 **Shared Password Manager** - Web Crypto API, client-side encryption
- 👥 **Access Control** - Administrator, CA user, regular user
- 📊 **Audit Logs** - Activity tracking
- 🛡️ **Attack Protection** - SQL injection, XSS, CSRF protection

### User Roles

- **👤 Administrator** - Full system control
- **🏢 CA User** - Manage certificates for their organization
- **👥 Regular User** - Request end-entity certificates

### Security Measures

- ✅ HTTPS/TLS encryption
- ✅ JWT authentication with refresh tokens
- ✅ reCAPTCHA protection
- ✅ Multi-device session tracking
- ✅ Encrypted password storage (PBKDF2/AES)
- ✅ SQL injection & XSS protection
- ✅ Comprehensive audit logging
- ✅ Input validation & sanitization

---

## 🎨 Frontend-Specific Section

### About This Component

Frontend application for **Public Key Infrastructure (PKI)** - user interface for managing digital certificates, user authentication, and managing sensitive data through a shared password manager.

The application provides secure access to the PKI system with:
- 🔐 Registration and login with reCAPTCHA protection
- 📜 Certificate generation and management
- 🔑 Secure password storage and sharing (Web Crypto API)
- 👥 Multi-device session tracking
- 📊 Certificate viewing by user role

### Technical Stack

- ⚛️ **React 18** - UI library
- ⚡ **Vite** - Build tool and dev server
- 🎨 **CSS3** - Styling
- 🌐 **Axios** - HTTP client
- 🔐 **Web Crypto API** - Client-side encryption/decryption
- 📦 **Node.js** - Runtime environment

### Prerequisites

- 📌 Node.js 16+ and npm 8+
- 🔗 Backend application running on `https://localhost:8080`
- 🌐 Modern browser with Web Crypto API support (Chrome, Firefox, Safari, Edge)

### Installation

#### 1. Clone and Install Dependencies

```bash
git clone <frontend-repo-url>
cd pki-front
npm install
```

#### 2. Environment Configuration

Create `.env` file in the root folder:

```env
# Backend API URL
VITE_API_URL=https://localhost:8080/api

# Google reCAPTCHA (if configured)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Environment
VITE_ENV=development
```

#### 3. Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Commands

```bash
# Development server with HMR (Hot Module Replacement)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# ESLint code check
npm run lint

# ESLint with auto-fix
npm run lint -- --fix
```

## Project Structure

```
pki-front/
├── src/
│   ├── main.jsx                          # Application entry point
│   ├── App.jsx                           # Root component
│   ├── App.css                           # Global styles
│   ├── index.css                         # CSS reset/normalization
│   ├── assets/                           # Static resources (images, fonts)
│   ├── components/
│   │   ├── Navbar.jsx                    # Navigation component
│   │   ├── LoginForm.jsx                 # Login form
│   │   ├── RegisterForm.jsx              # Registration form
│   │   ├── CertificateForm.jsx           # Certificate generation form
│   │   ├── CertificateList.jsx           # Certificate list display
│   │   ├── PasswordManager.jsx           # Password manager component
│   │   ├── SessionManager.jsx            # Session management
│   │   └── Loading.jsx                   # Loading spinner
│   ├── pages/
│   │   ├── HomePage.jsx                  # Home page
│   │   ├── SubjectPage.jsx               # User management page
│   │   ├── LoginPage.jsx                 # Login page
│   │   ├── RegisterPage.jsx              # Registration page
│   │   ├── CertificatesPage.jsx          # Certificate management
│   │   ├── PasswordManagerPage.jsx       # Password manager page
│   │   └── ProfilePage.jsx               # User profile
│   └── services/
│       ├── api.js                        # API client (axios instance)
│       ├── subjectService.js             # User services
│       ├── certificateService.js         # Certificate services
│       ├── authService.js                # Authentication services
│       ├── passwordService.js            # Password manager services
│       └── cryptoService.js              # Web Crypto API services
├── public/                               # Static files (favicon, manifest)
├── index.html                            # HTML template
├── vite.config.js                        # Vite configuration
├── eslint.config.js                      # ESLint configuration
├── package.json                          # Dependencies and scripts
└── .env                                  # Environment variables
```

## Key Components

### Navbar.jsx
Navigation menu with:
- Links to all pages
- Display of username
- Logout button
- Active page indicator

### LoginForm.jsx
Login form with:
- Email and password validation
- reCAPTCHA integration
- Error display
- Remember me option (optional)

### CertificateForm.jsx
Certificate generation/issuance form:
- CA certificate selection
- CN (Common Name) input
- Certificate duration settings
- Extension selection
- X.509 parameter validation

### PasswordManager.jsx
Sensitive data management component:
- Password storage with encryption
- Sharing with other users
- Decryption with private key
- View active shares

### SessionManager.jsx
Active session management:
- Display all active JWT tokens
- IP address, device type, last activity
- Token revocation (logout from other device)

## Services

### api.js
Axios instance with:
- Automatic JWT token sending
- Error handling
- Request/Response interceptors
- HTTPS validation

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  httpsAgent: { rejectUnauthorized: false } // For development
});

// Automatically add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### cryptoService.js
Web Crypto API services for:
- RSA key generation
- Encryption/Decryption
- Digital signing (optional)

```javascript
export const cryptoService = {
  // Encrypt with public key
  async encrypt(publicKey, data) {
    const encoded = new TextEncoder().encode(data);
    const encrypted = await window.crypto.subtle.encrypt(
      'RSA-OAEP',
      publicKey,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  },

  // Decrypt with private key
  async decrypt(privateKey, encryptedData) {
    const binaryString = atob(encryptedData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decrypted = await window.crypto.subtle.decrypt(
      'RSA-OAEP',
      privateKey,
      bytes.buffer
    );
    
    return new TextDecoder().decode(decrypted);
  }
};
```

### authService.js
Authentication services:

```javascript
export const authService = {
  async register(email, password, firstName, lastName, organization) {
    return api.post('/auth/register', {
      email, password, firstName, lastName, organization
    });
  },

  async login(email, password, recaptchaToken) {
    return api.post('/auth/login', {
      email, password, recaptchaToken
    });
  },

  async logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return api.post('/auth/logout');
  }
};
```

## Authentication

### Login Flow
1. User enters email and password
2. Solves reCAPTCHA
3. Backend returns JWT token
4. Token is stored in `localStorage` (HttpOnly cookie is preferred)
5. Every API request includes the token in the `Authorization` header

### Token Management
```javascript
// app-wide interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      // Token has expired
      const newToken = await refreshToken();
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return api(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Frontend Security

### 1. XSS Protection
```javascript
// ❌ Avoid directly setting HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Use React's default escaping
<div>{userInput}</div>
```

### 2. CSRF Protection
- Backend should validate `Origin` and `Referer` headers
- Use SameSite cookie option

### 3. Web Crypto API for Encryption
```javascript
// Encrypt password before sending to backend
const publicKey = await loadPublicKey();
const encryptedPassword = await cryptoService.encrypt(publicKey, password);
await api.post('/api/secrets', { encryptedPassword });
```

### 4. Input Validation
```javascript
// Email validation
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Password validation (minimum 8 characters, 1 number, 1 special character)
const validatePassword = (password) => {
  return /^(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/.test(password);
};
```

## Backend API Integration

### Certificate Issuance Flow
```javascript
// 1. User uploads CSR
const uploadCSR = async (csr, caId) => {
  const formData = new FormData();
  formData.append('csr', csr);
  formData.append('caId', caId);
  return api.post('/api/certificates/generate', formData);
};

// 2. Backend generates certificate
// 3. Frontend downloads certificate
const downloadCertificate = async (certificateId) => {
  const response = await api.get(
    `/api/certificates/${certificateId}/download`,
    { responseType: 'blob' }
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `certificate-${certificateId}.crt`);
  document.body.appendChild(link);
  link.click();
};
```

## Password Manager - Web Crypto API Flow

### Storing Password
1. User enters password in the form
2. Frontend loads user's public key
3. Password is encrypted with RSA-OAEP
4. Encrypted password is sent to backend
5. Backend stores it in the database

### Reading Password
1. User requests access to the password
2. Backend returns encrypted password
3. Frontend loads user's private key from their device
4. Frontend decrypts password using Web Crypto API
5. Decrypted password is displayed to the user

### Sharing Password
1. Alice wants to share password with Bob
2. Frontend decrypts password with Alice's private key
3. Frontend loads Bob's public key
4. Frontend encrypts password with Bob's public key
5. Both versions (Alice and Bob) are stored on backend

## Development

### Debugging
```bash
# Open DevTools (F12)
# Use Network tab to track API calls
# Use Console for console.log() output
```

### HMR (Hot Module Replacement)
Vite automatically refreshes the page when code is modified without losing state.

### Mock API Calls
For testing without backend, use mock services:
```javascript
// services/mockApi.js
export const mockAuthService = {
  login: () => Promise.resolve({ token: 'mock-token' }),
  register: () => Promise.resolve({ success: true })
};
```

## Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized `dist/` folder with:
- Minified JavaScript/CSS
- Optimized images
- Source maps for debugging

### Deploy with Nginx/Apache
```nginx
# nginx.conf
server {
  listen 443 ssl;
  server_name example.com;
  
  ssl_certificate /path/to/cert.crt;
  ssl_certificate_key /path/to/key.key;
  
  root /path/to/dist;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api {
    proxy_pass https://backend:8080;
  }
}
```

### Docker
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Check CORS configuration in backend `SecurityConfig.java` |
| "Cannot find module" | Run `npm install` and `npm run dev` again |
| API is unavailable | Verify that backend is running on `https://localhost:8080` |
| Web Crypto API error | Verify that application is on HTTPS (required for Web Crypto API) |
| Token has expired | Implement refresh token logic with interceptors |
| Build errors | Run `npm run lint -- --fix` for auto-correction |

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Crypto API | ✅ 37+ | ✅ 34+ | ✅ 11+ | ✅ 79+ |
| Fetch API | ✅ 40+ | ✅ 39+ | ✅ 10.1+ | ✅ 14+ |
| LocalStorage | ✅ | ✅ | ✅ | ✅ |
| reCAPTCHA | ✅ | ✅ | ✅ | ✅ |

## Additional Features

- 🎨 Themes (Light/Dark mode)
- 🔔 Real-time notifications (WebSocket)
- 📊 Data export (CSV, PDF)
- 🌍 Multi-language interface (i18n)
- ♿ Accessibility compliance (WCAG 2.1)

## All About Web Crypto API

Web Crypto API is used for:
1. **Encryption** - RSA-OAEP for public keys
2. **Decryption** - Using private keys
3. **Digital Signing** - RSASSA-PKCS1-v1_5
4. **Key Generation** - RSA-PSS, ECDSA

**Important**: Private key is NEVER sent to backend. All operations with private key occur on the frontend!

## Documentation

- React: https://react.dev
- Vite: https://vitejs.dev
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- Axios: https://axios-http.com

## License

Academic project - Security in Electronic Commerce Systems, 2025
