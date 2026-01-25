"""
Claude Tray Monitor - Full Version
==================================
System tray with meters for: CPU, RAM, WiFi, Claude, Server

Run with: pythonw claude-tray-full.pyw
"""

import threading
import time
import sys
import os
import subprocess

# Install dependencies if needed
try:
    import pystray
    from PIL import Image, ImageDraw, ImageFont
    import psutil
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pystray", "pillow", "psutil", "-q"])
    import pystray
    from PIL import Image, ImageDraw, ImageFont
    import psutil

# Config
SERVER_PORT = 8000
SERVER_DIR = r"C:\Users\Tom\Documents\GitHub\DemoTemplate"

# State
class State:
    running = True
    cpu = 0
    ram = 0
    ram_used = 0
    ram_total = 0
    wifi_signal = 0  # 0-100
    wifi_name = "N/A"
    claude_running = False
    claude_mem = 0
    server_ok = False
    net_down = 0
    net_up = 0

state = State()

def get_wifi_info():
    """Get WiFi signal strength and name on Windows"""
    try:
        result = subprocess.run(
            ['netsh', 'wlan', 'show', 'interfaces'],
            capture_output=True, text=True, timeout=5,
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        signal = 0
        name = "N/A"
        for line in result.stdout.split('\n'):
            if 'Signal' in line and ':' in line:
                sig_str = line.split(':')[1].strip().replace('%', '')
                try:
                    signal = int(sig_str)
                except:
                    pass
            if 'SSID' in line and 'BSSID' not in line and ':' in line:
                name = line.split(':', 1)[1].strip()
        return signal, name
    except:
        return 0, "N/A"

def check_server():
    """Check if server is running"""
    import socket
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', SERVER_PORT))
        sock.close()
        return result == 0
    except:
        return False

def get_claude_info():
    """Get Claude process info"""
    try:
        total_mem = 0
        count = 0
        for proc in psutil.process_iter(['name', 'memory_info']):
            try:
                if 'claude' in proc.info['name'].lower():
                    total_mem += proc.info['memory_info'].rss
                    count += 1
            except:
                pass
        return count > 0, total_mem // (1024 * 1024)
    except:
        return False, 0

def update_stats():
    """Background thread to update all stats"""
    while state.running:
        try:
            # CPU & RAM
            state.cpu = int(psutil.cpu_percent(interval=0.5))
            mem = psutil.virtual_memory()
            state.ram = int(mem.percent)
            state.ram_used = round(mem.used / (1024**3), 1)
            state.ram_total = round(mem.total / (1024**3), 1)
            
            # WiFi
            state.wifi_signal, state.wifi_name = get_wifi_info()
            
            # Claude
            state.claude_running, state.claude_mem = get_claude_info()
            
            # Server
            state.server_ok = check_server()
            
            # Network speed (simplified)
            net = psutil.net_io_counters()
            state.net_down = round(net.bytes_recv / (1024**3), 2)
            state.net_up = round(net.bytes_sent / (1024**3), 2)
            
        except Exception as e:
            pass
        
        time.sleep(2)

def get_color(value, warn=70, crit=85):
    """Get color based on value thresholds"""
    if value >= crit:
        return (255, 80, 80)  # Red
    elif value >= warn:
        return (255, 200, 80)  # Yellow
    else:
        return (80, 200, 120)  # Green

def create_icon_image():
    """Create tray icon with all meters"""
    size = 64
    img = Image.new('RGBA', (size, size), (30, 30, 40, 255))
    draw = ImageDraw.Draw(img)
    
    bar_width = 10
    bar_max_height = 44
    y_bottom = 54
    y_top = 10
    
    # Helper to draw a vertical bar
    def draw_bar(x, value, warn=70, crit=85):
        # Background
        draw.rectangle([x, y_top, x + bar_width, y_bottom], fill=(50, 50, 60))
        # Fill
        height = int((value / 100) * bar_max_height)
        if height > 0:
            color = get_color(value, warn, crit)
            draw.rectangle([x, y_bottom - height, x + bar_width, y_bottom], fill=color)
    
    # CPU bar
    draw_bar(4, state.cpu)
    
    # RAM bar
    draw_bar(17, state.ram)
    
    # WiFi bar
    draw_bar(30, state.wifi_signal, warn=50, crit=30)
    
    # Status dots (Claude + Server)
    # Claude dot
    claude_color = (80, 200, 120) if state.claude_running else (80, 80, 90)
    draw.ellipse([44, 10, 54, 20], fill=claude_color)
    
    # Server dot
    server_color = (80, 200, 120) if state.server_ok else (255, 80, 80)
    draw.ellipse([44, 24, 54, 34], fill=server_color)
    
    # Labels at bottom (tiny)
    try:
        # Draw tiny letters
        draw.text((6, 56), "C", fill=(150, 150, 150))
        draw.text((19, 56), "R", fill=(150, 150, 150))
        draw.text((32, 56), "W", fill=(150, 150, 150))
    except:
        pass
    
    return img

def get_tooltip():
    """Generate tooltip text"""
    server_status = "✓ Running" if state.server_ok else "✗ Stopped"
    claude_status = f"✓ {state.claude_mem}MB" if state.claude_running else "✗ Off"
    wifi_status = f"{state.wifi_signal}%" if state.wifi_signal > 0 else "N/A"
    
    return f"CPU:{state.cpu}% RAM:{state.ram}% WiFi:{wifi_status} Server:{server_status}"

def start_server(icon=None, item=None):
    """Start the local server"""
    if state.server_ok:
        return
    server_script = os.path.join(SERVER_DIR, "silent-server.pyw")
    if os.path.exists(server_script):
        subprocess.Popen(['pythonw', server_script], creationflags=subprocess.CREATE_NO_WINDOW)
    else:
        # Inline fallback
        code = f'''import http.server,socketserver,os
os.chdir(r"{SERVER_DIR}")
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(s,*a):pass
socketserver.TCPServer(("127.0.0.1",{SERVER_PORT}),H).serve_forever()'''
        subprocess.Popen(['pythonw', '-c', code], creationflags=subprocess.CREATE_NO_WINDOW)
    time.sleep(2)
    state.server_ok = check_server()

def stop_server(icon=None, item=None):
    """Stop the local server"""
    try:
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

def show_details(icon=None, item=None):
    """Show detailed status window"""
    try:
        import tkinter as tk
        from tkinter import ttk
        
        root = tk.Tk()
        root.title("Claude System Monitor")
        root.geometry("350x450")
        root.configure(bg='#1e1e2e')
        root.resizable(False, False)
        
        # Custom colors
        bg_color = '#1e1e2e'
        fg_color = '#cdd6f4'
        bar_bg = '#313244'
        
        frame = tk.Frame(root, bg=bg_color, padx=20, pady=20)
        frame.pack(fill='both', expand=True)
        
        # Title
        tk.Label(frame, text="🖥️ System Monitor", font=('Segoe UI', 14, 'bold'),
                bg=bg_color, fg=fg_color).pack(pady=(0, 15))
        
        def create_meter_row(parent, icon, label, value, unit="%", warn=70, crit=85):
            row = tk.Frame(parent, bg=bg_color)
            row.pack(fill='x', pady=6)
            
            # Label
            tk.Label(row, text=f"{icon} {label}", font=('Segoe UI', 10),
                    bg=bg_color, fg=fg_color, width=12, anchor='w').pack(side='left')
            
            # Bar container
            bar_frame = tk.Frame(row, bg=bar_bg, height=20, width=150)
            bar_frame.pack(side='left', padx=5)
            bar_frame.pack_propagate(False)
            
            # Bar fill
            fill_width = int((value / 100) * 150)
            if value >= crit:
                fill_color = '#f38ba8'
            elif value >= warn:
                fill_color = '#f9e2af'
            else:
                fill_color = '#a6e3a1'
            
            if fill_width > 0:
                fill = tk.Frame(bar_frame, bg=fill_color, width=fill_width, height=20)
                fill.place(x=0, y=0)
            
            # Value
            tk.Label(row, text=f"{value}{unit}", font=('Segoe UI', 10),
                    bg=bg_color, fg=fg_color, width=8).pack(side='left')
        
        # Meters
        create_meter_row(frame, "🔥", "CPU", state.cpu)
        create_meter_row(frame, "💾", "RAM", state.ram)
        create_meter_row(frame, "📶", "WiFi", state.wifi_signal, warn=50, crit=30)
        
        # Divider
        tk.Frame(frame, bg='#45475a', height=1).pack(fill='x', pady=15)
        
        # Details
        details = tk.Frame(frame, bg=bg_color)
        details.pack(fill='x')
        
        def detail_row(parent, label, value, color=fg_color):
            row = tk.Frame(parent, bg=bg_color)
            row.pack(fill='x', pady=3)
            tk.Label(row, text=label, font=('Segoe UI', 10), bg=bg_color, fg='#a6adc8').pack(side='left')
            tk.Label(row, text=value, font=('Segoe UI', 10), bg=bg_color, fg=color).pack(side='right')
        
        detail_row(details, "RAM Used:", f"{state.ram_used} / {state.ram_total} GB")
        detail_row(details, "WiFi Network:", state.wifi_name)
        detail_row(details, "Network ↓/↑:", f"{state.net_down} / {state.net_up} GB")
        
        # Divider
        tk.Frame(frame, bg='#45475a', height=1).pack(fill='x', pady=15)
        
        # Status indicators
        status_frame = tk.Frame(frame, bg=bg_color)
        status_frame.pack(fill='x')
        
        claude_color = '#a6e3a1' if state.claude_running else '#f38ba8'
        claude_text = f"Running ({state.claude_mem} MB)" if state.claude_running else "Not Running"
        detail_row(status_frame, "🤖 Claude:", claude_text, claude_color)
        
        server_color = '#a6e3a1' if state.server_ok else '#f38ba8'
        server_text = f"Running (:{SERVER_PORT})" if state.server_ok else "Stopped"
        detail_row(status_frame, "🌐 Server:", server_text, server_color)
        
        # Close button
        tk.Button(frame, text="Close", command=root.destroy,
                 bg='#45475a', fg=fg_color, font=('Segoe UI', 10),
                 relief='flat', padx=20, pady=5).pack(pady=(20, 0))
        
        root.mainloop()
    except Exception as e:
        print(f"Error showing details: {e}")

def quit_app(icon, item):
    """Quit the tray app"""
    state.running = False
    icon.stop()

def update_icon_loop(icon):
    """Update icon and tooltip periodically"""
    while state.running:
        try:
            icon.icon = create_icon_image()
            icon.title = get_tooltip()
        except:
            pass
        time.sleep(2)

def main():
    # Start stats thread
    stats_thread = threading.Thread(target=update_stats, daemon=True)
    stats_thread.start()
    time.sleep(1.5)  # Wait for initial stats
    
    # Menu
    menu = pystray.Menu(
        pystray.MenuItem("📊 Show Details", show_details, default=True),
        pystray.MenuItem("🌐 Open Browser", open_browser),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("▶️ Start Server", start_server),
        pystray.MenuItem("⏹️ Stop Server", stop_server),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem(lambda t: f"CPU: {state.cpu}%", None, enabled=False),
        pystray.MenuItem(lambda t: f"RAM: {state.ram}%", None, enabled=False),
        pystray.MenuItem(lambda t: f"WiFi: {state.wifi_signal}% ({state.wifi_name})", None, enabled=False),
        pystray.MenuItem(lambda t: f"Claude: {'✓' if state.claude_running else '✗'} ({state.claude_mem}MB)", None, enabled=False),
        pystray.MenuItem(lambda t: f"Server: {'✓ Running' if state.server_ok else '✗ Stopped'}", None, enabled=False),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("❌ Quit", quit_app)
    )
    
    # Create and run icon
    icon = pystray.Icon("claude_monitor", create_icon_image(), "Claude Monitor", menu)
    
    # Icon update thread
    update_thread = threading.Thread(target=update_icon_loop, args=(icon,), daemon=True)
    update_thread.start()
    
    icon.run()

if __name__ == "__main__":
    main()
