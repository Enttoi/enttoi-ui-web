import {BindingEngine, inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import {RestApiService} from './rest-api';
import {WebSocketApiService} from './websocket-api';
import * as models from './client-models';
import _ from 'underscore';

/**
 * Service that mantains a list of all clients with real-time state
 * 
 * Additionaly, publish events of sensor's state change in topic 'client-service.sensor-state'
 * 
 * @export
 * @class ClientService
 */
@inject(getLogger('ClientService'), BindingEngine, RestApiService, EventAggregator, WebSocketApiService)
export class ClientService {
  constructor(logger, bindingEngine, api, eventAggregator, socket) {
    this._logger = logger;
    this._api = api;
    this._socket = socket;

    this._subscriptions = [];
    this._observers = [];
    this._clients = []; // key/value representation

    this._initPromise = new Promise((resolve, reject) => {
      this._api.getClients()
        .then((httpResponse) => {
          _.each(httpResponse.content, (dataModel) => {
            this._clients[dataModel.id] = new models.ClientModel(dataModel);

            // wire internal events of sensor's state change
            _.each(this._clients[dataModel.id].sensors, (sensor) => {
              this._observers.push(bindingEngine
                .propertyObserver(sensor, 'state')
                .subscribe((newState, oldState) => {
                  eventAggregator.publish('client-service.sensor-state', {
                    newState: newState,
                    oldState: oldState,
                    sensor: sensor
                  });
                }));
            });
          });

          this._logger.debug('Initialized clients', this._clients);
        })
        .catch((error) => {
          this._logger.error('Error occurred during getting clients', error);
          reject(error);
        })
        .then(() => {
          this._subscriptions.push(eventAggregator.subscribe('socket.sensors', state => {
            if (this._clients[state.clientId].isOnline === false) {
              this._logger.info('Client went online as a result of sensor\'s state received', state.clientId);
              this._pullSensorsState(state.clientId);
            }
            this._clients[state.clientId].applySensorState(state.sensorId, state.sensorType, state.newState);
          }));

          this._subscriptions.push(eventAggregator.subscribe('socket.clients', state => {
            if (this._clients[state.clientId].isOnline === true && state.newState === false) {
              this._logger.info('Client went offline', state.clientId);
              this._clients[state.clientId].setOffline();
            }
            else if (this._clients[state.clientId].isOnline === false && state.newState === true) {
              this._logger.info('Client went online as a result of client\'s state received', state.clientId);
              this._pullSensorsState(state.clientId);
            }
          }));
        })
        .then(() => this._socket.start())
        .then(() => resolve());
    });
  }

  _pullSensorsState(clientId) {
    this._api.getSensors(clientId)
      .then((httpResponse) => {
        this._clients[clientId].setOnline(httpResponse.content);
      })
      .catch((error) => {
        this._logger.error('Error occurred during getting sensors state after client going online', error);
      });
  }

  get clients() {
    if (this.disposed) throw 'Attempted to access a disposed service';
    return this._initPromise.then(() => this._clients);
  }

  dispose() {
    this.disposed = true;

    this._initPromise.then(() => {
      if (this._socket)
        this._socket.stop();

      if (this._subscription)
        _.each(this._subscriptions, (sub) => sub.dispose());

      if (this._observers)
        _.each(this._observers, (obs) => obs.dispose());

      this._clients = [];
      this._observers = [];
    });
  }
}
