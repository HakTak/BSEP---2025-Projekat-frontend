export const getJwtPayload = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
        // Razdvajamo token na delove (Header.Payload.Signature)
        const base64Url = token.split('.')[1];

        // Fix za base64 format
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Dekodiranje koje podržava i naše karaktere (šđčćž)
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Greška pri dekodiranju tokena", e);
        return null;
    }
};

/**
 * Proverava da li je korisnik ulogovan.
 * Sada proverava i da li je token ISTEKAO (expiration time).
 */
export const isAuthenticated = () => {
    const payload = getJwtPayload();

    // Ako nema payload-a ili nema 'exp' polja, nije validan
    if (!payload || !payload.exp) return false;

    // 'exp' je u sekundama, Date.now() u milisekundama -> množimo sa 1000
    const currentTime = Date.now();
    return payload.exp * 1000 > currentTime;
};

/**
 * Vraća rolu korisnika (iz custom atributa 'role' koji smo mapirali).
 */
export const getUserRole = () => {
    const payload = getJwtPayload();
    if (!payload) return null;

    return payload.role || null;
};

/**
 * Proverava da li ulogovani korisnik ima traženu rolu.
 */
export const hasRole = (requiredRole) => {
    const currentRole = getUserRole();
    return currentRole === requiredRole;
};

/**
 * Proverava da li korisnik mora da promeni lozinku.
 * (Ovo je pravilo problem jer getJwtPayload nije postojala).
 */
export const mustChangePassword = () => {
    const payload = getJwtPayload();
    if (!payload) return false;

    // Proveravamo da li je true (boolean) ili "true" (string)
    return payload.mustChangePassword === true || payload.mustChangePassword === "true";
};