var gulp = require('gulp');
var vm = require('vm');
var fs = require('fs');

var configPath = './config.js';
var endpoint = process.env.ENTTOI_CDN_ENDPOINT;

gulp.task('bundle-cdn', ['bundle'], function () {
	if (!endpoint)
		throw Error('Environment variable "ENTTOI_CDN_ENDPOINT" is not set');
	var appCfg = getAppConfig();

	if (!appCfg || !appCfg.paths)
		throw Error(`"Paths" was not found in ${configPath} file`);

	for (var path in appCfg.paths) {
		appCfg.paths[path] = endpoint + '/' + appCfg.paths[path];
	}

	saveAppConfig(appCfg);
});

gulp.task('unbundle-cdn', ['unbundle'], function () {
	if (!endpoint)
		return;
	var appCfg = getAppConfig();

	if (!appCfg || !appCfg.paths)
		return;

	for (var path in appCfg.paths) {
		if (appCfg.paths[path].startsWith(endpoint))
			appCfg.paths[path] = appCfg.paths[path]
				.substr(endpoint.length + 1)
	}

	saveAppConfig(appCfg);
});


function getAppConfig() {
	var plainText = fs.readFileSync(configPath, 'utf8');
	var sandbox = {};
	sandbox.System = {
		cfg: {},
		config: function (cfg) {
			for (var key in cfg) {
				this.cfg[key] = cfg[key];
			}
		}
	};

	var ctx = vm.createContext(sandbox);
	vm.runInContext(plainText, sandbox);

	if (!sandbox.System.cfg.map) {
		sandbox.System.cfg.map = {};
	}
	return sandbox.System.cfg;
}

function saveAppConfig(config) {
	var tab = '  ';
	var json = JSON.stringify(config, null, 2)
		.replace(new RegExp('^' + tab + '"(\\w+)"', 'mg'), tab + '$1');
	fs.writeFileSync(configPath, `System.config(${json})`);
}
