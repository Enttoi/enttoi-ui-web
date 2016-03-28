import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as config from 'environment';
import 'ms-signalr-client';

/**
 * Facade for SignalR API which receives notifications of changes,
 * validates correct order of events (based on timestamp) and publish 
 * events to topics 'socket.sensors' and 'socket.clients'
 * 
 * @export
 * @class WebSocketApiService
 */
@inject(EventAggregator, getLogger('WebSocketApiService'))
export class WebSocketApiService {
  constructor(eventAggregator, logger) {
    this._logger = logger;
    this._eventAggregator = eventAggregator;

    this._connection = $.hubConnection(
      config.apiHostAddress,
      {
        logging: config.debug
      });
    this._connection.stateChanged((state) => {
      this._setConnectionState(state);
      if (this.connectionState.name === 'connected') 
        // the initial state is requested on first connect (connecting => connected)
        // and each time after reconnect (reconnecting => connected)
        this._hub.invoke('requestInitialState');
    });
    
    this._hub = this._connection.createHubProxy('commonHub');
    this._lastStates = {};
  }

  start() {    

    this._hub.on('sensorStatePush', state => {
      this._logger.debug('Received "sensorStatePush"', state);
      var lastState = this._lastStates[`${state.clientId}_${state.sensorId}_${state.sensorType}`];

      if (!lastState || lastState.timestamp < state.timestamp) {
        this._lastStates[`${state.clientId}_${state.sensorId}_${state.sensorType}`] = state;
        this._eventAggregator.publish('socket.sensors', state);
      }
      else {
        this._logger.warn('Skipping state update for sensor as it arrived late', {
          localState: lastState,
          receivedState: state
        });
      }
    });

    this._hub.on('clientStatePush', state => {
      this._logger.debug('Received "clientStatePush"', state);
      var lastState = this._lastStates[`${state.clientId}`];

      if (!lastState || lastState.timestamp < state.timestamp) {
        this._lastStates[`${state.clientId}`] = state;
        this._eventAggregator.publish('socket.clients', state);
      }
      else {
        this._logger.warn('Skipping state update for client as it arrived late', {
          localState: lastState,
          receivedState: state
        });
      }
    });
    return this._connection.start({})
      .done((m) => {

      })
      .fail((e) => {
        this._logger.error('Failed to connect to hub', e);
      });
  }

  stop() {
    this._connection.stop();
    this._hub.off('sensorStatePush');
    this._hub.off('clientStatePush');
  }
  
  _setConnectionState(state) {
    let connectionState = {
      0: 'connecting',
      1: 'connected',
      2: 'reconnecting',
      4: 'disconnected'
    }

    this._logger.debug(`SignalR state changed from ${connectionState[state.oldState]} to ${connectionState[state.newState]}`);
    this.connectionState = { code: state.newState, name: connectionState[state.newState] };
    
    this._eventAggregator.publish('socket.state', this.connectionState);
  }
}
