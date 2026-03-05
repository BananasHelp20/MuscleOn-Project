from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        raw = params.get("raw", ["0"])[0]
        adj = params.get("adj", ["0"])[0]
        norm = params.get("norm", ["0"])[0]

        print("RAW:", raw, " ADJ:", adj, " NORM:", norm)

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")

server = HTTPServer(("0.0.0.0", 8000), RequestHandler)
print("Server started")
server.serve_forever()