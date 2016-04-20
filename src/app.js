import {BindingSignaler} from 'aurelia-templating-resources';
import {inject} from 'aurelia-framework';

@inject(BindingSignaler)
export class App {    
  constructor(signaler) {
    setInterval(() => signaler.signal('second-interval-signal'), 1000);
  }
  
  configureRouter(config, router){
    config.title = 'Enttoi';
    config.map([
      {
        route: ['','dashboard'],  
        name: 'dashboard', 
        moduleId: 'views/dashboard', 
        nav: true, 
        title:'Home',
        settings: 'fa-building-o' 
        },
      { 
        route: 'stats',        
        name: 'stats',        
        moduleId: 'views/stats/index',        
        nav: true, 
        title:'Stats',
        settings: 'fa-bar-chart' },
      { 
        route: 'info',        
        name: 'info',        
        moduleId: 'views/about/index',        
        nav: true, 
        title:'Info',
        settings: 'fa-info-circle' }
    ]);
    this.router = router;
  }
}
