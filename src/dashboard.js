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
        var vm = this;

        this.subscription = this.eventAggregator.subscribe('sensors', state => {
            vm.logger.debug('got state', state);
        });
                
        return this.api.getClients()
            .then(function (httpResponse) {
                vm.logger.debug('got api', httpResponse.response);                
                vm.socket.start();
            })
            .catch(function (error) {
                vm.logger.error('Error occurred during getting clients', error);
            });
    }

    deactivate() {
        if(this.socket)
            this.socket.stop();
        
        if(this.subscription)
            this.subscription.dispose();
    }
}
