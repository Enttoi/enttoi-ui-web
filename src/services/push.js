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
        this.connectionState = 4;
        this._connection = $.hubConnection(
            config.apiHostAddress,
            {
                //logging: config.debug
            });
        this._connection.stateChanged((state) => this._connectionStateChanged(state));
        this.hub = this._connection.createHubProxy('commonHub');
        this.lastStates = {};

        this.hub.on('sensorStatePush', state => {
      this._logger.debug('Received "sensorStatePush"', state, this.lastStates);
      var lastState = this.lastStates[`${state.clientId}_${state.sensorId}_${state.sensorType}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
        this.lastStates[`${state.clientId}_${state.sensorId}_${state.sensorType}`] = state;
                this._eventAggregator.publish('socket.sensors', state);
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
      var lastState = this.lastStates[`${state.clientId}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
        this.lastStates[`${state.clientId}`] = state;
                this._eventAggregator.publish('socket.clients', state);
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
                this.hub.invoke('requestInitialState');
            })
            .fail((e) => {
                this._logger.error('Failed to connect to hub', e);
                this._stateChanged();
            });
    }

    stop() {
        this._connection.stop();
    }

    _connectionStateChanged(state) {
        let connectionState = {
            0: 'connecting',
            1: 'connected',
            2: 'reconnecting',
            4: 'disconnected',
            5: 'faulted'
        }

        if (!state) {
            this._logger.info(`SignalR state changed from ${this.connectionState.name} to ${connectionState[5]}`);
            this.connectionState = { code: 5, name: connectionState[5] };
        }
        else {
            this._logger.info(`SignalR state changed from ${connectionState[state.oldState]} to ${connectionState[state.newState]}`);
            this.connectionState = { code: state.newState, name: connectionState[state.newState] };
        }
        this._eventAggregator.publish('socket.state', this.connectionState);
    }
}