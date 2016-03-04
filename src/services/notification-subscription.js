import {getLogger} from 'aurelia-logging';
import {SENSOR_STATE_OFFLINE, SENSOR_STATE_FREE, SENSOR_STATE_OCCUPIED} from '../services/client-service';
import {BindingEngine, bindable, inject} from 'aurelia-framework';
import _ from 'underscore';
import browserNotifications  from 'browser-notifications';
import toastr from 'toastr';
import {EventAggregator} from 'aurelia-event-aggregator';

const NOTIFICATION_NOT_SUPPORTED = 'NOTIFICATION_NOT_SUPPORTED';
const NOTIFICATION_REJECTED = 'NOTIFICATION_REJECTED';
const NOTIFICATION_ERRORED = 'NOTIFICATION_ERRORED';


@inject(getLogger('NotificationSubscription'), BindingEngine, EventAggregator)
export class NotificationSubscription {
  constructor(logger, bindingEngine, eventAggregator) {
    this._logger = logger;
    this._subscribedClients = new Map();
    this._subscription = eventAggregator.subscribe('client-service.sensor-state', msg => { this._notifyUser(msg.sensor.client, msg.newState, msg.oldState); });


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
    return this._subscribedClients.has(clientId);
  }

  /**
   * Toggles subscription to notifications of availability of sensor in a specified client. 
   * 
   * @param client The client to be notified on when it becomes available
   */
  toggleSubscription(client) {

    client.subscribed = !client.subscribed;
    toastr.clear();

    if (this.isSubscribedToAlerts(client.id)) {
      this._subscribedClients.delete(client.id);
      toastr.info(`Removed subscription to notification in ${client.area} wing, on floor ${client.floor.replace('floor-', '') }, for ${client.gender} cabin.`);
    }
    else {
      this._subscribedClients.set(client.id, client);
      this._notificationPermissionPromise
        .then(() => {
          toastr.success(`Subscribed to notification in ${client.area} wing, on floor ${client.floor.replace('floor-', '') }, for ${client.gender} cabin.`);
        })
        .catch((r) => {
          toastr.warning(`We will notify you for ${client.gender} restroom availabilty via "browser alert"`);
        });
    }
  }

  _clearAllAlertsSubscriptions() {
    this._subscribedClients.forEach((client, clientId) => { client.subscribed = false; });
    this._subscribedClients.clear();
  }

  _notifyUser(client, newState, oldState) {
    if (this.isSubscribedToAlerts(client.id) && newState == SENSOR_STATE_FREE) {

      this._clearAllAlertsSubscriptions();
      var msg = {
        title: `Restroom available`,
        body: `Restroom has just become available at floor ${client.floor.replace('floor-', '') } in ${client.area} wing`,
        media: '/media/favicon-160x160.png',
        timeout: 30000
      };

      this._notificationPermissionPromise
        .then(() => { browserNotifications.send(msg.title, msg.body, msg.media, msg.timeout); })
        .catch(() => { setTimeout(() => alert(msg.title + '\n' + msg.body), 0); });
    }
  }
}

