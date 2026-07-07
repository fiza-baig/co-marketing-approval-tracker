# Co-Marketing Approval Bottleneck Tracker

A launch-readiness board for marketing operations teams. Tracks every approval standing between a co-marketing campaign and launch (Legal, Partner, Creative, Finance), visualizes readiness as a live meter, and uses Claude to triage which blockers are actually urgent — ranking them and suggesting a concrete next action for each.

Built as a focused 2-hour build to explore agentic AI workflows for marketing operations project management.

## Why I built this

Six+ years of running GTM and co-marketing campaign delivery taught me the same lesson every time: campaigns rarely die from bad creative. They die from approvals sitting in someone's inbox with nobody tracking the critical path. This tool is that instinct, automated — surfacing not just *what's* stuck, but *what to do about it.*

## What it does

- Log approval items by team (Legal, Partner, Creative, Finance, Sales), status, and days waiting
- See campaign launch readiness as a live visual meter
- One click sends the current board to Claude, which returns:
  - An overall launch-risk summary
  - Ranked blockers by urgency (high / medium / low)
  - A concrete next action per blocker

## Tech

- React (single-component, no build step required beyond standard tooling)
- Anthropic Claude API (`claude-sonnet-4-6`) for the triage/analysis step
- Inline styling, no external CSS framework

## Running it yourself

This project calls the Claude API directly from the browser, which means it needs an API key to actually run the "Analyze blockers" feature.

**⚠️ Security note:** Never put a real API key directly in client-side code in a public repo — anyone viewing the page source could copy and misuse it. The two safe options:

1. **Local use only:** clone this repo, add your own Anthropic API key to a local environment variable, and run it locally — never commit the key.
2. **Production use:** route the API call through a backend proxy (e.g. a small serverless function) that holds the key server-side, rather than calling `api.anthropic.com` directly from the browser.

The version in this repo is intentionally left as a **demo/prototype** — the UI, data model, and triage logic are fully functional; the live API call is illustrative of the intended architecture rather than production-ready as-is.

---
Built by Fiza Baig — [linkedin.com/in/fizabaig](https://linkedin.com/in/fizabaig)
