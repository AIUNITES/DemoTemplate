"""
DemoTemplate Silent HTTP Server
Run with: pythonw silent-server.pyw
No console window will appear.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080
DIRECTORY = r"C:\Users\Tom\Documents\GitHub\DemoTemplate"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that doesn't print to console"""
    def log_message(self, format, *args):
        pass  # Suppress all logging

def main():
    os.chdir(DIRECTORY)
    
    # Check if port is already in use
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('127.0.0.1', PORT))
    sock.close()
    
    if result == 0:
        # Server already running, exit silently
        sys.exit(0)
    
    # Start server
    with socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    main()
