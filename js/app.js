/**
 * DemoTemplate Main App
 * UI logic, event handlers, and app state management
 */

/**
 * Toggle password visibility
 * @param {string} inputId - The ID of the password input
 * @param {HTMLElement} btn - The toggle button element
 */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

const App = {
  state: {
    currentItem: null,
    editingItemId: null
  },

  /**
   * Initialize the app
   */
  init() {
    this.applyConfig();
    this.bindEvents();
    this.loadLandingContent();
    this.checkAuth();
  },

  /**
   * Apply config to DOM elements
   */
  applyConfig() {
    // Update title
    document.title = `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`;
    
    // Update version numbers
    const versionText = `v${APP_CONFIG.version}`;
    document.querySelectorAll('#footer-version, #auth-version, #admin-version').forEach(el => {
      if (el) el.textContent = versionText;
    });
    const lastUpdatedEl = document.getElementById('admin-last-updated');
    if (lastUpdatedEl && APP_CONFIG.lastUpdated) {
      lastUpdatedEl.textContent = APP_CONFIG.lastUpdated;
    }
    
    // Update all logo elements
    document.querySelectorAll('.logo').forEach(el => {
      el.innerHTML = APP_CONFIG.logoHtml;
    });
    
    // Update taglines
    document.querySelectorAll('.hero-slogan, .auth-tagline, .footer-slogan').forEach(el => {
      el.textContent = APP_CONFIG.tagline;
    });
    
    // Update hero
    const heroContent = document.querySelector('.hero-content h1');
    if (heroContent) heroContent.innerHTML = APP_CONFIG.headline;
    
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = APP_CONFIG.description;
    
    // Update CTA section
    const ctaHeadline = document.querySelector('.landing-cta h2');
    if (ctaHeadline) ctaHeadline.textContent = APP_CONFIG.ctaHeadline;
    
    const ctaDesc = document.querySelector('.landing-cta p');
    if (ctaDesc) ctaDesc.textContent = APP_CONFIG.ctaDescription;
    
    // Update items section
    const itemsTitle = document.getElementById('items-section-title');
    if (itemsTitle) itemsTitle.textContent = APP_CONFIG.itemsSectionTitle;
    
    const itemsSubtitle = document.getElementById('items-section-subtitle');
    if (itemsSubtitle) itemsSubtitle.textContent = APP_CONFIG.itemsSectionSubtitle;
    
    // Update dashboard labels
    const myItemsTitle = document.getElementById('my-items-title');
    if (myItemsTitle) myItemsTitle.textContent = `My ${APP_CONFIG.itemNamePlural.charAt(0).toUpperCase() + APP_CONFIG.itemNamePlural.slice(1)}`;
    
    const myItemsSubtitle = document.getElementById('my-items-subtitle');
    if (myItemsSubtitle) myItemsSubtitle.textContent = `Manage your ${APP_CONFIG.itemNamePlural}`;
    
    // Update new item button
    const newItemBtnText = document.getElementById('new-item-btn-text');
    if (newItemBtnText) newItemBtnText.textContent = APP_CONFIG.newItemButtonText;
    
    // Update empty state
    const emptyIcon = document.getElementById('empty-icon');
    if (emptyIcon) emptyIcon.textContent = APP_CONFIG.emptyIcon;
    
    const emptyTitle = document.getElementById('empty-title');
    if (emptyTitle) emptyTitle.textContent = APP_CONFIG.emptyTitle;
    
    const emptyDesc = document.getElementById('empty-description');
    if (emptyDesc) emptyDesc.textContent = APP_CONFIG.emptyDescription;
    
    const emptyBtnText = document.getElementById('empty-new-item-btn-text');
    if (emptyBtnText) emptyBtnText.textContent = `Create First ${APP_CONFIG.itemName.charAt(0).toUpperCase() + APP_CONFIG.itemName.slice(1)}`;
  },

  /**
   * Check authentication status
   */
  checkAuth() {
    if (Auth.isLoggedIn()) {
      this.showDashboard();
    } else {
      this.showLandingPage();
    }
  },

  /**
   * Bind all event listeners
   */
  bindEvents() {
    // Landing page
    document.getElementById('landing-login-btn')?.addEventListener('click', () => this.showAuthScreen());
    document.getElementById('landing-start-btn')?.addEventListener('click', () => this.showAuthScreen('signup'));
    document.getElementById('landing-start-btn-2')?.addEventListener('click', () => this.showAuthScreen('signup'));
    document.getElementById('landing-demo-btn')?.addEventListener('click', () => this.loginAsDemo());
    document.getElementById('auth-demo-btn')?.addEventListener('click', () => this.loginAsDemo());

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
    });

    // Back to landing
    document.getElementById('back-to-landing')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLandingPage();
    });

    // Auth forms
    document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signup-form')?.addEventListener('submit', (e) => this.handleSignup(e));
    document.getElementById('reset-app-link')?.addEventListener('click', (e) => this.resetAppToDefaults(e));

    // User menu
    document.querySelector('.user-menu')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleUserMenu();
    });
    document.getElementById('logout-link')?.addEventListener('click', (e) => this.handleLogout(e));
    // Settings is now a page (settings.html), not a modal
    // document.getElementById('settings-link')?.addEventListener('click', (e) => this.openSettings(e));

    // Dashboard navigation
    document.querySelectorAll('.nav-tab[data-view]').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchDashboardView(e.target.dataset.view));
    });

    // New item buttons
    document.getElementById('new-item-btn')?.addEventListener('click', () => this.openCreateModal());
    document.getElementById('empty-new-item-btn')?.addEventListener('click', () => this.openCreateModal());

    // Create modal
    document.getElementById('close-create-modal')?.addEventListener('click', () => this.closeCreateModal());
    document.getElementById('create-form')?.addEventListener('submit', (e) => this.handleCreateSubmit(e));

    // Item modal
    document.getElementById('close-item-modal')?.addEventListener('click', () => this.closeItemModal());

    // Settings modal
    document.getElementById('close-settings-modal')?.addEventListener('click', () => this.closeSettingsModal());
    document.getElementById('cancel-settings')?.addEventListener('click', () => this.closeSettingsModal());
    document.getElementById('user-settings-form')?.addEventListener('submit', (e) => this.handleSettingsSubmit(e));
    document.getElementById('backup-data-btn')?.addEventListener('click', () => this.backupUserData());
    document.getElementById('restore-data-input')?.addEventListener('change', (e) => this.restoreUserData(e));

    // Cache viewer
    document.getElementById('view-cache-btn')?.addEventListener('click', () => this.openCacheViewer());
    document.getElementById('close-cache-modal')?.addEventListener('click', () => this.closeCacheModal());
    document.querySelectorAll('.cache-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchCacheTab(e.target.dataset.cacheTab));
    });
    document.getElementById('clear-my-cache-btn')?.addEventListener('click', () => this.clearMyCache());

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-menu')) {
        document.getElementById('user-dropdown')?.classList.remove('active');
      }
    });

    // Admin panel - Now links to admin.html page
    // document.getElementById('admin-link')?.addEventListener('click', (e) => this.openAdminPanel(e));
    document.getElementById('close-admin-modal')?.addEventListener('click', () => this.closeAdminModal());
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.adminTab));
    });
    document.getElementById('system-settings-form')?.addEventListener('submit', (e) => this.handleSystemSettings(e));
    document.getElementById('export-all-data-btn')?.addEventListener('click', () => this.exportAllData());
    document.getElementById('reset-all-data-btn')?.addEventListener('click', () => this.resetAllData());

    // Legal modal
    document.getElementById('close-legal-modal')?.addEventListener('click', () => this.closeLegalModal());
    document.getElementById('footer-terms')?.addEventListener('click', (e) => this.showLegal(e, 'terms'));
    document.getElementById('footer-privacy')?.addEventListener('click', (e) => this.showLegal(e, 'privacy'));
    document.getElementById('settings-terms')?.addEventListener('click', (e) => this.showLegal(e, 'terms'));
    document.getElementById('settings-privacy')?.addEventListener('click', (e) => this.showLegal(e, 'privacy'));
    document.getElementById('show-terms')?.addEventListener('click', (e) => this.showLegal(e, 'terms'));
    document.getElementById('show-privacy')?.addEventListener('click', (e) => this.showLegal(e, 'privacy'));

    // Monetization
    document.getElementById('save-monetization-btn')?.addEventListener('click', () => this.saveMonetization());
    document.getElementById('add-product-btn')?.addEventListener('click', () => this.addProductRow());
    document.getElementById('monetize-amazon-enabled')?.addEventListener('change', (e) => {
      document.getElementById('amazon-fields').style.display = e.target.checked ? '' : 'none';
    });
    document.getElementById('monetize-adsense-enabled')?.addEventListener('change', (e) => {
      document.getElementById('adsense-fields').style.display = e.target.checked ? '' : 'none';
    });

    // Close modals on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCreateModal();
        this.closeItemModal();
        this.closeSettingsModal();
        this.closeCacheModal();
        this.closeAdminModal();
        this.closeLegalModal();
      }
    });

    // Modal backdrop clicks
    document.getElementById('create-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'create-modal') this.closeCreateModal();
    });
    document.getElementById('item-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'item-modal') this.closeItemModal();
    });
    document.getElementById('settings-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'settings-modal') this.closeSettingsModal();
    });
    document.getElementById('cache-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cache-modal') this.closeCacheModal();
    });
    document.getElementById('admin-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'admin-modal') this.closeAdminModal();
    });
    document.getElementById('legal-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'legal-modal') this.closeLegalModal();
    });
  },

  // ==================== SCREENS ====================

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId)?.classList.add('active');
  },

  showLandingPage() {
    this.showScreen('landing-screen');
  },

  loadLandingContent() {
    // Load hero cards
    const heroCardsEl = document.getElementById('hero-cards');
    if (heroCardsEl && APP_CONFIG.heroCards) {
      heroCardsEl.innerHTML = APP_CONFIG.heroCards.map((card, i) => `
        <div class="hero-card" style="background: linear-gradient(135deg, ${card.color}, ${this.adjustColor(card.color, -30)}); transform: rotate(${(i-1) * 6}deg) translateY(${i * 10}px);">
          <span class="hero-card-icon">${card.icon}</span>
          <span class="hero-card-name">${card.name}</span>
          <span class="hero-card-subs">${card.subtitle}</span>
        </div>
      `).join('');
    }

    // Load features
    const featuresGrid = document.getElementById('features-grid');
    if (featuresGrid && APP_CONFIG.features) {
      featuresGrid.innerHTML = APP_CONFIG.features.map(feature => `
        <div class="feature-card">
          <div class="feature-icon">${feature.icon}</div>
          <h3>${feature.title}</h3>
          <p>${feature.description}</p>
        </div>
      `).join('');
    }

    // Load shop section
    this.loadShopSection();

    // Load AdSense if configured
    this.loadAdSense();

    // Load landing items (from demo content)
    const itemsGrid = document.getElementById('landing-items-grid');
    if (itemsGrid && APP_CONFIG.demoItems) {
      itemsGrid.innerHTML = APP_CONFIG.demoItems.slice(0, 3).map(item => `
        <div class="item-card">
          <div class="item-card-header" style="background: linear-gradient(135deg, ${item.color}, ${this.adjustColor(item.color, -30)});">
            ${item.icon}
          </div>
          <div class="item-card-body">
            <h3 class="item-card-title">${this.escapeHtml(item.name)}</h3>
            <p class="item-card-desc">${this.escapeHtml(item.description || '')}</p>
          </div>
        </div>
      `).join('');
    }
  },

  loadShopSection() {
    // Priority: localStorage settings > config.js defaults
    const shop = this.loadShopFromSettings() || APP_CONFIG.shop;
    if (!shop || !shop.products || shop.products.length === 0) return;

    const section = document.getElementById('landing-shop');
    if (!section) return;

    section.style.display = '';

    const title = document.getElementById('shop-title');
    if (title) title.textContent = shop.title || 'Recommended';

    const subtitle = document.getElementById('shop-subtitle');
    if (subtitle) subtitle.textContent = shop.subtitle || '';

    const grid = document.getElementById('shop-grid');
    if (grid) {
      grid.innerHTML = shop.products.map(product => `
        <a href="${product.url}" target="_blank" rel="noopener sponsored" class="shop-card">
          <div class="shop-card-icon" style="background: linear-gradient(135deg, ${product.color}, ${this.adjustColor(product.color, -30)});">
            ${product.icon}
            ${product.badge ? `<span class="shop-badge">${product.badge}</span>` : ''}
          </div>
          <div class="shop-card-body">
            <h3 class="shop-card-title">${this.escapeHtml(product.name)}</h3>
            <p class="shop-card-desc">${this.escapeHtml(product.description)}</p>
            <div class="shop-card-footer">
              <span class="shop-price">${product.price}</span>
              <span class="shop-cta">View on Amazon →</span>
            </div>
          </div>
        </a>
      `).join('');
    }
  },

  showAuthScreen(tab = 'login') {
    this.showScreen('auth-screen');
    this.switchAuthTab(tab);
  },

  showDashboard() {
    this.showScreen('dashboard-screen');
    this.updateUserInfo();
    this.loadItems();
    this.loadDiscoverItems();
    this.updateStats();
  },

  // ==================== AUTH ====================

  switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${tab}-form`)?.classList.add('active');

    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';

    // Inject generated password when signup tab opens
    if (tab === 'signup') this.injectGeneratedPassword();
  },

  injectGeneratedPassword() {
    if (typeof PasswordUtils === 'undefined') return;
    const pwField  = document.getElementById('signup-password');
    const cfmField = document.getElementById('signup-confirm');
    if (!pwField) return;

    // Only inject if fields are empty (don't overwrite what user typed)
    if (pwField.value) return;

    const pw = PasswordUtils.generate();
    pwField.value  = pw;
    if (cfmField) cfmField.value = pw;

    // Ensure fields are visible (show-password mode)
    pwField.type  = 'text';
    if (cfmField) cfmField.type = 'text';

    // Add or update the suggestion bar
    const existing = document.getElementById('pw-suggest-bar');
    if (existing) { existing.remove(); }

    const bar = document.createElement('div');
    bar.id = 'pw-suggest-bar';
    bar.style.cssText = [
      'margin-top:8px','background:rgba(139,92,246,0.1)',
      'border:1px solid rgba(139,92,246,0.3)','border-radius:8px',
      'padding:8px 12px','font-size:0.8rem','color:#c4b5fd',
      'display:flex','align-items:center','gap:8px','flex-wrap:wrap'
    ].join(';');
    bar.innerHTML = `
      <span>🔐 We generated a secure password for you.</span>
      <span style="flex:1;"></span>
      <button type="button" id="pw-copy-btn"
        style="background:rgba(139,92,246,0.25);border:1px solid rgba(139,92,246,0.4);color:#e9d5ff;border-radius:6px;padding:3px 10px;font-size:0.78rem;cursor:pointer;font-family:inherit;">
        📋 Copy
      </button>
      <button type="button" id="pw-regen-btn"
        style="background:rgba(139,92,246,0.25);border:1px solid rgba(139,92,246,0.4);color:#e9d5ff;border-radius:6px;padding:3px 10px;font-size:0.78rem;cursor:pointer;font-family:inherit;">
        🔄 New
      </button>
    `;
    pwField.parentElement.appendChild(bar);

    document.getElementById('pw-copy-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(pwField.value).then(() => {
        const btn = document.getElementById('pw-copy-btn');
        if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000); }
      });
    });

    document.getElementById('pw-regen-btn').addEventListener('click', () => {
      const newPw = PasswordUtils.generate();
      pwField.value  = newPw;
      if (cfmField) cfmField.value = newPw;
    });
  },

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await Auth.login(username, password);
      this.showToast('Welcome back!', 'success');
      this.showDashboard();
    } catch (error) {
      document.getElementById('login-error').textContent = error.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  async handleSignup(e) {
    e.preventDefault();
    const displayName = document.getElementById('signup-name').value.trim();
    const username   = document.getElementById('signup-username').value.trim();
    const email      = document.getElementById('signup-email').value.trim();
    const password   = document.getElementById('signup-password').value;
    const confirm    = document.getElementById('signup-confirm').value;

    if (password !== confirm) {
      document.getElementById('signup-error').textContent = 'Passwords do not match';
      return;
    }

    const btn = e.target.querySelector('[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      await Auth.signup(displayName, username, email, password);
      this.showToast(`Welcome to ${APP_CONFIG.name}!`, 'success');
      this.showDashboard();
    } catch (error) {
      document.getElementById('signup-error').textContent = error.message;
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  handleLogout(e) {
    e.preventDefault();
    Auth.logout();
    this.showToast('Logged out successfully', 'success');
    this.showAuthScreen();
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
  },

  loginAsDemo() {
    try {
      Auth.login('demo', 'demo123');
      this.showToast('Welcome to the demo! Explore freely.', 'success');
      this.showDashboard();
    } catch (error) {
      Storage.clearAll();
      Auth.login('demo', 'demo123');
      this.showToast('Welcome to the demo! Explore freely.', 'success');
      this.showDashboard();
    }
  },

  resetAppToDefaults(e) {
    e.preventDefault();
    
    const password = prompt('Enter admin password to reset:');
    if (password !== APP_CONFIG.defaultAdmin.password) {
      this.showToast('Incorrect admin password', 'error');
      return;
    }
    
    if (!confirm('⚠️ Reset app to defaults? This will delete all data.')) {
      return;
    }

    Storage.clearAll();
    this.showToast('App reset! Login with admin / admin123', 'success');
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    document.getElementById('login-error').textContent = '';
    document.getElementById('signup-error').textContent = '';
  },

  toggleUserMenu() {
    document.getElementById('user-dropdown')?.classList.toggle('active');
  },

  updateUserInfo() {
    const user = Auth.getCurrentUser();
    if (user) {
      document.getElementById('user-display-name').textContent = user.displayName;
      document.getElementById('user-avatar').textContent = user.displayName.charAt(0).toUpperCase();
      
      const adminLink = document.getElementById('admin-link');
      if (adminLink) {
        adminLink.style.display = user.isAdmin ? 'block' : 'none';
      }
    }
  },

  // ==================== DASHBOARD ====================

  switchDashboardView(view) {
    document.querySelectorAll('.nav-tab[data-view]').forEach(t => t.classList.remove('active'));
    document.querySelector(`.nav-tab[data-view="${view}"]`)?.classList.add('active');

    document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}-view`)?.classList.add('active');
  },

  loadItems() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    const grid = document.getElementById('items-grid');
    const emptyState = document.getElementById('empty-items');

    if (items.length === 0) {
      grid.innerHTML = '';
      emptyState?.classList.add('active');
      return;
    }

    emptyState?.classList.remove('active');

    // Use custom renderer if provided, otherwise use default
    if (APP_CONFIG.renderItemCard) {
      grid.innerHTML = items.map(item => APP_CONFIG.renderItemCard(item)).join('');
    } else {
      grid.innerHTML = items.map(item => this.renderDefaultItemCard(item)).join('');
    }
  },

  renderDefaultItemCard(item) {
    const isFav = Storage.isFavorite(Auth.getCurrentUser()?.id, item.id);
    return `
      <div class="item-card" data-id="${item.id}">
        <div class="item-card-header" style="background: linear-gradient(135deg, ${item.color || '#ff3366'}, ${this.adjustColor(item.color || '#ff3366', -30)});">
          ${item.icon || '📦'}
          <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); App.toggleFavorite('${item.id}')">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
        <div class="item-card-body">
          <h3 class="item-card-title">${this.escapeHtml(item.name)}</h3>
          <p class="item-card-desc">${this.escapeHtml(item.description || '')}</p>
          <div class="item-card-actions">
            <button class="item-action-view" onclick="App.openItemModal('${item.id}')">👁️ View</button>
            <button class="item-action-edit" onclick="App.openCreateModal('${item.id}')">✏️ Edit</button>
            <button class="item-action-delete" onclick="App.deleteItem('${item.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
  },

  loadDiscoverItems() {
    const grid = document.getElementById('discover-grid');
    if (!grid || !APP_CONFIG.discoverItems) return;

    grid.innerHTML = APP_CONFIG.discoverItems.map(item => `
      <div class="item-card">
        <div class="item-card-header" style="background: linear-gradient(135deg, ${item.color}, ${this.adjustColor(item.color, -30)});">
          ${item.icon}
        </div>
        <div class="item-card-body">
          <h3 class="item-card-title">${item.name}</h3>
          <p class="item-card-desc">${item.description}</p>
          ${item.stats ? `
            <div class="item-card-stats">
              <span>👀 ${(item.stats.views / 1000).toFixed(1)}k views</span>
              <span>❤️ ${item.stats.likes}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  },

  updateStats() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    const statsRow = document.getElementById('user-stats');
    
    if (statsRow && APP_CONFIG.stats) {
      statsRow.innerHTML = APP_CONFIG.stats.map(stat => `
        <div class="stat-card">
          <div class="stat-label">${stat.label}</div>
          <div class="stat-value">${stat.getValue(items, user)}</div>
        </div>
      `).join('');
    }
  },

  toggleFavorite(itemId) {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    Storage.toggleFavorite(user.id, itemId);
    this.loadItems();
  },

  // ==================== CREATE/EDIT MODAL ====================

  openCreateModal(itemId = null) {
    this.state.editingItemId = itemId;
    const modal = document.getElementById('create-modal');
    const title = document.getElementById('create-modal-title');
    const form = document.getElementById('create-form');

    // Build form fields from config
    form.innerHTML = this.buildFormFields(itemId);

    if (itemId) {
      const item = Storage.getItem(itemId);
      title.textContent = `Edit ${APP_CONFIG.itemName.charAt(0).toUpperCase() + APP_CONFIG.itemName.slice(1)}`;
      this.populateFormFields(item);
    } else {
      title.textContent = `Create New ${APP_CONFIG.itemName.charAt(0).toUpperCase() + APP_CONFIG.itemName.slice(1)}`;
    }

    modal.classList.add('active');
  },

  buildFormFields(editingId) {
    let html = '';
    
    APP_CONFIG.itemFields.forEach(field => {
      if (field.type === 'text') {
        html += `
          <div class="form-group">
            <label for="field-${field.id}">${field.label} ${field.required ? '*' : ''}</label>
            <input type="text" id="field-${field.id}" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''}>
          </div>
        `;
      } else if (field.type === 'textarea') {
        html += `
          <div class="form-group">
            <label for="field-${field.id}">${field.label} ${field.required ? '*' : ''}</label>
            <textarea id="field-${field.id}" placeholder="${field.placeholder || ''}" rows="3" ${field.required ? 'required' : ''}></textarea>
          </div>
        `;
      } else if (field.type === 'select') {
        html += `
          <div class="form-group">
            <label for="field-${field.id}">${field.label}</label>
            <select id="field-${field.id}">
              ${field.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
            </select>
          </div>
        `;
      } else if (field.type === 'iconPicker') {
        html += `
          <div class="form-group">
            <label>${field.label}</label>
            <div class="icon-picker" id="icon-picker-${field.id}">
              ${field.options.map(icon => `
                <button type="button" class="icon-btn ${icon === field.default ? 'selected' : ''}" data-icon="${icon}" onclick="App.selectIcon('${field.id}', '${icon}')">${icon}</button>
              `).join('')}
            </div>
            <input type="hidden" id="field-${field.id}" value="${field.default}">
          </div>
        `;
      } else if (field.type === 'colorPicker') {
        html += `
          <div class="form-group">
            <label>${field.label}</label>
            <div class="color-picker" id="color-picker-${field.id}">
              ${field.options.map(color => `
                <button type="button" class="color-btn ${color === field.default ? 'selected' : ''}" data-color="${color}" style="background: linear-gradient(135deg, ${color}, ${this.adjustColor(color, -30)});" onclick="App.selectColor('${field.id}', '${color}')"></button>
              `).join('')}
            </div>
            <input type="hidden" id="field-${field.id}" value="${field.default}">
          </div>
        `;
      }
    });

    html += `
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="App.closeCreateModal()">Cancel</button>
        <button type="submit" class="btn-primary">${editingId ? 'Save Changes' : 'Create'}</button>
      </div>
    `;

    return html;
  },

  populateFormFields(item) {
    APP_CONFIG.itemFields.forEach(field => {
      const el = document.getElementById(`field-${field.id}`);
      if (el && item[field.id] !== undefined) {
        el.value = item[field.id];
        
        // Update visual selection for pickers
        if (field.type === 'iconPicker') {
          document.querySelectorAll(`#icon-picker-${field.id} .icon-btn`).forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.icon === item[field.id]);
          });
        } else if (field.type === 'colorPicker') {
          document.querySelectorAll(`#color-picker-${field.id} .color-btn`).forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === item[field.id]);
          });
        }
      }
    });
  },

  selectIcon(fieldId, icon) {
    document.querySelectorAll(`#icon-picker-${fieldId} .icon-btn`).forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.icon === icon);
    });
    document.getElementById(`field-${fieldId}`).value = icon;
  },

  selectColor(fieldId, color) {
    document.querySelectorAll(`#color-picker-${fieldId} .color-btn`).forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.color === color);
    });
    document.getElementById(`field-${fieldId}`).value = color;
  },

  closeCreateModal() {
    document.getElementById('create-modal')?.classList.remove('active');
    this.state.editingItemId = null;
  },

  handleCreateSubmit(e) {
    e.preventDefault();
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Gather form data
    const itemData = { userId: user.id };
    APP_CONFIG.itemFields.forEach(field => {
      const el = document.getElementById(`field-${field.id}`);
      if (el) {
        itemData[field.id] = el.value;
      }
    });

    // Custom validation if provided
    if (APP_CONFIG.validateItem) {
      const validation = APP_CONFIG.validateItem(itemData);
      if (!validation.valid) {
        this.showToast(validation.errors.join(', '), 'error');
        return;
      }
    }

    try {
      if (this.state.editingItemId) {
        Storage.updateItem(this.state.editingItemId, itemData);
        this.showToast(`${APP_CONFIG.itemName} updated!`, 'success');
      } else {
        Storage.createItem(itemData);
        this.showToast(`${APP_CONFIG.itemName} created!`, 'success');
      }
      this.closeCreateModal();
      this.loadItems();
      this.updateStats();
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  },

  deleteItem(itemId) {
    if (!confirm(`Delete this ${APP_CONFIG.itemName}? This cannot be undone.`)) {
      return;
    }

    try {
      Storage.deleteItem(itemId);
      this.showToast(`${APP_CONFIG.itemName} deleted`, 'success');
      this.loadItems();
      this.updateStats();
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  },

  // ==================== ITEM DETAIL MODAL ====================

  openItemModal(itemId) {
    const item = Storage.getItem(itemId);
    if (!item) return;

    const modal = document.getElementById('item-modal');
    const title = document.getElementById('item-modal-title');
    const body = document.getElementById('item-modal-body');

    title.textContent = item.name;

    // Use custom renderer if provided
    if (APP_CONFIG.renderItemDetail) {
      body.innerHTML = APP_CONFIG.renderItemDetail(item);
    } else {
      body.innerHTML = `
        <div class="item-detail">
          <div class="item-detail-header" style="background: linear-gradient(135deg, ${item.color || '#ff3366'}, ${this.adjustColor(item.color || '#ff3366', -30)});">
            <span class="item-detail-icon">${item.icon || '📦'}</span>
          </div>
          <div class="item-detail-body">
            <h2>${this.escapeHtml(item.name)}</h2>
            <p>${this.escapeHtml(item.description || 'No description')}</p>
            <div class="item-detail-meta">
              <span>Created: ${this.formatDate(item.createdAt)}</span>
              <span>Updated: ${this.formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.add('active');
  },

  closeItemModal() {
    document.getElementById('item-modal')?.classList.remove('active');
  },

  // ==================== SETTINGS ====================

  openSettings(e) {
    e?.preventDefault();
    const user = Auth.getCurrentUser();
    if (!user) return;

    document.getElementById('settings-name').value = user.displayName;
    document.getElementById('settings-email').value = user.email || '';

    document.getElementById('settings-modal').classList.add('active');
    document.getElementById('user-dropdown')?.classList.remove('active');
  },

  closeSettingsModal() {
    document.getElementById('settings-modal')?.classList.remove('active');
  },

  handleSettingsSubmit(e) {
    e.preventDefault();

    const displayName = document.getElementById('settings-name').value.trim();
    const email = document.getElementById('settings-email').value.trim();

    try {
      Auth.updateProfile({ displayName, email });
      this.updateUserInfo();
      this.closeSettingsModal();
      this.showToast('Settings saved!', 'success');
    } catch (error) {
      this.showToast(error.message, 'error');
    }
  },

  backupUserData() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    const favorites = Storage.getFavorites(user.id);

    const backup = {
      version: APP_CONFIG.version,
      app: APP_CONFIG.name,
      exportedAt: new Date().toISOString(),
      user: {
        username: user.username,
        displayName: user.displayName,
        email: user.email
      },
      items: items,
      favorites: favorites
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_CONFIG.storagePrefix}-backup-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showToast('Backup downloaded!', 'success');
  },

  restoreUserData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        
        if (!backup.items) {
          throw new Error('Invalid backup file');
        }

        const user = Auth.getCurrentUser();
        if (!user) throw new Error('Please log in first');

        if (!confirm(`Restore ${backup.items.length} ${APP_CONFIG.itemNamePlural}?`)) {
          return;
        }

        const allItems = Storage.getAllItems();
        backup.items.forEach(item => {
          const newId = Storage.generateId();
          allItems[newId] = {
            ...item,
            id: newId,
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });
        Storage.saveAll(Storage.KEYS.ITEMS, allItems);

        this.loadItems();
        this.updateStats();
        this.closeSettingsModal();
        this.showToast(`Restored ${backup.items.length} ${APP_CONFIG.itemNamePlural}!`, 'success');

      } catch (error) {
        this.showToast('Restore failed: ' + error.message, 'error');
      }
    };

    reader.readAsText(file);
    e.target.value = '';
  },

  // ==================== CACHE VIEWER ====================

  openCacheViewer() {
    this.loadCacheSummary();
    this.loadCacheItems();
    this.loadCacheRaw();
    document.getElementById('cache-modal').classList.add('active');
  },

  closeCacheModal() {
    document.getElementById('cache-modal')?.classList.remove('active');
  },

  switchCacheTab(tab) {
    document.querySelectorAll('.cache-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.cache-tab[data-cache-tab="${tab}"]`)?.classList.add('active');

    document.querySelectorAll('.cache-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`cache-${tab}-tab`)?.classList.add('active');
  },

  loadCacheSummary() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    const favorites = Storage.getFavorites(user.id);

    const grid = document.getElementById('cache-summary-grid');
    grid.innerHTML = `
      <div class="cache-summary-card">
        <div class="cache-summary-value">${items.length}</div>
        <div class="cache-summary-label">${APP_CONFIG.itemNamePlural}</div>
      </div>
      <div class="cache-summary-card">
        <div class="cache-summary-value">${favorites.length}</div>
        <div class="cache-summary-label">Favorites</div>
      </div>
    `;

    const totalSize = JSON.stringify(items).length / 1024;
    document.getElementById('cache-size').textContent = `Total size: ${totalSize.toFixed(2)} KB`;
  },

  loadCacheItems() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    const list = document.getElementById('cache-items-list');

    if (items.length === 0) {
      list.innerHTML = `<p style="color: var(--gray); text-align: center; padding: 2rem;">No ${APP_CONFIG.itemNamePlural} found</p>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="cache-item">
        <div class="cache-item-header">
          <span class="cache-item-icon">${item.icon || '📦'}</span>
          <span class="cache-item-title">${this.escapeHtml(item.name)}</span>
        </div>
        <div class="cache-item-meta">
          <span>ID: ${item.id}</span>
          <span>Created: ${this.formatDate(item.createdAt)}</span>
        </div>
      </div>
    `).join('');
  },

  loadCacheRaw() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const items = Storage.getUserItems(user.id);
    document.getElementById('cache-raw-view').textContent = JSON.stringify({ items }, null, 2);
  },

  clearMyCache() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    if (['admin', 'demo'].includes(user.username)) {
      this.showToast('Cannot clear system account data', 'error');
      return;
    }

    if (!confirm(`Delete all your ${APP_CONFIG.itemNamePlural}? This cannot be undone.`)) {
      return;
    }

    const allItems = Storage.getAllItems();
    Object.keys(allItems).forEach(id => {
      if (allItems[id].userId === user.id) {
        delete allItems[id];
      }
    });
    Storage.saveAll(Storage.KEYS.ITEMS, allItems);

    this.loadItems();
    this.updateStats();
    this.closeCacheModal();
    this.closeSettingsModal();
    this.showToast('Your content has been cleared', 'success');
  },

  // ==================== ADMIN PANEL ====================

  openAdminPanel(e) {
    e?.preventDefault();
    const user = Auth.getCurrentUser();
    if (!user?.isAdmin) {
      this.showToast('Admin access required', 'error');
      return;
    }

    this.loadAdminStats();
    this.loadAdminUsers();
    this.loadChangelog();
    this.loadMonetization();
    document.getElementById('admin-modal').classList.add('active');
    document.getElementById('user-dropdown')?.classList.remove('active');
  },

  closeAdminModal() {
    document.getElementById('admin-modal')?.classList.remove('active');
  },

  switchAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.admin-tab[data-admin-tab="${tab}"]`)?.classList.add('active');

    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`admin-${tab}-tab`)?.classList.add('active');
  },

  loadAdminStats() {
    const users = Storage.getUsers();
    const items = Storage.getAllItems();

    document.getElementById('admin-stat-users').textContent = Object.keys(users).length;
    document.getElementById('admin-stat-items').textContent = Object.keys(items).length;
  },

  loadAdminUsers() {
    // Try to use SQL database first (shows ALL users from ALL sites)
    if (typeof SQLDatabase !== 'undefined' && SQLDatabase.db && SQLDatabase.getAllUsersAllSites) {
      const sqlUsers = SQLDatabase.getAllUsersAllSites();
      if (sqlUsers && sqlUsers.length > 0) {
        document.getElementById('users-count').textContent = `${sqlUsers.length} users from all sites`;
        
        const table = document.getElementById('users-table');
        table.innerHTML = sqlUsers.map(user => `
          <div class="user-row">
            <div class="user-info">
              <div class="user-avatar-small">${(user.displayName || user.username || '?').charAt(0).toUpperCase()}</div>
              <div>
                <div class="user-row-name">${this.escapeHtml(user.displayName || user.username)}</div>
                <div class="user-row-username">@${user.username} ${user.role === 'admin' ? '🛡️' : ''}</div>
              </div>
            </div>
            <div class="user-meta">
              <span class="site-badge" style="background: ${user.site === 'DemoTemplate' ? 'rgba(139,92,246,0.2)' : 'rgba(239,68,68,0.2)'}; color: ${user.site === 'DemoTemplate' ? '#8b5cf6' : '#ef4444'}; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${user.site || 'unknown'}</span>
              <span>Joined: ${user.createdAt ? this.formatDate(user.createdAt) : '-'}</span>
            </div>
          </div>
        `).join('');
        return;
      }
    }
    
    // Fallback to localStorage users
    const users = Storage.getUsers();
    const userList = Object.values(users);
    
    document.getElementById('users-count').textContent = `${userList.length} users`;
    
    const table = document.getElementById('users-table');
    table.innerHTML = userList.map(user => `
      <div class="user-row">
        <div class="user-info">
          <div class="user-avatar-small">${user.displayName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="user-row-name">${this.escapeHtml(user.displayName)}</div>
            <div class="user-row-username">@${user.username} ${user.isAdmin ? '🛡️' : ''}</div>
          </div>
        </div>
        <div class="user-meta">
          <span>Joined: ${this.formatDate(user.createdAt)}</span>
        </div>
      </div>
    `).join('');
  },

  loadChangelog() {
    const container = document.getElementById('changelog-content');
    if (!container || !APP_CONFIG.changelog) return;

    container.innerHTML = APP_CONFIG.changelog.map(entry => `
      <div class="changelog-version">
        <h3>${entry.version} <span class="changelog-date">${entry.date}</span></h3>
        <ul>
          ${entry.changes.map(change => `<li>${change}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  },

  handleSystemSettings(e) {
    e.preventDefault();
    this.showToast('System settings saved!', 'success');
  },

  exportAllData() {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${APP_CONFIG.storagePrefix}-full-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.showToast('Full export downloaded!', 'success');
  },

  resetAllData() {
    if (!confirm('⚠️ This will delete ALL data for ALL users. Are you sure?')) {
      return;
    }
    
    const password = prompt('Enter admin password to confirm:');
    if (password !== APP_CONFIG.defaultAdmin.password) {
      this.showToast('Incorrect password', 'error');
      return;
    }

    Storage.clearAll();
    this.closeAdminModal();
    Auth.logout();
    this.showToast('All data reset!', 'success');
    this.showAuthScreen();
  },

  // ==================== LEGAL MODAL ====================

  showLegal(e, type) {
    e?.preventDefault();
    
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-modal-title');
    const termsContent = document.getElementById('terms-content');
    const privacyContent = document.getElementById('privacy-content');

    if (type === 'terms') {
      title.textContent = 'Terms of Service';
      termsContent.style.display = 'block';
      privacyContent.style.display = 'none';
    } else {
      title.textContent = 'Privacy Policy';
      termsContent.style.display = 'none';
      privacyContent.style.display = 'block';
    }

    modal.classList.add('active');
  },

  closeLegalModal() {
    document.getElementById('legal-modal')?.classList.remove('active');
  },

  // ==================== MONETIZATION ====================

  initMonetization() {
    // Load saved settings
    const settings = this.getMonetizationSettings();
    
    // Populate admin fields
    const amazonEnabled = document.getElementById('monetize-amazon-enabled');
    const adsenseEnabled = document.getElementById('monetize-adsense-enabled');
    if (amazonEnabled) amazonEnabled.checked = settings.amazon?.enabled || false;
    if (adsenseEnabled) adsenseEnabled.checked = settings.adsense?.enabled || false;
    
    const amazonTag = document.getElementById('monetize-amazon-tag');
    if (amazonTag) amazonTag.value = settings.amazon?.tag || '';
    
    const amazonTitle = document.getElementById('monetize-amazon-title');
    if (amazonTitle) amazonTitle.value = settings.amazon?.title || '\ud83d\uded2 Recommended Resources';
    
    const amazonSubtitle = document.getElementById('monetize-amazon-subtitle');
    if (amazonSubtitle) amazonSubtitle.value = settings.amazon?.subtitle || 'Tools and resources we use and recommend';
    
    const adsensePub = document.getElementById('monetize-adsense-pub');
    if (adsensePub) adsensePub.value = settings.adsense?.publisherId || '';
    
    const adsensePlacement = document.getElementById('monetize-adsense-placement');
    if (adsensePlacement) adsensePlacement.value = settings.adsense?.placement || 'footer';
    
    // Render saved products
    this.renderProductsList(settings.amazon?.products || []);
    
    // Toggle field visibility
    this.toggleMonetizeFields('amazon-fields', settings.amazon?.enabled);
    this.toggleMonetizeFields('adsense-fields', settings.adsense?.enabled);
    
    // Bind events
    amazonEnabled?.addEventListener('change', (e) => this.toggleMonetizeFields('amazon-fields', e.target.checked));
    adsenseEnabled?.addEventListener('change', (e) => this.toggleMonetizeFields('adsense-fields', e.target.checked));
    document.getElementById('add-product-btn')?.addEventListener('click', () => this.addProductRow());
    document.getElementById('save-monetization-btn')?.addEventListener('click', () => this.saveMonetization());
  },

  toggleMonetizeFields(id, show) {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? 'block' : 'none';
  },

  getMonetizationSettings() {
    try {
      return JSON.parse(localStorage.getItem(`${APP_CONFIG.storagePrefix}_monetization`) || '{}');
    } catch { return {}; }
  },

  renderProductsList(products) {
    const list = document.getElementById('monetize-products-list');
    if (!list) return;
    
    if (products.length === 0) {
      list.innerHTML = '<p class="monetize-empty">No products added. Click "Add Product" to get started.</p>';
      return;
    }
    
    list.innerHTML = products.map((p, i) => `
      <div class="monetize-product-row" data-index="${i}">
        <div class="product-row-header">
          <span class="product-row-num">#${i + 1}</span>
          <button type="button" class="btn-tiny danger" onclick="App.removeProduct(${i})">�\uddd1</button>
        </div>
        <div class="product-row-fields">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="product-field" data-field="name" data-index="${i}" value="${this.escapeHtml(p.name || '')}" placeholder="Product name">
          </div>
          <div class="form-group">
            <label>ASIN or URL</label>
            <input type="text" class="product-field" data-field="asin" data-index="${i}" value="${this.escapeHtml(p.asin || '')}" placeholder="B0XXXXXXXX or full Amazon URL">
            <span class="form-hint">Amazon product ID (from URL) — your tag gets added automatically</span>
          </div>
          <div class="product-row-inline">
            <div class="form-group">
              <label>Price</label>
              <input type="text" class="product-field" data-field="price" data-index="${i}" value="${this.escapeHtml(p.price || '')}" placeholder="$29.99">
            </div>
            <div class="form-group">
              <label>Icon</label>
              <input type="text" class="product-field" data-field="icon" data-index="${i}" value="${p.icon || '\ud83d\udcd8'}" placeholder="\ud83d\udcd8" style="text-align:center;">
            </div>
            <div class="form-group">
              <label>Color</label>
              <input type="color" class="product-field product-color-input" data-field="color" data-index="${i}" value="${p.color || '#3b82f6'}">
            </div>
          </div>
          <div class="product-row-inline">
            <div class="form-group">
              <label>Description</label>
              <input type="text" class="product-field" data-field="description" data-index="${i}" value="${this.escapeHtml(p.description || '')}" placeholder="Short description">
            </div>
            <div class="form-group">
              <label>Badge</label>
              <input type="text" class="product-field" data-field="badge" data-index="${i}" value="${this.escapeHtml(p.badge || '')}" placeholder="Popular, New, etc.">
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  addProductRow() {
    const settings = this.getMonetizationSettings();
    const products = settings.amazon?.products || [];
    products.push({ name: '', asin: '', price: '', icon: '\ud83d\udcd8', color: '#3b82f6', description: '', badge: '' });
    this.renderProductsList(products);
  },

  removeProduct(index) {
    const products = this.collectProductsFromForm();
    products.splice(index, 1);
    this.renderProductsList(products);
  },

  collectProductsFromForm() {
    const products = [];
    const rows = document.querySelectorAll('.monetize-product-row');
    rows.forEach(row => {
      const i = row.dataset.index;
      const get = (field) => row.querySelector(`[data-field="${field}"]`)?.value || '';
      products.push({
        name: get('name'),
        asin: get('asin'),
        price: get('price'),
        icon: get('icon') || '\ud83d\udcd8',
        color: get('color') || '#3b82f6',
        description: get('description'),
        badge: get('badge')
      });
    });
    return products;
  },

  saveMonetization() {
    const tag = document.getElementById('monetize-amazon-tag')?.value.trim() || '';
    const products = this.collectProductsFromForm();
    
    // Build URLs from ASINs + tag
    products.forEach(p => {
      if (p.asin && !p.asin.startsWith('http')) {
        p.url = `https://www.amazon.com/dp/${p.asin}${tag ? '?tag=' + tag : ''}`;
      } else if (p.asin && p.asin.startsWith('http')) {
        // If full URL, inject tag
        try {
          const url = new URL(p.asin);
          if (tag) url.searchParams.set('tag', tag);
          p.url = url.toString();
        } catch {
          p.url = p.asin;
        }
      } else {
        p.url = '#';
      }
    });
    
    const settings = {
      amazon: {
        enabled: document.getElementById('monetize-amazon-enabled')?.checked || false,
        tag: tag,
        title: document.getElementById('monetize-amazon-title')?.value || '\ud83d\uded2 Recommended Resources',
        subtitle: document.getElementById('monetize-amazon-subtitle')?.value || '',
        products: products
      },
      adsense: {
        enabled: document.getElementById('monetize-adsense-enabled')?.checked || false,
        publisherId: document.getElementById('monetize-adsense-pub')?.value.trim() || '',
        placement: document.getElementById('monetize-adsense-placement')?.value || 'footer'
      }
    };
    
    localStorage.setItem(`${APP_CONFIG.storagePrefix}_monetization`, JSON.stringify(settings));
    
    // Refresh the landing page shop section
    this.loadShopSection();
    this.loadAdSense();
    
    this.showToast('Monetization settings saved!', 'success');
  },

  loadAdSense() {
    const settings = this.getMonetizationSettings();
    const adsense = settings.adsense;
    
    // Remove existing adsense script if any
    document.getElementById('adsense-script')?.remove();
    
    if (!adsense?.enabled || !adsense?.publisherId) return;
    
    // Inject AdSense script
    const script = document.createElement('script');
    script.id = 'adsense-script';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense.publisherId}`;
    document.head.appendChild(script);
    
    if (adsense.placement === 'auto') {
      // Auto ads - Google handles placement
      const meta = document.createElement('meta');
      meta.name = 'google-adsense-account';
      meta.content = adsense.publisherId;
      document.head.appendChild(meta);
    }
  },

  // ==================== MONETIZATION ====================

  getMonetizationKey() {
    return `${APP_CONFIG.storagePrefix}_monetization`;
  },

  getMonetizationSettings() {
    try {
      const data = localStorage.getItem(this.getMonetizationKey());
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  },

  loadMonetization() {
    const settings = this.getMonetizationSettings();
    const amazonEnabled = document.getElementById('monetize-amazon-enabled');
    const adsenseEnabled = document.getElementById('monetize-adsense-enabled');
    const amazonFields = document.getElementById('amazon-fields');
    const adsenseFields = document.getElementById('adsense-fields');

    if (settings) {
      // Amazon
      amazonEnabled.checked = settings.amazon?.enabled || false;
      document.getElementById('monetize-amazon-tag').value = settings.amazon?.tag || '';
      document.getElementById('monetize-amazon-title').value = settings.amazon?.title || '\ud83d\uded2 Recommended Resources';
      document.getElementById('monetize-amazon-subtitle').value = settings.amazon?.subtitle || 'Tools and resources we use and recommend';
      this.renderProductRows(settings.amazon?.products || []);

      // AdSense
      adsenseEnabled.checked = settings.adsense?.enabled || false;
      document.getElementById('monetize-adsense-pub').value = settings.adsense?.pubId || '';
      document.getElementById('monetize-adsense-placement').value = settings.adsense?.placement || 'footer';
    } else {
      // Load defaults from config.js shop section
      const shop = APP_CONFIG.shop;
      if (shop) {
        amazonEnabled.checked = true;
        document.getElementById('monetize-amazon-tag').value = shop.amazonTag || '';
        document.getElementById('monetize-amazon-title').value = shop.title || '';
        document.getElementById('monetize-amazon-subtitle').value = shop.subtitle || '';
        this.renderProductRows(shop.products || []);
      } else {
        this.renderProductRows([]);
      }
    }

    // Toggle field visibility
    amazonFields.style.display = amazonEnabled.checked ? '' : 'none';
    adsenseFields.style.display = adsenseEnabled.checked ? '' : 'none';
  },

  saveMonetization() {
    const tag = document.getElementById('monetize-amazon-tag').value.trim();
    const products = this.collectProductRows();

    const settings = {
      amazon: {
        enabled: document.getElementById('monetize-amazon-enabled').checked,
        tag: tag,
        title: document.getElementById('monetize-amazon-title').value.trim(),
        subtitle: document.getElementById('monetize-amazon-subtitle').value.trim(),
        products: products
      },
      adsense: {
        enabled: document.getElementById('monetize-adsense-enabled').checked,
        pubId: document.getElementById('monetize-adsense-pub').value.trim(),
        placement: document.getElementById('monetize-adsense-placement').value
      }
    };

    localStorage.setItem(this.getMonetizationKey(), JSON.stringify(settings));
    this.showToast('Monetization settings saved! Refresh to see changes.', 'success');
  },

  renderProductRows(products) {
    const list = document.getElementById('monetize-products-list');
    if (!list) return;

    if (products.length === 0) {
      list.innerHTML = '<p style="color: var(--gray); font-size: 0.85rem; padding: 1rem 0;">No products added yet. Click \"Add Product\" to start.</p>';
      return;
    }

    const icons = ['\ud83d\udcd8', '\ud83d\udee0\ufe0f', '\ud83c\udfaf', '\ud83d\ude80', '\u2b50', '\ud83d\udd25', '\ud83d\udca1', '\ud83c\udfa8', '\ud83d\udcbb', '\ud83c\udf10'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    list.innerHTML = products.map((p, i) => `
      <div class="product-row" data-index="${i}">
        <div class="product-row-header">
          <span class="product-row-num">#${i + 1}</span>
          <button type="button" class="btn-tiny danger" onclick="App.removeProductRow(${i})">&times;</button>
        </div>
        <div class="product-row-fields">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="prod-name" value="${this.escapeHtml(p.name || '')}" placeholder="Product name">
          </div>
          <div class="form-group">
            <label>Description</label>
            <input type="text" class="prod-desc" value="${this.escapeHtml(p.description || '')}" placeholder="Short description">
          </div>
          <div class="product-row-inline">
            <div class="form-group">
              <label>ASIN or URL</label>
              <input type="text" class="prod-asin" value="${this.escapeHtml(p.asin || p.url || '')}" placeholder="B0XXXXXXXX or full URL">
            </div>
            <div class="form-group">
              <label>Price</label>
              <input type="text" class="prod-price" value="${this.escapeHtml(p.price || '')}" placeholder="$29.99">
            </div>
          </div>
          <div class="product-row-inline">
            <div class="form-group">
              <label>Icon</label>
              <select class="prod-icon">
                ${icons.map(ic => `<option value="${ic}" ${ic === (p.icon || icons[0]) ? 'selected' : ''}>${ic}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Color</label>
              <select class="prod-color">
                ${colors.map(c => `<option value="${c}" style="background:${c}" ${c === (p.color || colors[0]) ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Badge</label>
              <input type="text" class="prod-badge" value="${this.escapeHtml(p.badge || '')}" placeholder="Popular, New...">
            </div>
          </div>
        </div>
      </div>
    `).join('');
  },

  addProductRow() {
    const products = this.collectProductRows();
    products.push({ name: '', description: '', asin: '', price: '', icon: '\ud83d\udcd8', color: '#3b82f6', badge: '' });
    this.renderProductRows(products);
  },

  removeProductRow(index) {
    const products = this.collectProductRows();
    products.splice(index, 1);
    this.renderProductRows(products);
  },

  collectProductRows() {
    const rows = document.querySelectorAll('.product-row');
    const products = [];
    rows.forEach(row => {
      products.push({
        name: row.querySelector('.prod-name')?.value || '',
        description: row.querySelector('.prod-desc')?.value || '',
        asin: row.querySelector('.prod-asin')?.value || '',
        price: row.querySelector('.prod-price')?.value || '',
        icon: row.querySelector('.prod-icon')?.value || '\ud83d\udcd8',
        color: row.querySelector('.prod-color')?.value || '#3b82f6',
        badge: row.querySelector('.prod-badge')?.value || ''
      });
    });
    return products;
  },

  loadShopFromSettings() {
    const settings = this.getMonetizationSettings();
    if (!settings || !settings.amazon?.enabled) return null;
    if (!settings.amazon.products || settings.amazon.products.length === 0) return null;

    const tag = settings.amazon.tag || '';
    return {
      title: settings.amazon.title || 'Recommended',
      subtitle: settings.amazon.subtitle || '',
      products: settings.amazon.products.filter(p => p.name).map(p => {
        let url = p.asin || '';
        if (url && !url.startsWith('http')) {
          url = `https://www.amazon.com/dp/${url}${tag ? '?tag=' + tag : ''}`;
        } else if (url && tag && !url.includes('tag=')) {
          url += (url.includes('?') ? '&' : '?') + 'tag=' + tag;
        }
        return { ...p, url };
      })
    };
  },

  loadAdSense() {
    const settings = this.getMonetizationSettings();
    if (!settings || !settings.adsense?.enabled || !settings.adsense?.pubId) return;

    const pubId = settings.adsense.pubId;
    const placement = settings.adsense.placement || 'footer';

    // Inject AdSense script
    if (!document.querySelector('script[data-adsense]')) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.adsense = 'true';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`;
      document.head.appendChild(script);
    }

    if (placement === 'auto') return; // Google handles everything

    // Manual ad placement
    const adHtml = `<div class="adsense-container"><ins class="adsbygoogle" style="display:block" data-ad-client="${pubId}" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`;

    if (placement === 'footer') {
      const footer = document.querySelector('.landing-footer');
      if (footer) footer.insertAdjacentHTML('beforebegin', adHtml);
    } else if (placement === 'between') {
      const sections = document.querySelectorAll('.landing-features, .landing-items, .landing-shop');
      sections.forEach(s => s.insertAdjacentHTML('afterend', adHtml));
    }

    // Push ads
    setTimeout(() => {
      document.querySelectorAll('.adsbygoogle:not([data-pushed])').forEach(ad => {
        ad.dataset.pushed = 'true';
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
      });
    }, 500);
  },

  // ==================== UTILITIES ====================

  showLoading(message = 'Loading...') {
    document.getElementById('loading-message').textContent = message;
    document.getElementById('loading-overlay').classList.add('active');
  },

  hideLoading() {
    document.getElementById('loading-overlay').classList.remove('active');
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  },

  adjustColor(hex, amount) {
    if (!hex) return '#ff3366';
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
