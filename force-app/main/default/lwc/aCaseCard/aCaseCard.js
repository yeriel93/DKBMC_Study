import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Lightning Message Service
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import aCase_SELECTED_MESSAGE from '@salesforce/messageChannel/aCaseSelected__c';
import aCase_REFRESH_MESSAGE from '@salesforce/messageChannel/aCaseRefresh__c';

export default class ACaseCard extends LightningElement {
    @api recordId
    aCaseSelectedSubscription;
    title = 'aCase Detail Component';

    @wire(MessageContext) messageContext;

    connectedCallback(){
        //List component에서 보내준 메세지 받기 
        this.aCaseSelectedSubscription = subscribe(
            this.messageContext,
            aCase_SELECTED_MESSAGE,
            (message) => this.handleaCaseSelected(message)
        );
    }

    //메세지 채널 이벤트
    handleaCaseSelected(message){
        // console.log('card => message', message);
        this.recordId = message.aCaseId.aCaseId;
        this.title = message.aCaseId.aCaseName;
    }

    //수정 완료 후 이벤트
    editSuccess(event){
        // console.log(event.detail);
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record Number: ' + event.detail.fields.Name.value,
            variant: 'success',
        });
        this.dispatchEvent(evt);

        //수정 완료 후 filter component로 메세지 보내서 필터 적용된 리스트가 새로고침 되도록
        publish(this.messageContext, aCase_REFRESH_MESSAGE, {refreshaCase : '새로고침'});

    }
}