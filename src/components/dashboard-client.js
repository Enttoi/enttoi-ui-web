import {bindable, inject} from 'aurelia-framework';
import {NotificationsService} from 'services/notifications-service';
import {DashboardClientDetails} from './dashboard-client-details';
import {DialogService} from 'aurelia-dialog';

@inject(DialogService, NotificationsService)
export class DashboardClient {
  @bindable client;
  @bindable area;

  constructor(dialogService, notificationsService) {
    this._dialogService = dialogService;
    this._notificationsService = notificationsService;
  }

  openDetails() {
    this._dialogService
      .open({
        viewModel: DashboardClientDetails,
        model: this.client
      })
      .then(response => {
        if (!response.wasCancelled && !this.client.anySensorFree)
          this._notificationsService.toggleSubscription(this.client);
      });
  }
}
