import {inject, singleton} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

@singleton(false)
@inject(HttpClient)
export class ApiService {
	constructor(http) {
        //const hostAddress = '//enttoi-api.azurewebsites.net/';
        const hostAddress = '//localhost:57579';

		http.configure(config => {
			config
				.withBaseUrl(hostAddress);
		});
		this.http = http;
	}

	getClients() {		
		return this.http.get('/clients/all');
	}
}
