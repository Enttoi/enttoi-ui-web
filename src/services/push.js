import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as config from 'environment';
import 'ms-signalr-client';

@inject(EventAggregator, getLogger('SocketService'))    
export class SocketService {
    constructor(eventAggregator, logger) {
        this._logger = logger;
        this._eventAggregator = eventAggregator;
        this._connection = $.hubConnection(
            config.apiHostAddress, 
            {
                //logging: config.debug
            });
        this.hub = this._connection.createHubProxy('commonHub');
        this.lastStates = {};

        this.hub.on('sensorStatePush', state => {
            this._logger.debug('Received "sensorStatePush"', state);
            var lastState = this.lastStates[`${state.clienId}_${state.sensorId}_${state.sensorType}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
                this.lastStates[`${state.clienId}_${state.sensorId}_${state.sensorType}`] = state;
                this._eventAggregator.publish('sensors', state);
            }
            else {
                this._logger.warn('Skipping state update for sensor as it arrived late', {
                    localState: lastState,
                    receivedState: state
                });
            }
        });
        
        this.hub.on('clientStatePush', state => {
            this._logger.debug('Received "clientStatePush"', state);
            var lastState = this.lastStates[`${state.clienId}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
                this.lastStates[`${state.clienId}`] = state;
                this._eventAggregator.publish('clients', state);
            }
            else {
                this._logger.warn('Skipping state update for client as it arrived late', {
                    localState: lastState,
                    receivedState: state
                });
            }
        });
    }

    start() {
        return this._connection.start({})
            .done((m) => {
                this._logger.info('Connected to hub', m);
                this.hub.invoke('requestInitialState');
            })
            .fail((e) => {
                this._logger.error('Failed to connect to hub', e);
            });
    }

    stop() {
        this._connection.stop();
    }
}