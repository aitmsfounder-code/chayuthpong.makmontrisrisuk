# Dynamic Agent Creation Guide

## When to Create a New Agent
Create a new agent when:
1. A task requires expertise not covered by existing agents
2. An existing agent's scope is too broad and needs splitting
3. A new project phase introduces new requirements (e.g., DevOps for deployment, Content Writer for resume text)

## Creation Steps

### 1. Define the Agent
Determine:
- **Agent ID**: kebab-case identifier (e.g., `content-writer`, `devops-engineer`)
- **Name**: Human-readable name
- **Expertise**: List of skills
- **Responsibilities**: What this agent does
- **Dependencies**: Which agents it works with

### 2. Create Folder Structure
```bash
agents/{agent-id}/
├── SKILL.md          # Agent definition (from template)
├── TODO.md           # Task list (from template)
├── memory/           # Agent's persistent knowledge
│   └── decisions.md  # Key decisions log
├── work-history/     # Daily work logs
└── assets/           # Agent's working files
```

### 3. Populate from Template
Copy and customize from `orchestrator/templates/agent-template/`:
- Replace all `{PLACEHOLDER}` values
- Add specific expertise and responsibilities
- Define collaboration points with existing agents

### 4. Register in Registry
Add to `orchestrator/registry.json`:
```json
"{agent-id}": {
  "name": "{Agent Name}",
  "status": "active",
  "folder": "agents/{agent-id}",
  "expertise": ["skill-1", "skill-2"],
  "current_task": null,
  "tasks_completed": 0,
  "last_active": null
}
```

Also add to `agent_creation_log`:
```json
{
  "agent_id": "{agent-id}",
  "created_at": "YYYY-MM-DD",
  "reason": "Why this agent was needed",
  "created_by": "orchestrator"
}
```

### 5. Update CLAUDE.md
Add the new agent to the Agent Registry table in CLAUDE.md.

### 6. Notify Dev
Inform Dev that a new agent was created, why, and what it will do.

## Common Agent Types to Consider
- **Content Writer**: Polish resume text, write compelling copy
- **DevOps Engineer**: CI/CD, deployment, hosting configuration
- **SEO Specialist**: Meta tags, Open Graph, structured data
- **Animator**: Complex animation sequences beyond sprite art
- **Localization Agent**: Multi-language support (Thai/English)
