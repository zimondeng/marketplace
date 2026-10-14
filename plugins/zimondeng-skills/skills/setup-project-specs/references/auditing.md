# Auditing

Audit is read-only. Do not create, edit, or delete spec files, instruction files, source files, or agent config. Do not run `apply-block`. Do not run `codegraph init`, `index`, or `sync`. An MCP `codegraph_explore` that is already connected is allowed, because reading it does not reconfigure the tool. A cache that tool updates on its own is not a license to rebuild the index.

If `docs/agent-spec/` is missing, the report is that single confirmed gap. Stop. Do not create the tree.

## Checks

Run:

```bash
python "<skill-dir>/scripts/spec_tools.py" check <project-root>
```

`check` covers empty files, placeholder text, broken relative links, evidence paths that do not exist or escape the project, an Observed rule with one evidence path, an Explicit quote that is missing, not in the cited file, or unrelated to the description, and a non-heading line in `CLAUDE.md`, `CLAUDE.local.md`, or `AGENTS.md` that no Explicit rule quotes. It does not understand whether a rule is true. `CONTRIBUTING.md` is not part of that quote check.

You still read the spec and check:

- **Structure.** `index.md` is a map. Every row points at a file that exists. No spec file is a stub.
- **Evidence.** Cited symbols still look like the rule. If search misses a symbol, label that insufficient evidence, not a confirmed defect. A Rule heading whose evidence is one mechanism (one class, or a class plus the type it uses, or one entrypoint) is a confirmed issue: that note belongs under Observations. Two samples marked High are a confirmed issue. High requires three samples or an explicit checker.
- **Consistency.** Two spec files disagree, or an Explicit rule disagrees with the code you opened.
- **Coverage.** A top-level package from `discover` has no spec row, and the code there has a repeated pattern. Say the gap. Do not fill it during an audit.
- **Integration.** The managed block exists in the chosen instruction file, appears once, and names `docs/agent-spec/index.md`. A second copy is a confirmed issue. A missing block is a confirmed issue only when a spec tree exists and no instruction file points at it.

## Report labels

- **Confirmed issue.** `check` reported it, or you opened the file and the claim is false.
- **Potential issue.** Something looks wrong and you did not prove it. Unmarked spec files are potential: someone may maintain them by hand.
- **Insufficient evidence.** You could not find the symbol. The index may be stale or the query may be ambiguous. Say what you tried.

Do not write the report into the repository unless the user asks for a file. The default is the conversation.
