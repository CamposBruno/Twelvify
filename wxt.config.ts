import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Twelveify',
    description: 'Simplify any text on the web with AI',
    version: '0.1.0',
    permissions: ['storage'],
    // Production backend URL on Render. Update ALLOWED_ORIGINS on Render dashboard after Web Store approval.
    host_permissions: [
      'https://twelvify-backend.onrender.com/*',
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
