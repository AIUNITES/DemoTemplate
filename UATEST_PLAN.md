# DemoTemplate - UA Test Plan

## Site Information
| Field | Value |
|-------|-------|
| **Site Name** | DemoTemplate |
| **Repository** | DemoTemplate |
| **Live URL** | https://aiunites.github.io/DemoTemplate/ |
| **Local Path** | C:/Users/Tom/Documents/GitHub/DemoTemplate |
| **Last Updated** | January 24, 2026 |
| **Version** | 1.0.0 |
| **Purpose** | Reusable template for building AIUNITES web apps |

---

## Pages Inventory

| Page | File | Description | Status |
|------|------|-------------|--------|
| Single Page App | index.html | All screens in one file | ✅ Active |

---

## Screens (In index.html)

| Screen | ID | Description | Status |
|--------|-----|-------------|--------|
| Landing | landing-screen | Hero, features, CTA | ✅ |
| Auth | auth-screen | Login/Signup forms | ✅ |
| Dashboard | dashboard-screen | Main app view | ✅ |

---

## Core Features Checklist

### 🔐 Authentication System
| Feature | Status | Notes |
|---------|--------|-------|
| User Registration | ✅ | Creates account in localStorage |
| User Login | ✅ | Validates credentials |
| Demo Mode Login | ✅ | Quick login button |
| Logout | ✅ | Clears session |
| First User = Admin | ✅ | Auto-assigns admin role |
| Auto-create Demo Users | ✅ | On first load |
| Terms/Privacy Agreement | ✅ | Checkbox on signup |
| Reset App Link | ✅ | With admin password |

### 👤 User Dropdown Menu
| Feature | Status | Notes |
|---------|--------|-------|
| Click to Toggle | ✅ | Avatar + name clickable |
| Admin Panel Link | ✅ | Shows for admins only |
| Settings Link | ✅ | Opens Settings modal |
| Logout Link | ✅ | Logs out user |

### ⚙️ Settings Modal
| Feature | Status | Notes |
|---------|--------|-------|
| Edit Display Name | ✅ | |
| Edit Email | ✅ | |
| Save Settings | ✅ | |
| Cancel Button | ✅ | |
| **Backup & Restore Section** | ✅ | |
| Download Backup (JSON) | ✅ | Exports user data |
| Restore from Backup | ✅ | File upload |
| **View My Cache Section** | ✅ | |
| Open Cache Viewer | ✅ | Button |
| **Legal Section** | ✅ | |
| Terms of Service Link | ✅ | Opens Legal modal |
| Privacy Policy Link | ✅ | Opens Legal modal |

### 🗄️ Cache Viewer Modal
| Feature | Status | Notes |
|---------|--------|-------|
| Summary Tab | ✅ | Item count, favorites count |
| Items Tab | ✅ | List of user's items |
| Raw Data Tab | ✅ | JSON view |
| Total Size Display | ✅ | KB calculation |
| Clear My Data Button | ✅ | With confirmation |

### 🛡️ Admin Panel Modal
| Feature | Status | Notes |
|---------|--------|-------|
| **System Settings Tab** | ✅ | |
| Require Email Verification Toggle | ✅ | |
| Allow Public Signup Toggle | ✅ | Checked by default |
| Max Items per User Input | ✅ | Default 100 |
| Maintenance Mode Toggle | ✅ | |
| Save Settings Button | ✅ | |
| **Users Tab** | ✅ | |
| User Count | ✅ | |
| User List | ✅ | Avatar, name, username, admin badge |
| **Statistics Tab** | ✅ | |
| Total Users Count | ✅ | |
| Total Items Count | ✅ | |
| App Version | ✅ | |
| Export All Data Button | ✅ | Downloads JSON |
| Reset All Data Button | ✅ | With password confirmation |
| **Changelog Tab** | ✅ | |
| Version History | ✅ | From config |

### 📜 Legal Modal
| Feature | Status | Notes |
|---------|--------|-------|
| Terms of Service Content | ✅ | |
| Privacy Policy Content | ✅ | |
| Last Updated Date | ✅ | |
| Close Button | ✅ | |

### 📦 Dashboard Views
| Feature | Status | Notes |
|---------|--------|-------|
| My Items View | ✅ | Grid of user's items |
| Discover View | ✅ | Community items |
| Favorites View | ✅ | Saved items |
| Nav Tabs | ✅ | Switch between views |

### ✨ Item Management
| Feature | Status | Notes |
|---------|--------|-------|
| Create Item Modal | ✅ | Dynamic form from config |
| Edit Item | ✅ | Same modal, pre-filled |
| Delete Item | ✅ | With confirmation |
| View Item Detail | ✅ | Modal view |
| Favorite/Unfavorite | ✅ | Toggle star |
| Icon Picker | ✅ | Emoji selection |
| Color Picker | ✅ | Gradient colors |

### 🎨 Landing Page
| Feature | Status | Notes |
|---------|--------|-------|
| Hero Section | ✅ | Headline, subtitle, CTA |
| Hero Cards Animation | ✅ | Rotating cards |
| Features Grid | ✅ | 3 feature cards |
| Items Showcase | ✅ | Sample items |
| CTA Section | ✅ | Bottom call-to-action |
| Footer | ✅ | Logo, links, copyright |
| Demo Badge | ✅ | Pre-launch indicator |

### 🔔 UI Components
| Feature | Status | Notes |
|---------|--------|-------|
| Toast Notifications | ✅ | Success/error |
| Loading Overlay | ✅ | Spinner + message |
| Modal Backdrop Click | ✅ | Close on outside click |
| Escape Key Close | ✅ | Close modals |
| Feature Request Button | ✅ | Floating button |

---

## Configuration (config.js)

| Config Key | Purpose | Status |
|------------|---------|--------|
| name | App name | ✅ |
| tagline | Slogan | ✅ |
| logoHtml | Logo markup | ✅ |
| headline | Hero headline | ✅ |
| description | Hero subtitle | ✅ |
| storagePrefix | localStorage prefix | ✅ |
| itemName/itemNamePlural | Content naming | ✅ |
| itemFields | Form field definitions | ✅ |
| heroCards | Landing page cards | ✅ |
| features | Feature descriptions | ✅ |
| demoItems | Sample content | ✅ |
| discoverItems | Discover section | ✅ |
| stats | Dashboard stats | ✅ |
| changelog | Version history | ✅ |
| defaultAdmin | Admin credentials | ✅ |

---

## JavaScript Files

| File | Purpose | Status |
|------|---------|--------|
| config.js | App configuration | ✅ |
| storage.js | localStorage wrapper | ✅ |
| auth.js | Authentication logic | ✅ |
| app.js | Main app logic | ✅ |

---

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `[prefix]_users` | All user accounts |
| `[prefix]_currentUser` | Logged in user |
| `[prefix]_items` | All items |
| `[prefix]_favorites_[userId]` | User's favorites |

---

## Test Scenarios

### Landing Page Tests
- [ ] Hero content loads from config
- [ ] Features grid populates
- [ ] Demo items display
- [ ] Login button works
- [ ] Get Started button works
- [ ] Try Demo button works

### Authentication Tests
- [ ] Tab switching works
- [ ] Signup creates user
- [ ] Login validates credentials
- [ ] Demo login works
- [ ] First user gets admin role
- [ ] Reset app link works (with password)
- [ ] Terms checkbox required

### Dashboard Tests
- [ ] User info displays
- [ ] Stats populate
- [ ] Items grid loads
- [ ] Empty state shows when no items
- [ ] View tabs switch correctly
- [ ] New item button works

### CRUD Tests
- [ ] Create item with all fields
- [ ] Edit item pre-fills form
- [ ] Delete item with confirmation
- [ ] View item detail
- [ ] Favorite toggle works

### Modal Tests
- [ ] Settings modal opens/closes
- [ ] Settings save correctly
- [ ] Backup downloads JSON
- [ ] Restore imports data
- [ ] Cache viewer shows data
- [ ] Admin panel opens (admin only)
- [ ] Admin tabs switch
- [ ] Legal modal shows correct content

---

## Sites Based on DemoTemplate

| Site | Customizations |
|------|----------------|
| AIByJob | AI tools by profession, Agents |
| Redomy | Real estate listings |
| BizStry | Business stories |
| FurnishThings | Furniture items |
| Cloudsion | Cloud services |
| Gameatica | Games catalog |
| UptownIT | IT services |
| InThisWorld | World content |
| ERPise | ERP features |
| ERPize | ERP features |
| AgentHub | AI agents |
| AI Agents Hub | AI agents |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial complete template |

---

*Last tested: January 24, 2026*
