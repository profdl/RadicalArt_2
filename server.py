from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With')
        self.end_headers()
        
    def find_file(self, filename):
        """Recursively search for a file in the current directory and subdirectories."""
        for root, dirs, files in os.walk('.'):
            if filename in files:
                # Remove leading './' from the path if present
                full_path = os.path.join(root, filename)
                if full_path.startswith('./'):
                    full_path = full_path[2:]
                return full_path
        return None
        
    def do_GET(self):
        # Print request info for debugging
        print(f"Requested path: {self.path}")
        
        # Remove leading slash and any query parameters
        clean_path = self.path.split('?')[0].lstrip('/')
        
        # If the file exists directly, serve it
        if os.path.exists(clean_path):
            return super().do_GET()
            
        # For image files, try to find them recursively
        filename = os.path.basename(clean_path)
        if any(filename.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.gif', '.png']):
            found_path = self.find_file(filename)
            if found_path:
                print(f"Found file at: {found_path}")
                self.path = '/' + found_path
                return super().do_GET()
                
        return super().do_GET()

port = 8000
print(f"Starting server on port {port}...")
print(f"Open http://localhost:{port} to view the site")
httpd = HTTPServer(('localhost', port), CORSRequestHandler)
httpd.serve_forever() 