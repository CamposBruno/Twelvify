import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Twelveify',
    description: 'Simplify any text on the web with AI',
    version: '0.1.0',
    permissions: ['storage'],
    // NOTE: Update this URL to the actual deployed backend domain before Chrome Web Store submission.
    // Current URL points to the Render.com deployment used for development/testing.
    host_permissions: [
      'https://twelvify-backend.onrender.com/*',
      'http://localhost:3001/*'
    ],
    content_security_policy: {
      // Extension pages (popup, options) CSP — content script fetch() is governed by host_permissions
      extension_pages: "script-src 'self'; object-src 'self';"
    },
    action: {
      default_title: 'Twelveify'
    },
    commands: {
      'simplify-hotkey': {
        suggested_key: {
          default: 'Ctrl+Shift+1',
          mac: 'Command+Shift+1'
        },
        description: 'Simplify selected text'
      }
    }
  }
});
