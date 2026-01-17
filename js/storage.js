/**
 * DemoTemplate Storage Module
 * Handles localStorage-based data persistence
 */

const Storage = {
  // Dynamic keys based on config
  get KEYS() {
    const prefix = APP_CONFIG.storagePrefix;
    return {
      USERS: `${prefix}_users`,
      CURRENT_USER: `${prefix}_current_user`,
      ITEMS: `${prefix}_items`,
      SETTINGS: `${prefix}_settings`,
      FAVORITES: `${prefix}_favorites`
    };
  },

  /**
   * Initialize storage with default data
   */
  init() {
    // Initialize users
    if (!localStorage.getItem(this.KEYS.USERS)) {
      const users = {};
      
      // Admin user
      const admin = APP_CONFIG.defaultAdmin;
      users[admin.username] = {
        id: 'admin_001',
        username: admin.username,
        displayName: admin.displayName,
        email: admin.email,
        password: admin.password,
        isAdmin: true,
        createdAt: new Date().toISOString(),
        settings: {}
      };
      
      // Demo user
      const demo = APP_CONFIG.defaultDemo;
      users[demo.username] = {
        id: 'demo_001',
        username: demo.username,
        displayName: demo.displayName,
        email: demo.email,
        password: demo.password,
        isAdmin: false,
        createdAt: new Date().toISOString(),
        settings: {}
      };
      
      localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    }

    // Initialize items
    if (!localStorage.getItem(this.KEYS.ITEMS)) {
      localStorage.setItem(this.KEYS.ITEMS, JSON.stringify({}));
    }

    // Initialize settings
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({}));
    }

    // Initialize favorites
    if (!localStorage.getItem(this.KEYS.FAVORITES)) {
      localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify({}));
    }

    // Initialize demo content
    this.initDemoContent();
  },

  /**
   * Initialize demo user's sample content
   */
  initDemoContent() {
    const items = this.getAllItems();
    
    // Check if demo items already exist
    const demoItems = Object.values(items).filter(i => i.userId === 'demo_001');
    if (demoItems.length > 0) return;

    // Create sample items for demo user
    APP_CONFIG.demoItems.forEach((itemData, index) => {
      const id = `demo_item_${index + 1}`;
      items[id] = {
        id,
        userId: 'demo_001',
        ...itemData,
        createdAt: new Date(Date.now() - (index * 24*60*60*1000)).toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    
    this.saveAll(this.KEYS.ITEMS, items);
  },

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Get all data from a storage key
   */
  getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  },

  /**
   * Save all data to a storage key
   */
  saveAll(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // ==================== USERS ====================

  getUsers() {
    return this.getAll(this.KEYS.USERS);
  },

  getUserByUsername(username) {
    const users = this.getUsers();
    return users[username.toLowerCase()] || null;
  },

  createUser(userData) {
    const users = this.getUsers();
    const username = userData.username.toLowerCase();
    
    if (users[username]) {
      throw new Error('Username already exists');
    }

    const user = {
      id: this.generateId(),
      username: username,
      displayName: userData.displayName,
      email: userData.email || '',
      password: userData.password,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date().toISOString(),
      settings: {}
    };

    users[username] = user;
    this.saveAll(this.KEYS.USERS, users);
    return user;
  },

  updateUser(username, updates) {
    const users = this.getUsers();
    if (!users[username]) {
      throw new Error('User not found');
    }
    users[username] = { ...users[username], ...updates };
    this.saveAll(this.KEYS.USERS, users);
    return users[username];
  },

  getCurrentUser() {
    const username = localStorage.getItem(this.KEYS.CURRENT_USER);
    if (!username) return null;
    return this.getUserByUsername(username);
  },

  setCurrentUser(username) {
    localStorage.setItem(this.KEYS.CURRENT_USER, username.toLowerCase());
  },

  clearCurrentUser() {
    localStorage.removeItem(this.KEYS.CURRENT_USER);
  },

  // ==================== ITEMS ====================

  getAllItems() {
    return this.getAll(this.KEYS.ITEMS);
  },

  getUserItems(userId) {
    const allItems = this.getAllItems();
    return Object.values(allItems)
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getItem(itemId) {
    const items = this.getAllItems();
    return items[itemId] || null;
  },

  createItem(itemData) {
    const items = this.getAllItems();
    const id = this.generateId();

    const item = {
      id,
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items[id] = item;
    this.saveAll(this.KEYS.ITEMS, items);
    
    // Call hook if defined
    if (APP_CONFIG.onItemCreated) {
      APP_CONFIG.onItemCreated(item);
    }
    
    return item;
  },

  updateItem(itemId, updates) {
    const items = this.getAllItems();
    if (!items[itemId]) {
      throw new Error('Item not found');
    }
    items[itemId] = { 
      ...items[itemId], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveAll(this.KEYS.ITEMS, items);
    return items[itemId];
  },

  deleteItem(itemId) {
    const items = this.getAllItems();
    if (!items[itemId]) {
      throw new Error('Item not found');
    }
    delete items[itemId];
    this.saveAll(this.KEYS.ITEMS, items);
    
    // Call hook if defined
    if (APP_CONFIG.onItemDeleted) {
      APP_CONFIG.onItemDeleted(itemId);
    }
  },

  // ==================== FAVORITES ====================

  getFavorites(userId) {
    const favorites = this.getAll(this.KEYS.FAVORITES);
    return favorites[userId] || [];
  },

  toggleFavorite(userId, itemId) {
    const favorites = this.getAll(this.KEYS.FAVORITES);
    if (!favorites[userId]) {
      favorites[userId] = [];
    }
    
    const index = favorites[userId].indexOf(itemId);
    if (index > -1) {
      favorites[userId].splice(index, 1);
    } else {
      favorites[userId].push(itemId);
    }
    
    this.saveAll(this.KEYS.FAVORITES, favorites);
    return favorites[userId];
  },

  isFavorite(userId, itemId) {
    const favorites = this.getFavorites(userId);
    return favorites.includes(itemId);
  },

  // ==================== SETTINGS ====================

  getUserSettings(userId) {
    const settings = this.getAll(this.KEYS.SETTINGS);
    return settings[userId] || {};
  },

  saveUserSettings(userId, userSettings) {
    const settings = this.getAll(this.KEYS.SETTINGS);
    settings[userId] = { ...settings[userId], ...userSettings };
    this.saveAll(this.KEYS.SETTINGS, settings);
    return settings[userId];
  },

  // ==================== EXPORT/IMPORT ====================

  exportData() {
    return {
      version: APP_CONFIG.version,
      app: APP_CONFIG.name,
      users: this.getAll(this.KEYS.USERS),
      items: this.getAll(this.KEYS.ITEMS),
      settings: this.getAll(this.KEYS.SETTINGS),
      favorites: this.getAll(this.KEYS.FAVORITES),
      exportedAt: new Date().toISOString()
    };
  },

  importData(data) {
    if (data.users) this.saveAll(this.KEYS.USERS, data.users);
    if (data.items) this.saveAll(this.KEYS.ITEMS, data.items);
    if (data.settings) this.saveAll(this.KEYS.SETTINGS, data.settings);
    if (data.favorites) this.saveAll(this.KEYS.FAVORITES, data.favorites);
  },

  clearAll() {
    localStorage.removeItem(this.KEYS.USERS);
    localStorage.removeItem(this.KEYS.ITEMS);
    localStorage.removeItem(this.KEYS.SETTINGS);
    localStorage.removeItem(this.KEYS.FAVORITES);
    localStorage.removeItem(this.KEYS.CURRENT_USER);
    this.init();
  }
};

// Initialize storage on load
Storage.init();
