# CodeGraph

CodeGraph locates source and call structure. It does not decide which pattern is a convention, and this skill does not reimplement it.

## What is actually available

The connected MCP server exposes `codegraph_explore` by default. `codegraph_node`, `codegraph_search`, `codegraph_callers`, `codegraph_callees`, `codegraph_impact`, `codegraph_files`, and `codegraph_status` stay hidden unless `CODEGRAPH_MCP_TOOLS` lists them. Do not call a tool that is not in the session.

The CLI equivalents are `codegraph explore`, `query`, `node`, `files`, `callers`, `callees`, `impact`, and `status`. `codegraph init` creates `.codegraph/` and builds the graph. `codegraph index` rebuilds it. `codegraph sync` writes an incremental update. Do not run those three, and do not install or upgrade CodeGraph.

Telemetry is on by default until someone turns it off. A local `.codegraph/` directory does not mean no usage data leaves the machine. Before the first CLI invocation, tell the user that `codegraph telemetry` shows the switch and `codegraph telemetry off` disables it. Do not change the switch yourself. Prefer an MCP tool that is already connected: that session already chose to run the server. `discover` only checks whether `codegraph` is on `PATH`. It does not launch it.

## Choose a backend

```bash
python "<skill-dir>/scripts/spec_tools.py" plan --mcp <yes|no|unknown> --cli <yes|no|unknown> --indexed <yes|no|unknown>
```

Set `mcp` to yes only when `codegraph_explore` is in the tool list. Set `cli` from `discover`'s `codegraph_cli_on_path`. Set `indexed` to no when `.codegraph/` is absent. When the directory exists but you have not checked it, set `indexed` to unknown.

`plan` returns one action. It does not try the next backend for you. `indexed` of `no` forces `native` even when MCP is connected, because an empty index is not a search result. If the chosen tool then says the project is not indexed, or the result is empty, switch to native search yourself. A miss is not proof the file is absent. When `offer_init` is true, tell the user they can run `codegraph init` themselves. Do not run it.

Native search is Glob, Grep, and Read. Use it for markdown, YAML, JSON, and any language the index does not cover. Supported source extensions include Java, Kotlin, JavaScript, TypeScript, Vue, Python, Go, Rust, and the other languages listed in CodeGraph's language reference. Unsupported files are not missing files.

## How to search

Go from the module, to a few representative symbols, to their source, and only then to callers when a rule depends on a call path. One `codegraph_explore` (or `codegraph explore`) is usually enough. The returned source is already the file contents. Do not Read it again.

Stop trusting a result when the response contains any of these:

- `may be stale`
- `CodeGraph auto-sync is DISABLED`
- `CodeGraph auto-sync is RECOVERING`

Read those paths from disk and cite the disk version. The rest of that response can still be used. Do not run `codegraph sync` to clear the banner.

An empty result, an ambiguous name, or a broken call edge is uncertainty. Say so. Look at the file with the native tools before you conclude the symbol does not exist. Several overload bodies in one response stay several bodies. Do not merge them into one rule.

In a monorepo, pass the project path that actually contains `.codegraph/`. An index at the workspace root does not prove each package has one.

## Audit

Audit may read through an MCP tool that is already connected. It must not start the CLI indexer, and it must not run `init`, `index`, or `sync`.
