# 贡献指南

本仓库是 Claude Code Plugin Marketplace。Marketplace 只做索引；可安装单元是 Plugin；具体能力放在 Skill（以及将来真正需要的 Agent、Hook、MCP）里。

## 添加一个 Plugin

1. 复制 `templates/plugin-template/` 到 `plugins/<name>/`。步骤、Frontmatter 和注册格式见该目录的 `README.md`。
2. `plugin.json` 的 `name` 与 `marketplace.json` 里的 entry `name` 使用同一个 kebab-case 名称。
3. 版本只写在 `plugin.json`。不要在 marketplace entry 里写 `version`。
4. 一个 Plugin 可以放多个 Skill。不要为了每个 Skill 新建一个 Plugin。
5. 不要注册 `templates/` 下的目录，也不要注册还不存在的路径。
6. 插件之间不要引用彼此的内部文件，不要写本机绝对路径、用户名或密钥。

## 校验

在仓库根目录：

```bash
node scripts/validate-marketplace.mjs
claude plugin validate --strict .
claude plugin validate --strict ./plugins/<name>
```

`node` 脚本只报告仓库静态约束，输出 `static-check`。`claude plugin validate` 才是官方结果。官方 CLI 不在环境里时，不能把静态检查当成官方通过。

`--strict` 会把缺描述、缺版本、未知字段等警告变成失败。当前 CLI（2.1.294）支持该标志。

## 版本

遵循 SemVer，各 Plugin 独立编号。

- PATCH：兼容修复
- MINOR：向后兼容的新能力
- MAJOR：不兼容变更

发布时改 `plugin.json` 的 `version`，更新 `CHANGELOG.md`，重新校验。不要在未获授权时打 Git tag 或创建 GitHub Release。

完整发布说明见 `docs/development.md`。
