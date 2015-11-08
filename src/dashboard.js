import {CabinModel, RoomModel, FloorAreaModel, FloorModel} from 'models/commonModels';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import $ from 'jquery';
import 'ms-signalr-client';

@inject(HttpClient)
export class Dashboard {

    constructor(http) {
        this.connection = $.hubConnection('//enttoi-api.azurewebsites.net/');
        this.hub = this.connection.createHubProxy('commonHub');

        http.configure(config => {
            config
              .useStandardConfiguration()
              .withBaseUrl('//enttoi-api.azurewebsites.net/');
        });

        this.http = http;
    }

    activate() {  
        var vm = this;

        this.hub.on('sensorStatePush', function(state) {

            if(!vm.lastState || vm.lastState < state.timestamp)
                vm.lastState = state.timestamp;

            console.log(JSON.stringify(state)); 
        });

        this.connection.start({ })
            .done(function(){ 
                console.log('Connected to hub');
                vm.hub.invoke('requestInitialState');
            })
            .fail(function(){ 
                console.log('Failed to connect to hub');
            });
    }
    
    deactivate(){
        this.connection.stop();
    }
}
