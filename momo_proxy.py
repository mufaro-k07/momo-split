from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.request
import urllib.error
import ssl

# This is the upstream mock Momo API
UPSTREAM_BASE = "https://s600zdn3-3000.uks1.devtunnels.ms"


class MomoProxyHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self, status=200, content_type="application/json"):
        """Send status and CORS headers back to the browser."""
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self._set_cors_headers()

    def do_GET(self):
        # This health checks http://localhost:8000/
        if self.path == "/":
            self._set_cors_headers(content_type="text/plain")
            self.wfile.write(b"Momo proxy running")
            return

        # Forward /transactions, /transactions/summary, /merchants etc.
        upstream_url = UPSTREAM_BASE + self.path
        print(f"Proxying GET {self.path} -> {upstream_url}")

        try:
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(upstream_url, context=ctx) as resp:
                body = resp.read()
                content_type = resp.headers.get("Content-Type", "application/json")
                status = resp.status
        except urllib.error.HTTPError as e:
            body = e.read() or str(e).encode()
            content_type = "application/json"
            status = e.code
        except Exception as e:
            # Generic proxy failure
            error_json = (
                    '{"error": "proxy_failed", "message": "%s"}'
                    % str(e).replace('"', '\\"')
            )
            body = error_json.encode("utf-8")
            content_type = "application/json"
            status = 502

        self._set_cors_headers(status=status, content_type=content_type)
        self.wfile.write(body)


def run(server_class=HTTPServer, handler_class=MomoProxyHandler):
    server_address = ("", 8000)  # listen on localhost:8000
    httpd = server_class(server_address, handler_class)
    print("Momo proxy listening on http://localhost:8000")
    httpd.serve_forever()


if __name__ == "__main__":
    run()
