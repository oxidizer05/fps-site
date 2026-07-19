# Code Review Checklist

Use this checklist proportionally to the change. Not every item applies to every project.

## 1. Requirements and scope

- Does the change implement the requested behavior?
- Are important acceptance criteria missing or misunderstood?
- Does the diff include unrelated edits, renames, formatting, or refactoring?
- Are assumptions documented where requirements were ambiguous?

## 2. Correctness

- Are branches, conditions, calculations, and state transitions correct?
- Are empty, null, maximum, minimum, duplicate, and malformed inputs handled?
- Are errors propagated or surfaced appropriately?
- Can partial success leave inconsistent state?
- Are dates, time zones, locales, encodings, and numeric precision correct?
- Are operations idempotent where retries are possible?

## 3. Security and privacy

- Are authentication and authorization checked at the correct boundary?
- Can untrusted input reach SQL, shell commands, HTML, templates, paths, URLs, or prompts unsafely?
- Are file paths normalized and constrained to allowed locations?
- Are secrets, tokens, personal data, or internal errors logged or returned?
- Are uploads, redirects, deserialization, and external requests validated?
- Do permissions follow least privilege?

## 4. Concurrency and reliability

- Can concurrent calls race or overwrite state?
- Are transactions and locks used correctly?
- Are retries bounded and safe?
- Are timeouts, cancellation, and cleanup handled?
- Can network, disk, service, or process failures leave resources open?
- Are background jobs observable and recoverable?

## 5. Compatibility and data

- Does the change preserve public API and serialized formats?
- Are schema and migration changes safe for existing data?
- Can old and new versions coexist during deployment?
- Are defaults and configuration changes backward compatible?
- Are dependency and lockfile changes intentional?

## 6. Performance

- Is work bounded for realistic input sizes?
- Are there unnecessary nested loops, repeated parsing, or duplicated requests?
- Are database queries indexed and free of obvious N+1 patterns?
- Is blocking work performed on latency-sensitive or async paths?
- Can caches, collections, queues, or listeners grow without limits?
- Are large files or responses streamed where appropriate?

## 7. Architecture and maintainability

- Does the change follow existing project structure and conventions?
- Are responsibilities clear and dependencies directed correctly?
- Is duplicated logic likely to drift?
- Are abstractions justified by current requirements?
- Are names and control flow understandable without excessive explanation?
- Is dead code or obsolete configuration left behind?

## 8. Tests

- Do tests cover the changed success path and meaningful failure paths?
- Would the tests fail if the implementation defect were reintroduced?
- Are boundary cases and security-sensitive paths covered?
- Are tests deterministic and isolated from order, time, network, and shared state?
- Are mocks faithful enough to detect integration problems?
- Were relevant lint, type, build, unit, integration, and end-to-end checks run?

## Review discipline

- Inspect the diff before reading the author's summary as proof.
- Validate findings against surrounding code and project behavior.
- Report only concrete, actionable issues caused or exposed by the change.
- State verification gaps instead of guessing.
- Prefer the smallest safe correction.

