/**
 * DemoTemplate Auth Module
 * Handles user registration, login, and session management
 */

const Auth = {
  /**
   * Register new user
   */
  signup(displayName, username, email, password) {
    if (!displayName || displayName.length < 2) {
      throw new Error('Display name must be at least 2 characters');
    }
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    if (Storage.getUserByUsername(username)) {
      throw new Error('Username already taken');
    }

    const user = Storage.createUser({
      displayName,
      username,
      email,
      password
    });

    Storage.setCurrentUser(user.username);
    return user;
  },

  /**
   * Login user
   * Checks localStorage first, then SQL database if available
   */
  login(username, password) {
    if (!username || !password) {
      throw new Error('Please enter username and password');
    }

    // First, try localStorage (original behavior)
    let user = Storage.getUserByUsername(username);
    
    if (user) {
      // Found in localStorage - check password
      if (user.password !== password) {
        throw new Error('Incorrect password');
      }
      Storage.setCurrentUser(user.username);
      return user;
    }
    
    // Not found in localStorage - try SQL database if available
    if (typeof SQLDatabase !== 'undefined' && SQLDatabase.isLoaded && SQLDatabase.db) {
      try {
        // Use parameterized query to prevent SQL injection
        const stmt = SQLDatabase.db.prepare(
          `SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1`
        );
        stmt.bind([username]);
        
        if (stmt.step()) {
          const dbUser = stmt.getAsObject();
          stmt.free();
          
          // Check password (stored as password_hash in DB)
          const dbPassword = dbUser.password_hash || dbUser.password || '';
          if (dbPassword !== password) {
            throw new Error('Incorrect password');
          }
          
          // Create localStorage user from DB user for session
          user = Storage.createUser({
            displayName: dbUser.display_name || dbUser.displayName || username,
            username: dbUser.username,
            email: dbUser.email || '',
            password: password,
            isAdmin: dbUser.role === 'admin'
          });
          
          console.log('[Auth] User authenticated from SQL database:', username);
          Storage.setCurrentUser(user.username);
          return user;
        } else {
          stmt.free(); // Clean up prepared statement
        }
      } catch (dbError) {
        console.warn('[Auth] SQL database lookup failed:', dbError.message);
        // Fall through to "User not found"
      }
    }
    
    throw new Error('User not found');
  },

  /**
   * Logout current user
   */
  logout() {
    Storage.clearCurrentUser();
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return Storage.getCurrentUser() !== null;
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return Storage.getCurrentUser();
  },

  /**
   * Check if current user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.isAdmin === true;
  },

  /**
   * Update user profile
   */
  updateProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Not logged in');
    }
    return Storage.updateUser(user.username, updates);
  },

  /**
   * Update user settings
   */
  updateSettings(settings) {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Not logged in');
    }
    
    const updatedSettings = { ...user.settings, ...settings };
    return Storage.updateUser(user.username, { settings: updatedSettings });
  }
};
