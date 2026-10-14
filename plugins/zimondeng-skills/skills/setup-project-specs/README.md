# setup-project-specs

从仓库里已经存在的文档和源码提取工程约定，写成按需加载的 Markdown 规范。它记录仓库实际怎么写，不记录框架通常怎么写。

规范目录是 `docs/agent-spec/`。脚本只做发现、托管块合并和文件检查。约定是否成立由运行该技能的代理判断。

不修改业务源码，不安装工具，不初始化代码索引，不提交，不推送。

## 安装

把整个 `setup-project-specs` 目录拷到技能目录，目录名保持不变。不要只拷 `SKILL.md`。

Claude Code，当前项目：

```text
<项目>/.claude/skills/setup-project-specs/
```

Claude Code，当前用户：

```text
~/.claude/skills/setup-project-specs/
```

然后在目标项目里执行 `/setup-project-specs`，后面跟 `init`、`update` 或 `audit`。`disable-model-invocation: true`，不会自动触发。

Codex 使用同一份 `SKILL.md`。`agents/openai.yaml` 里 `allow_implicit_invocation: false`。放到当前项目的 `.agents/skills/setup-project-specs/`，或用户目录 `~/.agents/skills/setup-project-specs/`。

## 用法

在要写规范的项目根目录里调用，不要对技能仓库自身调用。

`init`（或「初始化」）阅读现有文档和源码，给出文件计划，确认后写入 `docs/agent-spec/`，并在已有的 `CLAUDE.md` 或 `AGENTS.md` 里插入一块指针。两边都有时只改一个，先问。两边都没有时先问要创建哪一个。

`update`（或「增量」）只重开本次 diff 影响到的规范。不整树覆盖。人工区域（`agent-spec:human`）以原文件为准。没有规范目录就停止，不偷偷做一次 init。全量刷新只有用户明确说「全量」或 full refresh 才做。

`audit`（或「审计」）只读。报告分成已确认、可疑、证据不足。不改规范、不改指令文件、不改源码，也不重建索引。

确认之前不写文件。调用消息里已经同意推荐方案时，不再追问。

## CodeGraph（可选）

没有 CodeGraph 时用 Glob、Grep、Read，技能可以完成。有的话，默认只使用已经连接的 `codegraph_explore`。不要运行 `codegraph init`、`index`、`sync`，也不要安装。

`codegraph` 在 PATH 上、但项目没有 `.codegraph/` 时，脚本的计划是本地搜索，并建议用户自己决定要不要 init。索引未命中不代表文件不存在。

CLI 的遥测默认开启。本地有 `.codegraph/` 不等于没有数据离开本机。第一次调用 CLI 之前告诉用户：`codegraph telemetry` 查看，`codegraph telemetry off` 关闭。技能本身不改这个开关。优先用已经连上的 MCP。

返回里若出现 `may be stale`、`CodeGraph auto-sync is DISABLED` 或 `CodeGraph auto-sync is RECOVERING`，被点名的文件改从磁盘读，不要把图里的旧文本当证据。

## 测试

在技能目录执行：

```text
python tests/test_spec_tools.py
```

2026-10-14：21 项通过。覆盖发现（含密钥文件名但不读内容、`packages` 目录不是 monorepo、单个 Gradle `include` 不是 monorepo）、检索计划（MCP、CLI、未索引、未安装，且计划里永远没有 install/init/index/sync）、托管块幂等与 CRLF、人工区域不被草稿改写、只读检查、两个夹具里重复代码形态还在。

## 夹具运行

2026-10-14，检索计划固定为 native（没有 CodeGraph）。副本在 `setup-project-specs-workspace/fixture-init/`，不在 `tests/fixtures/` 里。

Init：Java/Vue 写入 `index.md`、`backend.md`、`frontend.md`、`testing.md`，并在 `CLAUDE.md` 插入一块指针。FastAPI 写入 `index.md`、`architecture.md`、`conventions.md`、`testing.md`，并在 `AGENTS.md` 插入一块指针。两边 `check` 都是退出码 0、`issues` 为空。业务源码与 `tests/fixtures` 的哈希一致。规范里没有密钥、没有 `System.exit`、没有把 `node_modules` 当证据。FastAPI 规范没有 Vue 文件，也没有数据库文档。`CONTRIBUTING.md` 和控制器代码的冲突写在索引的优先级里，没有写成 `conflicts.md`。

已有规范上再执行 `apply-block`：`changed` 为 false，文件时间戳不变，指针仍是一块。

增量更新：只改了 FastAPI 副本的 `app/routers/items.py` 404 文案。规则仍然成立，四份规范都没改。人工句子 `Do not rename the app package.` 还在。`check` 退出码 0。

只读审计：Java/Vue 副本在审计后业务文件哈希不变，没有新增报告文件。`check` 退出码 0。审计确认了三件事：`frontend.md` 规则 2 只有两个样本却标了 High；`backend.md` 规则 3 把一个异常处理器加上它捕获的异常类型写成了规则；`CONTRIBUTING.md` 与三个现任控制器冲突，且没有被收成代码那边的假规则。审计没有改这些文件。

这次 init 没有把 `CLAUDE.md` 的许可证头、Maven 约定和 `.editorconfig` 的 Java 缩进写成 Explicit 规则。`extraction.md` 已补上：文档和编辑器配置即使现有代码没跟上，也仍然是 Explicit。同一处也写明两个样本是 Medium，一个机制不能当规则。这次补丁没有再跑一遍 init。

## 消融

未测量。不要引用任何速度或 token 数字。

可复现步骤：把同一个夹具复制两份。A 组把检索计划固定为 native（不调用 CodeGraph）。B 组使用已经建好的索引，只读 `codegraph_explore` 或 CLI 的只读子命令。两边都跑 init。记录墙上时间、工具调用次数、宿主给出的 token、`spec_tools.py check` 是否通过、证据路径是否真实、重复模式有没有被漏掉。首次建索引的成本单独记，不和复用索引混在一起。更快不等于规范更好。

## 已知限制

- `discover` 只看根目录、下一层，以及 `apps`、`packages`、`services` 这类容器目录里的再下一层。更深的清单要另外点名。
- 脚本不判断一条规则对不对，只检查空文件、占位符、断开的路径和重复的托管块。
- 一条样本只算观察，不算项目级规则。小仓库的规范会短。
- 不创建空的 `database.md`、`proposals.md`、`conflicts.md`。没有数据库、没有建议、没有需要记录的冲突，这些文件就不存在。
- 不把 `node_modules`、`target`、`generated` 里的文件当成约定来源。
- Java 夹具的测试引用了 JUnit，但 `pom.xml` 没有把测试依赖写全。这是夹具，不是要修的项目。
- 本仓库没有安装 CodeGraph，检索计划的分支用单元测试覆盖，没有对真实索引做查询。
