# Enttoi Web Client 

*This repository is part of [Enttoi](http://enttoi.github.io/) project.*

[Aurelia](https://github.com/aurelia) based dashboard.

## Running in dev

1. Ensure that [NodeJS](http://nodejs.org/) is installed. This provides the platform on which the build tooling runs.
2. From the project folder, execute the following command:

  ```shell
  npm install
  ```
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
  
