"""Dev static server with Cache-Control: no-store (audit use only)."""
import functools
import http.server
import socketserver


class NoStoreHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", 8765), functools.partial(NoStoreHandler, directory=".")) as srv:
    srv.serve_forever()
