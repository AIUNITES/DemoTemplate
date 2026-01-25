"""
Claude Tray Monitor - Lite Version
==================================
Simple system tray icon showing server status.
Right-click for menu to start/stop server and view stats.

Run with: pythonw claude-tray-lite.pyw
"""

import threading
import time
import sys
import os

# Install dependencies if needed
try:
    import pystray
    from PIL import Image, ImageDraw
    import psutil
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pystray", "pillow", "psutil", "-q"])
    import pystray
    from PIL import Image, ImageDraw
    import psutil

# Config
SERVER_PORT = 8000
SERVER_DIR = r"C:\Users\Tom\Documents\GitHub\DemoTemplate"

# State
class State:
    running = True
    server_ok = False
    cpu = 0
    ram = 0

state = State()

def check_server():
    """Check if server is running on port"""
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', SERVER_PORT))
        sock.close()
        return result == 0
    except:
        return False

def update_stats():
    """Background thread to update stats"""
    while state.running:
        try:
            state.cpu = int(psutil.cpu_percent(interval=1))
            state.ram = int(psutil.virtual_memory().percent)
            state.server_ok = check_server()
        except:
            pass
        time.sleep(3)

def create_icon_image():
    """Create tray icon with status indicator"""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background circle
    draw.ellipse([4, 4, 60, 60], fill=(40, 40, 50))
    
    # CPU bar (left)
    cpu_height = int((state.cpu / 100) * 40)
    cpu_color = (255, 80, 80) if state.cpu > 80 else (255, 200, 80) if state.cpu > 60 else (80, 200, 120)
    draw.rectangle([12, 52 - cpu_height, 22, 52], fill=cpu_color)
    
    # RAM bar (middle)
    ram_height = int((state.ram / 100) * 40)
    ram_color = (255, 80, 80) if state.ram > 80 else (255, 200, 80) if state.ram > 60 else (80, 200, 120)
    draw.rectangle([27, 52 - ram_height, 37, 52], fill=ram_color)
    
    # Server status dot (right)
    server_color = (80, 200, 120) if state.server_ok else (255, 80, 80)
    draw.ellipse([42, 38, 54, 50], fill=server_color)
    
    return img

def start_server(icon=None, item=None):
    """Start the local server"""
    if state.server_ok:
        return
    
    # Use pythonw to run server with no window
    server_script = os.path.join(SERVER_DIR, "silent-server.pyw")
    if os.path.exists(server_script):
        os.system(f'start "" pythonw "{server_script}"')
    else:
        # Fallback: create inline server
        import subprocess
        code = f'''
import http.server, socketserver, os
os.chdir(r"{SERVER_DIR}")
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer(("127.0.0.1", {SERVER_PORT}), H).serve_forever()
'''
        subprocess.Popen(['pythonw', '-c', code], 
                        creationflags=subprocess.CREATE_NO_WINDOW)
    
    time.sleep(2)
    state.server_ok = check_server()

def stop_server(icon=None, item=None):
    """Stop the local server"""
    try:
        import subprocess
        # Find process on port 8080 and kill it
        subprocess.run(
            ['powershell', '-WindowStyle', 'Hidden', '-Command',
             f'Get-NetTCPConnection -LocalPort {SERVER_PORT} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}'],
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        state.server_ok = False
    except:
        pass

def open_browser(icon=None, item=None):
    """Open DemoTemplate in browser"""
    import webbrowser
    webbrowser.open(f'http://127.0.0.1:{SERVER_PORT}')

def show_status(icon=None, item=None):
    """Show status popup"""
    try:
        import tkinter as tk
        from tkinter import messagebox
        root = tk.Tk()
        root.withdraw()
        
        status = f"""CPU: {state.cpu}%
RAM: {state.ram}%
Server: {'Running ✓' if state.server_ok else 'Stopped ✗'}

Server URL: http://127.0.0.1:{SERVER_PORT}"""
        
        messagebox.showinfo("Claude Monitor Status", status)
        root.destroy()
    except:
        pass

def quit_app(icon, item):
    """Quit the tray app"""
    state.running = False
    icon.stop()

def update_icon_loop(icon):
    """Update icon periodically"""
    while state.running:
        try:
            icon.icon = create_icon_image()
            status = "✓" if state.server_ok else "✗"
            icon.title = f"CPU:{state.cpu}% RAM:{state.ram}% Server:{status}"
        except:
            pass
        time.sleep(3)

def main():
    # Start stats thread
    stats_thread = threading.Thread(target=update_stats, daemon=True)
    stats_thread.start()
    time.sleep(1)
    
    # Create menu
    menu = pystray.Menu(
        pystray.MenuItem("📊 Show Status", show_status, default=True),
        pystray.MenuItem("🌐 Open Browser", open_browser),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("▶️ Start Server", start_server),
        pystray.MenuItem("⏹️ Stop Server", stop_server),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("❌ Quit", quit_app)
    )
    
    # Create tray icon
    icon = pystray.Icon("claude_monitor", create_icon_image(), "Claude Monitor", menu)
    
    # Start icon update thread
    update_thread = threading.Thread(target=update_icon_loop, args=(icon,), daemon=True)
    update_thread.start()
    
    # Run (blocks)
    icon.run()

if __name__ == "__main__":
    main()
