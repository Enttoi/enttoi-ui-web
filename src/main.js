import 'bootstrap';
import * as config from 'environment';

export function configure(aurelia) {
  var pipe = aurelia.use
    .standardConfiguration();
    
  if(config.debug === true || window.location.search.indexOf('debug') > -1)
    pipe.developmentLogging();

  aurelia.start().then(a => a.setRoot());
}
