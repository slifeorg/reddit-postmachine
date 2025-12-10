/**
 * Bun Configuration for Reddit Post Machine Extension
 */

export default {
  // Build configuration
  build: {
    target: 'browser',
    minify: process.env.NODE_ENV === 'production',
    splitting: false, // Disable code splitting for extension
    format: 'esm',
    outdir: './reddit-post-machine-egg',
    
    // Extension-specific optimizations
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.BUILD_TIME': JSON.stringify(new Date().toISOString())
    },
    
    // External modules (don't bundle these)
    external: [
      'chrome',
      'browser'
    ]
  },
  
  // Test configuration
  test: {
    preload: ['./test/setup.js']
  },
  
  // Development server (not used for extension, but good to have)
  dev: {
    port: 3000,
    hot: false // Extensions don't support hot reloading
  }
};