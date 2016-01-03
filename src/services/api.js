import {inject, singleton} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import * as config from 'environment';

@inject(HttpClient)
export class ApiService {
	constructor(http) {
		http.configure(cl => {
			cl.withBaseUrl(config.apiHostAddress);
		});
		this.http = http;
	}

	getClients() {		
		return this.http.get('/clients/all');
	}
}
