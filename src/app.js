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
        moduleId: 'views/stats',        
        nav: true, 
        title:'Stats',
        settings: 'fa-bar-chart' },
      { 
        route: 'about',        
        name: 'about',        
        moduleId: 'views/about',        
        nav: true, 
        title:'About',
        settings: 'fa-bullhorn' },
      { 
        route: 'releasenotes',        
        name: 'releasenotes',        
        moduleId: 'views/releasenotes',        
        nav: false, 
        title:'What\'s new',
        settings: 'fa-newspaper-o' }
    ]);
    this.router = router;
  }
}
