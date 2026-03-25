# Asset Conventions

## Pixel Art
- **Tile Size**: 16x16 or 32x32 (must be consistent across all assets)
- **Character Size**: 32x32 pixels
- **Color Palette**: Max 32 colors, defined in `agents/pixel-artist/references/palette.md`
- **Format**: PNG with transparency
- **Sprite Sheets**: Horizontal strip, each frame same dimensions

## File Naming
```
{category}-{name}-{dimensions}.png
```
- `character-player-32x32.png`
- `tiles-ground-16x16.png`
- `props-computer-32x32.png`
- `bg-city-skyline-960x240.png`

## Audio
- **Format**: OGG (primary) + MP3 (fallback)
- **BGM**: < 500KB, loopable
- **SFX**: < 50KB each
- **Naming**: `bgm-{name}.ogg`, `sfx-{name}.ogg`

## Tilemaps
- Created in Tiled Map Editor
- Exported as JSON
- Layers: background, ground, decoration, collision, triggers
- Naming: `level-{name}.json`

## Asset Folder Structure (in src/)
```
src/assets/
├── sprites/       # Character and NPC sprite sheets
├── tilesets/      # Tile set images for tilemaps
├── tilemaps/      # Tiled JSON exports
├── ui/            # UI elements (dialog boxes, buttons)
├── audio/
│   ├── bgm/       # Background music
│   └── sfx/       # Sound effects
└── fonts/         # Pixel fonts (if custom)
```
