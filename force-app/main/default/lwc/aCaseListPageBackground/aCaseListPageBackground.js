import { LightningElement, api, wire, track } from 'lwc';

// Lightning Message Service
import { publish, MessageContext } from 'lightning/messageService';
import aCase_REFRESH_MESSAGE from '@salesforce/messageChannel/aCaseRefresh__c';

export default class ACaseListPageBackground extends LightningElement {
    newModal = false;

    @wire(MessageContext) messageContext;

    // new modal 열기
    openNewModal(){
        this.newModal = true;
    }
    
    //new modal 닫기
    closeNewModal(){
        this.newModal = false;
        
        //수정 완료 후 filter component로 메세지 보내서 필터 적용된 리스트가 새로고침 되도록
        publish(this.messageContext, aCase_REFRESH_MESSAGE, {refreshaCase : '새로고침'});
    }
}