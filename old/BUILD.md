# Build Instructions for Reddit Post Machine Extension

## Overview

This extension uses **Bun** as the build tool for fast, efficient builds. The build system processes the source files and outputs them to the `reddit-post-machine-egg` directory.

## Prerequisites

- [Bun](https://bun.sh/) installed (v1.0 or higher)
- Node.js 18+ (for compatibility)

## Installation

Install dependencies:
```bash
bun install
```

## Build Commands

### Development Build
```bash
bun run build
```
Creates a development build in `reddit-post-machine-egg/` directory.

### Clean Build
```bash
bun run clean
```
Removes the `reddit-post-machine-egg/` directory.

### Watch Mode (Development)
```bash
bun run dev
```
Builds and watches for file changes (rebuilds automatically).

### Production Build & Pack
```bash
bun run pack
```
Creates a production build and generates `reddit-post-machine-extension.zip` ready for Chrome Web Store.

## Build Output

The build process creates:
- `reddit-post-machine-egg/` - Complete extension directory
- `reddit-post-machine-extension.zip` - Packaged extension file

### Output Structure
```
reddit-post-machine-egg/
├── manifest.json          # Processed manifest with build info
├── raven.html             # Extension popup HTML
├── assets/                # Static assets (icons, images)
└── src/                   # Processed JavaScript modules
    ├── services/reef.js           # Background service worker
    ├── workers/seren-post-machine.js  # Main worker process
    ├── sailor/reddit-post-man.js      # DOM interaction layer
    └── content/
        ├── reddit-helper.js       # Main content script
        └── frappe-bridge.js       # Frappe integration bridge
```

## Build Features

### 🚀 **Performance Optimizations**
- **Fast Builds**: Bun provides near-instant build times
- **ES Module Support**: Modern JavaScript module system
- **Minification**: Production builds are minified for smaller file sizes
- **Tree Shaking**: Unused code is eliminated

### 🔧 **Development Features**
- **Source Maps**: Debug-friendly development builds
- **Watch Mode**: Automatic rebuilds on file changes
- **Build Validation**: Checks for common extension issues
- **Version Stamping**: Automatic version updates with build timestamps

### 📦 **Extension-Specific Features**
- **Manifest Processing**: Automatic manifest.json validation and enhancement
- **Asset Copying**: Static assets are preserved during build
- **Chrome Extension Compatibility**: Builds are optimized for Chrome extension environment
- **Build Metadata**: Adds build information to manifest for debugging

## Configuration

### Bun Configuration (`bun.config.js`)
```javascript
export default {
  build: {
    target: 'browser',
    format: 'esm',
    minify: process.env.NODE_ENV === 'production',
    outdir: './reddit-post-machine-egg'
  }
}
```

### Package Scripts (`package.json`)
- `build`: Standard development build
- `dev`: Watch mode for development
- `clean`: Remove build artifacts
- `pack`: Production build + ZIP creation
- `prebuild`: Auto-cleanup before builds

## File Processing

### JavaScript Files
- **Bundling**: Individual modules are processed but not bundled together (for extension compatibility)
- **Minification**: Applied in production mode
- **ES6+ Support**: Modern JavaScript features are preserved
- **Error Handling**: Build failures are reported with detailed messages

### Manifest Processing
- **Version Stamping**: Development builds get timestamp-based versions
- **Build Metadata**: Adds `_build` section with build information
- **Validation**: Checks for required manifest fields

### Static Assets
- **Direct Copy**: HTML, CSS, and image files are copied as-is
- **Path Preservation**: Maintains original directory structure
- **Asset Optimization**: Optional image compression (can be enabled)

## Chrome Extension Loading

1. Build the extension:
   ```bash
   bun run build
   ```

2. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `reddit-post-machine-egg` directory

3. For production deployment:
   ```bash
   bun run pack
   ```
   Upload `reddit-post-machine-extension.zip` to Chrome Web Store.

## Troubleshooting

### Build Fails
- Ensure Bun is installed: `bun --version`
- Clean and rebuild: `bun run clean && bun run build`
- Check for JavaScript syntax errors in source files

### Extension Won't Load
- Verify `reddit-post-machine-egg/manifest.json` exists and is valid
- Check Chrome extension developer tools for error messages
- Ensure all referenced files exist in the build output

### Performance Issues
- Use development builds for debugging: `bun run build`
- Use production builds for deployment: `NODE_ENV=production bun run build`

## Advanced Usage

### Environment Variables
```bash
NODE_ENV=production bun run build  # Production build
NODE_ENV=development bun run build # Development build (default)
```

### Custom Build Scripts
The build system is extensible. You can modify `build.js` to add:
- Custom file processing
- Additional validation steps
- Integration with other tools
- Custom asset optimization

## Archive

Old files have been moved to the `archive/` directory:
- `archive/abilities.js`
- `archive/frappe-bridge.js`
- `archive/postm-page.js`
- `archive/postm-page1.js`
- `archive/raven.js`
- `archive/reef.js`

These files are kept for reference but are not part of the new build system.