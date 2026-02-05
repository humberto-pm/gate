# CLAUDE.md - Gate

Age verification gate - standalone HTML/JS application.

---

## Overview

Gate is a self-contained age verification page that users pass through before accessing affiliate links. No Slack bot or shared CLI credentials.

---

## Deployment

- **Platform**: Sevalla (Kinsta)
- **Domain**: playzones.net
- **Type**: Static HTML/JS (no backend)

---

## Key Gotchas

- **No shared .env** - self-contained application
- **Turnstile captcha** integration for bot protection
- **GEO-specific age requirements**:
  - US: 21+
  - CA: 19+
  - UK, AU, DE, AT, NZ, IE: 18+
- Configuration files:
  - `config/destinations.json` - Affiliate URL mappings
  - `config/domains.json` - Domain configuration

---

## Reference

For link generation utility, see `../CLI/integrations/gate_link_generator.py`

```bash
# Generate gate URL
python ../CLI/integrations/gate_link_generator.py "https://affiliate.com/offer" --geo CA

# Decode gate URL
python ../CLI/integrations/gate_link_generator.py --decode "https://playzones.net/?dest=..."
```
