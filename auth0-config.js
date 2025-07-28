// Auth0 Configuration for BuildToEarn.dev
// Replace these values with your actual Auth0 application settings

const AUTH0_CONFIG = {
  // Your Auth0 domain (e.g., 'your-tenant.us.auth0.com')
  domain: "YOUR_AUTH0_DOMAIN",

  // Your Auth0 Client ID (from Application Settings)
  clientId: "YOUR_AUTH0_CLIENT_ID",

  // Redirect URIs (automatically determined based on environment)
  authorizationParams: {
    redirect_uri: window.location.origin + "/callback.html",
  },

  // Additional configuration options
  cacheLocation: "localstorage",
  useRefreshTokens: true,
};

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AUTH0_CONFIG;
}

// Instructions for setup:
// 1. Go to your Auth0 Dashboard
// 2. Create a Single Page Application
// 3. In Application Settings, set:
//    - Allowed Callback URLs: https://buildtoearn.dev/callback.html, http://localhost:3000/callback.html
//    - Allowed Logout URLs: https://buildtoearn.dev, http://localhost:3000
//    - Allowed Web Origins: https://buildtoearn.dev, http://localhost:3000
// 4. Replace YOUR_AUTH0_DOMAIN and YOUR_AUTH0_CLIENT_ID with your actual values
// 5. Upload this file to your hosting provider along with your other files
