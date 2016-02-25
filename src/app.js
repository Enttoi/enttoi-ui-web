export class App {
  configureRouter(config, router){
    config.title = 'Enttoi';
    config.map([
      {
        route: ['','dashboard'],  
        name: 'dashboard', 
        moduleId: 'views/dashboard', 
        nav: true, 
        title:'Dashboard' 
        },
      { 
        route: 'stats',        
        name: 'stats',        
        moduleId: 'views/stats',        
        nav: true, 
        title:'Statistics' },
      { 
        route: 'about',        
        name: 'about',        
        moduleId: 'views/about',        
        nav: true, 
        title:'About' }
    ]);

    this.router = router;
  }
}
