@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set BASEDIR=%~dp0
if "%BASEDIR:~-1%"=="\" set BASEDIR=%BASEDIR:~0,-1%

set WRAPPER_JAR=%BASEDIR%\.mvn\wrapper\maven-wrapper.jar
set WRAPPER_PROPS=%BASEDIR%\.mvn\wrapper\maven-wrapper.properties

if not exist "%WRAPPER_JAR%" (
  if not exist "%WRAPPER_PROPS%" (
    echo ERROR: Could not find %WRAPPER_PROPS% >&2
    exit /b 1
  )
  findstr "^wrapperUrl=" "%WRAPPER_PROPS%" >nul
  if errorlevel 1 (
    echo ERROR: wrapperUrl not defined in %WRAPPER_PROPS% >&2
    exit /b 1
  )
  for /f "tokens=2 delims==" %%i in ('findstr "^wrapperUrl=" "%WRAPPER_PROPS%"') do set WRAPPER_URL=%%i
  echo Downloading Maven Wrapper from %WRAPPER_URL% ...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'"
)

java %MAVEN_OPTS% -jar "%WRAPPER_JAR%" %*
