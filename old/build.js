#!/usr/bin/env bun

/**
 * Reddit Post Machine Extension Builder
 * Builds the extension with Bun for optimal performance
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUILD_DIR = 'reddit-post-machine-egg';
const SRC_DIR = 'src';

class ExtensionBuilder {
  constructor() {
    this.srcPath = join(__dirname, SRC_DIR);
    this.buildPath = join(__dirname, BUILD_DIR);
    this.startTime = Date.now();
  }

  log(message, color = '\x1b[36m') {
    const timestamp = new Date().toISOString();
    console.log(`${color}[Builder] ${timestamp} - ${message}\x1b[0m`);
  }

  logSuccess(message) {
    this.log(message, '\x1b[32m');
  }

  logError(message) {
    this.log(message, '\x1b[31m');
  }

  logWarning(message) {
    this.log(message, '\x1b[33m');
  }

  async build() {
    try {
      this.log('Starting Reddit Post Machine extension build...');
      
      // Clean and create build directory
      this.cleanBuildDir();
      this.createBuildDir();
      
      // Copy and process files
      await this.copyStaticAssets();
      await this.bundleScripts();
      await this.processManifest();
      
      this.logBuildStats();
      this.logSuccess('✅ Build completed successfully!');
      
    } catch (error) {
      this.logError(`❌ Build failed: ${error.message}`);
      process.exit(1);
    }
  }

  cleanBuildDir() {
    if (existsSync(this.buildPath)) {
      this.log('Cleaning build directory...');
      Bun.spawn(['rm', '-rf', this.buildPath]);
    }
  }

  createBuildDir() {
    this.log('Creating build directory...');
    mkdirSync(this.buildPath, { recursive: true });
    mkdirSync(join(this.buildPath, 'src'), { recursive: true });
    mkdirSync(join(this.buildPath, 'src', 'services'), { recursive: true });
    mkdirSync(join(this.buildPath, 'src', 'workers'), { recursive: true });
    mkdirSync(join(this.buildPath, 'src', 'content'), { recursive: true });
    mkdirSync(join(this.buildPath, 'src', 'sailor'), { recursive: true });
  }

  async copyStaticAssets() {
    this.log('Copying static assets...');
    
    // Copy assets folder
    if (existsSync(join(__dirname, 'assets'))) {
      cpSync(join(__dirname, 'assets'), join(this.buildPath, 'assets'), { recursive: true });
    }
    
    // Copy HTML files
    const htmlFiles = ['raven.html'];
    for (const file of htmlFiles) {
      if (existsSync(join(__dirname, file))) {
        cpSync(join(__dirname, file), join(this.buildPath, file));
      }
    }
  }

  async bundleScripts() {
    this.log('Bundling scripts...');
    
    const scriptFiles = [
      { src: 'src/services/reef.js', dest: 'src/services/reef.js' },
      { src: 'src/workers/seren-post-machine.js', dest: 'src/workers/seren-post-machine.js' },
      { src: 'src/sailor/reddit-post-man.js', dest: 'src/sailor/reddit-post-man.js' },
      { src: 'src/content/reddit-helper.js', dest: 'src/content/reddit-helper.js' },
      { src: 'src/content/frappe-bridge.js', dest: 'src/content/frappe-bridge.js' }
    ];

    for (const { src, dest } of scriptFiles) {
      const srcPath = join(__dirname, src);
      const destPath = join(this.buildPath, dest);
      
      if (existsSync(srcPath)) {
        this.log(`Processing ${src}...`);
        
        try {
          // Use Bun to process the file (minification, etc.)
          const result = await Bun.build({
            entrypoints: [srcPath],
            minify: process.env.NODE_ENV === 'production',
            target: 'browser',
            format: 'esm',
            outdir: dirname(destPath),
            naming: '[name].[ext]'
          });
          
          if (result.success) {
            // If Bun build succeeds, copy the result
            const content = await result.outputs[0].text();
            writeFileSync(destPath, content);
          } else {
            // If Bun build fails, just copy the original file
            this.logWarning(`Bun build failed for ${src}, copying original file`);
            cpSync(srcPath, destPath);
          }
        } catch (error) {
          this.logWarning(`Failed to process ${src} with Bun, copying original: ${error.message}`);
          cpSync(srcPath, destPath);
        }
      }
    }
  }

  processManifest() {
    this.log('Processing manifest.json...');
    
    const manifestPath = join(__dirname, 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf8');
    let manifest = JSON.parse(manifestContent);
    
    // Update version with build timestamp for development builds
    if (process.env.NODE_ENV !== 'production') {
      const buildNumber = Math.floor(Date.now() / 1000);
      const [major, minor] = manifest.version.split('.');
      manifest.version = `${major}.${minor}.${buildNumber}`;
    }
    
    // Add build info
    manifest._build = {
      timestamp: new Date().toISOString(),
      builder: 'Bun',
      environment: process.env.NODE_ENV || 'development'
    };
    
    // Write processed manifest
    writeFileSync(
      join(this.buildPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }

  logBuildStats() {
    const buildTime = Date.now() - this.startTime;
    const buildPath = this.buildPath;
    
    this.log('📊 Build Statistics:');
    this.log(`   Build time: ${buildTime}ms`);
    this.log(`   Output directory: ${buildPath}`);
    this.log(`   Bun version: ${Bun.version}`);
    
    // Get build size
    try {
      const result = Bun.spawn(['du', '-sh', buildPath]);
      const output = result.stdout?.toString()?.trim();
      if (output) {
        const size = output.split('\t')[0];
        this.log(`   Build size: ${size}`);
      }
    } catch (error) {
      // Size calculation failed, continue anyway
    }
  }
}

// Main execution
if (import.meta.main) {
  const builder = new ExtensionBuilder();
  await builder.build();
}