import {ClientService, SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import _ from 'underscore';

@inject(ClientService, EventAggregator)
export class LiveCounter {

  constructor(clientService, eventAggregator) {
    this.clientService = clientService;

    this.male = { offline: 0, occupied: 0, free: 0 };
    this.female = { offline: 0, occupied: 0, free: 0 };


    this._subscription = eventAggregator.subscribe('client-service.sensor-state',
      (change) => this._handleState(change.sensor.client.gender == 'male' ? this.male : this.female, change.newState, change.oldState));

    this.clientService.clients.then((clients) => {
      _.chain(clients)
        .values()
        .each((client) => {
          _.each(client.sensors, (sensor) => {
            this._handleState(client.gender == 'male' ? this.male : this.female, sensor.state);
          });
        });
    });
  }

  _handleState(gender, newState, oldState) {
    if (oldState) {
      switch (oldState) {
        case SENSOR_STATE_FREE: gender.free--; break;
        case SENSOR_STATE_OCCUPIED: gender.occupied--; break;
        case SENSOR_STATE_OFFLINE: gender.offline--; break;
      }
    }

    switch (newState) {
      case SENSOR_STATE_FREE: gender.free++; break;
      case SENSOR_STATE_OCCUPIED: gender.occupied++; break;
      case SENSOR_STATE_OFFLINE: gender.offline++; break;
    }
  }

}
