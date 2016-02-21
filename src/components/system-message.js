import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class SystemMessage {

    constructor(eventAggregator) {
        this.message = '';

        eventAggregator.subscribe('socket.state', state => {
            
            if(this.timeout)
                clearTimeout(this.timeout);
                
            switch (state.name) {
                case 'connecting':
                    this.message = 'Connecting...';
                    break;
                case 'reconnecting':
                    this.message = 'Reconnecting...';
                    break;
                case 'faulted':
                    this.message = 'Connection error :(';
                    break;
                default:
                    this.timeout = setTimeout(() => {
                        this.message = '';
                    }, 500);     
            }
        });
    }

    get display() {
        return this.message !== '';
    }
}