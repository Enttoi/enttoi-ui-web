import {inject} from 'aurelia-framework';
import {ClientService} from 'services/client-service';
import _ from 'underscore';

@inject(ClientService)
export class Availability {

  constructor(clientService) {
    this._clientService = clientService;
    this.clients = [];
  }

  activate() {
    return this._clientService.clients.then((rowClients) => {
      this.clients = _.chain(rowClients)
        .values()
        //.where({ gender: this.gender.name })
        .sortBy('area')
        .sortBy('floor')
        .value();
    });
  }
}


export class GenderCssValueConverter {
  toView(value) {
    return value == 'men' ? 'fa-male' : 'fa-female';
  }
}
