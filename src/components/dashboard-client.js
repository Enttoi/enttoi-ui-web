import {bindable, inject, TemplatingEngine} from 'aurelia-framework';
import {NotificationSubscription} from 'services/notification-subscription';
import $ from 'jquery';

@inject(Element, TemplatingEngine, NotificationSubscription)
export class DashboardClient {
  @bindable client;
  @bindable area;

  constructor(element, templatingEngine, notificationService) {
    this._element = element;
    this._templatingEngine = templatingEngine;
    this._notifications = notificationService;
  }

  attached() {
    // the popop plugin initialized when view loaded,
    // but the binding of it's content to the 'client' model applied only
    // when the popup becomes visible, once popup is hidden we'll remove binding as well 
    let popupView;
    $(this._element).popover({
      html: true,
      trigger: 'hover',
      placement: this.area == 'right' ? 'left' : 'right',
      content: '<ul class="list-unstyled" style="margin-bottom: 0"><li repeat.for="sensor of sensors"><i class="fa fa-${sensor.client.gender} ${sensor.stateCss}"></i> for XXX seconds</li></ul>'
    })
      .on('inserted.bs.popover', (e) => {
        popupView = this._templatingEngine.enhance({ 
          element: $('.popover-content', $(this._element).next())[0], // popup element created next to the clicked element
          bindingContext: this.client 
        });
        popupView.attached();
      })
      .on('hidden.bs.popover', (e) => {
        popupView.detached();
        popupView.unbind();
      });
  }

  detached() {
    $(this._element).popover('destroy');
  }

  toggleSubscription() {
    if (!this.client.anySensorFree) {
      this._notifications.toggleSubscription(this.client);
    }
  }

  get cssClass() {
    return `${this.client.subscribed ? 'et-subscribed' : ''} ${!this.client.anySensorFree ? 'et-subscribable' : ''}`;
  }

}

