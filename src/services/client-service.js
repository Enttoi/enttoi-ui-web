import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {ApiService} from 'services/api';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SocketService} from 'services/push';
import _ from 'underscore';

const SENSOR_STATE_OFFLINE = 'SENSOR_STATE_OFFLINE';
const SENSOR_STATE_FREE = 'SENSOR_STATE_FREE';
const SENSOR_STATE_OCCUPIED = 'SENSOR_STATE_OCCUPIED';

@inject(getLogger('ClientService'), ApiService, EventAggregator, SocketService)
export class ClientService {
    constructor(logger, api, eventAggregator, socket) {
        this._logger = logger;
        this._api = api;
        this._socket = socket;

        this._subscriptions = [];
        this._clients = []; // key/value representation

        this._initPromise = new Promise((resolve, reject) => {
            this._api.getClients()
                .then((httpResponse) => {
                    _.each(httpResponse.content, (dataModel) => {
                        this._clients[dataModel.id] = new Client(dataModel);
                    });

                    this._logger.debug('Initialized clients', this._clients);
                })
                .catch((error) => {
                    this._logger.error('Error occurred during getting clients', error);
                    reject(error);
                })
                .then(() => {
                    this._subscriptions.push(eventAggregator.subscribe('sensors', state => {
                        if(this._clients[state.clientId].isOnline === false)
                            this._logger.info('Client went online', state.clientId);
                        this._clients[state.clientId].setSensorState(state.sensorId, state.sensorType, state.newState);
                    }));

                    this._subscriptions.push(eventAggregator.subscribe('clients', state => {
                        if (state.newState === false) {
                            this._logger.info('Client went offline', state.clientId);
                            this._clients[state.clientId].setOffline();
                        }
                    }));
                })
                .then(() => this._socket.start())
                .then(() => resolve());
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

            this._clients = [];
        });
    }
}

class Client {
    constructor(dataModel) {
        if (!dataModel) throw 'Cannot initialize "Client" without dataModel';
        this.id = dataModel.id;

        this.isOnline = dataModel.isOnline;

        this.floor = _.find(dataModel.tags, (tag) => tag.indexOf('floor') >= 0);
        this.area = _.find(dataModel.tags, (tag) => tag == 'left' || tag == 'right');
        this.gender = _.find(dataModel.tags, (tag) => tag == 'men' || tag == 'women');
        this.gender = this.gender === 'men' ? 'male' : 'female';

        this._sensors = []; // key-value style
        this.sensors = []; // collection style
        _.each(dataModel.sensors, (sensorModel) => {
            var sensor = new Sensor(this, sensorModel);
            this._sensors[`${sensorModel.sensorId}_${sensorModel.sensorType}`] = sensor;
            this.sensors.push(sensor);
        });
    }

    setOffline() {
        if (this.isOnline === true) {
            this.isOnline = false;
            _.each(this.sensors, (sensor) => {
                sensor.state = SENSOR_STATE_OFFLINE;
            });
        }
    }

    setSensorState(sensorId, sensorType, newState) {
        if (this.isOnline === false) {
            this.isOnline = true;
        }
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
    }

    get state() {
        return this._state;
    }

    get stateCss() {
        switch (this.state) {
            case SENSOR_STATE_FREE: return 'text-success';
            case SENSOR_STATE_OCCUPIED: return 'text-danger';
            default: return '';
        }
    }
}