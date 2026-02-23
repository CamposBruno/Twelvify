import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: 'Twelveify',
    description: 'Simplify any text on the web with AI',
    version: '0.1.0',
    permissions: ['storage'],
    host_permissions: [
      'https://api.simplify.example.com/*'
    ],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self';"
    },
    action: {
      default_title: 'Twelveify'
    }
  }
});
