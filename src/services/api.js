import {inject, singleton} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import * as config from 'environment';

@inject(HttpClient)
export class ApiService {
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
}
