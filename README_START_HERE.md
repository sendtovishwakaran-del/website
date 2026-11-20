# Sprout — cursor-tracking 3D dragon

An original, procedurally modeled green dragon built in Three.js. It has smooth head movement, cursor-following pupils, periodic blinks, idle breathing, and tail sway. Its bright yellow and mint presentation is inspired by playful interactive portfolio sites, not a copy of any existing proprietary model.

## Files
- `index.html` — standalone bright homepage demo
- `styles.css` — homepage styles
- `main.js` — starts the scene on the demo homepage
- `dragon.js` — reusable Three.js dragon (the actual 3D interaction)
- `EMBED_IN_EXISTING_SITE.html` — paste-in directions for your current portfolio

## Option A — preview on GitHub Pages without replacing your existing portfolio
1. Open your GitHub Pages repository (the repository that powers `thirupathireddy.com`).
2. Create a folder named `dragon-demo` in its published branch/folder.
3. Upload **index.html, styles.css, main.js, dragon.js** into `dragon-demo`.
4. Commit. Visit `https://thirupathireddy.com/dragon-demo/` after Pages deploys.
5. If you use a custom GitHub Pages publishing folder, put the files there instead.

## Option B — embed in your existing homepage (recommended)
1. Upload `dragon.js` to the same published folder as your existing `index.html`.
2. Open `EMBED_IN_EXISTING_SITE.html` and paste its `section`, `style`, and `script` blocks into your own `index.html`.
3. Do **not** overwrite your current `index.html` with the demo one unless you intentionally want to replace your whole homepage.
4. Do not paste the HTML embed snippet into a `.js` file.
5. Remove your old character-cursor script tag if you don't want both mascots on screen.
6. Commit, wait for deployment, then reload with Ctrl+Shift+R.

## Requirements & troubleshooting
- Modern browser with WebGL; internet connection required to load Three.js from jsDelivr and fonts from Google Fonts.
- Run through GitHub Pages (or localhost via `python -m http.server 8000`), not by double-clicking the HTML file using `file://`.
- In DevTools console (F12), investigate any network errors for `dragon.js`, `main.js`, or `three.module.js`.
- Movement follows pointer across browser window. Reduced-motion and touch settings turn off the moving effects.
- To adjust speed, edit `desiredX * 0.35`, `desiredY * 0.15`, or `4.8` smoothing rate in `dragon.js`.
- Replace `mailto:hello@example.com` in the demo before publicizing it. It's only a placeholder.
- This is a stylized 3D model created from Three.js geometry; it is not a furry photorealistic GLB model like the screenshot.
