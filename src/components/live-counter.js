import {ClientService} from '../services/client-service';
import {SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-models';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';
import _ from 'underscore';

@inject(ClientService, EventAggregator)
export class LiveCounter {

  constructor(clientService, eventAggregator) {
    this.clientService = clientService;

    this.men = { offline: 0, occupied: 0, free: 0 };
    this.women = { offline: 0, occupied: 0, free: 0 };


    this._subscription = eventAggregator.subscribe('client-service.sensor-state',
      (change) => this._handleState(
        change.sensor.client.gender == 'men' ? this.men : this.women,
        change.newState,
        change.oldState));

    this.clientService.clients.then((clients) => {
      _.chain(clients)
        .values()
        .each((client) => {
          _.each(client.sensors, (sensor) => {
            this._handleState(
              client.gender == 'men' ? this.men : this.women,
              sensor.state);
          });
        });
    });
  }

  _handleState(gender, newState, oldState) {
    console.log('sssssssssssssssssssssssssssssssssss');
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
