/**
 * Gate Page - Age Verification + Captcha Interstitial
 *
 * URL Pattern: https://gate.example.com/?dest=BASE64_URL&geo=US
 *
 * Configuration:
 * 1. Add your Turnstile site key to index.html (data-sitekey attribute)
 * 2. Update ALLOWED_DOMAINS below with your affiliate tracking domains
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

document.addEventListener('DOMContentLoaded', function() {
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
    const encodedDest = params.get('dest');
    currentGeo = (params.get('geo') || 'US').toUpperCase();

    // Apply GEO-specific content
    applyGeoConfig(currentGeo);

    // Validate destination URL
    if (!encodedDest) {
        showError('No destination specified');
        return;
    }

    try {
        destinationUrl = atob(encodedDest);

        // Validate URL format
        const url = new URL(destinationUrl);

        // Validate against allowed domains
        if (!isAllowedDomain(url.hostname)) {
            showError('Invalid destination domain');
            return;
        }

        console.log('Gate initialized for:', url.hostname);

    } catch (e) {
        console.error('URL decode error:', e);
        showError('Invalid destination URL');
        return;
    }

    // Set up event listeners
    ageCheckbox.addEventListener('change', function(e) {
        ageConfirmed = e.target.checked;
        updateButtonState();
    });

    continueBtn.addEventListener('click', handleContinue);
});

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
 * Update continue button enabled state
 */
function updateButtonState() {
    const canContinue = captchaPassed && ageConfirmed && destinationUrl;
    continueBtn.disabled = !canContinue;
}

/**
 * Handle continue button click
 */
let isRedirecting = false;
window.handleContinue = function() {
    console.log('handleContinue called', { captchaPassed, ageConfirmed, destinationUrl, isRedirecting });

    // Prevent double-firing
    if (isRedirecting) {
        console.log('Already redirecting, ignoring');
        return;
    }

    if (!captchaPassed || !ageConfirmed || !destinationUrl) {
        console.log('Conditions not met, returning');
        return;
    }

    isRedirecting = true;

    // Add loading state
    if (continueBtn) {
        continueBtn.classList.add('loading');
        continueBtn.disabled = true;
    }

    console.log('Redirecting to:', destinationUrl);

    // Use form submission - hardest method to block
    setTimeout(function() {
        var form = document.createElement('form');
        form.method = 'GET';
        form.action = destinationUrl;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    }, 100);
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
