import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import _ from 'underscore';

@inject(Router)
export class NavBar {

  constructor(router) {
    this.router = router;
  }
}

export class IsActiveCssValueConverter {
  toView(value) {
    return value ? 'active' : ''
  }
}

export class NewFeatureCssValueConverter {
  toView(value) {
    return value === 'fa-bullhorn' ? 'label label-success' : 'sr-only'
  }
}
