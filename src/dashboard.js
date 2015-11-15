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
    }

    activate() {

        this.subscription = this.eventAggregator.subscribe('sensors', state => {
            this.logger.debug('got state', state);
        });
                
        return this.api.getClients()
            .then((httpResponse) => {
                this.floors = _.chain(httpResponse.content)
                    .groupBy((client) => _.find(client.tags, (tag) => tag.indexOf('floor') >= 0))
                    .map((clients, floorName) => { return {
                        css: `et-floor et-${floorName}`,
                        areas: _.chain(clients)
                            .groupBy((client) => _.find(client.tags, (tag) => tag == 'left' || tag == 'right'))
                            .map((clients, areaName) => { return {
                                css: `et-area et-area-${areaName}`,
                                cabins: clients
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
