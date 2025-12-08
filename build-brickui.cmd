@echo off
setlocal enabledelayedexpansion

rem Paths
set "ROOT=%~dp0src"
set "OUT=%~dp0dist\brickui.js"

rem Ensure output directory exists
if not exist "%~dp0dist" mkdir "%~dp0dist"

rem Start with the root file
> "%OUT%" type "%ROOT%\brickui-root.js"

rem Append every other .js file under src (subfolders)
for /r "%ROOT%" %%F in (*.js) do (
    if /I not "%%~fF"=="%ROOT%\brickui-root.js" (
        >> "%OUT%" echo(
        >> "%OUT%" type "%%F"
    )
)

echo Done. Output: "%OUT%"
