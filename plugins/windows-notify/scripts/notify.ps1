# Claude Code Windows desktop notification
[Console]::InputEncoding = [Text.Encoding]::UTF8
$data = [Console]::In.ReadToEnd() | ConvertFrom-Json

$project = if ($data.cwd) {
    Split-Path $data.cwd -Leaf
} else {
    "Current Project"
}

if ($data.hook_event_name -eq "Stop") {
    $title = "Claude Code 任务已完成"
    $message = "项目：$project"
} else {
    $title = "Claude Code 需要处理"
    $message = if ($data.message) {
        $data.message
    } else {
        "项目 $project 需要你的注意"
    }
}

[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml(@"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$([Security.SecurityElement]::Escape($title))</text>
      <text>$([Security.SecurityElement]::Escape($message))</text>
    </binding>
  </visual>
</toast>
"@)

$appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
$toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
