#Requires AutoHotkey v2.0

; Only apply to MapTool.exe
GroupAdd("MapTool", "ahk_exe MapTool.exe")
#HotIf WinActive("ahk_group MapTool")

; Tab to disable/enable hotkeys
#SuspendExempt
+Tab::Suspend(-1)
#SuspendExempt False

; Others
p::Send("+{F9}")
i::Send("+{F10}")
j::Send("+{F11}")
k::Send("+{F12}")