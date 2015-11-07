import {CabinModel, RoomModel, FloorAreaModel, FloorModel} from 'models/commonModels';
import $ from 'jquery';
import 'ms-signalr-client';

export class Dashboard {
    activate() {  
        var connection = $.hubConnection('enttoi-api.azurewebsites.net');
        var hub = connection.createHubProxy('commonHub');
        var vm = this;

        hub.on('sensorStatePush', function(state) {

            if(!vm.lastState || vm.lastState < state.timestamp)
                vm.lastState = state.timestamp;

            console.log(JSON.stringify(state)); 
        });

        /*return*/ connection.start({ })
            .done(function(){ 
                console.log('Connected'); 
                hub.requestInitialState();
                vm.hubConnected = true;
            })
            .fail(function(){ 
                console.log('Could not connect'); 
                vm.hubConnected = false;
            });
    }
}
