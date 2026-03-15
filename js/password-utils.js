/**
 * AIUNITES Password Utilities
 * ============================
 * SHA-256 hashing via Web Crypto API (built into all modern browsers, no library needed).
 *
 * Passwords are NEVER stored in plaintext. The hash is one-way — even if
 * localStorage or an export file is read, the original password cannot be recovered.
 *
 * Usage:
 *   const hash = await PasswordUtils.hash('mypassword');  // → hex string
 *   const ok   = await PasswordUtils.verify('mypassword', hash); // → true/false
 */
const PasswordUtils = {
  // Site-specific salt mixed in before hashing.
  // This means hashes from one AIUNITES site cannot be replayed on another.
  SALT: 'aiunites-2026',

  /**
   * Hash a password with SHA-256 + salt.
   * Returns a 64-character lowercase hex string.
   */
  async hash(password) {
    const input = password + this.SALT;
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(input)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Verify a plaintext password against a stored hash.
   */
  async verify(password, storedHash) {
    const inputHash = await this.hash(password);
    return inputHash === storedHash;
  },

  /**
   * Migrate a user record from plaintext password → passwordHash.
   * Returns the updated user object (does NOT save to storage — caller handles that).
   * Call this during login when a plaintext `password` field is still present.
   */
  async migrate(user, plaintextPassword) {
    const hash = await this.hash(plaintextPassword);
    const migrated = { ...user, passwordHash: hash };
    delete migrated.password; // remove plaintext field
    return migrated;
  },

  /**
   * Strip password fields from a user object before export or display.
   * Safe to call on any user object — missing fields are silently ignored.
   */
  sanitize(user) {
    const { password, passwordHash, ...safe } = user; // eslint-disable-line no-unused-vars
    return safe;
  }
};

window.PasswordUtils = PasswordUtils;
