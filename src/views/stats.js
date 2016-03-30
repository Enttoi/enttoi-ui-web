import {ToolbarService} from '../services/toolbar-service';
import {inject} from 'aurelia-framework';
import 'bootstrap-daterangepicker';
import moment from 'moment';

@inject(Element, ToolbarService)
export class Stats {

  constructor(element, toolbarService) {
    this._element = element;
    this.genders = toolbarService.genders;
    this.selectedGender = this.genders[0];
    this.selectedDatesRange = toolbarService.datesRange;
  }

  configureRouter(config, router) {
    config.map([
      { route: ['', 'availability'], name: 'availability', moduleId: 'views/stats/availability', nav: true, title: 'Availability Report' },
      { route: 'rushhour', name: 'rushhour', moduleId: 'views/stats/rushhour', nav: true, title: 'Rush Hour' }
    ]);

    this.router = router;
  }

  attached() {
    let picker = $('.range-picker', this._element).daterangepicker({
      ranges: {
        'Today': [moment(this.selectedDatesRange.start), moment(this.selectedDatesRange.end)],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')]
      },
      'startDate': moment(this.selectedDatesRange.start),
      'endDate': moment(this.selectedDatesRange.end),
      'maxDate': moment(this.selectedDatesRange.end),
      'opens': 'left',
      'applyClass': 'btn-primary'
    }, (start, end) => this.selectDatesRange(start, end))
    .on('show.daterangepicker', (e, popup) => {
      picker.addClass('active');
      $('.glyphicon', popup.container).each((e, el)=>{
        $(el).removeClass().addClass('fa fa-calendar-check-o');
      });
    })
    .on('hide.daterangepicker', () => {
      picker.removeClass('active');
    });
    this.selectDatesRange(picker.data('daterangepicker').startDate, picker.data('daterangepicker').endDate);
  }

  selectDatesRange(start, end) {
    this.selectedDatesRange.start = start._d;
    this.selectedDatesRange.end = end._d;
    
    // handle shortest possible display
    let sameYear = start.year() == end.year();
    let sameYearAndMonth = sameYear && start.month() == end.month();
    let sameYearMonthAndDay = sameYearAndMonth && start.day() == end.day();
    if(sameYearMonthAndDay){
      this.selectedDatesRangeText =  start.format(`MMM D YYYY`);
    }
    else {
      let startFormat = start.format(`MMM D${sameYear ? '' : ', YYYY'}`);
      let endFormat = end.format(`${sameYearAndMonth ? '' : 'MMM'} D, YYYY`);
      this.selectedDatesRangeText =  `${startFormat} - ${endFormat}`;
    }
  }

  selectGender(gender) {
    this.genders.selected = gender;
  }
}
