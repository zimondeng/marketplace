# Spec architecture

The root is `docs/agent-spec/`. Create a file only when it will contain a rule you can evidence. A small repository usually needs `index.md` plus `conventions.md`. Add `architecture.md` when there is a real layering or package boundary to describe. Add `testing.md` when a test tool and a repeated test shape exist.

Split `backend/` and `frontend/` when both sides exist and each side has more than one rule. Keep a single conventions file when a split would leave a heading alone. Never add Vue docs to a Python service, or a database doc to a project with no database client, migration, or datasource config. A hand-written repository interface is a data-access note, not a database guide.

For a monorepo (`layout.monorepo` is true), give each real package its own directory under `docs/agent-spec/<package>/` and keep the root `index.md` as the map across packages. Do not invent a package the manifests do not list.

## index.md

The index is a map. It names the spec files, which paths or tasks should read them, the priority order (Explicit, then Observed, then the code when they conflict), and the date. It does not restate the rules.

```markdown
<!-- agent-spec:generated -->
# Project engineering specifications

Read only the specifications that match the files you will change.

## Specification index

| Scope | Read |
|---|---|
| Naming and errors | conventions.md |

## Priority

Explicit rules win over Observed rules. If either disagrees with the code, stop and check which one is outdated. A proposals file, when one exists, is not binding. Do not link a file you did not create.
```

Drop rows you do not have files for. Add a row when a task type needs a different file (HTTP handlers, UI components, tests).

## Other files

Put `<!-- agent-spec:generated -->` on the first line of every file you create. That marker means a later update may refresh the file. Without it, the file is treated as someone else's and an update must show a diff and wait.

Wrap text the user wants preserved, in any spec file, with:

```markdown
<!-- agent-spec:human:start -->
...
<!-- agent-spec:human:end -->
```

Do not put binding rules inside that region. Updates copy it back from the existing file and will not take your rewrite.
