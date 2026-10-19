---
name: claude-notify
description: Explain the Windows notifications provided automatically by the windows-notify plugin.
disable-model-invocation: true
---

# Claude Code Notifications

This plugin automatically sends a Windows desktop notification when Claude Code:

- finishes a task (`Stop`)
- needs attention for a permission request or idle prompt (`Notification`)

The notifications are provided by the plugin hooks and do not require manually invoking this skill.
