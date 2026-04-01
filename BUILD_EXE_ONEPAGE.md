# Build One-Page EXE (Windows)

Run in `d:\pilitic\MathStats\MathStats`:

```powershell
python -m pip install -r requirements.txt
python -m PyInstaller --noconfirm --clean MathStats_OnePage.spec
```

Output:
- `dist\MathStats_OnePage.exe`

This build is separate from your existing `MathStats.exe` and launches `OnePage/OnePage.html`.
