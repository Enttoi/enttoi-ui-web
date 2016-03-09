import * as models from 'services/client-models';
import moment from 'moment';

export class SubscribedCssValueConverter {
  toView(value) {
    return value ? 'et-subscribed' : '';
  }
}

export class SubscribableCssValueConverter {
  toView(value) {
    return value ? '' : 'et-subscribable';
  }
}

export class GenderCssValueConverter {
  toView(value) {
    return value == 'men' ? 'fa-male' : 'fa-female';
  }
}

export class StateCssValueConverter {
  toView(value) {
    switch (value) {
      case models.SENSOR_STATE_FREE: return 'text-success';
      case models.SENSOR_STATE_OCCUPIED: return 'text-danger'; 
      default: return '';
    }
  }
}

export class FromNowValueConverter {
  toView(value) {
    var now = moment(new Date());
    var then = moment(value);
    var seconds = now.diff(then, 'seconds');
    if(seconds < 60 )
      return `${seconds} ${seconds == 1 ? 'second' : 'seconds'}`;
    else      
      return then.fromNow(true);
  }
}
