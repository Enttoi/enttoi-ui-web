import {inject, singleton} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

/**
 * Facade for Github API 
 * 
 * @export
 * @class RestApiService
 */
@inject(HttpClient)
export class GithubApiService {
  constructor(http) {
    http.configure(cl => {
      cl.withBaseUrl('https://api.github.com')
        .withHeader('accept', 'application/json; charset=utf-8');
    });
    this._http = http;
  }

  getLatestClosedIssues() {
    return this._http.get('/search/issues?q=org:enttoi+state:closed+type:issue');
  }
}
