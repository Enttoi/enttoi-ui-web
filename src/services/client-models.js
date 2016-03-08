import _ from 'underscore';

export const SENSOR_STATE_OFFLINE = 'SENSOR_STATE_OFFLINE';
export const SENSOR_STATE_FREE = 'SENSOR_STATE_FREE';
export const SENSOR_STATE_OCCUPIED = 'SENSOR_STATE_OCCUPIED';

/**
 * Represents an entire observable state of single client 
 * 
 * @export
 * @class ClientModel
 */
export class ClientModel {
  constructor(dataModel) {
    if (!dataModel) throw 'Cannot initialize "Client" without dataModel';
    this.id = dataModel.id;
    this.subscribed = false;

    this.isOnline = dataModel.isOnline;


    this.floor = _.find(dataModel.tags, (tag) => tag.indexOf('floor') >= 0);
    this.area = _.find(dataModel.tags, (tag) => tag == 'left' || tag == 'right');
    this.gender = _.find(dataModel.tags, (tag) => tag == 'men' || tag == 'women');

    this._sensors = []; // key-value style
    this.sensors = []; // collection style
    this.anySensorFree = false; // indicates whether at least one sensor in 'FREE' state
    _.each(dataModel.sensors, (sensorModel) => {
      var sensor = new SensorModel(this, sensorModel);
      this._sensors[`${sensorModel.sensorId}_${sensorModel.sensorType}`] = sensor;
      this.sensors.push(sensor);
    });
  }


  /**
   * Takes client offline and all its sensors
   */
  setOffline() {
    if (this.isOnline === true) {
      this.isOnline = false;
      _.each(this.sensors, (sensor) => {
        sensor.state = SENSOR_STATE_OFFLINE;
      });
    }
  }

  /**
   * Sets client online and sets sensors state that retreived from API
   * 
   */
  setOnline(sensorsDataModel) {
    if (this.isOnline === false)
      this.isOnline = true;

    _.each(sensorsDataModel, (sensorDataModel) => {
      var sensor = this._sensors[`${sensorDataModel.sensorId}_${sensorDataModel.sensorType}`];
      if (sensor.state === SENSOR_STATE_OFFLINE)
        sensor.state = sensorDataModel.state;
    });
  }

  /**
   * Applies new state to specific sensor. 
   * Takes if the client was offline previously.   * 
   */
  applySensorState(sensorId, sensorType, newState) {
    if (this.isOnline === false)
      this.isOnline = true;
    this._sensors[`${sensorId}_${sensorType}`].state = newState;
  }
}

/**
 * Represents an observable state of single sensor within a client
 * 
 * @class SensorModel
 */
class SensorModel {
  constructor(parentClient, dataModel) {
    if (!parentClient) throw 'Cannot initialize "Sensor" without parentClient';
    if (!dataModel) throw 'Cannot initialize "Sensor" without dataModel';

    this.client = parentClient;
    this.id = dataModel.sensorId;
    this.state = SENSOR_STATE_OFFLINE;
  }

  set state(newState) {
    if (newState !== 1 && newState !== 0 && newState !== SENSOR_STATE_OFFLINE)
      throw `Invalid newState value "${newState}"`;
    if (newState === 1)
      this._state = SENSOR_STATE_OCCUPIED;
    else if (newState === 0)
      this._state = SENSOR_STATE_FREE;
    else
      this._state = SENSOR_STATE_OFFLINE;

    if (this._state == SENSOR_STATE_FREE)
      this.client.anySensorFree = true;
    else {
      this.client.anySensorFree = _.some(this.client.sensors, (sensor) => { return sensor.state == SENSOR_STATE_FREE; });
    }
  }

  get state() {
    return this._state;
  }
}
