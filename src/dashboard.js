import {CabinModel, RoomModel, FloorAreaModel, FloorModel} from 'models/commonModels';
import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {getLogger} from 'aurelia-logging';
import $ from 'jquery';
import 'ms-signalr-client';

@inject(HttpClient, getLogger('dashboard'))
export class Dashboard {

    constructor(http, logger) {
        const hostAddress = '//enttoi-api.azurewebsites.net/';
        //const hostAddress = '//localhost:57579/';
        this.logger = logger;
        
        this.connection = $.hubConnection(hostAddress);
        this.hub = this.connection.createHubProxy('commonHub');

        // http.configure(config => {
        //     config
        //       .withBaseUrl(hostAddress);
        // });

        this.http = http;
    }

    activate() {  
        var vm = this;
        this.initializeHubEvents();
        var result = this.http.get('//localhost:57579/clients/all');
            // .done(function(message){
            //     vm.logger.info('got', message);
            // })
            // .fail(function(error){
            //     vm.logger.error('error', error);
            //     
            // });
    }
    
    deactivate(){
        this.connection.stop();
    }
    
    initializeHubEvents(){
        var vm = this;
        vm.lastStates = {};

        this.hub.on('sensorStatePush', function(state) {
            var lastState = vm.lastStates[`${state.clienId}_${state.sensorId}_${state.sensorType}`];   
                     
            if(!lastState || lastState.timestamp < state.timestamp)
                lastState = state;
            else{  
                vm.logger.warn('Skipping state update as it arrived late', {
                    localState: lastState,
                    receivedState: state
                });              
                return;
            }               

            // update model state
        });

        this.connection.start({ })
            .done(function(){ 
                vm.logger.info('Connected to hub');
                vm.hub.invoke('requestInitialState');
            })
            .fail(function(){ 
                vm.logger.error('Failed to connect to hub');
            });
    }
}
