import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {ClientService} from 'services/client-service';
import {NotificationSubscription} from 'services/notification-subscription';
import _ from 'underscore';
import toastr from 'toastr';

@inject(getLogger('dashboard'), ClientService, NotificationSubscription)
export class Dashboard {
  constructor(logger, clientService, notificationService) {
    this.logger = logger;
    this.clientService = clientService;
    this.floors = [];
    this.notifications = notificationService;
  }

  activate() {
    this.clientService.clients.then((rowClients) => {  
      var temp_floors = _.chain(rowClients)
        .values()
        .groupBy((client) => client.floor)
        .map((floor_clients, floorName) => { return {
            css: `et-floor et-${floorName}`,
            areas: _.chain(floor_clients)
                .groupBy((floor_client) => floor_client.area)
                .map((area_clients, areaName) => { return {
                    areaName: areaName,
                    css: `et-area et-area-${areaName}`,
                    clients: _.sortBy(area_clients, 'gender')
                }})
                .sortBy('areaName')
                .value()
        }})
        .value();  
    this.floors = temp_floors;
    });
  }

  toggleSubscription(client) {
    if (!client.anySensorFree) {
      this.notifications.toggleSubscription(client);
    }
  }
}

