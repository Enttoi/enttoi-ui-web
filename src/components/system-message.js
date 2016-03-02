import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import toastr from 'toastr';

@inject(EventAggregator)
export class SystemMessage {

    constructor(eventAggregator) {
        this.message = 'Loading...';

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
                    this.message = ''; 
            }
        });
        
        // TODO: move out from here toastr configurations and styles
        toastr.options = {
            'progressBar': true,
            'positionClass': 'toast-top-right',
            'tapToDismiss': true,
            "timeOut": "5000"
        }
    }

    get display() {
        return this.message !== '';
    }
}