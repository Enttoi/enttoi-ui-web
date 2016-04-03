import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import $ from 'bootstrap';

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
    $('[data-toggle="tooltip"]', this._element).tooltip();
  }
  detached() {
    $('[data-toggle="tooltip"]', this._element).tooltip('destroy');
  }
}
