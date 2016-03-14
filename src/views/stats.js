
export class Stats {
  
  constructor(){
    this.genders = [      
      {
        title: 'Male',
        name: 'men',
        icon: 'fa fa-male'
      },
      {
        title: 'Female',
        name: 'women',
        icon: 'fa fa-female'
      }
    ];
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
    this.selectedGender = gender;
  }
}
