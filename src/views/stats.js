import {ToolbarService} from '../services/toolbar-service';
import {inject} from 'aurelia-framework';

@inject(ToolbarService)
export class Stats {
  
  constructor(toolbarService){
    this.genders = toolbarService.genders;
    this.selectedGender = this.genders[0];
  }
  
  configureRouter(config, router) {
    config.map([
      { route: ['', 'availability'], name: 'availability', moduleId: 'views/stats/availability', nav: true, title: 'Availability Report' },
      { route: 'rushhour', name: 'rushhour', moduleId: 'views/stats/rushhour', nav: true, title: 'Rush Hour' }
    ]);

    this.router = router;
  }
  
  selectGender(gender){
    this.genders.selected = gender;
  }
}
