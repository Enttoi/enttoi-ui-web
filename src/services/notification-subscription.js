import {getLogger} from 'aurelia-logging';
import {SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import _ from 'underscore';
import browserNotifications  from 'browser-notifications';



@inject(getLogger('NotificationSubscription'), BindingEngine)
export class NotificationSubscription {
  constructor(logger, bindingEngine) {
    this._logger = logger;
    this.bindingEngine = bindingEngine;
    this._observers = [];
  }

  isSubscribedToAlerts(clientId) {
    return _.findWhere(this._observers, { clientId: clientId }) != undefined;
  }

  toggleSubscribedToAlerts(client) {
    client.subscribed = !client.subscribed;

    if (client.subscribed) {
      //subscribing
      _.each(client.sensors, (sensor) => {
        this._observers.push(
          new SensorSubsriber(client,
            this.bindingEngine
              .propertyObserver(sensor, 'state')
              .subscribe((newState, oldState) => {
                this._notifyUser(client, newState, oldState);
              })))
      });
    }
    else {
      //unsubscribing
      _.chain(this._observers).where({ clientId: client.id }).each(s=> s.dispose());
      this._observers = _.reject(this._observers, function (s) { return s.clientId == client.id; });
    }
  }

  _clearAllAlertsSubscriptions() {

    _.chain(this._observers)
      .values()
      .each((s) => {
        s.client.subscribed = false;
        s.dispose();
      });
      this._observers = [];
  }

  _notifyUser(client, newState, oldState) {
    if (client.subscribed && newState == SENSOR_STATE_FREE) { //jenya - do i need to add (&& newState != SENSOR_STATE_FREE) ??           
      this._clearAllAlertsSubscriptions();
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
        setTimeout(() => alert(`Toilet Available\nRun to ${client.area} wing on ${client.floor} ${client.gender} cabin!!`), 0);        
      }

    }
  }

}

class SensorSubsriber {
  constructor(client, subscriberContext) {
    this.clientId = client.id;
    this.client = client;
    this.context = subscriberContext;
    
    
  }

  dispose() {
    this.context.dispose();
  }
}
