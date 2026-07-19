# Claude → Codex Development Workflow

## Roles

- **Claude — Implementer:** understands the task, makes the smallest safe change, and runs relevant checks.
- **Codex — Reviewer:** independently inspects the diff, reports concrete defects, and does not edit during review.
- **User — Decision owner:** defines requirements and approves material scope, architecture, dependency, or deployment changes.

## Standard cycle

1. **Task** — The user gives Claude the requested outcome and constraints.
2. **Inspect** — Claude reads relevant code, project instructions, and tests.
3. **Implement** — Claude makes focused changes.
4. **Verify** — Claude runs relevant tests and checks the diff.
5. **Review** — Codex reviews current workspace changes using `CODEX.md` and `REVIEW.md`.
6. **Resolve** — Claude fixes valid HIGH and MEDIUM findings. LOW findings are fixed or briefly explained.
7. **Re-review** — Codex verifies the revised diff and checks for regressions introduced by fixes.
8. **Final verification** — Claude runs the relevant checks again and reports results.

## Prompts

### Start implementation with Claude

> Follow CLAUDE.md and WORKFLOW.md. Implement this task with the smallest safe change: [TASK]. Run relevant checks and prepare the workspace for Codex review.

### Start review with Codex

> Review the current workspace changes according to CODEX.md and REVIEW.md. Do not edit files. Report only actionable findings ordered by severity.

### Return findings to Claude

> Apply the valid findings below with focused changes. Do not modify unrelated code. Run relevant checks and summarize any finding you did not apply: [FINDINGS].

### Final verification with Codex

> Re-review the current diff after the fixes. Confirm whether earlier findings are resolved and check for regressions. Do not edit files.

## Stop conditions

Pause and ask the user before proceeding when the task requires:

- destructive or irreversible operations;
- a material architecture or API decision not present in the request;
- adding or replacing dependencies;
- changing deployment, infrastructure, CI/CD, secrets, or production data;
- choosing among alternatives with materially different product behavior.

## Completion criteria

The task is complete only when:

- the requested behavior is implemented;
- relevant tests and checks pass, or limitations are clearly disclosed;
- no unresolved HIGH findings remain;
- MEDIUM findings are resolved or explicitly accepted by the user;
- the final diff contains no accidental unrelated changes;
- the final report states what changed, how it was verified, and any remaining risks.

