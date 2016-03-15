import {BindingEngine, inject} from 'aurelia-framework';
import {ClientService} from 'services/client-service';
import _ from 'underscore';
import {ToolbarService} from '../../services/toolbar-service';

@inject(ClientService, ToolbarService, BindingEngine)
export class Availability {

  constructor(clientService, toolbarService, bindingEngine) {
    this._clientService = clientService;
    this._toolbarService = toolbarService;
    this._bindingEngine = bindingEngine;
    this.clients = [];
  }

  activate() {
    return this._clientService.clients.then((clients) => {
      this._genderObserver = this._bindingEngine
        .propertyObserver(this._toolbarService.genders, 'selected')
        .subscribe(() => {
          this._clientService.clients.then((clients) => this._applyFilters(clients));
        });
      this._applyFilters(clients);
    });
  }

  deactivate() {
    if (this._genderObserver)
      this._genderObserver.dispose();
  }

  _applyFilters(clients) {
    this.clients = _.chain(clients)
      .values()
      .where({ gender: this._toolbarService.genders.selected.name })
      .sortBy('area')
      .reverse()
      .sortBy('floor')
      .reverse()
      .value();    
  }
}



export class GenderCssValueConverter {
  toView(value) {
    return value == 'men' ? 'fa-male' : 'fa-female';
  }
}
