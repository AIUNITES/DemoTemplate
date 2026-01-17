/**
 * DemoTemplate Configuration
 * ===========================
 * Customize this file to create your own demo app.
 * 
 * INSTRUCTIONS:
 * 1. Copy this entire DemoTemplate folder
 * 2. Rename it to your app name
 * 3. Edit this config.js file with your app's details
 * 4. Update index.html placeholders (search for {{APP_*)
 * 5. Customize CSS colors in css/style.css if desired
 */

const APP_CONFIG = {
  // ============================================
  // BASIC APP INFO
  // ============================================
  name: 'DemoApp',
  tagline: 'Your Tagline Here',
  description: 'A brief description of what your app does.',
  icon: '📦', // Emoji for favicon and headers
  version: '1.0.0',
  
  // Logo HTML (can use HTML/emoji)
  logoHtml: 'Demo<span>App</span>',
  
  // Main headline (supports HTML like <br> and <span>)
  headline: 'Build Something<br><span class="gradient-text">Amazing.</span>',
  
  // CTA section
  ctaHeadline: 'Ready to get started?',
  ctaDescription: 'Join thousands of users building great things.',

  // ============================================
  // STORAGE KEYS (must be unique per app)
  // ============================================
  storagePrefix: 'demoapp', // Used to namespace localStorage keys
  
  // ============================================
  // ITEM CONFIGURATION
  // ============================================
  // What do you call the main items in your app?
  itemName: 'item',        // singular: "item", "tool", "project", "recipe"
  itemNamePlural: 'items', // plural: "items", "tools", "projects", "recipes"
  
  // Empty state
  emptyIcon: '📦',
  emptyTitle: 'No items yet',
  emptyDescription: 'Create your first item to get started',
  
  // New item button text
  newItemButtonText: 'New Item',

  // ============================================
  // LANDING PAGE SECTIONS
  // ============================================
  
  // Items section on landing page
  itemsSectionTitle: '📖 Featured Content',
  itemsSectionSubtitle: 'Explore what\'s available',
  
  // Hero cards (shown on landing page)
  heroCards: [
    { icon: '🎯', name: 'Example 1', subtitle: 'Description', color: '#ff3366' },
    { icon: '🚀', name: 'Example 2', subtitle: 'Description', color: '#10b981' },
    { icon: '💡', name: 'Example 3', subtitle: 'Description', color: '#6366f1' }
  ],
  
  // Features (How It Works section)
  features: [
    { icon: '1️⃣', title: 'Step One', description: 'First thing users do' },
    { icon: '2️⃣', title: 'Step Two', description: 'Second thing users do' },
    { icon: '3️⃣', title: 'Step Three', description: 'Third thing users do' },
    { icon: '4️⃣', title: 'Step Four', description: 'Fourth thing users do' }
  ],

  // ============================================
  // USER STATS (shown on dashboard)
  // ============================================
  // Define what stats to show. Each stat needs:
  // - id: unique identifier
  // - label: display name
  // - getValue: function that takes (items, user) and returns the value
  stats: [
    { id: 'total', label: 'Total Items', getValue: (items) => items.length },
    { id: 'favorites', label: 'Favorites', getValue: (items) => items.filter(i => i.favorite).length },
    { id: 'recent', label: 'This Week', getValue: (items) => {
      const weekAgo = Date.now() - 7*24*60*60*1000;
      return items.filter(i => new Date(i.createdAt) > weekAgo).length;
    }}
  ],

  // ============================================
  // ITEM FIELDS (for create/edit form)
  // ============================================
  // Define the fields for your items
  itemFields: [
    { 
      id: 'name', 
      label: 'Name', 
      type: 'text', 
      placeholder: 'Enter name',
      required: true 
    },
    { 
      id: 'description', 
      label: 'Description', 
      type: 'textarea', 
      placeholder: 'Enter description',
      required: false 
    },
    { 
      id: 'category', 
      label: 'Category', 
      type: 'select',
      options: [
        { value: 'general', label: 'General' },
        { value: 'work', label: 'Work' },
        { value: 'personal', label: 'Personal' }
      ],
      required: false 
    },
    {
      id: 'icon',
      label: 'Icon',
      type: 'iconPicker',
      options: ['📦', '🎯', '🚀', '💡', '⭐', '🔥', '💎', '🎨'],
      default: '📦'
    },
    {
      id: 'color',
      label: 'Color',
      type: 'colorPicker',
      options: ['#ff3366', '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899'],
      default: '#ff3366'
    }
  ],

  // ============================================
  // DISCOVER SECTION (sample/featured items)
  // ============================================
  discoverItems: [
    { 
      name: 'Featured Item 1', 
      icon: '⭐', 
      color: '#ff3366', 
      description: 'A great example item',
      stats: { views: 1200, likes: 45 }
    },
    { 
      name: 'Featured Item 2', 
      icon: '🔥', 
      color: '#10b981', 
      description: 'Another awesome item',
      stats: { views: 890, likes: 32 }
    },
    { 
      name: 'Featured Item 3', 
      icon: '💡', 
      color: '#6366f1', 
      description: 'Check this one out',
      stats: { views: 2100, likes: 78 }
    }
  ],

  // ============================================
  // DEFAULT USERS
  // ============================================
  defaultAdmin: {
    username: 'admin',
    password: 'admin123',
    displayName: 'Administrator',
    email: 'admin@example.com',
    isAdmin: true
  },
  
  defaultDemo: {
    username: 'demo',
    password: 'demo123',
    displayName: 'Demo User',
    email: 'demo@example.com',
    isAdmin: false
  },

  // ============================================
  // DEMO CONTENT
  // ============================================
  // Items created for the demo user
  demoItems: [
    {
      name: 'Sample Item 1',
      description: 'This is a sample item to show how things work.',
      icon: '🎯',
      color: '#ff3366',
      category: 'general'
    },
    {
      name: 'Sample Item 2',
      description: 'Another example item for demonstration.',
      icon: '🚀',
      color: '#10b981',
      category: 'work'
    }
  ],

  // ============================================
  // THEME COLORS (CSS custom properties)
  // ============================================
  theme: {
    primary: '#ff3366',
    secondary: '#10b981',
    accent: '#6366f1',
    gradient1: 'linear-gradient(135deg, #ff3366, #ff6b35)',
    gradient2: 'linear-gradient(135deg, #6366f1, #4f46e5)'
  },

  // ============================================
  // CUSTOM FUNCTIONS (optional overrides)
  // ============================================
  
  // Custom render function for item cards (optional)
  // If not provided, uses default card renderer
  renderItemCard: null, // function(item) { return '<div>...</div>'; }
  
  // Custom render function for item detail modal (optional)
  renderItemDetail: null, // function(item) { return '<div>...</div>'; }
  
  // Custom validation for item form (optional)
  validateItem: null, // function(itemData) { return { valid: true, errors: [] }; }
  
  // Hook called after item is created (optional)
  onItemCreated: null, // function(item) { console.log('Created:', item); }
  
  // Hook called after item is deleted (optional)
  onItemDeleted: null, // function(itemId) { console.log('Deleted:', itemId); }

  // ============================================
  // CHANGELOG (shown in admin panel)
  // ============================================
  changelog: [
    {
      version: 'v1.0.0',
      date: 'January 2026',
      changes: [
        'Initial release',
        'User authentication system',
        'Item creation and management',
        'Dashboard with stats',
        'Backup and restore functionality',
        'Admin panel with settings',
        'Terms of Service and Privacy Policy'
      ]
    }
  ]
};

// Make config globally accessible
window.APP_CONFIG = APP_CONFIG;
