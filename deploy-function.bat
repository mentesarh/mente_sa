@echo off
echo ============================================
echo Deploy da Edge Function - create-user
echo ============================================
echo.

echo [1/3] Verificando login no Supabase...
npx supabase login
if %errorlevel% neq 0 (
    echo Erro ao fazer login. Tente novamente.
    pause
    exit /b 1
)

echo.
echo [2/3] Linkando ao projeto...
npx supabase link --project-ref xomxdvouptsivduzlqyn
if %errorlevel% neq 0 (
    echo Aviso: Pode ser que o projeto ja esteja linkado. Continuando...
)

echo.
echo [3/3] Fazendo deploy da funcao...
npx supabase functions deploy create-user
if %errorlevel% neq 0 (
    echo Erro durante o deploy.
    pause
    exit /b 1
)

echo.
echo ============================================
echo Deploy concluido com sucesso!
echo ============================================
echo.
echo A funcao esta disponivel em:
echo https://xomxdvouptsivduzlqyn.supabase.co/functions/v1/create-user
echo.
pause


