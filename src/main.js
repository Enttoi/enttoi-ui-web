import * as config from 'environment';
import 'bootstrap';

export function configure(aurelia) {
    var isDebug = config.debug === true || window.location.search.indexOf('debug') > -1;
    
    var pipe = aurelia.use
        .standardConfiguration();

    if (isDebug)
        pipe.developmentLogging();

    pipe.plugin('aurelia-computed', { 
      enableLogging: isDebug
    })
    .plugin('aurelia-dialog', (settings) => {
      settings.lock = false;
      settings.startingZIndex = 5;
    });
    
    aurelia.start().then(a => a.setRoot());
}
