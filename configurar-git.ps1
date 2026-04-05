# Script para configurar Git no projeto Mente Sã Connect
# Execute: .\configurar-git.ps1

$projectPath = $PSScriptRoot
Write-Host "Diretório do projeto: $projectPath" -ForegroundColor Green

# Navegar para o diretório do projeto
Set-Location $projectPath

# Verificar se já existe .git
if (Test-Path ".git") {
    Write-Host "Repositório Git já existe!" -ForegroundColor Yellow
} else {
    Write-Host "Inicializando repositório Git..." -ForegroundColor Cyan
    git init
}

# Configurar remote
Write-Host "Configurando remote do GitHub..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/mentesarh/mentesa.git

# Verificar remote
Write-Host "`nRemote configurado:" -ForegroundColor Green
git remote -v

# Status
Write-Host "`nStatus do repositório:" -ForegroundColor Green
git status --short

Write-Host "`n✅ Git configurado com sucesso!" -ForegroundColor Green
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m 'Initial commit'" -ForegroundColor White
Write-Host "  3. git branch -M main" -ForegroundColor White
Write-Host "  4. git push -u origin main" -ForegroundColor White


