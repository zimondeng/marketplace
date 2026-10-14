# Agent integration

The spec is useless if the next session never hears about it. The managed block is a pointer. It is not a copy of the rules. Sessions should open `docs/agent-spec/index.md` and then only the rows that match the files they are changing.

## Which file

- If `CLAUDE.md` exists and `AGENTS.md` does not, edit `CLAUDE.md`.
- If `AGENTS.md` exists and `CLAUDE.md` does not, edit `AGENTS.md`.
- If both exist, do not write both. Recommend the file for the agent you are running in: `CLAUDE.md` for Claude Code, `AGENTS.md` for Codex. If you cannot tell, recommend the file that already holds engineering guidance, and if both do, recommend `CLAUDE.md` and leave `AGENTS.md` alone. Ask once.
- If neither exists, ask which one to create. Do not choose, and do not pass `--create` until they answer.

Do not edit `CLAUDE.local.md`, cursor rules, or an unrelated section. Do not touch a `CODEGRAPH` marker block or an `Agent skills` block. Those belong to other tools.

## Write the block

```bash
python "<skill-dir>/scripts/spec_tools.py" apply-block <instruction-file> --index docs/agent-spec/index.md
```

Add `--create` only after the user agreed to a new file. The command inserts `<!-- PROJECT-SPECS:START -->` ... `<!-- PROJECT-SPECS:END -->` or replaces that one region. It leaves the rest of the file alone. Running it again is a no-op when the region already matches, so init can run it without stacking copies.

If the command exits because the block is duplicated or unclosed, stop. Show the file. Do not try to merge it by hand.

## User-owned spec text

When an update rewrites a spec file that contains `agent-spec:human` regions:

```bash
python "<skill-dir>/scripts/spec_tools.py" preserve-human --old <current-file> --new <draft-file>
```

Write the command's stdout back only after the user has seen the diff. The command keeps the existing interior. A draft that changes or drops that interior does not win.

A spec file without `<!-- agent-spec:generated -->` is not yours to overwrite. Show the diff and wait, or leave it out of the update.
