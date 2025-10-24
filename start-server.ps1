# start-server.ps1 — start a simple local HTTP server for this project
# Usage: right-click -> Run with PowerShell or run from terminal: .\start-server.ps1

$port = 8000
$bind = '127.0.0.1'
Write-Host "Starting Python HTTP server at http://$bind:$port (press Ctrl+C to stop)"
python -m http.server $port --bind $bind
