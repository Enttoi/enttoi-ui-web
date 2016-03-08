import {bindable, inject, TemplatingEngine} from 'aurelia-framework';
import {NotificationsService} from 'services/notifications-service';
import $ from 'jquery';

@inject(Element, TemplatingEngine, NotificationsService)
export class DashboardClient {
  @bindable client;
  @bindable area;

  constructor(element, templatingEngine, notificationsService) {
    this._element = element;
    this._templatingEngine = templatingEngine;
    this._notificationsService = notificationsService;
  }

  attached() {
    // the popop plugin initialized when view loaded,
    // but the binding of it's content to the 'client' model applied only
    // when the popup becomes visible, once popup is hidden we'll remove binding as well 
    return; // TODO:
    let popupView;
    $(this._element).popover({
      html: true,
      trigger: 'hover',
      placement: this.area == 'right' ? 'left' : 'right',
      content: '<compose view="./components/dashboard-client-popup.html"></compose>'
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
      this._notificationsService.toggleSubscription(this.client);
    }
  }
}
