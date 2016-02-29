//import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ClientService, SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import _ from 'underscore';
import browserNotifications  from 'browser-notifications';
import toastr from 'toastr';



@inject(getLogger('NotificationSubscription'),
    ClientService,
    BindingEngine)
export class NotificationSubscription {
    constructor(logger,
        clientService,
        bindingEngine) {
        this._logger = logger;
        this.clientService = clientService;
        this.bindingEngine = bindingEngine;

        this._sensorStateChangedSubscriptions = [];

        this.clientService.clients.then((clients) => {
            _.chain(clients)
                .values()
                .each((client) => {
                    client.subscribed = this.isSubscribedToAlerts(client.id);
                    _.each(client.sensors, (sensor) => {
                        this._sensorStateChangedSubscriptions.push(bindingEngine
                            .propertyObserver(sensor, 'state')
                            .subscribe((newState, oldState) => this._notifyUser(client, newState, oldState)));

                        //this._handleState(client.gender == 'male' ? this.male : this.female, sensor.state);// for not missing an update.. ask jenya if needed here
                    });
                });
        });
    }




    isSubscribedToAlerts(clientId) {
        var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
        if (subscribedList && subscribedList.indexOf(clientId) >= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    toggleSubscribedToAlerts(client) {
        var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
        if (subscribedList && client.subscribed == true) {
            client.subscribed = false;
            console.log(`unsubscribing client ${client.id} from alerts`);
            if (subscribedList) {
                var ind = subscribedList.indexOf(client.id);
                if (ind > -1) {
                    subscribedList.splice(ind, 1);
                }
            }
        }
        else if (client.subscribed === false) {
            client.subscribed = true;
            if (!subscribedList) {
                subscribedList = [];
            }
            subscribedList.push(client.id);
        }

        localStorage.setItem('subscribedList', JSON.stringify(subscribedList));
        
        //this.notifyUser(client);
    }

    _clearAlertsSubscriptions() {
        this.clientService.clients.then((clients) => {
            _.chain(clients)
                .values()
                .each((client) => {
                    client.subscribed = false;
                })
        });

        localStorage.setItem('subscribedList', JSON.stringify([]));
    }

    _notifyUser(client, newState, oldState) {
        if (client.subscribed && newState == SENSOR_STATE_FREE) { //jenya - do i need to add (&& newState != SENSOR_STATE_FREE) ??           
            this._clearAlertsSubscriptions();
            if (browserNotifications.isSupported()) {
                browserNotifications.requestPermissions()
                    .then(function (isPermitted) {
                        if (isPermitted) {
                            console.log("The notification was isPermitted: ");
                            return browserNotifications.send(`Toilet Available`, `Run to ${client.area} wing on ${client.floor} ${client.gender} cabin!!`, '/media/favicon-160x160.png', 30000)
                                .then(function (wasClicked) {
                                    console.log("The notification was clicked: ", wasClicked);
                                });
                        }
                        else {
                            console.log("We asked for permission, but got denied");
                        }
                    })
                    .catch(function (err) {
                        console.error("An error occured", err);
                    });
            }
            else {
                toastr.clear();
                toastr.success(`Toilet Available`,`Run to ${client.area} wing on ${client.floor} ${client.gender} cabin!!`);
                
               
                //alert(`Toliet Available\nRun to ${client.floor}/${client.area} ${client.gender}!!`);
               
            }

        }
    }

}