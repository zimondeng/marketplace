# zimondeng-skills

个人维护的 Claude Code Plugin Marketplace。用一个仓库长期开发、注册和分发 Plugin，以及其中的 Skill、Agent、Hook、MCP。

Marketplace 只做插件索引。每个 Plugin 单独安装、单独标版本。当前只有一个用来打通安装链路的示例插件，不包含业务技能。

## 插件目录

| Plugin | Description | Version | Skills | 安装 |
| --- | --- | --- | --- | --- |
| hello-world | A minimal plugin for verifying zimondeng-skills marketplace installation. | 0.1.0 | hello | `claude plugin install hello-world@zimondeng-skills` |

版本来自 `plugins/hello-world/.claude-plugin/plugin.json`，不写在 `marketplace.json`。

## 安装 Marketplace

GitHub 远程。仓库是 `zimondeng/skills`，Marketplace 名是 `zimondeng-skills`，两者不一样：

```bash
claude plugin marketplace add zimondeng/skills
```

本地目录（在本仓库根目录执行；会写入 Claude Code 设置，请自行运行）：

```bash
claude plugin marketplace add .
```

## 安装插件

先装好 Marketplace，再执行：

```bash
claude plugin install hello-world@zimondeng-skills
```

安装 id 是 `<entry name>@<marketplace name>`。

## 使用 Skill

```text
/hello-world:hello
```

该技能只回复一行安装成功消息，不跑命令、不访问网络、不改文件。

## 更新 Marketplace

没有打开自动更新时，用官方命令拉取：

```bash
claude plugin marketplace update zimondeng-skills
claude plugin update hello-world@zimondeng-skills
```

会话内也可以执行 `/plugin marketplace update zimondeng-skills`。

自动更新要在 `/plugin` → Marketplaces 里对本 Marketplace 选择 Enable auto-update。`marketplace.json` 没有开关字段。已发布安装只在插件 `version` 变化后才会换新副本。

移除本地试验用的 Marketplace：

```bash
claude plugin marketplace remove zimondeng-skills
```

这会卸载它安装的插件。

## 开发指南

1. 复制 `templates/plugin-template/` 到 `plugins/<name>/`，按模板 `README.md` 改名、写 Skill、注册。
2. 在 `.claude-plugin/marketplace.json` 的 `plugins` 里追加 `{ "name", "source", "description" }`。`source` 形如 `./plugins/<name>`。
3. 校验：

```bash
node scripts/validate-marketplace.mjs
claude plugin validate --strict .
claude plugin validate --strict ./plugins/<name>
```

4. 发布时只递增该插件 `plugin.json` 的 `version`，并更新 `CHANGELOG.md`。细节见 `docs/development.md` 和 `CONTRIBUTING.md`。

## 目录结构

```text
.claude-plugin/marketplace.json
.github/workflows/validate-marketplace.yml
docs/development.md
plugins/hello-world/
  .claude-plugin/plugin.json
  skills/hello/SKILL.md
scripts/validate-marketplace.mjs
templates/plugin-template/
CHANGELOG.md
CONTRIBUTING.md
README.md
```

`templates/plugin-template/` 不在 Marketplace 注册表里。

## 设计原则

用 Monorepo 是为了让目录、校验和发布保持在一处：插件文件就在仓库内，entry 用相对路径。某个插件需要独立权限或独立发布节奏时，再拆成单独的 GitHub 仓库，并把 `source` 改成官方的 `github` 或 `git-subdir`。在那之前不要拆。

## 常见问题

**Marketplace 和 Plugin 有什么区别？**

Marketplace 是带 `.claude-plugin/marketplace.json` 的目录，列出可以安装哪些插件。Plugin 是被安装的那一份，里面才有技能和版本。

**Plugin 和 Skill 有什么区别？**

Plugin 是安装和版本单元。Skill 是插件里的一项能力，文件是 `skills/<name>/SKILL.md`。一个插件可以有多个 Skill。

**为什么安装后 Skill 名称带有插件前缀？**

官方把插件组件命名在 manifest `name` 下面。`hello-world` 里的 `hello` 因此是 `/hello-world:hello`，避免和别的插件里的同名技能冲突。

**新增 Skill 是否必须新增 Plugin？**

不必须。在现有插件的 `skills/` 下加一个目录即可。只有需要单独安装或单独版本时才新建 Plugin。

**如何排查 Plugin 安装失败？**

先在仓库根目录跑 `claude plugin validate --strict .` 和对应插件目录。相对路径里的 `..` 会在校验时报错；目录不存在则校验可能通过，但安装时报 `Source path does not exist`。entry `name` 和 `plugin.json` 的 `name` 不一致时，用 manifest 名去装会报不在该 Marketplace 中。

**如何更新插件版本？**

改该插件 `plugin.json` 的 `version` 并推送。用户执行 `claude plugin marketplace update zimondeng-skills`，再执行 `claude plugin update <plugin>@zimondeng-skills`。版本字符串不改，远程安装用户不会收到新文件。
