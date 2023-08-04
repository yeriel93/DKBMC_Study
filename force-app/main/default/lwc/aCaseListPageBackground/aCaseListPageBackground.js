import { LightningElement, api, wire, track } from 'lwc';

// Lightning Message Service
import { subscribe, MessageContext } from 'lightning/messageService';
import aCase_SELECTED_MESSAGE from '@salesforce/messageChannel/aCaseSelected__c';

export default class ACaseListPageBackground extends LightningElement {
    newModal = false;



    // new modal 열기
    openNewModal(){
        this.newModal = true;
    }
    
    //new modal 닫기
    closeNewModal(){
        this.newModal = false;
        // this.callList();
    }
}