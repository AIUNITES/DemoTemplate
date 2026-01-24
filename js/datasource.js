/**
 * DemoTemplate DataSource Manager
 * ================================
 * Handles multiple data storage backends:
 * - localStorage (default)
 * - Google Forms/Sheets
 * - GitHub Gist
 * - GitHub Repo JSON
 * - JSONbin.io
 * - npoint.io
 */

const DataSourceManager = {
  // Current active source
  activeSource: 'localStorage',
  
  // Configuration storage key
  CONFIG_KEY: 'demotemplate_datasource_config',
  
  // Available datasource types
  SOURCES: {
    localStorage: {
      name: 'localStorage',
      label: 'Browser Storage',
      icon: '💾',
      requiresConfig: false
    },
    googleSheets: {
      name: 'googleSheets',
      label: 'Google Sheets',
      icon: '📊',
      requiresConfig: true,
      fields: ['formUrl', 'apiUrl', 'prefix']
    },
    githubGist: {
      name: 'githubGist',
      label: 'GitHub Gist',
      icon: '📝',
      requiresConfig: true,
      fields: ['gistId', 'filename', 'token']
    },
    githubRepo: {
      name: 'githubRepo',
      label: 'GitHub Repo',
      icon: '📁',
      requiresConfig: true,
      fields: ['owner', 'repo', 'path', 'branch', 'token']
    },
    jsonbin: {
      name: 'jsonbin',
      label: 'JSONbin.io',
      icon: '🗃️',
      requiresConfig: true,
      fields: ['binId', 'apiKey']
    },
    npoint: {
      name: 'npoint',
      label: 'npoint.io',
      icon: '📡',
      requiresConfig: true,
      fields: ['endpointId']
    }
  },

  /**
   * Initialize the datasource manager
   */
  init() {
    this.loadConfig();
    this.bindEvents();
    this.updateUI();
    console.log('[DataSource] Initialized. Active source:', this.activeSource);
  },

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        this.activeSource = config.activeSource || 'localStorage';
        this.configs = config.configs || {};
      } else {
        this.activeSource = 'localStorage';
        this.configs = {};
      }
    } catch (e) {
      console.error('[DataSource] Error loading config:', e);
      this.activeSource = 'localStorage';
      this.configs = {};
    }
  },

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    const config = {
      activeSource: this.activeSource,
      configs: this.configs,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    console.log('[DataSource] Config saved');
  },

  /**
   * Bind UI events
   */
  bindEvents() {
    // Datasource card selection
    document.querySelectorAll('.datasource-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const source = e.target.dataset.source;
        this.openConfigModal(source);
      });
    });

    // Close config modal
    document.getElementById('close-datasource-config-modal')?.addEventListener('click', () => {
      this.closeConfigModal();
    });

    // Test connection
    document.getElementById('test-datasource-btn')?.addEventListener('click', () => {
      this.testConnection();
    });

    // Save datasource
    document.getElementById('save-datasource-btn')?.addEventListener('click', () => {
      this.saveAndActivate();
    });

    // Modal backdrop click
    document.getElementById('datasource-config-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'datasource-config-modal') {
        this.closeConfigModal();
      }
    });
  },

  /**
   * Update UI to reflect current state
   */
  updateUI() {
    // Update active datasource display
    const activeDisplay = document.getElementById('active-datasource');
    if (activeDisplay) {
      const source = this.SOURCES[this.activeSource];
      activeDisplay.textContent = source ? `${source.icon} ${source.label}` : 'localStorage';
    }

    // Update status indicator
    const indicator = document.getElementById('datasource-status-indicator');
    if (indicator) {
      indicator.className = 'status-indicator connected';
    }

    // Update card states
    document.querySelectorAll('.datasource-card').forEach(card => {
      const source = card.dataset.source;
      const btn = card.querySelector('.datasource-select-btn');
      
      if (source === this.activeSource) {
        card.classList.add('active');
        if (btn) btn.textContent = 'Selected ✓';
      } else {
        card.classList.remove('active');
        if (btn) btn.textContent = this.configs[source] ? 'Configured' : 'Configure';
      }
    });
  },

  /**
   * Open configuration modal for a datasource
   */
  openConfigModal(source) {
    const modal = document.getElementById('datasource-config-modal');
    const title = document.getElementById('datasource-config-title');
    
    if (!modal) return;

    // Hide all config forms
    document.querySelectorAll('.datasource-config-form').forEach(form => {
      form.style.display = 'none';
    });

    // Show the selected config form
    const configForm = document.getElementById(`config-${source}`);
    if (configForm) {
      configForm.style.display = 'block';
    }

    // Update title
    const sourceInfo = this.SOURCES[source];
    if (title && sourceInfo) {
      title.textContent = `Configure ${sourceInfo.icon} ${sourceInfo.label}`;
    }

    // Load saved config values
    this.loadFormValues(source);

    // Store current source being configured
    this.configuringSource = source;

    // Clear test result
    const testResult = document.getElementById('datasource-test-result');
    if (testResult) {
      testResult.innerHTML = '';
      testResult.className = 'test-result';
    }

    // Show modal
    modal.classList.add('active');
  },

  /**
   * Close configuration modal
   */
  closeConfigModal() {
    const modal = document.getElementById('datasource-config-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.configuringSource = null;
  },

  /**
   * Load saved form values for a datasource
   */
  loadFormValues(source) {
    const config = this.configs[source] || {};
    
    switch (source) {
      case 'googleSheets':
        document.getElementById('config-google-form-url').value = config.formUrl || '';
        document.getElementById('config-google-api-url').value = config.apiUrl || '';
        document.getElementById('config-google-prefix').value = config.prefix || 'USER';
        break;
      case 'githubGist':
        document.getElementById('config-gist-id').value = config.gistId || '';
        document.getElementById('config-gist-filename').value = config.filename || 'data.json';
        document.getElementById('config-gist-token').value = config.token || '';
        break;
      case 'githubRepo':
        document.getElementById('config-repo-owner').value = config.owner || '';
        document.getElementById('config-repo-name').value = config.repo || '';
        document.getElementById('config-repo-path').value = config.path || 'data/database.json';
        document.getElementById('config-repo-branch').value = config.branch || 'main';
        document.getElementById('config-repo-token').value = config.token || '';
        break;
      case 'jsonbin':
        document.getElementById('config-jsonbin-id').value = config.binId || '';
        document.getElementById('config-jsonbin-key').value = config.apiKey || '';
        break;
      case 'npoint':
        document.getElementById('config-npoint-id').value = config.endpointId || '';
        break;
    }
  },

  /**
   * Get form values for current datasource
   */
  getFormValues() {
    const source = this.configuringSource;
    let config = {};
    
    switch (source) {
      case 'googleSheets':
        config = {
          formUrl: document.getElementById('config-google-form-url').value.trim(),
          apiUrl: document.getElementById('config-google-api-url').value.trim(),
          prefix: document.getElementById('config-google-prefix').value.trim() || 'USER'
        };
        break;
      case 'githubGist':
        config = {
          gistId: document.getElementById('config-gist-id').value.trim(),
          filename: document.getElementById('config-gist-filename').value.trim() || 'data.json',
          token: document.getElementById('config-gist-token').value.trim()
        };
        break;
      case 'githubRepo':
        config = {
          owner: document.getElementById('config-repo-owner').value.trim(),
          repo: document.getElementById('config-repo-name').value.trim(),
          path: document.getElementById('config-repo-path').value.trim() || 'data/database.json',
          branch: document.getElementById('config-repo-branch').value.trim() || 'main',
          token: document.getElementById('config-repo-token').value.trim()
        };
        break;
      case 'jsonbin':
        config = {
          binId: document.getElementById('config-jsonbin-id').value.trim(),
          apiKey: document.getElementById('config-jsonbin-key').value.trim()
        };
        break;
      case 'npoint':
        config = {
          endpointId: document.getElementById('config-npoint-id').value.trim()
        };
        break;
      case 'localStorage':
        config = { enabled: true };
        break;
    }
    
    return config;
  },

  /**
   * Test connection for current datasource
   */
  async testConnection() {
    const source = this.configuringSource;
    const config = this.getFormValues();
    const resultEl = document.getElementById('datasource-test-result');
    
    if (!resultEl) return;
    
    resultEl.innerHTML = '<span class="testing">🔄 Testing connection...</span>';
    resultEl.className = 'test-result';

    try {
      let success = false;
      let message = '';

      switch (source) {
        case 'localStorage':
          success = true;
          message = 'localStorage is always available';
          break;
          
        case 'googleSheets':
          if (!config.apiUrl) {
            throw new Error('Apps Script API URL is required');
          }
          const gsResponse = await fetch(config.apiUrl);
          success = gsResponse.ok;
          message = success ? 'Connected to Google Sheets API' : 'Failed to connect';
          break;
          
        case 'githubGist':
          if (!config.gistId) {
            throw new Error('Gist ID is required');
          }
          const gistUrl = `https://api.github.com/gists/${config.gistId}`;
          const gistHeaders = config.token ? { 'Authorization': `token ${config.token}` } : {};
          const gistResponse = await fetch(gistUrl, { headers: gistHeaders });
          success = gistResponse.ok;
          message = success ? 'Connected to GitHub Gist' : `Failed: ${gistResponse.status}`;
          break;
          
        case 'githubRepo':
          if (!config.owner || !config.repo) {
            throw new Error('Repository owner and name are required');
          }
          const repoUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;
          const repoHeaders = config.token ? { 'Authorization': `token ${config.token}` } : {};
          const repoResponse = await fetch(repoUrl, { headers: repoHeaders });
          success = repoResponse.ok;
          message = success ? 'Connected to GitHub Repository' : `Failed: ${repoResponse.status}`;
          break;
          
        case 'jsonbin':
          if (!config.binId || !config.apiKey) {
            throw new Error('Bin ID and API Key are required');
          }
          const jsonbinUrl = `https://api.jsonbin.io/v3/b/${config.binId}`;
          const jsonbinResponse = await fetch(jsonbinUrl, {
            headers: { 'X-Master-Key': config.apiKey }
          });
          success = jsonbinResponse.ok;
          message = success ? 'Connected to JSONbin.io' : `Failed: ${jsonbinResponse.status}`;
          break;
          
        case 'npoint':
          if (!config.endpointId) {
            throw new Error('Endpoint ID is required');
          }
          const npointUrl = `https://api.npoint.io/${config.endpointId}`;
          const npointResponse = await fetch(npointUrl);
          success = npointResponse.ok;
          message = success ? 'Connected to npoint.io' : `Failed: ${npointResponse.status}`;
          break;
      }

      resultEl.innerHTML = success 
        ? `<span class="success">✅ ${message}</span>`
        : `<span class="error">❌ ${message}</span>`;
      resultEl.className = `test-result ${success ? 'success' : 'error'}`;
      
    } catch (error) {
      resultEl.innerHTML = `<span class="error">❌ Error: ${error.message}</span>`;
      resultEl.className = 'test-result error';
    }
  },

  /**
   * Save configuration and activate datasource
   */
  saveAndActivate() {
    const source = this.configuringSource;
    const config = this.getFormValues();
    
    // Store config
    this.configs[source] = config;
    
    // Set as active
    this.activeSource = source;
    
    // Save to localStorage
    this.saveConfig();
    
    // Update UI
    this.updateUI();
    
    // Close modal
    this.closeConfigModal();
    
    // Show success toast
    if (typeof showToast === 'function') {
      const sourceInfo = this.SOURCES[source];
      showToast(`${sourceInfo.icon} ${sourceInfo.label} is now active`, 'success');
    }
    
    console.log('[DataSource] Activated:', source);
  },

  /**
   * Read data from active datasource
   */
  async read(key) {
    const config = this.configs[this.activeSource] || {};
    
    switch (this.activeSource) {
      case 'localStorage':
        return JSON.parse(localStorage.getItem(key) || 'null');
        
      case 'googleSheets':
        if (!config.apiUrl) return null;
        try {
          const response = await fetch(`${config.apiUrl}?action=get&key=${key}`);
          const data = await response.json();
          return data;
        } catch (e) {
          console.error('[DataSource] Google Sheets read error:', e);
          return null;
        }
        
      case 'githubGist':
        if (!config.gistId) return null;
        try {
          const headers = config.token ? { 'Authorization': `token ${config.token}` } : {};
          const response = await fetch(`https://api.github.com/gists/${config.gistId}`, { headers });
          const gist = await response.json();
          const content = gist.files[config.filename]?.content;
          return content ? JSON.parse(content) : null;
        } catch (e) {
          console.error('[DataSource] GitHub Gist read error:', e);
          return null;
        }
        
      case 'githubRepo':
        if (!config.owner || !config.repo) return null;
        try {
          const url = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.path}`;
          const response = await fetch(url);
          return await response.json();
        } catch (e) {
          console.error('[DataSource] GitHub Repo read error:', e);
          return null;
        }
        
      case 'jsonbin':
        if (!config.binId || !config.apiKey) return null;
        try {
          const response = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}/latest`, {
            headers: { 'X-Master-Key': config.apiKey }
          });
          const data = await response.json();
          return data.record;
        } catch (e) {
          console.error('[DataSource] JSONbin read error:', e);
          return null;
        }
        
      case 'npoint':
        if (!config.endpointId) return null;
        try {
          const response = await fetch(`https://api.npoint.io/${config.endpointId}`);
          return await response.json();
        } catch (e) {
          console.error('[DataSource] npoint read error:', e);
          return null;
        }
        
      default:
        return null;
    }
  },

  /**
   * Write data to active datasource
   */
  async write(key, data) {
    const config = this.configs[this.activeSource] || {};
    
    switch (this.activeSource) {
      case 'localStorage':
        localStorage.setItem(key, JSON.stringify(data));
        return true;
        
      case 'googleSheets':
        // Google Forms submission
        if (!config.formUrl) return false;
        try {
          const formData = new FormData();
          formData.append('entry.0', JSON.stringify(data));
          await fetch(config.formUrl, { method: 'POST', body: formData, mode: 'no-cors' });
          return true;
        } catch (e) {
          console.error('[DataSource] Google Sheets write error:', e);
          return false;
        }
        
      case 'githubGist':
        if (!config.gistId || !config.token) return false;
        try {
          await fetch(`https://api.github.com/gists/${config.gistId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `token ${config.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              files: { [config.filename]: { content: JSON.stringify(data, null, 2) } }
            })
          });
          return true;
        } catch (e) {
          console.error('[DataSource] GitHub Gist write error:', e);
          return false;
        }
        
      case 'githubRepo':
        if (!config.owner || !config.repo || !config.token) return false;
        try {
          // Get current file SHA
          const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
          const getResponse = await fetch(getUrl, {
            headers: { 'Authorization': `token ${config.token}` }
          });
          const fileInfo = await getResponse.json();
          
          // Update file
          await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${config.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Update ${config.path}`,
              content: btoa(JSON.stringify(data, null, 2)),
              sha: fileInfo.sha,
              branch: config.branch
            })
          });
          return true;
        } catch (e) {
          console.error('[DataSource] GitHub Repo write error:', e);
          return false;
        }
        
      case 'jsonbin':
        if (!config.binId || !config.apiKey) return false;
        try {
          await fetch(`https://api.jsonbin.io/v3/b/${config.binId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Master-Key': config.apiKey
            },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) {
          console.error('[DataSource] JSONbin write error:', e);
          return false;
        }
        
      case 'npoint':
        if (!config.endpointId) return false;
        try {
          await fetch(`https://api.npoint.io/${config.endpointId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return true;
        } catch (e) {
          console.error('[DataSource] npoint write error:', e);
          return false;
        }
        
      default:
        return false;
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  DataSourceManager.init();
});

// Export for use in other modules
window.DataSourceManager = DataSourceManager;
