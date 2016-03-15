import {TaskQueue, inject} from 'aurelia-framework';
import * as c3 from 'c3';

@inject(Element, TaskQueue)
export class Chart {
  constructor(element, taskQueue) {
    this._element = element;
    this._taskQueue = taskQueue;
  }

  attached() {
    this._taskQueue.queueTask(() => {
      this._chart = c3.generate({
        bindto: this._element,
        data: {
          columns: [
            ['available', Math.floor((Math.random() * 100) + 1)],
            ['occupied', Math.floor((Math.random() * 100) + 1)],
            ['offline', Math.floor((Math.random() * 20) + 1)]
          ],
          colors: {
            available: '#62c462',
            occupied: '#ee5f5b',
            offline: '#7a8288'
          },
          type : 'pie',
          size: {
            height: 240
          }
        }});
    });
  }

  detached() {    
    this._taskQueue.queueMicroTask(() => {
      if (this._chart)
        this._chart.destroy();
    });
  }
}
