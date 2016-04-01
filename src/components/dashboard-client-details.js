import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import jq from 'jquery';

@inject(Element, DialogController)
export class DashboardClientDetails {
  client;

  constructor(element, dialogController) {
    this._element = element;
    this.controller = dialogController;
  }
  activate(client) {
    this.client = client;
  }
  attached() {
    // for some reason, when unbundled the plugin of bootstrap is loaded only to 'jq' (imported module)
    // but when bundled, it is only available through global variable $
    ($().tooltip ? $ : jq)('[data-toggle="tooltip"]', this._element).tooltip();
  }
  detached() {
    ($().tooltip ? $ : jq)('[data-toggle="tooltip"]', this._element).tooltip('destroy');
  }
}
