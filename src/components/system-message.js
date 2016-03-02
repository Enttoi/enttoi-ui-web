import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class SystemMessage {

  constructor(eventAggregator) {
    this.message = 'Loading...';
    this.timeout = setTimeout(() => {
      this.message = 'Still loading...';
      this.timeout = setTimeout(() => {
        this.message = 'Probably something went wrong :(';
      }, 15000);
    }, 5000);

    eventAggregator.subscribe('socket.state', state => {

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
