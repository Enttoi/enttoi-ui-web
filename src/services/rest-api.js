import {inject, singleton} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import * as config from 'environment';

/**
 * Facade for REST API of clients
 * 
 * @export
 * @class RestApiService
 */
@inject(HttpClient)
export class RestApiService {
  constructor(http) {
    http.configure(cl => {
      cl.withBaseUrl(config.apiHostAddress)
        .withHeader('accept', 'application/json; charset=utf-8');
    });
    this._http = http;
  }

  getClients() {
    return this._http.get('/clients/all');
  }
  getSensors(clientId) {
    return this._http.get(`/sensors/${clientId}`);
  }
  
  getSensorStateStats(clientId, sensorId, from, to) {
    return this._http.get(`/stats/sensor-state?clientId=${clientId}&sensorId=${sensorId}&from=${from}&to=${to}`);
  }
}
