#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the manifest.json file
const manifestPath = path.join(__dirname, '../dist/bex/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Replace the single content script with multiple URL-based scripts
manifest.content_scripts = [
  {
    "matches": [
      "*://www.reddit.com/*/submit",
      "*://www.reddit.com/*/submit/*",
      "*://old.reddit.com/*/submit",
      "*://old.reddit.com/*/submit/*"
    ],
    "js": [
      "submit-content-script.js"
    ],
    "run_at": "document_idle"
  },
  {
    "matches": [
      "*://www.reddit.com/*",
      "*://old.reddit.com/*"
    ],
    "exclude_matches": [
      "*://www.reddit.com/*/submit",
      "*://www.reddit.com/*/submit/*",
      "*://old.reddit.com/*/submit",
      "*://old.reddit.com/*/submit/*"
    ],
    "js": [
      "my-content-script.js",
      "stats-content-script.js"
    ],
    "run_at": "document_idle"
  }
];

// Write the updated manifest back
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ Manifest.json updated with URL-based content scripts');
console.log('📝 Submit script: Only runs on submit pages');
console.log('📊 Stats script: Runs on all reddit.com pages except submit');
