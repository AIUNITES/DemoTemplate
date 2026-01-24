' DemoTemplate Server Watchdog - Silent Launcher
' This VBScript runs PowerShell completely hidden with no window flash
' Used by Task Scheduler to check/start the local server

Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -Command ""& {" & _
    "$port = 8080;" & _
    "$path = 'C:\Users\Tom\Documents\GitHub\DemoTemplate';" & _
    "try {" & _
    "  $tcp = New-Object System.Net.Sockets.TcpClient;" & _
    "  $tcp.Connect('127.0.0.1', $port);" & _
    "  $tcp.Close();" & _
    "} catch {" & _
    "  Start-Process -FilePath 'pythonw' -ArgumentList '-c', 'import http.server; import socketserver; import os; os.chdir(r\"$path\"); handler = http.server.SimpleHTTPRequestHandler; httpd = socketserver.TCPServer((\"127.0.0.1\", $port), handler); httpd.serve_forever()' -WindowStyle Hidden;" & _
    "}" & _
"}""", 0, False
