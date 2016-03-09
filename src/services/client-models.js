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
    this.isOnlineTimestamp = dataModel.isOnlineChanged;

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
  setOffline(clientNewState) {
    if (this.isOnline === true) {
      this.isOnline = false;
      this.isOnlineTimestamp = clientNewState.timestamp;
      _.each(this.sensors, (sensor) => {
        sensor.state = null;
      });
    }
  }

  /**
   * Sets client online and sets sensors state that retreived from API
   * 
   */
  setOnline(clientNewState, sensorsDataModel) {
    if (this.isOnline === false){
      this.isOnline = true;
      this.isOnlineTimestamp = clientNewState.timestamp;
    }

    _.each(sensorsDataModel, (sensorDataModel) => {
      var sensor = this._sensors[`${sensorDataModel.sensorId}_${sensorDataModel.sensorType}`];
      if (sensor.state === SENSOR_STATE_OFFLINE) 
      // some sensors may be already online, because the event
      // of sensor came before the event of client
        sensor.state = sensorDataModel;
    });
  }

  /**
   * Applies new state to specific sensor. 
   * Takes cares if the client was offline previously.    
   */
  applySensorState(sensorNewState) {
    if (this.isOnline === false){
      this.isOnline = true;
      this.isOnlineTimestamp = clientNewState.timestamp;
      }
    this._sensors[`${sensorNewState.sensorId}_${sensorNewState.sensorType}`].state = sensorNewState;
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
    this.stateTimestamp = null;
    this.state = null;
  }

  /**
   * Sets the state. When null is passed the state becomes 'SENSOR_STATE_OFFLINE'
   * with timestamp of parent's client isOnlineTimestamp
   */
  set state(newSensorModel) {
    if (typeof newSensorModel === undefined ||
      (newSensorModel !== null && (typeof newSensorModel.newState === undefined || typeof newSensorModel.state === undefined)) ||
      (newSensorModel !== null && newSensorModel.newState && newSensorModel.newState !== 1 && newSensorModel.newState !== 0 ) ||
      (newSensorModel !== null && newSensorModel.state && newSensorModel.state !== 1 && newSensorModel.state !== 0 ))
      throw `Invalid model "${newSensorModel}"`;
    
    // update state with stateTimestamp
    if(newSensorModel == null){
      this._state = SENSOR_STATE_OFFLINE;      
      this.stateTimestamp = this.client.isOnlineTimestamp;      
    }
    else if (newSensorModel.newState === 1 || newSensorModel.state === 1){
      this._state = SENSOR_STATE_OCCUPIED;
      this.stateTimestamp = newSensorModel.timestamp;
    }
    else if (newSensorModel.newState === 0 || newSensorModel.state === 0)
    {
      this._state = SENSOR_STATE_FREE;      
      this.stateTimestamp = newSensorModel.timestamp || newSensorModel.stateUpdatedOn;
    }
    else
      throw 'Invalid operation';
      
    // update availbility of all client's sensors
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
