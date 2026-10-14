# Plugin 模板

复制本目录后再改。本模板不注册到 Marketplace。

标准布局（官方默认扫描路径）：

```text
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── <skill-name>/
        └── SKILL.md
```

`skills/`、`SKILL.md` 放在插件根目录，不要放进 `.claude-plugin/`。一个 Plugin 可以包含多个 Skill，不必一个 Skill 一个 Plugin。仅在需要时再加 `references/`、`scripts/`、`assets/`。不要在这里添加 MCP、Hooks 或外部依赖。

## 1. 创建插件目录

在仓库根目录执行（将 `plugin-name` 换成实际名称）：

```powershell
Copy-Item -Recurse templates/plugin-template plugins/plugin-name
```

Linux / macOS：

```bash
cp -R templates/plugin-template plugins/plugin-name
```

## 2. 设置 Plugin 名称

编辑 `.claude-plugin/plugin.json` 的 `name`。使用 kebab-case：小写字母、数字、连字符，且以字母或数字开头。

`name` 必须与稍后写入 `marketplace.json` 的 `entry.name` 完全一致。组件命名空间用的是 manifest 里的 `name`，安装 id 用的是 entry 里的 `name`。两者不一致时，按 manifest 名安装会报插件不在该 Marketplace 中。

版本只写在 `plugin.json` 的 `version`（SemVer）。不要在 marketplace entry 里再写 `version`，否则官方校验会警告两者冲突，且运行时以 `plugin.json` 为准。

## 3. 添加 Skill

每个 Skill 是 `skills/<skill-name>/SKILL.md`。再加一个 Skill 就再加一个这样的目录，例如 `skills/review/SKILL.md`。

目录名使用 kebab-case。调用形式为 `/<plugin-name>:<skill-name>`。

## 4. 设置 Skill Frontmatter

`SKILL.md` 第一行必须是 `---`。常用字段：

| 字段 | 作用 |
| --- | --- |
| `name` | 命令名的最后一段。本仓库要求它与目录名相同 |
| `description` | 技能做什么、何时使用 |
| `disable-model-invocation` | `true` 表示只能手动用 `/name` 触发，Claude 不会自动加载 |

官方还接受 `argument-hint`、`allowed-tools`、`user-invocable` 等字段。不认识的字段会被忽略且不报错，所以不要自造字段名。

## 5. 注册到 marketplace.json

在 `.claude-plugin/marketplace.json` 的 `plugins` 数组追加一条，且只注册已经存在的目录：

```json
{
  "name": "plugin-name",
  "source": "./plugins/plugin-name",
  "description": "与 plugin.json 相同的简短说明"
}
```

`source` 从仓库根目录算起，以 `./` 开头，使用正斜杠，不能包含 `..`。

## 6. 本地校验

在仓库根目录：

```bash
node scripts/validate-marketplace.mjs
claude plugin validate --strict .
claude plugin validate --strict ./plugins/plugin-name
```

第一条是本仓库的静态约束（名称一致、路径在仓库内、Frontmatter、版本不重复）。后两条是官方校验。`--strict` 把警告当成失败。两条都要通过，静态脚本通过不能代替官方结果。

## 7. 发布新版本

1. 按 SemVer 修改该插件 `plugin.json` 的 `version`：PATCH 修复、MINOR 兼容新功能、MAJOR 不兼容变更。
2. 在 `CHANGELOG.md` 写下变更。
3. 再跑第 6 节的校验。
4. 提交并推送到 Marketplace 所在远程仓库的默认分支。

不要自动打 Git tag 或 GitHub Release。用户安装后需要更新才会拿到新版本，见仓库 `README.md`。本地用目录添加的 Marketplace 会直接读工作区文件，不看版本号。
