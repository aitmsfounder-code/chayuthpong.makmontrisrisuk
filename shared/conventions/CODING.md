# Coding Conventions

## Language
- TypeScript (strict mode) for all source code
- CSS Modules or plain CSS for styles (no Tailwind in game project)

## File Naming
- kebab-case for all files: `player-controller.ts`, `main-scene.ts`
- PascalCase for React components: `ResumePanel.tsx`, `GameCanvas.tsx`
- PascalCase for Phaser scenes/entities: `MainScene.ts`, `Player.ts`

## Folder Structure
```
src/
├── game/        # Phaser game code
├── ui/          # React UI code
├── assets/      # Static assets (images, audio, tilemaps)
├── styles/      # CSS files
└── types/       # Shared TypeScript types
```

## Code Style
- 2 spaces indentation
- Single quotes for strings
- Trailing commas
- No semicolons (or always semicolons — pick one and be consistent)
- Max line length: 100 characters
- Use explicit return types on public methods

## Git
- Branch naming: `feature/{agent-id}/{description}`, `fix/{agent-id}/{description}`
- Commit format: `[{agent-id}] {type}: {description}`
  - Types: feat, fix, style, refactor, test, docs, chore
  - Example: `[frontend-dev] feat: add player walk animation`

## Comments
- JSDoc for public functions and classes
- Inline comments for complex game logic
- TODO comments: `// TODO({agent-id}): description`

## Testing
- Unit tests with Vitest
- E2E tests with Playwright
- Test files: `*.test.ts` or `*.spec.ts` next to source files
