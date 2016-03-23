import {TaskQueue, inject, bindable} from 'aurelia-framework';
import * as c3 from 'c3';

@inject(Element, TaskQueue)
export class Chart {
  @bindable type;
  @bindable colors;
  @bindable data;

  constructor(element, taskQueue) {
    this._element = element;
    this._taskQueue = taskQueue;
  }

  dataChanged() {
    this._taskQueue.queueTask(() => {
      
      if (!this._chart && this.data) {
        this._chart = c3.generate({
          bindto: this._element,
          data: {
            columns: this.data,
            colors: this.colors || {},
            type : this.type
          }}); 
      }
      else if(this._chart) {
        if(!this.data || this.data.length === 0)        
          this._chart.unload();      
        else
          this._chart.load({
            columns: this.data
          });
      }
    });
  }

  detached() {
    this._taskQueue.queueMicroTask(() => {
      if (this._chart)
        this._chart.destroy();
    });
  }
}
