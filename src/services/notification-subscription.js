import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'underscore';
import browserNotifications  from 'browser-notifications';



@inject(getLogger('NotificationSubscription'))
export class NotificationSubscription {
    constructor(logger) {
        this._logger = logger;
    }


    isSubscribed(clientId) {
        var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
        if (subscribedList && subscribedList.indexOf(clientId) >= 0) {
            return true;
        }
        else {
            return false;
        }
    }

    subscribe(client) {
        var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
        if (subscribedList && client.subscribed == true) {
            client.subscribed = false;

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
        
        this.notifyUser(client);
    }

    notifyUser(client) {
        if (client.subscribed) {
            var that = this;             
            if (browserNotifications.isSupported()) {
                browserNotifications.requestPermissions()
                    .then(function (isPermitted) {
                        if (isPermitted){
                              console.log("The notification was isPermitted: ");
                            return browserNotifications.send(`Toilet Available`, `Run to ${client.area} wing on floor ${client.floor} ${client.gender} cabin!!`, '/media/favicon-160x160.png', 30000)
                                .then(function (wasClicked) {
                                    console.log("The notification was clicked: ", wasClicked);
                                    that.subscribe(client);// to unsubscribe
                                });
                        }
                        else{
                            console.log("We asked for permission, but got denied");
                        }
                    })
                    .catch(function (err) {
                        console.error("An error occured", err);
                    });
            }
            else {
                alert('Toliet Available', `Run to ${client.floor}/${client.area} ${client.gender}!!`);
                this.subscribe(client);// to unsubscribe
            }
        }
    }

}