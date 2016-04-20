
export class Index {

  constructor() {
  }

  configureRouter(config, router) {
    config.map([
      {
        route: ['', 'about'],
        name: 'about',
        moduleId: 'views/about/about',
        nav: true,
        title: 'About',
        settings: 'fa-bullhorn'
      },
      { 
        route: 'releasenotes',        
        name: 'releasenotes',        
        moduleId: 'views/about/releasenotes',        
        nav: true, 
        title:'What\'s new',
        settings: 'fa-newspaper-o' }
    ]);

    this.router = router;
  }
}
