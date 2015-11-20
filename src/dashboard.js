import {ApiService} from 'services/api';
import {SocketService} from 'services/push';
import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'underscore';

@inject(ApiService, SocketService, EventAggregator, getLogger('dashboard'))
export class Dashboard {
    constructor(api, socket, eventAggregator, logger) {
        this.api = api;
        this.socket = socket;
        this.eventAggregator = eventAggregator;
        this.logger = logger;
        this.floors = [];
        this.clients = [];
    }

    activate() {

        this.subscription = this.eventAggregator.subscribe('sensors', state => {
            this.logger.debug('Got state', state);
            var client = _.find(this.clients, cl => { return cl.id == state.clientId });
            var sensor = _.find(client.sensors, sn => { return sn.sensorId == state.sensorId && sn.sensorType == state.sensorType}); 
            sensor.stateCSS = state.newState === 1 ? 'text-danger' : 'text-success';
        });
                
        return this.api.getClients()
            .then((httpResponse) => {
                this.clients = httpResponse.content;
                this.floors = _.chain(this.clients)
                    .groupBy((client) => _.find(client.tags, (tag) => tag.indexOf('floor') >= 0))
                    .map((clients, floorName) => { return {
                        css: `et-floor et-${floorName}`,
                        areas: _.chain(clients)
                            .groupBy((client) => _.find(client.tags, (tag) => tag == 'left' || tag == 'right'))
                            .map((clients, areaName) => { return {
                                css: `et-area et-area-${areaName}`,
                                cabins: _.sortBy(clients, (client) => _.find(client.tags, (tag) => tag == 'men' || tag == 'women'))
                            }})
                            .sortBy('css')
                            .value()
                    }})
                    .value();
                    
                this.socket.start();
            })
            .catch((error) => {
                this.logger.error('Error occurred during getting clients', error);
            });
    }

    deactivate() {
        if(this.socket)
            this.socket.stop();
        
        if(this.subscription)
            this.subscription.dispose();
    }
}
