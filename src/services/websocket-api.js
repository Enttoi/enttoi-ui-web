import {inject, singleton, TaskQueue} from 'aurelia-framework';
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
const CONNECT_RETRIES = 5; // number of times try to reconnect in retry policy

@inject(EventAggregator, getLogger('WebSocketApiService'), TaskQueue)
export class WebSocketApiService {

  constructor(eventAggregator, logger, taskQueue) {
    this._logger = logger;
    this._eventAggregator = eventAggregator;
    this._taskQueue = taskQueue;

    this._connection = $.hubConnection(
      config.apiHostAddress,
      {
        logging: config.debug
      });
      
    this._failedRetries = 0;
    this._shouldRetryConnect = false; // indicates whether the connection was stopped intentionally
    
    this._connection.stateChanged((state) => {
      this._setConnectionState(state);    
      this._handleRetryConnect();       
    });
    
    this._hub = this._connection.createHubProxy('commonHub');
    this._lastStates = {};
  }

  /**
   * Binds HUB's events to event-aggregator topics and start connection
   * 
   * @returns Promise 
   */
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
    
    this._hub.on('onlineUsersPush', count => {
      this._logger.debug('Received "onlineUsersPush"', count);
      this._eventAggregator.publish('socket.onlineUsers', count);
    });  
    this._shouldRetryConnect = true;
    return this._connection.start();
  }

  /**
   * Stops intentionally connection and unbinds HUB's events
   */
  stop() {
    this._hub.off('sensorStatePush');
    this._hub.off('clientStatePush');
    this._hub.off('onlineUsersPush');
    this._shouldRetryConnect = false;
    this._connection.stop();
  }
  
  /**
   * Sets a 'friendly' name of connection state and publish message of state
   * 
   * @param state SignalR's connection state object
   */
  _setConnectionState(state) {
    let connectionState = {
      0: 'connecting',
      1: 'connected',
      2: 'reconnecting',
      4: 'disconnected',
      500: 'disconnected-final'
    }

    this._logger.debug(`SignalR state changed from ${connectionState[state.oldState]} to ${connectionState[state.newState]}`);
    this.connectionState = { code: state.newState, name: connectionState[state.newState] };
    
    this._eventAggregator.publish('socket.state', this.connectionState);
  }
  
  /**
   * Retry policy of connection. Basicly, handles cases 
   * where on mobile browser comes back from background or PC comes back from sleep/hibernate
   * which cause to socket go into disconnect mode. 
   */
  _handleRetryConnect() {    
    if(this.connectionState.name == 'connected'){
      this._failedRetries = 0;
      return;
    }
    
    if(this._shouldRetryConnect && this.connectionState.name == 'disconnected'){
      this._failedRetries++;
      if(this._failedRetries > CONNECT_RETRIES){
        this._logger.info(`Give up trying to reconnect after ${this._failedRetries} times`);
        this._setConnectionState({
          oldState: 4,
          newState: 500
        });    
      }
      else{
        this._logger.info(`Retrying to connect ${this._failedRetries} of ${CONNECT_RETRIES}`);
        this._taskQueue.queueMicroTask(() => {
          this._connection.start();
        });
      }
    }   
  }
}
