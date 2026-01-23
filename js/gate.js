/**
 * Gate Page - Age Verification + Captcha Interstitial
 *
 * URL Patterns:
 *   - Short ID: https://gate.example.com/?id=jpc1
 *   - Base64:   https://gate.example.com/?dest=BASE64_URL&geo=US (backwards compatible)
 *
 * Configuration:
 * 1. Add your Turnstile site key to index.html (data-sitekey attribute)
 * 2. For short IDs: Add destinations to config/destinations.json
 * 3. For base64: Update ALLOWED_DOMAINS below
 */

// ============================================
// CONFIGURATION - Update these values
// ============================================

const ALLOWED_DOMAINS = [
    'spintoday.net',
    'canverse.net',
    'aumetry.com',
    'chainwager.net',
    'thesunpapers.com',
    'northeasttimes.com',
    'centraljersey.com',
    'gorgeousplay.com',
    'drafttek.com',
    'metrotimes.com',
    'culture.org',
    'jackpotcitycasino.com',
    'spincasino.com',
    'gotoplayojo.com',
    // Add more affiliate/tracking domains as needed
];

// GEO-specific content configuration
const GEO_CONFIG = {
    US: {
        legalAge: 21,
        helpline: 'Need help? Call <strong>1-800-522-4700</strong>',
        helplineOrg: 'National Problem Gambling Helpline'
    },
    CA: {
        legalAge: 19,
        helpline: 'Need help? Call <strong>1-866-531-2600</strong>',
        helplineOrg: 'ConnexOntario'
    },
    UK: {
        legalAge: 18,
        helpline: 'Need help? Visit <strong>GambleAware.org</strong>',
        helplineOrg: 'GambleAware'
    },
    AU: {
        legalAge: 18,
        helpline: 'Need help? Call <strong>1800 858 858</strong>',
        helplineOrg: 'Gambling Help Online'
    },
    DE: {
        legalAge: 18,
        helpline: 'Hilfe unter <strong>0800-1372700</strong>',
        helplineOrg: 'Bundeszentrale fur gesundheitliche Aufklarung'
    },
    AT: {
        legalAge: 18,
        helpline: 'Hilfe unter <strong>0800-202304</strong>',
        helplineOrg: 'Spielsuchthilfe'
    },
    NZ: {
        legalAge: 18,
        helpline: 'Need help? Call <strong>0800 654 655</strong>',
        helplineOrg: 'Gambling Helpline NZ'
    },
    IE: {
        legalAge: 18,
        helpline: 'Need help? Visit <strong>GambleAware.ie</strong>',
        helplineOrg: 'GambleAware Ireland'
    }
};

// Default config for unknown GEOs
const DEFAULT_GEO_CONFIG = {
    legalAge: 18,
    helpline: 'Please gamble responsibly',
    helplineOrg: ''
};

// ============================================
// STATE
// ============================================

let captchaPassed = false;
let ageConfirmed = false;
let destinationUrl = null;
let currentGeo = 'US';

// ============================================
// DOM ELEMENTS (initialized after DOM loads)
// ============================================

let continueBtn, ageCheckbox, legalAgeEl, helplineEl, errorMessageEl, errorTextEl, captchaStatusEl;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize DOM references
    continueBtn = document.getElementById('continue-btn');
    ageCheckbox = document.getElementById('age-checkbox');
    legalAgeEl = document.getElementById('legal-age');
    helplineEl = document.getElementById('helpline');
    errorMessageEl = document.getElementById('error-message');
    errorTextEl = document.getElementById('error-text');
    captchaStatusEl = document.getElementById('captcha-status');

    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const shortId = params.get('id');
    const encodedDest = params.get('dest');

    // Method 1: Short ID lookup (preferred)
    if (shortId) {
        try {
            const config = await loadDestinationsConfig();
            const destination = config[shortId];

            if (!destination) {
                showError('Invalid destination ID');
                return;
            }

            destinationUrl = destination.url;
            currentGeo = (destination.geo || 'US').toUpperCase();

            console.log('Gate initialized via ID:', shortId, '→', new URL(destinationUrl).hostname);

        } catch (e) {
            console.error('Config load error:', e);
            showError('Failed to load destination');
            return;
        }
    }
    // Method 2: Base64 encoded destination (backwards compatible)
    else if (encodedDest) {
        currentGeo = (params.get('geo') || 'US').toUpperCase();

        try {
            destinationUrl = atob(encodedDest);

            // Validate URL format
            const url = new URL(destinationUrl);

            // Validate against allowed domains
            if (!isAllowedDomain(url.hostname)) {
                showError('Invalid destination domain');
                return;
            }

            console.log('Gate initialized via base64 for:', url.hostname);

        } catch (e) {
            console.error('URL decode error:', e);
            showError('Invalid destination URL');
            return;
        }
    }
    // No destination specified
    else {
        showError('No destination specified');
        return;
    }

    // Apply GEO-specific content
    applyGeoConfig(currentGeo);

    // Set up event listeners
    ageCheckbox.addEventListener('change', function(e) {
        ageConfirmed = e.target.checked;
        updateButtonState();
    });

    // Prevent clicks on disabled link
    continueBtn.addEventListener('click', function(e) {
        if (!captchaPassed || !ageConfirmed || !destinationUrl) {
            e.preventDefault();
            console.log('Link click blocked - validation not complete');
            return false;
        }
        // Let the native link behavior handle navigation
        console.log('Navigating via native link to:', this.href);
    });
});

/**
 * Load destinations config file
 */
async function loadDestinationsConfig() {
    // Add cache-busting to avoid CDN stale data
    const response = await fetch('config/destinations.json?v=' + Date.now());
    if (!response.ok) {
        throw new Error('Failed to load destinations config');
    }
    return response.json();
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Apply GEO-specific configuration to the page
 */
function applyGeoConfig(geo) {
    const config = GEO_CONFIG[geo] || DEFAULT_GEO_CONFIG;

    // Update legal age display
    if (legalAgeEl) {
        legalAgeEl.textContent = config.legalAge;
    }

    // Update helpline
    if (helplineEl) {
        helplineEl.innerHTML = config.helpline;
    }
}

/**
 * Check if hostname is in allowed domains list
 */
function isAllowedDomain(hostname) {
    // Remove www. prefix for comparison
    const cleanHostname = hostname.replace(/^www\./, '');

    return ALLOWED_DOMAINS.some(domain => {
        // Check exact match or subdomain
        return cleanHostname === domain || cleanHostname.endsWith('.' + domain);
    });
}

/**
 * Turnstile success callback (called by Turnstile widget)
 */
window.onTurnstileSuccess = function(token) {
    captchaPassed = true;

    // Update status indicator
    if (captchaStatusEl) {
        captchaStatusEl.innerHTML = '<span class="status-success">Verified</span>';
    }

    updateButtonState();
};

/**
 * Turnstile error callback
 */
window.onTurnstileError = function() {
    captchaPassed = false;

    if (captchaStatusEl) {
        captchaStatusEl.innerHTML = '<span class="status-pending">Verification failed - please refresh</span>';
    }

    updateButtonState();
};

/**
 * Turnstile expired callback
 */
window.onTurnstileExpired = function() {
    captchaPassed = false;

    if (captchaStatusEl) {
        captchaStatusEl.innerHTML = '<span class="status-pending">Verification expired - please refresh</span>';
    }

    updateButtonState();
};

/**
 * Update continue link state
 * The continue button is now an <a> tag - we enable it by setting href and removing disabled class
 */
function updateButtonState() {
    const canContinue = captchaPassed && ageConfirmed && destinationUrl;

    if (canContinue) {
        // Enable: set href and remove disabled class
        continueBtn.href = destinationUrl;
        continueBtn.classList.remove('disabled');
        console.log('Continue link enabled:', destinationUrl);
    } else {
        // Disable: remove href and add disabled class
        continueBtn.removeAttribute('href');
        continueBtn.classList.add('disabled');
    }
}

/**
 * Show error message
 */
function showError(message) {
    if (errorTextEl) {
        errorTextEl.textContent = message;
    }
    if (errorMessageEl) {
        errorMessageEl.style.display = 'flex';
    }

    // Disable all interaction
    if (continueBtn) {
        continueBtn.disabled = true;
    }
    if (ageCheckbox) {
        ageCheckbox.disabled = true;
    }
}

// ============================================
// DEVELOPMENT / TESTING HELPERS
// ============================================

/**
 * Generate a gate URL (for testing in console)
 * Usage: generateGateUrl('https://chainwager.net/go/playojo/', 'CA')
 */
window.generateGateUrl = function(affiliateUrl, geo = 'US') {
    const encoded = btoa(affiliateUrl);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?dest=${encoded}&geo=${geo}`;
};

/**
 * Decode a gate URL destination (for debugging)
 * Usage: decodeGateDest('aHR0cHM6Ly9jaGFpbndh...')
 */
window.decodeGateDest = function(encoded) {
    try {
        return atob(encoded);
    } catch (e) {
        return 'Invalid encoding';
    }
};

// Log helper functions availability in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Gate Page Dev Helpers:');
    console.log('  generateGateUrl(affiliateUrl, geo) - Create gate URL');
    console.log('  decodeGateDest(encoded) - Decode destination');
}
