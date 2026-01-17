# Affiliate Gate Page

Age verification + captcha interstitial for affiliate links. Sits between Reddit posts and affiliate destinations.

**Flow:** Reddit post → Gate page (captcha + 18+ checkbox) → Affiliate URL

## Quick Start

### 1. Set Up Cloudflare Turnstile

1. Create free account at [cloudflare.com](https://cloudflare.com)
2. Go to **Turnstile** → **Add widget**
3. Add your domain (e.g., `yourusername.github.io`)
4. Copy the **Site Key**
5. Replace `YOUR_TURNSTILE_SITE_KEY` in `index.html`:

```html
<div class="cf-turnstile"
     data-sitekey="0x4AAAAAAA..."  <!-- Your site key here -->
     data-callback="onTurnstileSuccess"
     data-theme="dark">
</div>
```

### 2. Deploy to GitHub Pages

```bash
# Create new repo
gh repo create affiliate-gate --public --clone
cd affiliate-gate

# Copy files
cp -r /path/to/html/gate/* .

# Push and enable Pages
git add . && git commit -m "Initial gate page"
git push -u origin main

# Go to Settings → Pages → Source: main branch, / (root)
```

Your gate will be live at: `https://yourusername.github.io/affiliate-gate/`

### 3. (Optional) Custom Domain

1. Add `CNAME` file with your domain:
   ```
   gate.yourdomain.com
   ```
2. Add DNS record: `CNAME gate → yourusername.github.io`
3. Enable HTTPS in GitHub Pages settings

## Generating Gate URLs

### Browser Console Method

Open the gate page and use the console:

```javascript
generateGateUrl('https://chainwager.net/go/playojo-fre-spi-en-ca/?!86aeepf52', 'CA')
// Returns: https://yourdomain.com/gate/?dest=aHR0cHM6Ly9...&geo=CA
```

### JavaScript (for automation)

```javascript
function createGateLink(affiliateUrl, geo = 'US') {
    const baseUrl = 'https://yourusername.github.io/affiliate-gate/';
    const encoded = btoa(affiliateUrl);
    return `${baseUrl}?dest=${encoded}&geo=${geo}`;
}

// Example
createGateLink('https://spintoday.net/go/betmgm/', 'US');
```

### Python (for bulk generation)

```python
import base64

def create_gate_link(affiliate_url, geo='US'):
    base_url = 'https://yourusername.github.io/affiliate-gate/'
    encoded = base64.b64encode(affiliate_url.encode()).decode()
    return f'{base_url}?dest={encoded}&geo={geo}'

# Example
links = [
    ('https://chainwager.net/go/playojo/', 'CA'),
    ('https://aumetry.com/go/stake/', 'AU'),
    ('https://spintoday.net/go/betmgm/', 'US'),
]

for url, geo in links:
    print(create_gate_link(url, geo))
```

### Command Line (macOS/Linux)

```bash
# Encode URL
echo -n "https://chainwager.net/go/playojo/" | base64
# aHR0cHM6Ly9jaGFpbndh...

# Full gate URL
echo "https://yourdomain.com/?dest=$(echo -n 'https://chainwager.net/go/playojo/' | base64)&geo=CA"
```

## URL Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `dest` | Yes | Base64-encoded affiliate URL |
| `geo` | No | Country code for legal age/helpline (default: US) |

### Supported GEOs

| Code | Legal Age | Helpline |
|------|-----------|----------|
| US | 21+ | 1-800-522-4700 |
| CA | 19+ | 1-866-531-2600 |
| UK | 18+ | GambleAware.org |
| AU | 18+ | 1800 858 858 |
| DE | 18+ | 0800-1372700 |
| AT | 18+ | 0800-202304 |
| NZ | 18+ | 0800 654 655 |
| IE | 18+ | GambleAware.ie |

## Adding New Affiliate Domains

Edit `js/gate.js` and add domains to the `ALLOWED_DOMAINS` array:

```javascript
const ALLOWED_DOMAINS = [
    'spintoday.net',
    'canverse.net',
    'aumetry.com',
    'chainwager.net',
    // Add your new domain here:
    'newaffiliate.com',
];
```

## Security

- **Domain allowlist**: Only URLs from configured domains are accepted
- **Base64 encoding**: Prevents URL parameter manipulation
- **Client-side validation**: Invalid URLs show error before redirect
- **noindex meta tag**: Page won't be indexed by search engines

## Testing Locally

```bash
# Python simple server
cd html/gate
python -m http.server 8080

# Open browser
open http://localhost:8080/?dest=aHR0cHM6Ly9jaGFpbndh...&geo=US
```

For local testing, the Turnstile widget will show a testing interface.

## File Structure

```
gate/
├── index.html      # Main page with Turnstile widget
├── css/
│   └── gate.css    # Dark theme styling
├── js/
│   └── gate.js     # Validation + redirect logic
└── README.md       # This file
```

## Troubleshooting

### Turnstile not loading
- Check site key is correct
- Verify domain is added in Cloudflare dashboard
- Check browser console for errors

### "Invalid destination domain" error
- Add the domain to `ALLOWED_DOMAINS` in `gate.js`
- Domain should be without `www.` prefix

### Page redirects immediately
- Ensure both captcha is completed AND checkbox is checked
- Check that `captchaPassed` and `ageConfirmed` are both true

## Customization

### Change colors
Edit `css/gate.css`:
- Gold accent: `#d4af37`
- Background: `#1a1a2e` to `#0f0f23` gradient
- Card: `rgba(255, 255, 255, 0.05)` with blur

### Add new GEO
Edit `js/gate.js` `GEO_CONFIG`:

```javascript
const GEO_CONFIG = {
    // ...existing...
    BR: {
        legalAge: 18,
        helpline: 'Precisa de ajuda? <strong>0800-XXX-XXXX</strong>',
        helplineOrg: 'Jogadores Anonimos'
    }
};
```
