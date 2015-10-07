export class CabinModel {
	constructor(id, isOccupied) {
		this.id = id;
	  	this.isOccupied = isOccupied ? isOccupied : false;
  }
}

export class RoomModel {
	constructor(id, isOnline, sex, cabins) {	  
		this.id = id;
		this.sex = sex ? sex : 'man';
		this.isOnline = isOnline ? isOnline : false;		
  }
}

export class FloorAreaModel {
	constructor(name, rooms) {	  
		this.name = name;
		this.rooms = rooms;	
  }
}

export class FloorModel {
	constructor(floorNumber, areas) {	  
		this.number = floorNumber;
		this.areas = areas;	
  }
}