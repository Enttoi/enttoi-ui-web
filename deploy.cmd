::Deployment
echo Handling node.js deployment.
 
:: 1. KuduSync
IF /I "%IN_PLACE_DEPLOYMENT%" NEQ "1" (
  call :ExecuteCmd "%KUDU_SYNC_CMD%" -v 50 -f "%DEPLOYMENT_SOURCE%" -t "%DEPLOYMENT_TARGET%" -n "%NEXT_MANIFEST_PATH%" -p "%PREVIOUS_MANIFEST_PATH%" -i ".git;.hg;.deployment;deploy.cmd"
  IF !ERRORLEVEL! NEQ 0 goto error
)
 
:: 2. Select node version
call :SelectNodeVersion
 
:: 3. Install npm packages
IF EXIST "%DEPLOYMENT_TARGET%\package.json" (
  pushd "%DEPLOYMENT_TARGET%"
  call :ExecuteCmd !NPM_CMD! install
  IF !ERRORLEVEL! NEQ 0 goto error
  popd
)
 
:: 4. Build the webclient
IF EXIST "%DEPLOYMENT_TARGET%\Gulpfile.js" (
  pushd "%DEPLOYMENT_TARGET%"
  echo "Building web site using Gulp"
  call :ExecuteCmd ".\node_modules\.bin\gulp.cmd"
  if !ERRORLEVEL! NEQ 0 goto error
  popd
)