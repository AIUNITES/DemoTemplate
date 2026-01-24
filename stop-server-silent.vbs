' Stop DemoTemplate Server Silently
' Double-click this file to stop the server

Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell -WindowStyle Hidden -Command ""Get-Process pythonw -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like '*silent-server*'} | Stop-Process -Force""", 0, True

' Also try to stop any python http.server on port 8080
objShell.Run "powershell -WindowStyle Hidden -Command ""Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }""", 0, True
