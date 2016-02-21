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
                    this.timeout = setTimeout(() => { this.message = 'Connecting...'; }, 500);    
                    break;
                case 'reconnecting':
                    this.timeout = setTimeout(() => { this.message = 'Reconnecting...'; }, 500);  
                    break;
                case 'faulted':
                    this.message = 'Connection error :(';
                    break;
                default:
                    this.message = ''; 
            }
        });
    }

    get display() {
        return this.message !== '';
    }
}