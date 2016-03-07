import {bindable, inject} from 'aurelia-framework';
import {NotificationSubscription} from 'services/notification-subscription';

@inject(Element, NotificationSubscription)
export class DashboardClient {
  @bindable client;

  constructor(element, notificationService) {
    this._element = element;
    this._notifications = notificationService;
  }

  toggleSubscription() {
    if (!this.client.anySensorFree) {
      this._notifications.toggleSubscription(this.client);
    }
  }
  
  get cssClass(){
    return `${this.client.subscribed ? 'et-subscribed' : ''} ${!this.client.anySensorFree ? 'et-subscribable' : ''}`;
  }
}

