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
    icons: {
      '16': 'assets/icons/icon16.png',
      '32': 'assets/icons/icon32.png',
      '48': 'assets/icons/icon48.png',
      '128': 'assets/icons/icon128.png',
    },
    action: {
      default_title: 'Twelveify',
      default_icon: {
        '16': 'assets/icons/icon16.png',
        '32': 'assets/icons/icon32.png',
        '48': 'assets/icons/icon48.png',
        '128': 'assets/icons/icon128.png',
      },
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
