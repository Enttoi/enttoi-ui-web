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
    });
    
    aurelia.start().then(a => a.setRoot());
}
