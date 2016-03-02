import {getLogger} from 'aurelia-logging';
import {SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import _ from 'underscore';
import browserNotifications  from 'browser-notifications';
import toastr from 'toastr';

const NOTIFICATION_NOT_SUPPORTED = 'NOTIFICATION_NOT_SUPPORTED';
const NOTIFICATION_REJECTED = 'NOTIFICATION_REJECTED';
const NOTIFICATION_ERRORED = 'NOTIFICATION_ERRORED';


@inject(getLogger('NotificationSubscription'), BindingEngine)
export class NotificationSubscription {
  constructor(logger, bindingEngine) {
    this._logger = logger;
    this.bindingEngine = bindingEngine;
    this._observers = [];
    this._notificationPermissionPromise = new Promise((resolve, reject) => {
      if (browserNotifications.isSupported()) {
        browserNotifications.requestPermissions()
          .then((isPermitted) => {
            if (isPermitted) {
              resolve();
            }
            else {
              this._logger.debug("We asked for permission, but got denied");
              reject(NOTIFICATION_REJECTED);
            }
          })
          .catch((err) => {
            reject(NOTIFICATION_ERRORED);
            this._logger.debug(`An error occured", ${err}`);
          });
      }
      else {
        reject(NOTIFICATION_NOT_SUPPORTED);
      }
    });
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

      this._notificationPermissionPromise
        .then()
        .catch((r) => {
          toastr.warning(`We will notify you for ${client.gender} restroom availabilty via "browser alert"`);
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
    if (client.subscribed && newState == SENSOR_STATE_FREE) {

      this._clearAllAlertsSubscriptions();
      var msg = {
        title: `Restroom available`,
        body: `Restroom has just become available at floor ${client.floor.replace('floor-', '') } in ${client.area} wing`,
        media: '/media/favicon-160x160.png',
        timeout: 30000
      };

      this._notificationPermissionPromise
        .then(() => { browserNotifications.send(msg.title, msg.body, msg.media, msg.timeout); })
        .catch(() => { setTimeout(() => alert(msg.title + '\n' + msg.body), 0) });
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
