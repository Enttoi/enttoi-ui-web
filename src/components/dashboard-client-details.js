import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)
export class DashboardClientDetails {
  client;

  constructor(dialogController) {
    this.controller = dialogController;
  }
  activate(client) {
    this.client = client;
  }
}
