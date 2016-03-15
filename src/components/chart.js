import {inject} from 'aurelia-framework';
import * as c3 from 'c3';

@inject(Element)
export class Chart {
  constructor(element) {
    this._element = element;
  }

  attached() {
    setTimeout(()=>{
    this._chart = c3.generate({
      bindto: this._element,
      data: {
        columns: [
          ['data1', 30, 200, 100, 400, 150, 250],
          ['data2', 50, 20, 10, 40, 15, 25]
        ]
      }
    })}, 150);
  }
}
