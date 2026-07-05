[日本語](README.md) | English

# Sha-Sha Neko (Hissing Cat) 🐈

An app that turns the other person's raised voice on a call into a hissing cat.

Long calls with loud or harsh tones can be quietly draining. The moment the
volume spikes, the cat hisses and puffs up — a small way to lighten the mood
and reset your own mindset.

Audio is never recorded or sent anywhere. The app only analyzes the volume
level, entirely inside your browser.
(It doesn't look at the content, and nothing is ever transmitted.)

## How to use

### Web version (no install, works in the browser)

1. Open the published page (`https://<your-username>.github.io/shaa-neko/`)
2. Click "🎙 Turn on microphone" → allow microphone access when the browser asks
3. Play your call (e.g. Zoom) through your speakers while using it, and the cat will react to the other person's voice too
4. Use the sensitivity slider to adjust how loud a sound needs to be to trigger a hiss
5. Click "👆 Tap to hiss" to test it, and use the toggle in the corner to turn the hiss sound effect on/off
6. "Today's hiss count" shows how many times the cat has hissed today

### Chrome extension version (captures a call tab's audio directly)

More accurate than the microphone, since it analyzes a call app's tab audio directly.

1. Open `chrome://extensions` in Chrome
2. Turn on "Developer mode" in the top right
3. Click "Load unpacked" → select the `extension` folder
4. Click the cat icon in the toolbar → the side panel opens
5. With a call app's tab open (browser-based phone, Zoom Web, etc.),
   click "🎧 Capture this tab's audio" and the cat will react to that tab's audio
   (you can still hear the other person normally while it's capturing)

## Folder structure

```
shaa-neko/
├── docs/          … Web version (can be published as-is via GitHub Pages)
│   └── index.html
└── extension/     … Chrome extension version (side panel + tab audio capture)
    ├── manifest.json
    ├── background.js
    ├── sidepanel.html
    ├── sidepanel.js
    └── icons/
```

## Notes

- Tab audio capture is a feature of desktop Chrome / Edge
- Audio from `chrome://` pages or the Web Store cannot be captured
- If using this at work, please check your workplace's rules on tool usage
