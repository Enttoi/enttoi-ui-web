export class App {
  configureRouter(config, router){
    config.title = 'Enttoi';
    config.map([
      {
        route: ['','dashboard'],  
        name: 'dashboard', 
        moduleId: 'dashboard', 
        nav: true, 
        title:'Dashboard' 
        },
      { 
        route: 'stats',        
        name: 'stats',        
        moduleId: 'stats',        
        nav: true, 
        title:'Statistics' }
    ]);

    this.router = router;
  }
}
