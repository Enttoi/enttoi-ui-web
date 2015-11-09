import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'ms-signalr-client';

@inject(EventAggregator, getLogger('SocketService'))
export class SocketService {
    constructor(eventAggregator, logger) {
        
        //const hostAddress = '//enttoi-api.azurewebsites.net/';
        const hostAddress = '//localhost:57579';

        this.logger = logger;
        this.eventAggregator = eventAggregator;
        this.connection = $.hubConnection(hostAddress);
        this.hub = this.connection.createHubProxy('commonHub');
        this.lastStates = {};

        this.logger.info('LOAD');
        this.hub.on('sensorStatePush', state => {
            var lastState = this.lastStates[`${state.clienId}_${state.sensorId}_${state.sensorType}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
                lastState = state;
                this.publisher = this.eventAggregator.publish('sensors', state);
            }
            else {
                this.logger.warn('Skipping state update as it arrived late', {
                    localState: lastState,
                    receivedState: state
                });
            }
        });

    }

    start() {
        return this.connection.start({})
            .done((m) => {
                this.logger.info('Connected to hub', m);
                this.hub.invoke('requestInitialState');
            })
            .fail((e) => {
                this.logger.error('Failed to connect to hub', e);
            });
    }

    stop() {
        this.connection.stop();
    }
}