' Stop DemoTemplate Server
' Kills all Python HTTP server processes

Set objShell = CreateObject("WScript.Shell")
objShell.Run "taskkill /F /IM python.exe", 0, True
MsgBox "Server stopped.", vbInformation, "DemoTemplate Server"
