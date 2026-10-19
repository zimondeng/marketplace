---
description: Check Windows notification hooks and remove legacy global duplicates while keeping the plugin hooks active.
allowed-tools: Read, Edit
---

# Set up Windows notifications

Configure the installed `windows-notify` plugin without adding duplicate hooks.

## Procedure

1. Inspect these files if they exist:
   - `~/.claude/settings.json`
   - `~/.claude/settings.local.json`
2. Check whether either file has `Stop` or `Notification` hook entries that invoke the legacy user script:
   - `powershell.exe`
   - `-Command`
   - `Join-Path $env:USERPROFILE '.claude\\notify.ps1'`
3. Remove only those legacy entries. Do not remove unrelated hooks, permissions, environment variables, plugins, or settings.
4. Preserve the surrounding JSON structure and all unrelated configuration.
5. If a hooks event becomes empty, remove only that empty event property.
6. If no legacy entries exist, make no changes and report that the plugin hooks are already the active notification hooks.
7. Report which files changed and confirm that the plugin's `Stop` and `Notification` hooks remain active.

This command is idempotent: running it again must not change anything after the legacy entries have been removed.
