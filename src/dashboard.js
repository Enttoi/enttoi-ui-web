import {ApiService} from 'services/api';
import {SocketService} from 'services/push';
import {inject} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(ApiService, SocketService, EventAggregator, getLogger('dashboard'))
export class Dashboard {
    constructor(api, socket, eventAggregator, logger) {
        this.api = api;
        this.socket = socket;
        this.eventAggregator = eventAggregator;
        this.logger = logger;
    }

    activate() {

        this.subscription = this.eventAggregator.subscribe('sensors', state => {
            this.logger.debug('got state', state);
        });
                
        return this.api.getClients()
            .then((httpResponse) => {
                this.logger.debug('got api', httpResponse.response);                
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
