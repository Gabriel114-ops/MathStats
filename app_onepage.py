import socket
import socketserver
import sys
import threading
from http.server import SimpleHTTPRequestHandler
from pathlib import Path

import webview


APP_TITLE = "Math Stats - One Page"
START_PAGE = "OnePage/OnePage.html"
DEFAULT_PORT = 8795


def base_dir() -> Path:
    if hasattr(sys, "_MEIPASS"):
        return Path(sys._MEIPASS)
    return Path(__file__).resolve().parent


def find_free_port(preferred: int = DEFAULT_PORT) -> int:
    for port in range(preferred, preferred + 50):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
    raise RuntimeError("No free localhost port found for app server.")


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return


class ReusableThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True


def start_server(root: Path, port: int):
    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(root), **kwargs)
    httpd = ReusableThreadingTCPServer(("127.0.0.1", port), handler)

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    return httpd


def main():
    project_root = base_dir()
    start_file = project_root / START_PAGE
    if not start_file.exists():
        raise FileNotFoundError(f"Missing startup file: {start_file}")

    port = find_free_port()
    server = start_server(project_root, port)
    start_url = f"http://127.0.0.1:{port}/{START_PAGE}"

    try:
        webview.create_window(APP_TITLE, start_url, width=1366, height=860)
        webview.start()
    finally:
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    main()
