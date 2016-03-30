import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import toastr from 'toastr';

@inject(EventAggregator)
export class ConnectionMessage {

  constructor(eventAggregator) {
    this.message = 'Loading...';
    this.timeout = setTimeout(() => {
      this.message = 'Still loading...';
    }, 5000);

    eventAggregator.subscribe('socket.state', state => {
      this.displayRefresh = false;
      if (this.timeout)
        clearTimeout(this.timeout);

      switch (state.name) {
        case 'connecting':
          this.message = 'Connecting...';
          this.timeout = setTimeout(() => {
            this.message = 'Still connecting...';
          }, 5000);
          break;
        case 'reconnecting':
          this.message = 'Reconnecting...';
          break;
        case 'disconnected-final':
          this.message = 'Connection error.';
          this.displayRefresh = true;
          break;
        case 'disconnected':
          this.message = 'Connection lost :(';
          break;
        case 'connected':
          this.message = 'Connected!';
          this.timeout = setTimeout(() => {
            this.message = '';
          }, 1200);
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
