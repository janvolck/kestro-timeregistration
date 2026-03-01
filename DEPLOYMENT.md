# Multi-Environment Deployment Guide

## Overview
This application supports multiple deployment configurations with different languages and API endpoints per environment.

## Available Environments

### Development (Default)
- **Title**: "Kestro Time Registration - Development"
- **Document Title**: "Kestro Dev - Time Tracking" (browser tab)  
- **Favicon**: `/cropped-icon-72x72-1-32x32.png`
- **Language**: English
- **API**: http://localhost:5000
- **Command**: `npm start`

### Netherlands Deployment
- **Title**: "Kestro Nederland - Tijdsregistratie"
- **Document Title**: "Kestro NL - Tijdsregistratie" (browser tab)
- **Favicon**: `/nl-favicon.png`
- **Language**: Dutch (nl)  
- **API**: https://nl-api.kestro.com
- **Commands**: 
  - Serve: `npm run start:nl`
  - Build: `npm run build:nl`

### France Deployment  
- **Title**: "Kestro France - Suivi du Temps"
- **Document Title**: "Kestro France - Temps" (browser tab)
- **Favicon**: `/fr-flag-favicon.ico`
- **Language**: French (fr)
- **API**: https://fr-api.kestro.com
- **Commands**:
  - Serve: `npm run start:fr` 
  - Build: `npm run build:fr`

### United States Deployment
- **Title**: "Kestro USA - Time Tracking"
- **Document Title**: "Kestro USA - Time Tracking" (browser tab)
- **Favicon**: `/us-flag-favicon.ico` 
- **Language**: English (en)  
- **API**: https://us-api.kestro.com
- **Commands**:
  - Serve: `npm run start:us`
  - Build: `npm run build:us`

### Production (Generic)
- **Title**: "Kestro Tijdsregistratie"
- **Document Title**: "Kestro - Tijdsregistratie" (browser tab)
- **Favicon**: `/kestro-favicon.ico`
- **Language**: Dutch (nl)
- **API**: https://your-production-api.com  
- **Commands**:
  - Build: `npm run build:prod`

### Example Customer Deployments

#### ACME Corp
- **Title**: "ACME Corp - Time Tracking System"
- **Document Title**: "ACME Time Tracker" (browser tab)
- **Favicon**: `/acme-logo-favicon.png`
- **Language**: English (en)
- **API**: https://acme-api.example.com

#### TechGmbH
- **Title**: "TechGmbH Zeiterfassung Portal" 
- **Document Title**: "TechGmbH - Zeiterfassung" (browser tab)
- **Favicon**: `/techgmbh-favicon.ico`

## Adding New Deployments

### 1. Create Environment File
Create `/src/environments/environment.{name}.ts`:
```typescript
export const environment = {
  production: true,
  defaultLanguage: 'de', // German example
  apiUrl: 'https://de-api.kestro.com',
  appTitle: 'Kestro Deutschland - Zeiterfassung',
  documentTitle: 'Kestro DE - Zeit', // Browser tab title
  faviconPath: '/de-flag-favicon.ico' // Favicon path
};
```

### 2. Add Translation File
Create `/src/assets/i18n/de.json`:
```json
{
  "app.title": "Kestro Zeiterfassung",
  "nav.projects": "Projekte",
  // ... other translations
}
```

### 3. Update angular.json
Add configuration to `configurations` section:
```json
"germany": {
  "budgets": [...],
  "outputHashing": "all",
  "fileReplacements": [{
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.de.ts"
  }]
}
```

### 4. Update package.json
Add build scripts:
```json
"start:de": "ng serve --configuration=germany",
"build:de": "ng build --configuration=germany"
```

## Environment Variables

Each environment file contains:
- `production`: Boolean for production mode
- `defaultLanguage`: ISO language code (en, nl, fr, de, etc.)
- `apiUrl`: Base API URL for that deployment
- `appTitle`: Customer-specific application title displayed in header
- `documentTitle`: Browser tab/window title (keep shorter for tab display)
- `faviconPath`: Path to favicon file (supports .ico, .png formats)

## Branding Configuration

### **App Title vs Document Title**
- **App Title**: Full branded name shown in application header (e.g., "ACME Corp - Time Tracking System")
- **Document Title**: Shorter title for browser tab (e.g., "ACME Time Tracker")

### **Favicon Setup**
1. Place favicon files in `/public/` directory
2. Supports `.ico` and `.png` formats  
3. Recommended sizes: 16x16, 32x32, 48x48 pixels
4. Path should start with `/` (e.g., `/company-favicon.ico`)

### **UI Labels vs Branding**
- **Branding** (app title, document title, favicon): Set per environment for customer identity
- **UI Labels** (buttons, menus, messages): Use translation system for language support

This allows each customer to have complete branding control while maintaining language flexibility.
### Supported Languages
- `en`: English
- `nl`: Dutch
- `fr`: French
- Add more by creating new JSON files

## Deployment Commands

```bash
# Development
npm start                 # English, localhost:5000

# Country-specific development
npm run start:nl          # Dutch, nl-api.kestro.com
npm run start:fr          # French, fr-api.kestro.com
npm run start:us          # English, us-api.kestro.com

# Production builds
npm run build:nl          # Dutch production build
npm run build:fr          # French production build
npm run build:us          # US English production build
npm run build:prod        # Generic production build
```

## File Structure
```
src/
├── environments/
│   ├── environment.ts      # Development (en)
│   ├── environment.prod.ts # Production (nl)
│   ├── environment.nl.ts   # Netherlands (nl)
│   ├── environment.fr.ts   # France (fr)
│   └── environment.us.ts   # United States (en)
└── assets/
    └── i18n/
        ├── en.json         # English translations
        ├── nl.json         # Dutch translations
        └── fr.json         # French translations
public/
├── cropped-icon-72x72-1-32x32.png  # Default favicon
├── kestro-favicon.ico              # Production favicon
├── nl-favicon.png                  # Netherlands favicon
├── fr-flag-favicon.ico             # France favicon  
├── us-flag-favicon.ico             # US favicon
├── acme-logo-favicon.png           # Customer: ACME
└── techgmbh-favicon.ico            # Customer: TechGmbH```