import * as models from 'services/client-models';

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
