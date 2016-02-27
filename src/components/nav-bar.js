import {ClientService, SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import _ from 'underscore';

@inject(ClientService, Router, BindingEngine)
export class NavBar {

    constructor(clientService, router, bindingEngine) {
        this.clientService = clientService;
        this.router = router;

        this.male = { offline: 0, occupied: 0, free: 0 };
        this.female = { offline: 0, occupied: 0, free: 0 };

        this._subscriptions = [];

        this.clientService.clients.then((clients) => {
            _.chain(clients)
                .values()
                .each((client) => {
                    _.each(client.sensors, (sensor) => {
                        this._subscriptions.push(bindingEngine
                            .propertyObserver(sensor, 'state')
                            .subscribe((newState, oldState) => this._handleState(client.gender == 'male' ? this.male : this.female, newState, oldState)));

                        this._handleState(client.gender == 'male' ? this.male : this.female, sensor.state);
                    });
                });
        });
    }

    _handleState(gender, newState, oldState) {
        if (oldState) {
            switch (oldState) {
                case SENSOR_STATE_FREE: gender.free--; break;
                case SENSOR_STATE_OCCUPIED: gender.occupied--; break;
                case SENSOR_STATE_OFFLINE: gender.offline--; break;
            }
        }

        switch (newState) {
            case SENSOR_STATE_FREE: gender.free++; break;
            case SENSOR_STATE_OCCUPIED: gender.occupied++; break;
            case SENSOR_STATE_OFFLINE: gender.offline++; break;
        }
    }

}