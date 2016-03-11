import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';
import {NotificationsService} from 'services/notifications-service';

@inject(DialogController, NotificationsService)
export class DashboardClientDetails {
  client;

  constructor(dialogController, notificationsService) {
    this.controller = dialogController;
    this._notificationsService = notificationsService;
  }
  activate(client) {
    this.client = client;
  }

  toggle() {
    if (!this.client.anySensorFree)
      this._notificationsService.toggleSubscription(this.client);
  }
}
