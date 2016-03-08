import {SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from 'services/client-service';

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
      case SENSOR_STATE_FREE: return 'text-success';
      case SENSOR_STATE_OCCUPIED: return 'text-danger'; 
      default: return '';
    }
  }
}
