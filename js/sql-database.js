/**
 * DemoTemplate SQL Database Manager
 * ==================================
 * Browser-based SQLite database using sql.js
 * - Create/manage databases
 * - Run SQL queries
 * - Import/export .db files
 * - Auto-save to localStorage or IndexedDB
 */

const SQLDatabase = {
  db: null,
  isLoaded: false,
  SQL: null,
  history: [],
  
  // Storage key for auto-save
  STORAGE_KEY: 'demotemplate_sqldb',
  HISTORY_KEY: 'demotemplate_sql_history',
  
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
      
      // Try to load saved database
      await this.loadFromStorage();
      
      // Load query history
      this.loadHistory();
      
      // Bind UI events
      this.bindEvents();
      
      // Update UI
      this.updateStatus();
      this.refreshTables();
      
    } catch (error) {
      console.error('[SQLDatabase] Failed to initialize:', error);
      this.updateStatus('Error loading sql.js', 'error');
    }
  },
  
  /**
   * Bind UI events
   */
  bindEvents() {
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
