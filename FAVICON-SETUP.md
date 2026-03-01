# Customer Favicon Setup Guide

## Quick Favicon Setup for New Customers

### 1. Prepare Favicon Files
- **Format**: `.ico` (preferred) or `.png`
- **Sizes**: 16x16, 32x32, or 48x48 pixels
- **Naming**: Use customer identifier (e.g., `acme-favicon.ico`)

### 2. Add to Public Directory
Place favicon files in `/public/` folder:
```
public/
├── acme-favicon.ico       # ACME Corp
├── techgmbh-favicon.ico   # TechGmbH  
├── globaltech-favicon.png # GlobalTech
└── ...
```

### 3. Update Environment File
Reference favicon in environment configuration:
```typescript
export const environment = {
  // ... other config
  faviconPath: '/acme-favicon.ico'
};
```

### 4. Automatic Loading
The application automatically:
- ✅ Sets browser tab title from `documentTitle`
- ✅ Updates favicon from `faviconPath`  
- ✅ Shows app title from `appTitle`
- ✅ Applies language from `defaultLanguage`

## Favicon Best Practices

### **File Formats**
- **ICO**: Best browser compatibility, supports multiple sizes
- **PNG**: Modern, good quality, smaller file size

### **Recommended Sizes**  
- **16x16**: Basic favicon
- **32x32**: High-DPI displays
- **48x48**: Windows shortcuts

### **File Naming Convention**
- Use lowercase
- Include customer identifier  
- Example: `companyname-favicon.ico`

### **Testing**
After deployment, verify:
1. Browser tab shows correct title
2. Favicon appears in browser tab
3. Favicon shows in bookmarks
4. Mobile devices display correctly

## Common Issues

### **Favicon Not Updating**
- Clear browser cache (Ctrl+F5)
- Check file path starts with `/`  
- Verify file exists in `/public/` directory

### **File Format Issues**
- Use `.ico` for maximum compatibility
- Ensure proper file dimensions (16x16, 32x32, 48x48)
- Test in different browsers

### **Path Configuration**
```typescript
// ✅ Correct
faviconPath: '/company-favicon.ico'

// ❌ Incorrect  
faviconPath: 'company-favicon.ico'        // Missing leading slash
faviconPath: './public/company-favicon.ico' // Wrong path format
```