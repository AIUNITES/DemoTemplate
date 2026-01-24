/**
 * DemoTemplate SQL Database Manager
 * ==================================
 * Browser-based SQLite database using sql.js
 * - Create/manage databases
 * - Run SQL queries
 * - Import/export .db files
 * - Auto-save to localStorage or IndexedDB
 * - Multiple backend locations (browser, local server, GitHub, Supabase, Turso)
 */

const SQLDatabase = {
  db: null,
  isLoaded: false,
  SQL: null,
  history: [],
  
  // Storage keys
  STORAGE_KEY: 'demotemplate_sqldb',
  HISTORY_KEY: 'demotemplate_sql_history',
  LOCATION_KEY: 'demotemplate_db_location',
  
  // Current location config
  location: 'browser',
  locationConfig: {},
  
  // Database location types
  LOCATIONS: {
    browser: { name: 'Browser', icon: '💻', requiresConfig: false },
    localServer: { name: 'Local Server', icon: '🖥️', requiresConfig: true },
    githubSync: { name: 'GitHub Sync', icon: '🐙', requiresConfig: true },
    supabase: { name: 'Supabase', icon: '⚡', requiresConfig: true },
    turso: { name: 'Turso', icon: '🚀', requiresConfig: true }
  },
  
  /**
   * Initialize sql.js and load saved database
   */
  async init() {
    try {
      // Load sql.js WebAssembly
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
      });
      
      console.log('[SQLDatabase] sql.js loaded successfully');
      
      // Load location config
      this.loadLocationConfig();
      
      // Try to load saved database
      await this.loadFromStorage();
      
      // Load query history
      this.loadHistory();
      
      // Bind UI events
      this.bindEvents();
      
      // Update UI
      this.updateStatus();
      this.refreshTables();
      this.updateLocationUI();
      
    } catch (error) {
      console.error('[SQLDatabase] Failed to initialize:', error);
      this.updateStatus('Error loading sql.js', 'error');
    }
  },
  
  /**
   * Load location configuration
   */
  loadLocationConfig() {
    try {
      const saved = localStorage.getItem(this.LOCATION_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        this.location = config.location || 'browser';
        this.locationConfig = config.configs || {};
      }
    } catch (e) {
      console.error('[SQLDatabase] Error loading location config:', e);
    }
  },
  
  /**
   * Save location configuration
   */
  saveLocationConfig() {
    const config = {
      location: this.location,
      configs: this.locationConfig,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.LOCATION_KEY, JSON.stringify(config));
  },
  
  /**
   * Update location UI
   */
  updateLocationUI() {
    // Update status badge
    const statusEl = document.getElementById('db-location-status');
    if (statusEl) {
      const loc = this.LOCATIONS[this.location];
      statusEl.textContent = loc ? `${loc.icon} ${loc.name}` : 'Browser';
    }
    
    // Update card states
    document.querySelectorAll('.db-location-card').forEach(card => {
      const cardLoc = card.dataset.location;
      if (cardLoc === this.location) {
        card.classList.add('active');
        const badge = card.querySelector('.db-loc-badge');
        const btn = card.querySelector('.btn-tiny');
        if (badge) badge.style.display = 'inline';
        if (btn) btn.style.display = 'none';
      } else {
        card.classList.remove('active');
        const badge = card.querySelector('.db-loc-badge');
        const btn = card.querySelector('.btn-tiny');
        if (badge) badge.style.display = 'none';
        if (btn) btn.style.display = 'inline';
      }
    });
  },
  
  /**
   * Configure a database location
   */
  configureLocation(locationType) {
    const modal = document.getElementById('db-location-modal');
    const title = document.getElementById('db-location-modal-title');
    
    if (!modal) return;
    
    // Hide all config forms
    document.querySelectorAll('.db-location-config-form').forEach(form => {
      form.style.display = 'none';
    });
    
    // Show the selected config form
    const configForm = document.getElementById(`config-${locationType}`);
    if (configForm) {
      configForm.style.display = 'block';
    }
    
    // Update title
    const loc = this.LOCATIONS[locationType];
    if (title && loc) {
      title.textContent = `Configure ${loc.icon} ${loc.name}`;
    }
    
    // Load saved config values
    this.loadLocationFormValues(locationType);
    
    // Store current location being configured
    this.configuringLocation = locationType;
    
    // Clear test result
    const testResult = document.getElementById('db-location-test-result');
    if (testResult) {
      testResult.innerHTML = '';
    }
    
    // Show modal
    modal.classList.add('active');
  },
  
  /**
   * Close location config modal
   */
  closeLocationModal() {
    const modal = document.getElementById('db-location-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.configuringLocation = null;
  },
  
  /**
   * Load saved form values for a location
   */
  loadLocationFormValues(locationType) {
    const config = this.locationConfig[locationType] || {};
    
    switch (locationType) {
      case 'localServer':
        const serverUrl = document.getElementById('config-local-server-url');
        if (serverUrl) serverUrl.value = config.serverUrl || '';
        break;
        
      case 'githubSync':
        const ghOwner = document.getElementById('config-gh-sync-owner');
        const ghRepo = document.getElementById('config-gh-sync-repo');
        const ghPath = document.getElementById('config-gh-sync-path');
        const ghToken = document.getElementById('config-gh-sync-token');
        const ghAuto = document.getElementById('config-gh-sync-auto');
        if (ghOwner) ghOwner.value = config.owner || '';
        if (ghRepo) ghRepo.value = config.repo || '';
        if (ghPath) ghPath.value = config.path || 'data/app.db';
        if (ghToken) ghToken.value = config.token || '';
        if (ghAuto) ghAuto.checked = config.autoSync !== false;
        break;
        
      case 'supabase':
        const sbUrl = document.getElementById('config-supabase-url');
        const sbKey = document.getElementById('config-supabase-key');
        if (sbUrl) sbUrl.value = config.url || '';
        if (sbKey) sbKey.value = config.key || '';
        break;
        
      case 'turso':
        const tursoUrl = document.getElementById('config-turso-url');
        const tursoToken = document.getElementById('config-turso-token');
        if (tursoUrl) tursoUrl.value = config.url || '';
        if (tursoToken) tursoToken.value = config.token || '';
        break;
    }
  },
  
  /**
   * Get form values for current location
   */
  getLocationFormValues() {
    const locationType = this.configuringLocation;
    let config = {};
    
    switch (locationType) {
      case 'localServer':
        config = {
          serverUrl: document.getElementById('config-local-server-url')?.value.trim() || ''
        };
        break;
        
      case 'githubSync':
        config = {
          owner: document.getElementById('config-gh-sync-owner')?.value.trim() || '',
          repo: document.getElementById('config-gh-sync-repo')?.value.trim() || '',
          path: document.getElementById('config-gh-sync-path')?.value.trim() || 'data/app.db',
          token: document.getElementById('config-gh-sync-token')?.value.trim() || '',
          autoSync: document.getElementById('config-gh-sync-auto')?.checked !== false
        };
        break;
        
      case 'supabase':
        config = {
          url: document.getElementById('config-supabase-url')?.value.trim() || '',
          key: document.getElementById('config-supabase-key')?.value.trim() || ''
        };
        break;
        
      case 'turso':
        config = {
          url: document.getElementById('config-turso-url')?.value.trim() || '',
          token: document.getElementById('config-turso-token')?.value.trim() || ''
        };
        break;
        
      case 'browser':
        config = { enabled: true };
        break;
    }
    
    return config;
  },
  
  /**
   * Test database location connection
   */
  async testLocationConnection() {
    const locationType = this.configuringLocation;
    const config = this.getLocationFormValues();
    const resultEl = document.getElementById('db-location-test-result');
    
    if (!resultEl) return;
    
    resultEl.innerHTML = '<span class="testing">🔄 Testing connection...</span>';
    resultEl.className = 'test-result';
    
    try {
      let success = false;
      let message = '';
      
      switch (locationType) {
        case 'browser':
          success = true;
          message = 'localStorage is always available';
          break;
          
        case 'localServer':
          if (!config.serverUrl) throw new Error('Server URL is required');
          const serverResp = await fetch(`${config.serverUrl}/health`, { method: 'GET' });
          success = serverResp.ok;
          message = success ? 'Connected to local server' : `Failed: ${serverResp.status}`;
          break;
          
        case 'githubSync':
          if (!config.owner || !config.repo) throw new Error('Owner and repo are required');
          const ghResp = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
            headers: config.token ? { 'Authorization': `token ${config.token}` } : {}
          });
          success = ghResp.ok;
          message = success ? 'Connected to GitHub repository' : `Failed: ${ghResp.status}`;
          break;
          
        case 'supabase':
          if (!config.url || !config.key) throw new Error('URL and key are required');
          const sbResp = await fetch(`${config.url}/rest/v1/`, {
            headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
          });
          success = sbResp.ok || sbResp.status === 404; // 404 is ok, means connected but no tables
          message = success ? 'Connected to Supabase' : `Failed: ${sbResp.status}`;
          break;
          
        case 'turso':
          if (!config.url) throw new Error('Database URL is required');
          // Turso uses libsql protocol, we can only verify URL format for now
          success = config.url.startsWith('libsql://') || config.url.startsWith('https://');
          message = success ? 'Turso URL format valid' : 'Invalid URL format';
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
   * Save location config and activate
   */
  saveLocationAndActivate() {
    const locationType = this.configuringLocation;
    const config = this.getLocationFormValues();
    
    // Store config
    this.locationConfig[locationType] = config;
    
    // Set as active location
    this.location = locationType;
    
    // Save to localStorage
    this.saveLocationConfig();
    
    // Update UI
    this.updateLocationUI();
    
    // Close modal
    this.closeLocationModal();
    
    // Show success toast
    if (typeof showToast === 'function') {
      const loc = this.LOCATIONS[locationType];
      showToast(`${loc.icon} ${loc.name} is now active`, 'success');
    }
    
    console.log('[SQLDatabase] Location activated:', locationType);
  },
  
  /**
   * Download server script
   */
  downloadServerScript(type) {
    let content, filename;
    
    if (type === 'node') {
      filename = 'local-db-server.js';
      content = `// DemoTemplate Local Database Server (Node.js)
// Run: node local-db-server.js
// Then: cloudflared tunnel --url http://localhost:3456

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const DB_PATH = path.join(__dirname, 'database.db');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }
  
  // Get database
  if (req.method === 'GET' && req.url === '/db') {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH);
      res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      res.end(data);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Database not found' }));
    }
    return;
  }
  
  // Save database
  if (req.method === 'POST' && req.url === '/db') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(body);
      fs.writeFileSync(DB_PATH, buffer);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, size: buffer.length }));
    });
    return;
  }
  
  // Execute query
  if (req.method === 'POST' && req.url === '/query') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      // Note: For real SQL execution, you'd need better-sqlite3 or similar
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Query endpoint - implement with better-sqlite3' }));
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(\`🗄️  Local DB Server running at http://localhost:\${PORT}\`);
  console.log('\\nEndpoints:');
  console.log('  GET  /health  - Health check');
  console.log('  GET  /db      - Download database');
  console.log('  POST /db      - Upload database');
  console.log('\\nTo expose to internet:');
  console.log('  cloudflared tunnel --url http://localhost:3456');
});
`;
    } else {
      filename = 'local_db_server.py';
      content = `# DemoTemplate Local Database Server (Python)
# Run: python local_db_server.py
# Then: cloudflared tunnel --url http://localhost:3456

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os

PORT = 3456
DB_PATH = 'database.db'

class DBHandler(BaseHTTPRequestHandler):
    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self._cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ok'}).encode())
        elif self.path == '/db':
            if os.path.exists(DB_PATH):
                with open(DB_PATH, 'rb') as f:
                    data = f.read()
                self.send_response(200)
                self._cors_headers()
                self.send_header('Content-Type', 'application/octet-stream')
                self.end_headers()
                self.wfile.write(data)
            else:
                self.send_response(404)
                self._cors_headers()
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/db':
            length = int(self.headers.get('Content-Length', 0))
            data = self.rfile.read(length)
            with open(DB_PATH, 'wb') as f:
                f.write(data)
            self.send_response(200)
            self._cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'size': len(data)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('', PORT), DBHandler)
    print(f'🗄️  Local DB Server running at http://localhost:{PORT}')
    print('\\nEndpoints:')
    print('  GET  /health  - Health check')
    print('  GET  /db      - Download database')
    print('  POST /db      - Upload database')
    print('\\nTo expose to internet:')
    print('  cloudflared tunnel --url http://localhost:3456')
    server.serve_forever()
`;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  
  /**
   * Download file watcher script (PowerShell)
   */
  downloadWatcherScript() {
    const content = `# DemoTemplate Database File Watcher (PowerShell)
# Watches for changes to database.db and syncs to GitHub
# Run: .\\db-watcher.ps1

$DB_PATH = "database.db"
$REPO_PATH = "."  # Your git repo path
$CHECK_INTERVAL = 5  # Seconds between checks

$lastHash = $null

Write-Host "🔍 Database File Watcher Started" -ForegroundColor Cyan
Write-Host "Watching: $DB_PATH"
Write-Host "Press Ctrl+C to stop"
Write-Host ""

while ($true) {
    if (Test-Path $DB_PATH) {
        $currentHash = (Get-FileHash $DB_PATH -Algorithm MD5).Hash
        
        if ($lastHash -ne $null -and $currentHash -ne $lastHash) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected, syncing..." -ForegroundColor Yellow
            
            try {
                Set-Location $REPO_PATH
                git add $DB_PATH
                git commit -m "Auto-sync database [$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')]"
                git push
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Synced successfully!" -ForegroundColor Green
            } catch {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Sync failed: $_" -ForegroundColor Red
            }
        }
        
        $lastHash = $currentHash
    }
    
    Start-Sleep -Seconds $CHECK_INTERVAL
}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'db-watcher.ps1';
    a.click();
    URL.revokeObjectURL(url);
  },
  
  /**
   * Bind UI events
   */
  bindEvents() {
    // Database Location Modal
    document.getElementById('close-db-location-modal')?.addEventListener('click', () => {
      this.closeLocationModal();
    });
    
    document.getElementById('test-db-location-btn')?.addEventListener('click', () => {
      this.testLocationConnection();
    });
    
    document.getElementById('save-db-location-btn')?.addEventListener('click', () => {
      this.saveLocationAndActivate();
    });
    
    // Download script buttons
    document.getElementById('download-server-script')?.addEventListener('click', () => {
      this.downloadServerScript('node');
    });
    
    document.getElementById('download-server-py')?.addEventListener('click', () => {
      this.downloadServerScript('python');
    });
    
    document.getElementById('download-watcher-ps')?.addEventListener('click', () => {
      this.downloadWatcherScript();
    });
    
    // Browser card click
    document.querySelector('.db-location-card[data-location="browser"]')?.addEventListener('click', () => {
      this.location = 'browser';
      this.saveLocationConfig();
      this.updateLocationUI();
      if (typeof showToast === 'function') {
        showToast('💻 Browser storage active', 'success');
      }
    });
    
    // New Database
    document.getElementById('sql-new-db-btn')?.addEventListener('click', () => {
      this.createNewDatabase();
    });
    
    // Load .db file
    document.getElementById('sql-load-file')?.addEventListener('change', (e) => {
      this.loadFromFile(e.target.files[0]);
    });
    
    // Save database
    document.getElementById('sql-save-db-btn')?.addEventListener('click', () => {
      this.saveToFile();
    });
    
    // Run query
    document.getElementById('sql-run-btn')?.addEventListener('click', () => {
      this.runQuery();
    });
    
    // Clear query
    document.getElementById('sql-clear-btn')?.addEventListener('click', () => {
      document.getElementById('sql-query-input').value = '';
    });
    
    // Example queries dropdown
    document.getElementById('sql-examples-select')?.addEventListener('change', (e) => {
      this.insertExampleQuery(e.target.value);
      e.target.value = '';
    });
    
    // Refresh tables
    document.getElementById('sql-refresh-tables-btn')?.addEventListener('click', () => {
      this.refreshTables();
    });
    
    // Create table
    document.getElementById('sql-create-table-btn')?.addEventListener('click', () => {
      this.showCreateTableDialog();
    });
    
    // Clear history
    document.getElementById('sql-clear-history-btn')?.addEventListener('click', () => {
      this.clearHistory();
    });
    
    // Keyboard shortcut: Ctrl+Enter to run query
    document.getElementById('sql-query-input')?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.runQuery();
      }
    });
  },
  
  /**
   * Create a new empty database
   */
  createNewDatabase() {
    if (this.db && !confirm('This will replace the current database. Continue?')) {
      return;
    }
    
    this.db = new this.SQL.Database();
    this.isLoaded = true;
    
    this.updateStatus('New database created', 'success');
    this.refreshTables();
    this.autoSave();
    
    // Enable save button
    document.getElementById('sql-save-db-btn').disabled = false;
    
    console.log('[SQLDatabase] New database created');
  },
  
  /**
   * Load database from file
   */
  async loadFromFile(file) {
    if (!file) return;
    
    try {
      const buffer = await file.arrayBuffer();
      const data = new Uint8Array(buffer);
      
      this.db = new this.SQL.Database(data);
      this.isLoaded = true;
      
      this.updateStatus(`Loaded: ${file.name}`, 'success');
      this.refreshTables();
      this.autoSave();
      
      document.getElementById('sql-save-db-btn').disabled = false;
      
      console.log('[SQLDatabase] Loaded from file:', file.name);
      
    } catch (error) {
      console.error('[SQLDatabase] Load error:', error);
      this.updateStatus('Error loading file', 'error');
    }
  },
  
  /**
   * Save database to file
   */
  saveToFile() {
    if (!this.db) {
      alert('No database to save');
      return;
    }
    
    try {
      const data = this.db.export();
      const blob = new Blob([data], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_${Date.now()}.db`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log('[SQLDatabase] Saved to file');
      
    } catch (error) {
      console.error('[SQLDatabase] Save error:', error);
      alert('Error saving database');
    }
  },
  
  /**
   * Auto-save to localStorage
   */
  autoSave() {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      const base64 = btoa(String.fromCharCode.apply(null, data));
      localStorage.setItem(this.STORAGE_KEY, base64);
      console.log('[SQLDatabase] Auto-saved to localStorage');
    } catch (error) {
      console.error('[SQLDatabase] Auto-save error:', error);
    }
  },
  
  /**
   * Load from localStorage
   */
  async loadFromStorage() {
    try {
      const base64 = localStorage.getItem(this.STORAGE_KEY);
      if (!base64) return;
      
      const binary = atob(base64);
      const data = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        data[i] = binary.charCodeAt(i);
      }
      
      this.db = new this.SQL.Database(data);
      this.isLoaded = true;
      
      document.getElementById('sql-save-db-btn').disabled = false;
      
      console.log('[SQLDatabase] Loaded from localStorage');
      
    } catch (error) {
      console.error('[SQLDatabase] Load from storage error:', error);
    }
  },
  
  /**
   * Run SQL query
   */
  runQuery() {
    const input = document.getElementById('sql-query-input');
    const query = input.value.trim();
    
    if (!query) {
      alert('Please enter a SQL query');
      return;
    }
    
    if (!this.db) {
      this.createNewDatabase();
    }
    
    const startTime = performance.now();
    
    try {
      const results = this.db.exec(query);
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      
      // Update query time
      document.getElementById('sql-query-time').textContent = `${duration}ms`;
      
      // Display results
      this.displayResults(results);
      
      // Add to history
      this.addToHistory(query, true);
      
      // Refresh tables if schema changed
      if (this.isSchemaChange(query)) {
        this.refreshTables();
      }
      
      // Auto-save
      this.autoSave();
      
      console.log('[SQLDatabase] Query executed:', query);
      
    } catch (error) {
      console.error('[SQLDatabase] Query error:', error);
      this.displayError(error.message);
      this.addToHistory(query, false, error.message);
    }
  },
  
  /**
   * Check if query changes schema
   */
  isSchemaChange(query) {
    const schemaKeywords = ['CREATE', 'DROP', 'ALTER', 'RENAME'];
    const upperQuery = query.toUpperCase();
    return schemaKeywords.some(kw => upperQuery.includes(kw));
  },
  
  /**
   * Display query results
   */
  displayResults(results) {
    const container = document.getElementById('sql-results-container');
    const countEl = document.getElementById('sql-results-count');
    
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="results-success">✅ Query executed successfully (no results)</div>';
      countEl.textContent = '';
      return;
    }
    
    let html = '';
    let totalRows = 0;
    
    results.forEach((result, idx) => {
      const { columns, values } = result;
      totalRows += values.length;
      
      html += `<div class="result-set">`;
      
      if (results.length > 1) {
        html += `<div class="result-set-header">Result Set ${idx + 1}</div>`;
      }
      
      html += `<div class="sql-table-wrapper"><table class="sql-results-table">`;
      
      // Headers
      html += '<thead><tr>';
      columns.forEach(col => {
        html += `<th>${this.escapeHtml(col)}</th>`;
      });
      html += '</tr></thead>';
      
      // Rows
      html += '<tbody>';
      values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
          const displayValue = cell === null ? '<span class="null-value">NULL</span>' : this.escapeHtml(String(cell));
          html += `<td>${displayValue}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div></div>';
    });
    
    container.innerHTML = html;
    countEl.textContent = `${totalRows} row${totalRows !== 1 ? 's' : ''}`;
  },
  
  /**
   * Display error
   */
  displayError(message) {
    const container = document.getElementById('sql-results-container');
    container.innerHTML = `<div class="results-error">❌ Error: ${this.escapeHtml(message)}</div>`;
    document.getElementById('sql-results-count').textContent = '';
  },
  
  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  /**
   * Refresh tables list
   */
  refreshTables() {
    const container = document.getElementById('sql-tables-list');
    
    if (!this.db) {
      container.innerHTML = '<div class="empty-tables">No database loaded</div>';
      return;
    }
    
    try {
      const result = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      
      if (!result.length || !result[0].values.length) {
        container.innerHTML = '<div class="empty-tables">No tables yet</div>';
        return;
      }
      
      let html = '';
      result[0].values.forEach(([tableName]) => {
        // Get row count
        let rowCount = 0;
        try {
          const countResult = this.db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
          rowCount = countResult[0]?.values[0]?.[0] || 0;
        } catch (e) {}
        
        html += `
          <div class="table-item" data-table="${tableName}">
            <span class="table-icon">📋</span>
            <span class="table-name">${this.escapeHtml(tableName)}</span>
            <span class="table-count">${rowCount} rows</span>
            <div class="table-actions">
              <button class="btn-tiny" onclick="SQLDatabase.selectAll('${tableName}')" title="SELECT *">👁️</button>
              <button class="btn-tiny" onclick="SQLDatabase.showTableSchema('${tableName}')" title="Schema">📄</button>
              <button class="btn-tiny danger" onclick="SQLDatabase.dropTable('${tableName}')" title="Drop">🗑️</button>
            </div>
          </div>
        `;
      });
      
      container.innerHTML = html;
      
    } catch (error) {
      console.error('[SQLDatabase] Refresh tables error:', error);
      container.innerHTML = '<div class="empty-tables">Error loading tables</div>';
    }
  },
  
  /**
   * Quick select all from table
   */
  selectAll(tableName) {
    document.getElementById('sql-query-input').value = `SELECT * FROM "${tableName}" LIMIT 100;`;
    this.runQuery();
  },
  
  /**
   * Show table schema
   */
  showTableSchema(tableName) {
    document.getElementById('sql-query-input').value = `PRAGMA table_info("${tableName}");`;
    this.runQuery();
  },
  
  /**
   * Drop table with confirmation
   */
  dropTable(tableName) {
    if (confirm(`Are you sure you want to drop table "${tableName}"? This cannot be undone.`)) {
      document.getElementById('sql-query-input').value = `DROP TABLE "${tableName}";`;
      this.runQuery();
    }
  },
  
  /**
   * Show create table dialog
   */
  showCreateTableDialog() {
    const tableName = prompt('Enter table name:');
    if (!tableName) return;
    
    const columns = prompt('Enter columns (e.g., id INTEGER PRIMARY KEY, name TEXT, email TEXT):');
    if (!columns) return;
    
    document.getElementById('sql-query-input').value = `CREATE TABLE "${tableName}" (\n  ${columns}\n);`;
    this.runQuery();
  },
  
  /**
   * Insert example query
   */
  insertExampleQuery(type) {
    const examples = {
      select: 'SELECT * FROM table_name WHERE condition LIMIT 10;',
      create: `CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`,
      insert: `INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com');`,
      update: `UPDATE users 
SET name = 'Updated Name' 
WHERE id = 1;`,
      delete: `DELETE FROM users 
WHERE id = 1;`,
      drop: 'DROP TABLE IF EXISTS table_name;'
    };
    
    if (examples[type]) {
      document.getElementById('sql-query-input').value = examples[type];
    }
  },
  
  /**
   * Add query to history
   */
  addToHistory(query, success, error = null) {
    this.history.unshift({
      query,
      success,
      error,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 50
    this.history = this.history.slice(0, 50);
    
    this.saveHistory();
    this.renderHistory();
  },
  
  /**
   * Save history to localStorage
   */
  saveHistory() {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
  },
  
  /**
   * Load history from localStorage
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem(this.HISTORY_KEY);
      if (saved) {
        this.history = JSON.parse(saved);
        this.renderHistory();
      }
    } catch (e) {
      this.history = [];
    }
  },
  
  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistory();
  },
  
  /**
   * Render history list
   */
  renderHistory() {
    const container = document.getElementById('sql-history-list');
    
    if (!this.history.length) {
      container.innerHTML = '<div class="empty-history">No queries yet</div>';
      return;
    }
    
    let html = '';
    this.history.slice(0, 20).forEach((item, idx) => {
      const icon = item.success ? '✅' : '❌';
      const shortQuery = item.query.substring(0, 50) + (item.query.length > 50 ? '...' : '');
      
      html += `
        <div class="history-item ${item.success ? 'success' : 'error'}" onclick="SQLDatabase.useHistoryItem(${idx})">
          <span class="history-icon">${icon}</span>
          <span class="history-query">${this.escapeHtml(shortQuery)}</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
  },
  
  /**
   * Use history item
   */
  useHistoryItem(index) {
    if (this.history[index]) {
      document.getElementById('sql-query-input').value = this.history[index].query;
    }
  },
  
  /**
   * Update status display
   */
  updateStatus(message = null, type = 'info') {
    const iconEl = document.getElementById('sql-status-icon');
    const textEl = document.getElementById('sql-status-text');
    
    if (!iconEl || !textEl) return;
    
    if (message) {
      textEl.textContent = message;
    } else if (this.isLoaded) {
      textEl.textContent = 'Database ready';
    } else {
      textEl.textContent = 'Database not loaded';
    }
    
    // Update icon
    switch (type) {
      case 'success':
        iconEl.textContent = '🟢';
        break;
      case 'error':
        iconEl.textContent = '🔴';
        break;
      default:
        iconEl.textContent = this.isLoaded ? '🟢' : '⚪';
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Delay init to let sql.js load
  setTimeout(() => {
    SQLDatabase.init();
  }, 100);
});

// Export for global access
window.SQLDatabase = SQLDatabase;
