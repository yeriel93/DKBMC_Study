import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Lightning Message Service
import { subscribe, MessageContext } from 'lightning/messageService';
import aCase_SELECTED_MESSAGE from '@salesforce/messageChannel/aCaseSelected__c';

export default class ACaseCard extends LightningElement {
    @api recordId
    title = 'aCase Detail Component';

    @wire(MessageContext) messageContext;

    connectedCallback(){
        this.aCaseFilterSubscription = subscribe(
            this.messageContext,
            aCase_SELECTED_MESSAGE,
            (message) => this.handleaCaseSelected(message)
        );
    }

    handleaCaseSelected(message){
        // console.log('card => message', message);
        this.recordId = message.aCaseId.aCaseId;
        this.title = message.aCaseId.aCaseName;
    }

    editSuccess(event){
        // console.log(event.detail);
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record Number: ' + event.detail.fields.Name.value,
            variant: 'success',
        });
        this.dispatchEvent(evt);

    }
}