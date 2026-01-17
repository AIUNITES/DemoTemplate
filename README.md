# DemoTemplate

A reusable template for creating localStorage-based web app demos. Based on the AIZines architecture.

## Quick Start

1. **Copy this folder** and rename it to your app name
2. **Edit `js/config.js`** with your app's details
3. **Update `index.html`** - replace `{{APP_*}}` placeholders
4. **Customize `css/style.css`** if desired (change colors, etc.)
5. **Open `index.html`** in a browser - no server needed!

## Features

- 🔐 User authentication (login, signup, demo mode)
- 💾 localStorage-based persistence
- 📱 Mobile-responsive design
- 🎨 Customizable theming
- 💾 Backup & restore functionality
- 🗄️ Cache viewer for debugging
- ⚙️ Configurable item fields

## Configuration

All customization happens in `js/config.js`:

```javascript
const APP_CONFIG = {
  // Basic info
  name: 'MyApp',
  tagline: 'Your awesome tagline',
  icon: '🚀',
  
  // Storage namespace (must be unique per app)
  storagePrefix: 'myapp',
  
  // What you call items
  itemName: 'project',
  itemNamePlural: 'projects',
  
  // Define your item fields
  itemFields: [
    { id: 'name', label: 'Name', type: 'text', required: true },
    { id: 'description', label: 'Description', type: 'textarea' },
    { id: 'category', label: 'Category', type: 'select', options: [...] },
    { id: 'icon', label: 'Icon', type: 'iconPicker', options: [...] },
    { id: 'color', label: 'Color', type: 'colorPicker', options: [...] }
  ],
  
  // Dashboard stats
  stats: [
    { id: 'total', label: 'Total', getValue: (items) => items.length }
  ],
  
  // Demo content
  demoItems: [...]
};
```

## Field Types

- `text` - Single line text input
- `textarea` - Multi-line text
- `select` - Dropdown with options
- `iconPicker` - Emoji/icon picker
- `colorPicker` - Color selection

## Deployment

### GitHub Pages (Free)
1. Create a GitHub repository
2. Push this folder to the repo
3. Go to Settings → Pages → Select "main" branch
4. Your app is live!

### Netlify (Free)
1. Create a Netlify account
2. Drag & drop this folder to deploy
3. Your app is live!

## Default Accounts

- **Admin**: `admin` / `admin123`
- **Demo**: `demo` / `demo123`

## File Structure

```
DemoTemplate/
├── index.html          # Main HTML (update placeholders)
├── css/
│   └── style.css       # All styles (customizable)
├── js/
│   ├── config.js       # ⭐ YOUR CUSTOMIZATIONS GO HERE
│   ├── storage.js      # localStorage wrapper
│   ├── auth.js         # Authentication
│   └── app.js          # Main app logic
└── README.md           # This file
```

## Extending

### Custom Item Card Renderer

```javascript
APP_CONFIG.renderItemCard = function(item) {
  return `<div class="my-custom-card">...</div>`;
};
```

### Custom Validation

```javascript
APP_CONFIG.validateItem = function(data) {
  if (data.name.length < 3) {
    return { valid: false, errors: ['Name too short'] };
  }
  return { valid: true, errors: [] };
};
```

### Lifecycle Hooks

```javascript
APP_CONFIG.onItemCreated = function(item) {
  console.log('Created:', item);
};

APP_CONFIG.onItemDeleted = function(itemId) {
  console.log('Deleted:', itemId);
};
```

## License

MIT - Use freely for any project.
