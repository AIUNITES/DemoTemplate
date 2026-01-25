' DemoTemplate Silent Server Launcher
' Double-click to start local server on port 8000 (no window)
' To stop: Open Task Manager and end "python.exe" process

Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

objShell.Run "cmd /c cd /d """ & strPath & """ && python -m http.server 8000 --bind 127.0.0.1", 0, False

MsgBox "Server started at http://localhost:8000" & vbCrLf & vbCrLf & "To stop: End python.exe in Task Manager", vbInformation, "DemoTemplate Server"
