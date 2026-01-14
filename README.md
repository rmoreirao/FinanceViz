# FinanceViz

Interactive stock charting application: https://rmoreirao.github.io/FinanceViz/

## Tech Stack

React 18 • TypeScript • Vite • TailwindCSS • Lightweight Charts

## Quick Start

```bash
cd src/frontend
npm install
npm run dev
```

## Features

- 7 chart types (Candlestick, Line, Bar, Area, Hollow, Heikin-Ashi, Baseline)
- 15+ technical indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.)
- Multiple time ranges (1D to MAX)
- Symbol search with autocomplete
- Responsive design (desktop, tablet, mobile)
- Dark/light theme support

## Development Workflow

This project uses **Custom VS Code Agents** to orchestrate the development lifecycle. Each agent specializes in a specific role and hands off to the next agent in the workflow.

### Agent Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FinanceViz Development Flow                          │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌───────────────────┐         ┌──────────────────┐
    │              │         │                   │         │                  │
    │   Product    │────────▶│    Technical      │────────▶│    Frontend      │
    │    Owner     │         │    Specialist     │         │    Developer     │
    │              │         │                   │         │                  │
    └──────────────┘         └───────────────────┘         └──────────────────┘
           │                                                        │
           │                                                        ▼
           │                 ┌───────────────────┐         ┌──────────────────┐
           │                 │                   │         │                  │
           └◀────────────────│    Technical      │◀────────│    Frontend      │
                             │     Writer        │         │     Tester       │
                             │                   │         │                  │
                             └───────────────────┘         └──────────────────┘
```

### Agent Responsibilities

| Agent | Role | Output |
|-------|------|--------|
| **ProductOwner** | Gathers requirements and creates feature specifications | `/docs/specs/{id}_{name}/REQUIREMENTS.md` |
| **TechnicalSpecialist** | Breaks down features into implementable tasks with testing criteria | `/docs/specs/{feature}/TASKS.md` |
| **FrontendDeveloper** | Implements tasks, validates builds, verifies UI with Playwright | Code changes + commits |
| **FrontendTester** | Creates comprehensive Playwright E2E tests | `e2e/{feature}/*.spec.ts` |
| **TechnicalWriter** | Updates project documentation to reflect changes | README.md, SPECIFICATIONS.md |

### Using the Agents

1. Open VS Code Chat (`Ctrl+Shift+I`)
2. Select an agent from the agents dropdown (e.g., `@ProductOwner`)
3. Describe your feature request or task
4. Follow the handoff buttons to transition between agents

Each agent provides a **handoff button** after completing their work, allowing seamless transition to the next step in the workflow.