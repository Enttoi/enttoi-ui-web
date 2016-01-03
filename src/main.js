import 'bootstrap';
import * as config from 'environment';

export function configure(aurelia) {
  var pipe = aurelia.use
    .standardConfiguration();
    
  if(config.debug === true)
    pipe.developmentLogging();

  aurelia.start().then(a => a.setRoot());
}
