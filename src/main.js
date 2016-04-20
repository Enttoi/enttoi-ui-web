import * as config from 'environment';
import 'bootstrap';
import {HttpClient} from 'aurelia-http-client';

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
    
    // force HttpClient to be transient
    let container = aurelia.container;
    container.registerHandler(HttpClient, c => new HttpClient());
    
    aurelia.start().then(a => a.setRoot());
}
