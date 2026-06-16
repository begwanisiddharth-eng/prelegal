# Stop the Next.js dev server by killing whatever is listening on port 3000
$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $connections) {
    Write-Host "Nothing is listening on port 3000"
    exit 0
}
$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($id in $pids) {
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process $id"
}
