# zimondeng-marketplace

个人维护的 Claude Code Plugin Marketplace。用一个仓库长期开发、注册和分发 Plugin，以及其中的 Skill、Agent、Hook、MCP。

Marketplace 只做插件索引。每个 Plugin 单独安装、单独标版本。

## 插件目录

| Plugin | Description | Version | Skills | 安装 |
| --- | --- | --- | --- | --- |
| zimondeng-skills | Initialize, update, and audit project-specific engineering conventions extracted from the repository's real code and docs. | 0.1.0 | setup-project-specs | `claude plugin install zimondeng-skills@zimondeng-marketplace` |
| windows-notify | Send Windows desktop notifications when Claude Code finishes or needs attention. | 0.2.1 | claude-notify | `claude plugin install windows-notify@zimondeng-marketplace` |

版本来自各插件的 `plugin.json`，不写在 `marketplace.json`。调用 `claude-notify` 用 `/windows-notify:claude-notify`。

Windows 通知插件安装后会自动启用 `Stop` 和 `Notification` hooks。若之前配置过全局通知 hook，可执行 `/windows-notify:setup` 清理旧的重复配置。

## 使用教程

### 1. 添加整个 Marketplace

Marketplace 是插件索引。先添加 Marketplace，之后才能按插件名称安装其中的插件。

GitHub 远程仓库：

```bash
claude plugin marketplace add zimondeng/marketplace
```

这里的仓库名是 `marketsplace`（拼写如此），Marketplace 名称是 `zimondeng-marketplace`。

如果要使用本地工作区版本，在仓库根目录执行：

```bash
claude plugin marketplace add .
```

查看已经添加的 Marketplace：

```bash
claude plugin marketplace list
```

也可以在 Claude Code 中执行：

```text
/plugin
```

然后进入 Marketplaces 查看状态。

### 2. 安装当前仓库中的插件

先添加 `zimondeng-marketplace`，再按需安装插件。当前仓库提供以下插件：

#### zimondeng-skills

安装：

```bash
claude plugin install zimondeng-skills@zimondeng-marketplace
```

安装后使用：

```text
/zimondeng-skills:setup-project-specs
```

该 Skill 用于初始化、更新和审计项目工程规范，只写入 `docs/agent-spec/**` 及约定的说明文件，不修改业务代码。

#### windows-notify

安装：

```bash
claude plugin install windows-notify@zimondeng-marketplace
```

安装后，`Stop` 和 `Notification` hooks 会自动生效。执行以下命令可以清理旧的全局通知 hook，避免重复通知：

```text
/windows-notify:setup
```

该插件还提供说明 Skill：

```text
/windows-notify:claude-notify
```

### 3. 更新 Marketplace 和插件

远程仓库有更新时，先更新 Marketplace 索引：

```bash
claude plugin marketplace update zimondeng-marketplace
```

再更新已经安装的插件：

```bash
claude plugin update zimondeng-skills@zimondeng-marketplace
claude plugin update windows-notify@zimondeng-marketplace
```

如果只更新其中一个插件，只执行对应的命令即可。插件只有在 `plugin.json` 的 `version` 发生变化后，更新命令才会获取新的插件版本。

### 4. 启用自动更新

在 Claude Code 中执行：

```text
/plugin
```

进入 Marketplaces，为 `zimondeng-marketplace` 选择 **Enable auto-update**。自动更新开关由 Claude Code 管理，不写在 `marketplace.json` 中。

### 5. 查看、禁用和移除

查看已安装插件：

```bash
claude plugin list
```

在 Claude Code 中打开 `/plugin`，可以对单个插件执行启用、禁用或卸载操作。

移除整个 Marketplace：

```bash
claude plugin marketplace remove zimondeng-marketplace
```

这会同时移除通过该 Marketplace 安装的插件。

### 6. 本地开发和校验

在仓库根目录执行：

```bash
node scripts/validate-marketplace.mjs
claude plugin validate --strict .
claude plugin validate --strict ./plugins/zimondeng-skills
claude plugin validate --strict ./plugins/windows-notify
```

本地 Marketplace 添加后，工作区文件会直接生效；远程安装用户则需要先更新 Marketplace，再更新具体插件。

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
plugins/zimondeng-skills/
  .claude-plugin/plugin.json
  skills/setup-project-specs/SKILL.md
plugins/windows-notify/
  .claude-plugin/plugin.json
  hooks/hooks.json
  commands/setup.md
  scripts/notify.ps1
  skills/claude-notify/SKILL.md
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

官方把插件组件命名在 manifest `name` 下面。`zimondeng-skills` 里的 `setup-project-specs` 因此是 `/zimondeng-skills:setup-project-specs`，避免和别的插件里的同名技能冲突。

**新增 Skill 是否必须新增 Plugin？**

不必须。在现有插件的 `skills/` 下加一个目录即可。只有需要单独安装或单独版本时才新建 Plugin。

**如何排查 Plugin 安装失败？**

先在仓库根目录跑 `claude plugin validate --strict .` 和对应插件目录。相对路径里的 `..` 会在校验时报错；目录不存在则校验可能通过，但安装时报 `Source path does not exist`。entry `name` 和 `plugin.json` 的 `name` 不一致时，用 manifest 名去装会报不在该 Marketplace 中。

**如何更新插件版本？**

改该插件 `plugin.json` 的 `version` 并推送。用户执行 `claude plugin marketplace update zimondeng-marketplace`，再执行 `claude plugin update <plugin>@zimondeng-marketplace`。版本字符串不改，远程安装用户不会收到新文件。
