# AI Kuaida Prototype

Static review site for the AI Kuaida RFP/DDQ prototype.

## Access

This prototype is intended for invited reviewers only.

- Access password: `AIKuaida-Review-8068`
- The page uses a lightweight client-side access gate.
- The page is marked `noindex,nofollow` to discourage search engine indexing.

## GitHub Pages

This repository deploys the current static prototype to GitHub Pages through GitHub Actions.

The deployment workflow pulls the static assets from the existing Vercel prototype and publishes them as a GitHub Pages artifact.

Expected Pages URL after deployment:

```text
https://ellapanai.github.io/ai-kuaida-app/
```

## Privacy Note

GitHub Pages is static hosting. The password prompt is useful for controlled prototype review, but it is not enterprise-grade authentication. Do not place real client confidential data in this static prototype.
