import {bindable, inject} from 'aurelia-framework';
import {DashboardClientDetails} from './dashboard-client-details';
import {DialogService} from 'aurelia-dialog';

@inject(DialogService)
export class DashboardClient {
  @bindable client;
  @bindable area;

  constructor(dialogService) {
    this._dialogService = dialogService;
  }

  openDetails() {
    this._dialogService
      .open({
        viewModel: DashboardClientDetails,
        model: this.client
      })
      .then(response => {
      });
  }
}
