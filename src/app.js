import {ClientService} from 'services/client-service';
import {inject} from 'aurelia-framework';

@inject(ClientService)
export class App {
   constructor(clientService) {
       // trigger initalization of clients +
       // push subscription ASAP 
       clientService.clients;
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
        route: 'feedback',        
        name: 'feedback',        
        moduleId: 'views/feedback',        
        nav: true, 
        title:'Feeback',
        settings: 'fa-bullhorn' }
    ]);

    this.router = router;
  }
}
