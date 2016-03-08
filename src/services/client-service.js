import {BindingEngine, inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {ApiService} from 'services/api';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SocketService} from 'services/push';
import _ from 'underscore';

export const SENSOR_STATE_OFFLINE = 'SENSOR_STATE_OFFLINE';
export const SENSOR_STATE_FREE = 'SENSOR_STATE_FREE';
export const SENSOR_STATE_OCCUPIED = 'SENSOR_STATE_OCCUPIED';

@inject(getLogger('ClientService'), BindingEngine, ApiService, EventAggregator, SocketService)
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
            this._clients[dataModel.id] = new Client(dataModel);

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
class Client {
  constructor(dataModel) {
    if (!dataModel) throw 'Cannot initialize "Client" without dataModel';
    this.id = dataModel.id;
    this.subscribed = false;

    this.isOnline = dataModel.isOnline;


    this.floor = _.find(dataModel.tags, (tag) => tag.indexOf('floor') >= 0);
    this.area = _.find(dataModel.tags, (tag) => tag == 'left' || tag == 'right');
    this.gender = _.find(dataModel.tags, (tag) => tag == 'men' || tag == 'women');

    this._sensors = []; // key-value style
    this.sensors = []; // collection style
    this.anySensorFree = false; // indicates whether at least one sensor in 'FREE' state
    _.each(dataModel.sensors, (sensorModel) => {
      var sensor = new Sensor(this, sensorModel);
      this._sensors[`${sensorModel.sensorId}_${sensorModel.sensorType}`] = sensor;
      this.sensors.push(sensor);
    });
  }


  /**
   * Takes client offline and all its sensors
   */
  setOffline() {
    if (this.isOnline === true) {
      this.isOnline = false;
      _.each(this.sensors, (sensor) => {
        sensor.state = SENSOR_STATE_OFFLINE;
      });
    }
  }

  /**
   * Sets client online and sets sensors state that retreived from API
   * 
   */
  setOnline(sensorsDataModel) {
    if (this.isOnline === false)
      this.isOnline = true;

    _.each(sensorsDataModel, (sensorDataModel) => {
      var sensor = this._sensors[`${sensorDataModel.sensorId}_${sensorDataModel.sensorType}`];
      if (sensor.state === SENSOR_STATE_OFFLINE)
        sensor.state = sensorDataModel.state;
    });
  }

  /**
   * Applies new state to specific sensor. 
   * Takes if the client was offline previously.   * 
   */
  applySensorState(sensorId, sensorType, newState) {
    if (this.isOnline === false)
      this.isOnline = true;
    this._sensors[`${sensorId}_${sensorType}`].state = newState;
  }
}

class Sensor {
  constructor(parentClient, dataModel) {
    if (!parentClient) throw 'Cannot initialize "Sensor" without parentClient';
    if (!dataModel) throw 'Cannot initialize "Sensor" without dataModel';

    this.client = parentClient;
    this.id = dataModel.sensorId;
    this.state = SENSOR_STATE_OFFLINE;
  }

  set state(newState) {
    if (newState !== 1 && newState !== 0 && newState !== SENSOR_STATE_OFFLINE)
      throw `Invalid newState value "${newState}"`;
    if (newState === 1)
      this._state = SENSOR_STATE_OCCUPIED;
    else if (newState === 0)
      this._state = SENSOR_STATE_FREE;
    else
      this._state = SENSOR_STATE_OFFLINE;

    if (this._state == SENSOR_STATE_FREE)
      this.client.anySensorFree = true;
    else {
      this.client.anySensorFree = _.some(this.client.sensors, (sensor) => { return sensor.state == SENSOR_STATE_FREE; });
    }
  }

  get state() {
    return this._state;
  }
}
