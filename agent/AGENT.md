# COLOR CRITTERS — Agent Instructions

Before coding:
1. Read `docs/00-PROJECT-OVERVIEW.md`.
2. Read the relevant GDD, TDD, architecture, gameplay, UI, asset and roadmap documents for the task.
3. Read this file and `agent/TASKS.md`.
4. Inspect the current repository and existing code before changing anything.

## Rules
- Work only on the currently assigned task.
- Do not implement future milestones unless explicitly requested.
- Do not silently alter agreed gameplay or architecture decisions.
- If documents conflict or a requirement is ambiguous, report it and ask for clarification when it materially affects implementation.
- Prefer small, modular, readable TypeScript code.
- Avoid unnecessary dependencies and premature abstraction.
- Do not introduce backend, multiplayer, combat or procedural generation into MVP.
- Keep pixel rendering sharp; avoid blur.
- Use placeholder assets if final assets are not available.
- Do not overwrite or delete existing project files without inspecting them and considering the impact.
- Do not claim a task is complete unless acceptance criteria have been tested or clearly identify what could not be tested.
- Include changed files, commands, test results, known issues and next recommended task in the final report.
- Stop after the task is completed.

## Source of truth
The docs directory is the design baseline. `agent/TASKS.md` specifies the current task. If implementation reveals a necessary change, explain it and propose an update rather than silently changing the design.
