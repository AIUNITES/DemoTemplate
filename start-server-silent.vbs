' Start DemoTemplate Server Silently
' Double-click this file to start the server with no window
' The server runs at http://127.0.0.1:8080

Set objShell = CreateObject("WScript.Shell")
objShell.Run "pythonw ""C:\Users\Tom\Documents\GitHub\DemoTemplate\silent-server.pyw""", 0, False
