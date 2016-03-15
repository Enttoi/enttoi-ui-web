/**
 * Stores toolbar's selections settings
 * 
 * @export
 * @class GlobalService
 */
export class ToolbarService {

  constructor() {
    
    let gendersList = [
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
    this.genders ={ 
      list: gendersList,
      selected: gendersList[0]
    };
  }
}
