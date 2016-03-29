import {GithubApiService} from 'services/github-api';
import {inject} from 'aurelia-framework';

@inject(GithubApiService)
export class ReleaseNotes {
  
  constructor(api) {
    this._api = api;
    this.issues = [];
  }
  
  activate(){
    this._api
      .getLatestClosedIssues()
      .then((data) => {
        this.issues = data.content;
      });
  }
}
