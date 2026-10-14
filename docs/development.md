# 开发与发布

## 分层

Marketplace → Plugin → Skill / Agent / Hook / MCP

- **Marketplace**（`.claude-plugin/marketplace.json`）只负责发现、注册和分发。必填字段是 `name`、`owner`、`plugins`。本仓库同时写了 `description`。
- **Plugin** 是独立安装和独立版本的单元。元数据在 `<plugin>/.claude-plugin/plugin.json`。`name` 是唯一官方必填字段；本仓库同时要求 `version`、`description`、`author.name`，与 `claude plugin validate --strict` 的警告项一致。
- **Skill** 位于 `<plugin>/skills/<name>/SKILL.md`。插件技能的命令是 `/<plugin-name>:<skill-name>`。
- **Agent、Hook、MCP** 只有在某个插件真正需要时，才按官方默认路径添加（`agents/`、`hooks/hooks.json`、`.mcp.json`）。不要预先放空壳。Hook 不得默认执行危险命令。

相对路径 `source` 从仓库根目录解析，不是从 `.claude-plugin/` 解析。

## 为什么用 Monorepo

插件都在这个仓库里时，一条 Marketplace 源、一套 CI 就够了，`source` 用 `./plugins/<name>`。

一个插件需要单独的访问控制、发布节奏或仓库权限时，再把它拆到独立 Git 仓库。拆出后把对应 entry 的 `source` 改成官方对象形式（`github` 或 `git-subdir`），不要继续写已经搬走的相对路径。本仓库的静态脚本目前只接受 `./` 相对路径；改成远程 source 时要同时改 `scripts/validate-marketplace.mjs`，并在 CI 里区分「形状合法」和「远程内容已拉取」。

## 发布流程

1. 在该插件的 `plugin.json` 递增 `version`。不要在 `marketplace.json` 重复写版本。
2. 更新 `CHANGELOG.md`。
3. 运行 `CONTRIBUTING.md` 里的静态检查和 `claude plugin validate --strict`。
4. 推送到 Marketplace 远程的默认分支。

用户侧更新（官方命令）：

```bash
claude plugin marketplace update zimondeng-skills
claude plugin update hello-world@zimondeng-skills
```

会话内刷新目录是 `/plugin marketplace update zimondeng-skills`。

自动更新不是 `marketplace.json` 的字段。用户在 `/plugin` 的 Marketplaces 里对这个 Marketplace 打开 Enable auto-update 之后，才会在后台更新。版本字符串不变时，已安装用户不会拿到新文件；本地目录方式添加的 Marketplace 除外，它每次会话直接读当前文件。

不在此流程中自动创建 Git tag 或 GitHub Release。
