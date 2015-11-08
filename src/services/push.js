import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import $ from 'jquery';
import 'ms-signalr-client';

@singleton(false)
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

        var that = this;

        this.hub.on('sensorStatePush', state => {
            var lastState = that.lastStates[`${state.clienId}_${state.sensorId}_${state.sensorType}`];

            if (!lastState || lastState.timestamp < state.timestamp) {
                lastState = state;
                that.publisher = that.eventAggregator.publish('sensors', state);
            }
            else {
                that.logger.warn('Skipping state update as it arrived late', {
                    localState: lastState,
                    receivedState: state
                });
            }
        });

    }

    start() {
        var that = this;
        return this.connection.start({})
            .done((m) => {
                that.logger.info('Connected to hub', m);
                that.hub.invoke('requestInitialState');
            })
            .fail((e) => {
                that.logger.error('Failed to connect to hub', e);
            });
    }

    stop() {
        this.connection.stop();
    }
}