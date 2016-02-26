import {inject, singleton} from 'aurelia-framework';
import {getLogger} from 'aurelia-logging';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'underscore';


@inject(getLogger('NotificationSubscription'))
export class NotificationSubscription {
    constructor(logger) {
        this._logger = logger;
    }
    
    
     isSubscribed(clientId){
         var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
         if(subscribedList && subscribedList.indexOf(clientId) >= 0){
             return true;
         }
         else {
             return false;
         }
    }
    
    
    subscribe(client){
       console.log(client);
        var subscribedList = JSON.parse(localStorage.getItem('subscribedList'));
        if(subscribedList && client.subscribed == true){
            client.subscribed = false;
            
            if(subscribedList){
                var ind = subscribedList.indexOf(client.id);
                if(ind > -1){
                    subscribedList.splice(ind,1);
                }
            }                                    
        }     
        else if(client.subscribed === false){
            client.subscribed = true;         
            if(!subscribedList){
                subscribedList = [];
            }
            subscribedList.push(client.id);
        }
         
        localStorage.setItem('subscribedList',JSON.stringify(subscribedList));                                      
     }
    
}