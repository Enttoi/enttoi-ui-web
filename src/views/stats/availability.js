import {BindingEngine, inject} from 'aurelia-framework';
import {ClientService} from 'services/client-service';
import {RestApiService} from 'services/rest-api';
import _ from 'underscore';
import {ToolbarService} from '../../services/toolbar-service';
import {SensorModel, SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../../services/client-models';

@inject(ClientService, ToolbarService, BindingEngine, RestApiService)
export class Availability {

  constructor(clientService, toolbarService, bindingEngine, restApiService) {
    this._clientService = clientService;
    this._toolbarService = toolbarService;
    this._bindingEngine = bindingEngine;
    this._restApiService = restApiService;

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
      .each((client) => {
        client.sensors = _.each(client.sensors, (sensor) => {
          this._restApiService
            .getSensorStateStats(client.id, sensor.id, new Date().toISOString(), new Date().toISOString())
            .then((httpResponse) => {
              sensor.data = _.chain(httpResponse.content)
                .pairs()
                .each((pair) => pair[0] = SensorModel.parseState(pair[0]).title)
                .value();
            })
            .catch(() => sensor.data = null);
          return sensor;
        });
        return client;
      })
      .value();
  }
}

export class GenderCssValueConverter {
  toView(value) {
    return value == 'men' ? 'fa-male' : 'fa-female';
  }
}

export class SensorCssValueConverter {
  toView(value) {
    return `col-lg-${12 / value} col-md-${12 / value} col-sm-${12 / value}`;
  }
}
