import * as models from 'services/client-models';
import moment from 'moment';

export class SubscribedCssValueConverter {
  toView(value) {
    return value ? 'et-subscribed' : '';
  }
}

export class ToggleSubscriptionTextValueConverter {
  toView(value) {
    return value ? 'Unsubscribe' : 'Subscribe';
  }
}

export class ToggleSubscriptionIconValueConverter {
  toView(value) {
    return value ? 'fa fa-bell-slash-o' : 'fa fa-bell-o';
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
  toView(sensor) {
    
    var now = moment();
    var then = moment(sensor.stateTimestamp);
    var seconds = now.diff(then, 'seconds');
    if (seconds < 60)
      return `${seconds} seconds`;
    else {
      if (sensor.state === models.SENSOR_STATE_OCCUPIED)
        return 'more than 1 minute';
      else
        return then.fromNow(true);
    }
  }
}
