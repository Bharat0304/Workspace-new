# WorkSpace — Git Workflow

**Last Updated:** 2026-06-20

---

## 1. Branch Strategy

WorkSpace uses **GitHub Flow** — a simplified branching model suited for a small team.

```
main                    ← Production-ready code only. Protected.
  └── feature/[name]   ← All development work
  └── fix/[name]        ← Bug fixes
  └── docs/[name]       ← Documentation-only changes
  └── refactor/[name]   ← Refactors without behavior change
  └── dev/[name]        ← Developer tooling / infrastructure
```

### Rules
- Never commit directly to `main`
- Each branch addresses a single ticket or concern
- Branches are short-lived — merge and delete

---

## 2. Branch Naming Convention

```
[type]/[ticket-id]-[short-description]

Examples:
feature/AUTH-001-google-auth-modal
feature/ONB-001-4-step-onboarding
fix/DASH-001-face-rotation-reversal
docs/update-architecture-decisions
dev/DEV-003-developer-panel
refactor/shared-css-modular-split
```

---

## 3. Commit Message Convention

WorkSpace follows the **Conventional Commits** specification.

```
[type]([scope]): [short description]

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | CSS, formatting — no logic change |
| `refactor` | Code restructure — no behavior change |
| `test` | Adding or updating tests |
| `chore` | Build tools, config, dependencies |
| `dev` | Developer tooling only |

### Scopes
```
auth, onboarding, dashboard, development, shared, config, docs
```

### Examples
```
feat(auth): add Google OAuth mock with realistic delay
fix(onboarding): correct profile localStorage key after reset
docs(architecture): add ADR-005 environment detection
style(auth): align Google button icon to center
refactor(shared): extract reveal animation to utility
dev(development): add storage reset system
chore(config): add feature flags with per-env defaults
```

---

## 4. Pull Request Workflow

### Before Opening a PR
- [ ] Branch is up-to-date with `main`
- [ ] All console errors resolved
- [ ] Module README updated (if new files added)
- [ ] FeatureTickets.md updated (if new feature)
- [ ] ChangeLog.md updated
- [ ] ArchitectureDecisions.md updated (if ADR warrants)

### PR Description Template
```
## Summary
Brief description of what changed and why.

## Ticket
[TICKET-ID] — Link to FeatureTickets.md entry

## Changes
- List of specific changes

## Testing Done
- How did you test this? (manual steps, screenshots)

## Notes for Reviewer
Any gotchas, context, or things to pay attention to.
```

### Review Criteria
- Code follows Coding Guidelines
- No direct localStorage.clear() calls
- No `console.log` left in production code paths
- No hardcoded colors or magic numbers
- Imports follow the import rules (Component → Service → Mock)

---

## 5. Release Process

1. Bump version in `ChangeLog.md`
2. Merge final feature branches to `main`
3. Tag: `git tag v0.x.0 -m "Release v0.x.0: [short description]"`
4. Push tag: `git push origin v0.x.0`
5. Update `Roadmap.md` — mark milestone complete
