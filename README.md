# AI Engineering Kit v1

A portable set of project instructions for a two-agent workflow in Antigravity IDE:

- Claude implements features and fixes.
- Codex independently reviews the resulting workspace changes.
- Claude resolves valid findings.
- Codex performs a final verification.

## Files

- `CLAUDE.md` — implementation rules for Claude
- `CODEX.md` — independent review rules for Codex
- `WORKFLOW.md` — the shared development cycle and ready-to-use prompts
- `REVIEW.md` — the review checklist
- `README.md` — setup and usage

## Installation

Extract all five files into the root of a project, next to the repository's main files.

If the project already contains files with the same names, review and merge the instructions instead of overwriting project-specific rules.

## Quick start

In Claude, send:

> Follow CLAUDE.md and WORKFLOW.md. Implement this task with the smallest safe change: [TASK]. Run relevant checks and prepare the workspace for Codex review.

When Claude finishes, send Codex:

> Review the current workspace changes according to CODEX.md and REVIEW.md. Do not edit files. Report only actionable findings ordered by severity.

If Codex reports findings, send them back to Claude:

> Apply the valid findings below with focused changes. Do not modify unrelated code. Run relevant checks and summarize any finding you did not apply: [FINDINGS].

Then ask Codex:

> Re-review the current diff after the fixes. Confirm whether earlier findings are resolved and check for regressions. Do not edit files.

## Project-specific customization

These files provide general defaults. Add concrete project details where useful, such as:

- build, lint, and test commands;
- architecture boundaries;
- protected files and directories;
- supported platforms and runtime versions;
- security and compliance requirements;
- definition of done.

Project-specific instructions should override generic advice when they are explicit and safe.

## Important note

Instruction files improve consistency but do not guarantee defect-free code. Keep version control, automated tests, backups, human judgment, and production safeguards in the workflow.

