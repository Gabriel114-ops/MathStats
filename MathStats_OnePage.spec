# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['app_onepage.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('OnePage', 'OnePage'),
        ('IMAGES', 'IMAGES'),
        ('Blue Winter.ttf', '.'),
        ('Funny Hello.otf', '.'),
        ('Gomuno Bubble.ttf', '.'),
        ('Starborn.ttf', '.'),
        ('TitanOne-Regular.ttf', '.')
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='MathStats_OnePage',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['IMAGES\\MathStats.ico'],
)
