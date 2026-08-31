[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$infrastructureDirectory = (Resolve-Path (Join-Path $scriptDirectory "..")).Path
$repositoryDirectory = (Resolve-Path (Join-Path $infrastructureDirectory "..")).Path
$snapshotDirectory = Join-Path $infrastructureDirectory "database-snapshots"

if (-not $snapshotDirectory.StartsWith($repositoryDirectory, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "La carpeta de snapshots debe estar dentro del repositorio."
}

New-Item -ItemType Directory -Force -Path $snapshotDirectory | Out-Null

$postgresRunning = docker inspect --format '{{.State.Running}}' shared-db 2>$null
if ($LASTEXITCODE -ne 0 -or $postgresRunning -ne "true") {
    throw "El contenedor shared-db no esta en ejecucion. Use: docker compose up -d shared-db"
}

$postgresUser = docker exec shared-db printenv POSTGRES_USER
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($postgresUser)) {
    throw "No fue posible determinar POSTGRES_USER."
}
$postgresUser = $postgresUser.Trim()

$databases = @(
    "authdb",
    "usersdb",
    "agenda_db",
    "notificationsdb",
    "paymentsdb",
    "filesdb",
    "rafflesdb"
)

foreach ($database in $databases) {
    $containerSnapshot = "/tmp/coniiti-$database.dump"
    $temporarySnapshot = Join-Path $snapshotDirectory "$database.dump.tmp"
    $finalSnapshot = Join-Path $snapshotDirectory "$database.dump"

    docker exec shared-db pg_dump `
        -U $postgresUser `
        -d $database `
        --format=custom `
        --clean `
        --if-exists `
        --no-owner `
        --no-privileges `
        --file=$containerSnapshot
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo el respaldo de $database."
    }

    docker cp "shared-db`:$containerSnapshot" $temporarySnapshot | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "No fue posible copiar el respaldo de $database."
    }
    docker exec shared-db rm -f $containerSnapshot
    Move-Item -Force -LiteralPath $temporarySnapshot -Destination $finalSnapshot
    Write-Host "Snapshot PostgreSQL actualizado: $database"
}

$mongoRunning = docker inspect --format '{{.State.Running}}' analytics-mongo 2>$null
if ($LASTEXITCODE -ne 0 -or $mongoRunning -ne "true") {
    throw "El contenedor analytics-mongo no esta en ejecucion."
}

$mongoDatabase = docker exec analytics-mongo printenv MONGO_INITDB_DATABASE
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($mongoDatabase)) {
    $mongoDatabase = "analytics_db"
}
$mongoDatabase = $mongoDatabase.Trim()
$mongoContainerSnapshot = "/tmp/coniiti-analytics.archive"
$mongoTemporarySnapshot = Join-Path $snapshotDirectory "analytics_db.archive.tmp"
$mongoFinalSnapshot = Join-Path $snapshotDirectory "analytics_db.archive"

docker exec analytics-mongo mongodump `
    --db=$mongoDatabase `
    --archive=$mongoContainerSnapshot
if ($LASTEXITCODE -ne 0) {
    throw "Fallo el respaldo de MongoDB."
}

docker cp "analytics-mongo`:$mongoContainerSnapshot" $mongoTemporarySnapshot | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw "No fue posible copiar el respaldo de MongoDB."
}
docker exec analytics-mongo rm -f $mongoContainerSnapshot
Move-Item -Force -LiteralPath $mongoTemporarySnapshot -Destination $mongoFinalSnapshot
Write-Host "Snapshot MongoDB actualizado: $mongoDatabase"

$manifest = [ordered]@{
    generated_at_utc = [DateTime]::UtcNow.ToString("o")
    postgres_databases = $databases
    mongo_database = $mongoDatabase
    warning = "Snapshot temporal de desarrollo; contiene datos completos y no debe publicarse en un repositorio abierto."
}
$manifestJson = $manifest | ConvertTo-Json -Depth 3
Set-Content -LiteralPath (Join-Path $snapshotDirectory "manifest.json") -Value $manifestJson -Encoding utf8

Write-Host "Snapshots completos guardados en infraestructura/database-snapshots."
