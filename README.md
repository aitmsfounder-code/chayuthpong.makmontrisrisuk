# AI Squad — Pixel Art Resume Project

## Quick Start (Claude Code CLI)
1. Open this folder in Claude Code: `cd ai-squad && claude`
2. Claude reads `CLAUDE.md` automatically and becomes the Orchestrator
3. Talk to the Orchestrator in Thai or English
4. The Orchestrator delegates tasks to sub-agents via the Agent tool

## Quick Start (Cowork)
1. Select this folder as your workspace
2. Claude reads `CLAUDE.md` and operates as the Orchestrator
3. Same workflow — just talk naturally

## Folder Structure
```
ai-squad/
├── CLAUDE.md                          # Orchestrator brain
├── README.md                          # This file
│
├── orchestrator/
│   ├── registry.json                  # Agent registry & status
│   ├── AGENT-CREATION-GUIDE.md        # How to create new agents
│   ├── memory/
│   │   └── squad-knowledge.md         # Shared knowledge base
│   └── templates/
│       └── agent-template/            # Template for new agents
│           ├── SKILL.md
│           └── TODO.md
│
├── agents/
│   ├── frontend-dev/                  # Game & web development
│   │   ├── SKILL.md                   # Agent definition
│   │   ├── TODO.md                    # Task backlog
│   │   ├── memory/                    # Persistent knowledge
│   │   ├── work-history/              # Daily logs
│   │   └── assets/                    # Working files
│   │
│   ├── pixel-artist/                  # Visual assets
│   │   ├── SKILL.md
│   │   ├── TODO.md
│   │   ├── memory/
│   │   ├── work-history/
│   │   ├── assets/
│   │   └── references/                # Palette, style guide
│   │
│   ├── ui-ux-designer/               # Layout & UX
│   │   ├── SKILL.md
│   │   ├── TODO.md
│   │   ├── memory/
│   │   ├── work-history/
│   │   └── assets/
│   │
│   ├── sound-designer/               # Audio & music
│   │   ├── SKILL.md
│   │   ├── TODO.md
│   │   ├── memory/
│   │   ├── work-history/
│   │   └── assets/
│   │
│   ├── qa-tester/                     # Testing & QA
│   │   ├── SKILL.md
│   │   ├── TODO.md
│   │   ├── memory/
│   │   ├── work-history/
│   │   └── test-reports/
│   │
│   └── project-manager/              # Planning & tracking
│       ├── SKILL.md
│       ├── TODO.md
│       ├── memory/
│       ├── work-history/
│       └── reports/
│
└── shared/
    ├── project-context/
    │   ├── BRIEF.md                   # Project brief
    │   └── STATUS.md                  # Current status
    ├── conventions/
    │   ├── CODING.md                  # Code conventions
    │   └── ASSET.md                   # Asset conventions
    └── assets/                        # Shared deliverables
```

## How It Works
1. **You** tell the Orchestrator what you want
2. **Orchestrator** analyzes the task and picks the right agent(s)
3. **Sub-agent** reads its SKILL.md, memory, and shared context
4. **Sub-agent** completes the task and logs its work
5. **Orchestrator** collects results and reports back to you
6. If no suitable agent exists, Orchestrator creates one automatically

## Commands (talk naturally)
- "สร้างตัวละครหลัก" → Orchestrator sends to Pixel Artist
- "เขียน game loop" → Orchestrator sends to Frontend Dev
- "ตอนนี้โปรเจกต์เป็นยังไงบ้าง" → Orchestrator asks PM for status
- "ทดสอบบน mobile" → Orchestrator sends to QA Tester
- "เพิ่ม agent สำหรับ SEO" → Orchestrator creates new agent
