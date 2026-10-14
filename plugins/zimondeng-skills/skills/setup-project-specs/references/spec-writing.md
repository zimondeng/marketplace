# Spec writing

Write rules the next change can follow. Do not write a language tutorial.

Use the language of the project's existing engineering docs. If those docs are mixed or missing, use the language the user is using.

## Shape

```markdown
<!-- agent-spec:generated -->
# <topic this file actually covers>

## Scope

<paths this file applies to>

## Rules

### Rule 1: <what the code does>

Status: Explicit or Observed
Confidence: Medium for two samples, High only when the extraction count says High

Description:
<one behavior, tied to the evidence below>

Evidence:
- `relative/path/that/contains-this-claim` "verbatim sentence or setting from that file"

Preferred pattern:
<what the next change should do>

Exceptions:
<live counterexample, or "none found">

Verification:
<command the repo already has, or "not specified">

## Observations

One sample, or one mechanism, lives here. It does not get a Rule heading.
```

This is a shape, not a sample. Copying it into a repository fails the checker, because those paths do not exist. Write the rule from the files you opened.

Every path in Evidence and in a navigation link must exist, and an Evidence path must be a file you opened and found this claim in. An Explicit bullet quotes the sentence or setting with straight double quotes; Observed bullets are paths only. Quote each non-heading line from `CLAUDE.md`, `CLAUDE.local.md`, and `AGENTS.md` on an Explicit rule. Leave a `CONTRIBUTING.md` line that disagrees with the code under Observations, without a Rule heading. An Observed rule needs two evidence paths. One path is an Observation, not Confidence Medium. A build file shows the tool in use. It does not stand in for a written rule that lives in a different file. Keep snippets to a few lines. Do not paste a whole class. Do not include an anti-pattern you did not see. Do not include a verification command the repo has no tool for.

Status is `Explicit` or `Observed` in the main tree. `Proposed` belongs in `proposals.md`. `Conflict` belongs in the summary, and in `conflicts.md` only after the user agrees.

## Banned filler

Do not leave `TBD`, `TODO: fill`, `{{...}}`, `待补充`, `lorem ipsum`, or `<placeholder>`. Do not describe a file you did not open. Do not cite `node_modules` or a generated client as the preferred pattern.

Put evidence paths in bullets or links, not only inside a fenced code block. The checker ignores fences on purpose, so a path that exists only inside a fence is not checked.

## Before you stop

Run:

```bash
python "<skill-dir>/scripts/spec_tools.py" check <project-root>
```

Confirmed findings are yours to fix. A potential `unmarked-spec` on a file you just wrote means you forgot the generated marker.
