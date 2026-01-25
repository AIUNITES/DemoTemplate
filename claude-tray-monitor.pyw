"""
Claude System Tray Monitor
==========================
A Windows system tray app that shows CPU, RAM, Network, and Claude status.
Displays meter bars and alerts for potential issues.

Requirements:
    pip install pystray pillow psutil

Run:
    pythonw claude-tray-monitor.pyw  (no console window)
    python claude-tray-monitor.pyw   (with console for debugging)
"""

import threading
import time
import sys
from io import BytesIO

try:
    import pystray
    from pystray import MenuItem as item
    from PIL import Image, ImageDraw, ImageFont
    import psutil
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pystray", "pillow", "psutil"])
    import pystray
    from pystray import MenuItem as item
    from PIL import Image, ImageDraw, ImageFont
    import psutil

# Global state
class MonitorState:
    cpu = 0
    ram = 0
    ram_gb = 0
    ram_total = 0
    network_up = 0
    network_down = 0
    wifi_signal = "N/A"
    claude_running = False
    claude_mem = 0
    server_running = False
    alerts = []
    running = True

state = MonitorState()

def get_wifi_signal():
    """Get WiFi signal strength on Windows"""
    try:
        import subprocess
        result = subprocess.run(['netsh', 'wlan', 'show', 'interfaces'], 
                              capture_output=True, text=True, timeout=5)
        for line in result.stdout.split('\n'):
            if 'Signal' in line:
                return line.split(':')[1].strip()
        return "N/A"
    except:
        return "N/A"

def check_server_running(port=8000):
    """Check if local server is running"""
    try:
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex(('127.0.0.1', port))
        sock.close()
        return result == 0
    except:
        return False

def update_stats():
    """Update system statistics"""
    while state.running:
        try:
            # CPU
            state.cpu = psutil.cpu_percent(interval=1)
            
            # RAM
            mem = psutil.virtual_memory()
            state.ram = mem.percent
            state.ram_gb = round(mem.used / (1024**3), 1)
            state.ram_total = round(mem.total / (1024**3), 1)
            
            # Network
            net = psutil.net_io_counters()
            state.network_up = round(net.bytes_sent / (1024**2), 1)
            state.network_down = round(net.bytes_recv / (1024**2), 1)
            
            # WiFi
            state.wifi_signal = get_wifi_signal()
            
            # Claude processes
            claude_procs = [p for p in psutil.process_iter(['name', 'memory_info']) 
                          if 'claude' in p.info['name'].lower()]
            state.claude_running = len(claude_procs) > 0
            state.claude_mem = sum(p.info['memory_info'].rss for p in claude_procs) // (1024**2) if claude_procs else 0
            
            # Local server
            state.server_running = check_server_running(8000)
            
            # Check for alerts
            state.alerts = []
            if state.cpu > 85:
                state.alerts.append("High CPU")
            if state.ram > 85:
                state.alerts.append("High RAM")
            if state.wifi_signal != "N/A":
                try:
                    signal = int(state.wifi_signal.replace('%', ''))
                    if signal < 50:
                        state.alerts.append("Weak WiFi")
                except:
                    pass
            if state.claude_mem > 2000:
                state.alerts.append("Claude High Mem")
                
        except Exception as e:
            print(f"Error updating stats: {e}")
        
        time.sleep(3)

def create_meter_bar(value, width=60, height=8, color=(0, 200, 100)):
    """Create a meter bar image"""
    img = Image.new('RGBA', (width, height), (40, 40, 50, 255))
    draw = ImageDraw.Draw(img)
    
    # Background bar
    draw.rectangle([0, 0, width-1, height-1], outline=(80, 80, 90))
    
    # Fill based on value
    fill_width = int((value / 100) * (width - 2))
    if fill_width > 0:
        # Color changes based on value
        if value > 85:
            color = (255, 80, 80)  # Red
        elif value > 70:
            color = (255, 200, 80)  # Yellow
        else:
            color = (80, 200, 120)  # Green
        draw.rectangle([1, 1, fill_width, height-2], fill=color)
    
    return img

def create_icon():
    """Create the system tray icon with mini meters"""
    size = 64
    img = Image.new('RGBA', (size, size), (30, 30, 40, 255))
    draw = ImageDraw.Draw(img)
    
    # Draw mini meter bars
    bar_width = 50
    bar_height = 10
    x_start = 7
    
    # CPU bar (top)
    cpu_color = (255, 80, 80) if state.cpu > 85 else (255, 200, 80) if state.cpu > 70 else (80, 200, 120)
    draw.rectangle([x_start, 8, x_start + bar_width, 18], outline=(80, 80, 90))
    cpu_fill = int((state.cpu / 100) * bar_width)
    if cpu_fill > 0:
        draw.rectangle([x_start+1, 9, x_start + cpu_fill, 17], fill=cpu_color)
    
    # RAM bar (middle)
    ram_color = (255, 80, 80) if state.ram > 85 else (255, 200, 80) if state.ram > 70 else (80, 200, 120)
    draw.rectangle([x_start, 24, x_start + bar_width, 34], outline=(80, 80, 90))
    ram_fill = int((state.ram / 100) * bar_width)
    if ram_fill > 0:
        draw.rectangle([x_start+1, 25, x_start + ram_fill, 33], fill=ram_color)
    
    # Status indicators (bottom)
    # Claude indicator
    claude_color = (80, 200, 120) if state.claude_running else (100, 100, 110)
    draw.ellipse([x_start, 44, x_start+12, 56], fill=claude_color)
    
    # Server indicator
    server_color = (80, 200, 120) if state.server_running else (100, 100, 110)
    draw.ellipse([x_start+18, 44, x_start+30, 56], fill=server_color)
    
    # Alert indicator
    if state.alerts:
        draw.ellipse([x_start+36, 44, x_start+48, 56], fill=(255, 80, 80))
    else:
        draw.ellipse([x_start+36, 44, x_start+48, 56], fill=(80, 200, 120))
    
    return img

def get_status_text():
    """Generate status text for tooltip/menu"""
    lines = [
        f"CPU: {state.cpu:.0f}%",
        f"RAM: {state.ram:.0f}% ({state.ram_gb}/{state.ram_total} GB)",
        f"WiFi: {state.wifi_signal}",
        f"Claude: {'Running' if state.claude_running else 'Not running'}" + 
            (f" ({state.claude_mem} MB)" if state.claude_running else ""),
        f"Server: {'Running' if state.server_running else 'Stopped'}",
    ]
    if state.alerts:
        lines.append(f"⚠️ Alerts: {', '.join(state.alerts)}")
    return '\n'.join(lines)

def on_start_server(icon, item):
    """Start the local development server"""
    import subprocess
    import os
    
    if state.server_running:
        return
    
    server_path = r"C:\Users\Tom\Documents\GitHub\DemoTemplate"
    
    # Start Python HTTP server
    subprocess.Popen(
        ["python", "-m", "http.server", "8000", "--bind", "127.0.0.1"],
        cwd=server_path,
        creationflags=subprocess.CREATE_NO_WINDOW
    )
    
    time.sleep(2)
    state.server_running = check_server_running(8000)

def on_stop_server(icon, item):
    """Stop the local development server"""
    import subprocess
    try:
        # Find and kill Python HTTP server on port 8000
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline') or []
                if 'python' in str(cmdline).lower() and 'http.server' in str(cmdline) and '8000' in str(cmdline):
                    proc.kill()
            except:
                pass
        state.server_running = False
    except Exception as e:
        print(f"Error stopping server: {e}")

def on_open_browser(icon, item):
    """Open DemoTemplate in browser"""
    import webbrowser
    webbrowser.open('http://127.0.0.1:8000')

def on_show_details(icon, item):
    """Show detailed status window"""
    import tkinter as tk
    from tkinter import ttk
    
    root = tk.Tk()
    root.title("Claude System Monitor")
    root.geometry("400x500")
    root.configure(bg='#1e1e2e')
    
    # Style
    style = ttk.Style()
    style.theme_use('clam')
    style.configure('TFrame', background='#1e1e2e')
    style.configure('TLabel', background='#1e1e2e', foreground='white', font=('Segoe UI', 10))
    style.configure('Header.TLabel', font=('Segoe UI', 12, 'bold'))
    style.configure('TProgressbar', troughcolor='#313244', background='#89b4fa')
    
    frame = ttk.Frame(root, padding=20)
    frame.pack(fill='both', expand=True)
    
    # Title
    ttk.Label(frame, text="🖥️ Claude System Monitor", style='Header.TLabel').pack(pady=(0, 20))
    
    def create_meter(parent, label, value, unit=""):
        container = ttk.Frame(parent)
        container.pack(fill='x', pady=5)
        
        ttk.Label(container, text=label).pack(anchor='w')
        
        bar_frame = ttk.Frame(container)
        bar_frame.pack(fill='x')
        
        progress = ttk.Progressbar(bar_frame, length=300, mode='determinate', value=value)
        progress.pack(side='left', fill='x', expand=True)
        
        ttk.Label(bar_frame, text=f" {value:.0f}{unit}").pack(side='right')
        
        return progress
    
    cpu_bar = create_meter(frame, "🔥 CPU Usage", state.cpu, "%")
    ram_bar = create_meter(frame, "💾 RAM Usage", state.ram, "%")
    
    # WiFi
    ttk.Label(frame, text=f"📶 WiFi Signal: {state.wifi_signal}").pack(anchor='w', pady=5)
    
    # Claude status
    claude_text = f"🤖 Claude: {'Running' if state.claude_running else 'Not running'}"
    if state.claude_running:
        claude_text += f" ({state.claude_mem} MB)"
    ttk.Label(frame, text=claude_text).pack(anchor='w', pady=5)
    
    # Server status
    server_text = f"🌐 Local Server: {'Running ✅' if state.server_running else 'Stopped ❌'}"
    ttk.Label(frame, text=server_text).pack(anchor='w', pady=5)
    
    # Alerts
    if state.alerts:
        ttk.Label(frame, text=f"⚠️ Alerts: {', '.join(state.alerts)}", 
                 foreground='#f38ba8').pack(anchor='w', pady=10)
    else:
        ttk.Label(frame, text="✅ All systems normal", 
                 foreground='#a6e3a1').pack(anchor='w', pady=10)
    
    # Buttons
    btn_frame = ttk.Frame(frame)
    btn_frame.pack(pady=20)
    
    def update_display():
        if root.winfo_exists():
            cpu_bar['value'] = state.cpu
            ram_bar['value'] = state.ram
            root.after(3000, update_display)
    
    update_display()
    
    tk.Button(btn_frame, text="Close", command=root.destroy, 
             bg='#313244', fg='white', padx=20).pack()
    
    root.mainloop()

def on_quit(icon, item):
    """Quit the application"""
    state.running = False
    icon.stop()

def update_icon(icon):
    """Update the tray icon periodically"""
    while state.running:
        try:
            icon.icon = create_icon()
            icon.title = f"CPU: {state.cpu:.0f}% | RAM: {state.ram:.0f}%"
        except:
            pass
        time.sleep(3)

def main():
    # Start stats update thread
    stats_thread = threading.Thread(target=update_stats, daemon=True)
    stats_thread.start()
    
    # Wait for initial stats
    time.sleep(2)
    
    # Create menu
    menu = pystray.Menu(
        item('📊 Show Details', on_show_details),
        item('🌐 Open DemoTemplate', on_open_browser),
        pystray.Menu.SEPARATOR,
        item('▶️ Start Server', on_start_server, 
             enabled=lambda item: not state.server_running),
        item('⏹️ Stop Server', on_stop_server,
             enabled=lambda item: state.server_running),
        pystray.Menu.SEPARATOR,
        item(lambda text: f"CPU: {state.cpu:.0f}%", None, enabled=False),
        item(lambda text: f"RAM: {state.ram:.0f}%", None, enabled=False),
        item(lambda text: f"Claude: {'✅' if state.claude_running else '❌'}", None, enabled=False),
        item(lambda text: f"Server: {'✅' if state.server_running else '❌'}", None, enabled=False),
        pystray.Menu.SEPARATOR,
        item('❌ Quit', on_quit)
    )
    
    # Create icon
    icon = pystray.Icon(
        "claude_monitor",
        create_icon(),
        "Claude System Monitor",
        menu
    )
    
    # Start icon update thread
    icon_thread = threading.Thread(target=update_icon, args=(icon,), daemon=True)
    icon_thread.start()
    
    # Run icon
    icon.run()

if __name__ == "__main__":
    main()
