# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

The preview server is configured in `.claude/launch.json` and uses Python's built-in HTTP server:

```bash
python3 -m http.server 3000
```

Use `preview_start` with the name `stratos` to launch it via the preview panel.

## Architecture

Pure vanilla HTML/CSS/JS — no framework, no build step, no package manager.

- `index.html` — single-page app; all screens live here as `<div class="screen">` elements. The active screen has no class; hidden ones get the `hidden` class.
- `styles.css` — all styles. Uses CSS custom properties (`:root`) for the color palette and spacing tokens. Mobile-first, max-width 430 px phone frame.
- `app.js` — all interactivity. Screen switching is done by toggling the `hidden` class via `showScreen(name)`.

## Design tokens (styles.css `:root`)

| Token | Value | Usage |
|---|---|---|
| `--blue` | `#1a3de8` | Primary brand color |
| `--bg` | `#e8eaf6` | Page background |
| `--input-bg` | `#f0f2ff` | Input field background |
| `--radius-card` | `28px` | Card corners |
| `--radius-btn` | `50px` | Button/input pill shape |

## Screen system

Each screen is `<div class="screen" id="screen-<name>">`. Add new screens following the same pattern and register them in the `screens` object in `app.js`. Call `showScreen('<name>')` to navigate.

## Planned features (not yet built)

- Home feed: vertically scrollable competition cards by sport
- Friend system: add by pseudo chosen at registration
- Group creation inside a competition, with invite-by-link or invite-from-friends
- Competition detail: standings table + upcoming matches
