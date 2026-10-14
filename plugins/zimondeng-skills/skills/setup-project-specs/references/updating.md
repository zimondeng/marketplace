# Updating

Update keeps the spec in step with the code that changed. It is not a second init.

If `docs/agent-spec/` is missing, say so and stop. Do not create it unless the user switches to init or asks for a full refresh.

## Scope

Use the range the user named. If they did not name one, use the current worktree diff (`git status`, `git diff`) when the project is a git checkout. If it is not, ask which paths to consider. Do not scan the whole repository because a range was omitted.

A full refresh is allowed only when the user asks for one in those words (or `全量`). Then follow the init path, and still preserve human regions and text outside the managed block.

## What to reopen

1. Search the spec for the changed paths and symbols.
2. Read those spec sections.
3. Re-collect evidence with the retrieval plan in [codegraph.md](codegraph.md). Read the new file from disk if the index marks it stale.
4. Decide, per rule: still true, outdated, or newly visible. A new pattern needs the same sample count as init. One edited file does not become a new project rule.
5. Show a diff of the spec files you intend to change, and say which rules you are leaving alone. Wait for confirmation.
6. Run `preserve-human` for every file that has a human region. Write only the confirmed files.
7. Run `apply-block` only when the managed block is missing or still points at the wrong index. It is safe to run when it already matches; it will not append a second block.
8. Run `check`.

Do not delete a rule only because one cited file moved. Update the path if the symbol still exists, or mark the rule outdated if the pattern is gone.

If a file has local edits you cannot merge without dropping a human region or an unmarked paragraph, show both versions and stop.

## Report

State which rules changed, why, the new evidence, which rules you removed or marked outdated, conflicts you still cannot settle, and the files you wrote.
