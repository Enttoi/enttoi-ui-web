import {ClientService, SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import _ from 'underscore';

@inject(ClientService, Router, BindingEngine)
export class NavBar {

    constructor(clientService, router, bindingEngine) {
        this.clientService = clientService;
        this.router = router;

        this.maleOffline = 0;
        this.maleOccupied = 0;
        this.maleFree = 0;

        this.femaleOffline = 0;
        this.femaleOccupied = 0;
        this.femaleFree = 0;

        this._subscriptions = [];

        this.clientService.clients.then((clients) => {
            _.chain(clients)
                .values()
                .each((client) => {
                    _.each(client.sensors, (sensor) => {
                        this._subscriptions.push(bindingEngine
                            .propertyObserver(sensor, 'state')
                            .subscribe((newState, oldState) => this._handleState(newState, oldState)));
                        this._handleState(sensor.state);
                    });
                });
        });
        console.log(this.observers);
    }    

    _handleState(newState, oldState) {
        if (oldState) {
            switch (oldState) {
                case SENSOR_STATE_FREE: this.maleFree--; break;
                case SENSOR_STATE_OCCUPIED: this.maleOccupied--; break;
                case SENSOR_STATE_OFFLINE: this.maleOffline--; break;
            }
        }

        switch (newState) {
            case SENSOR_STATE_FREE: this.maleFree++; break;
            case SENSOR_STATE_OCCUPIED: this.maleOccupied++; break;
            case SENSOR_STATE_OFFLINE: this.maleOffline++; break;
        }
    }

}