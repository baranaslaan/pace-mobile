# Pace — Legal pages

Self-contained, host-agnostic static pages for the App Store / Play Store
required links. No build step, no external fonts or assets.

**Published from `docs/` via GitHub Pages** (`main` branch → `/docs` folder):

- `docs/index.html` — landing with links to both documents
- `docs/privacy.html` — Privacy Policy (TR + EN on one page)
- `docs/terms.html` — Terms of Use (TR + EN on one page)
- `docs/style.css` — shared dark theme matching the Pace app

These stay in `legal/` (internal, not published):

- `README.md` — this file
- `store-listing.md` — App Store / Play marketing copy

Both pages are factual and reflect what the app actually does: all data stays on
the device, no account, no tracking, and the only network call is anonymous
exchange-rate fetching from frankfurter.dev. Not legal advice — review before publishing.

## Live URLs

Once `docs/` is committed and pushed to `main`, Pages serves:

- Privacy: `https://baranaslaan.github.io/pace-mobile/privacy.html`
- Terms:   `https://baranaslaan.github.io/pace-mobile/terms.html`

Pages was enabled via `gh api` (source = `main` / `/docs`). It goes live after the
first push that includes `docs/`. First build can take a minute or two.

### Going live — one command (Baran commits)

```bash
git add docs legal && git commit -m "Add hosted legal pages + store copy" && git push
```

## Custom domain (optional, later)

To serve at `pace.app/privacy` instead:
1. Add a `docs/CNAME` file containing `pace.app`.
2. Point the domain's DNS at GitHub Pages.
3. Update the in-app URLs (below) to the pace.app paths.

## Wiring the URLs into the app

The in-app links live in `src/features/settings/components/SettingsSheet.tsx`.
They have been updated to the GitHub Pages URLs:

```ts
const PRIVACY_URL = "https://baranaslaan.github.io/pace-mobile/privacy.html";
const TERMS_URL   = "https://baranaslaan.github.io/pace-mobile/terms.html";
```

If you later move to a `pace.app` custom domain, update these two constants.

## When the EULA/subscription terms become real

`terms.html` already includes auto-renewing subscription language (Apple requires
this for the annual plan). Revisit the "Pace Pro and subscriptions" section once
RevenueCat is wired and final pricing is confirmed.
