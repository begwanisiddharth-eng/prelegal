# Stop the backend by killing whatever is listening on port 8000
$connections = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
    Write-Host "Nothing is listening on port 8000"
    exit 0
}
$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($id in $pids) {
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process $id"
}
