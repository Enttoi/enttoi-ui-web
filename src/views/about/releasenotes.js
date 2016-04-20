import {GithubApiService} from 'services/github-api';
import {inject} from 'aurelia-framework';
import moment from 'moment';

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
        this.issues = data.content.items;
      });
  }
}

export class FriendlyDateValueConverter {
  toView(value) {
    var date = moment(value);
    if(moment().diff(date, 'days') > 1)
      return date.format('MMMM Do YYYY');
    else
      return date.fromNow();
  }
}
