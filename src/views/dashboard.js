import {inject} from 'aurelia-framework';
import {ClientService} from 'services/client-service';
import _ from 'underscore';

@inject(ClientService)
export class Dashboard {
  constructor(clientService) {
    this._clientService = clientService;
    this.floors = [];
  }

  activate() {
    this._floorsPromise = this._clientService.clients.then((rowClients) => {           
      var temp_floors = _.chain(rowClients)
        .values()
        .groupBy((client) => client.floor)
        .map((floor_clients, floorName) => { return {
            floorName: floorName,
            areas: _.chain(floor_clients)
              .groupBy((floor_client) => floor_client.area)
              .map((area_clients, areaName) => { return {
                  areaName: areaName,
                  clients: _.sortBy(area_clients, 'gender')
              }})
              .sortBy('areaName')
              .value()
        }})
        .value();
      this.floors = temp_floors;
    });
  }
}

export class FloorCssValueConverter {
  toView(value) {
    return `et-floor et-${value}`;
  }
}

export class AreaCssValueConverter {
  toView(value) {
    return `et-area et-area-${value}`;
  }
}

