# Fancy Gallery (Static)

Cute pink-teal themed dark gallery.

Files:
- `index.html` — main page
- `style.css` — styles
- `gallery.js` — script loads images from `images/` and videos from `videos/`

Image filenames expected: `images/1.jpg` .. `images/8.jpg`, `images/9.png`, `images/10.png`, `images/11.jpeg`
Video filenames expected: `videos/1.mp4` .. `videos/4.mp4`

Important: open a local static server (do NOT open directly via file://) so the browser can load media.

Quick local server (python):

```bash
# Python 3
cd "path/to/fancy gallery"
python -m http.server 8000
# then open http://localhost:8000 in your browser
```

Enjoy! Replace media in `images/` and `videos/` as needed.