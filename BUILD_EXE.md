# Build MathStats as One-File EXE (Windows)

Run these commands in `d:\pilitic\MathStats\MathStats`:

```powershell
python -m pip install -r requirements.txt
python -m PyInstaller --noconfirm --clean --onefile --windowed --name MathStats `
  --add-data "HTML;HTML" `
  --add-data "CSS;CSS" `
  --add-data "IMAGES;IMAGES" `
  --add-data "KBG.mp3;." `
  --add-data "KBGM.mp3;." `
  --add-data "Blue Winter.ttf;." `
  --add-data "Funny Hello.otf;." `
  --add-data "Gomuno Bubble.ttf;." `
  --add-data "Starborn.ttf;." `
  --add-data "TitanOne-Regular.ttf;." `
  app.py
```

Output:
- `dist\MathStats.exe` (this is the file you can give to your instructor)

Notes:
- If SmartScreen warns, click `More info` then `Run anyway`.
- `pywebview` uses Microsoft WebView2 runtime (already present on most Windows 10/11 PCs).
- Your app should work offline, but Google Fonts in HTML may need internet the first time (or fallback fonts are used).
