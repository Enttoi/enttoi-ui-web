# Enttoi Web Client 

[![Build Status](https://travis-ci.org/Enttoi/enttoi-ui-web.svg)](https://travis-ci.org/Enttoi/enttoi-ui-web)

[Aurelia](https://github.com/aurelia) based dashboard for displaying realtime state of clients and sensors. The state retreived and pushed from [ENttoi API](https://github.com/Enttoi/enttoi-api). 

## Running in dev

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
  *if you building on Windows and getting "not found Microsoft.Cpp.Default.props" message, run:* `SET VCTargetsPath="C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V140"`
3. Ensure that [Gulp](http://gulpjs.com/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g gulp
  ```
4. Ensure that [jspm](http://jspm.io/) is installed. If you need to install it, use the following command:

  ```shell
  npm install -g jspm
  ```
5. Install the client-side dependencies with jspm:

  ```shell
  jspm install -y
  ```
  *if you getting "GitHub rate limit reached" message, generate token [here](https://github.com/settings/tokens) and run:* `jspm registry config github`
  
6. To run the app, execute the following command:

  ```shell
  gulp watch
  ```
7. Browse to [http://localhost:9000](http://localhost:9000)
  
## Deploying

1. Build:

  ```shell
  gulp build
  ```
2. Bundle:

  ```shell
  gulp bundle
  ```
2. Deploy `/index.html`, `/styles`, `/media`, `/dist` and `jspm_packages/system.js`
