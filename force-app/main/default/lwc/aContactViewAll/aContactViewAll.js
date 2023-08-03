import { LightningElement, api, wire } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import relatedaContact from '@salesforce/apex/aAccountController.relatedaContact'

export default class AContactViewAll extends NavigationMixin(LightningElement) {
    @api aAccountId;
    @api aAccountName;
    data;
    error;
    aContactList;
    
    connectedCallback(){
        // console.log('aAccountId', this.aAccountId);
        // console.log('aAccountName', this.aAccountName);
        this.callaContactList();
    }

    callaContactList(){
        relatedaContact(({aAccountId: this.aAccountId}))
        .then((data)=>{
            this.aContactList = data;
            this.error = undefined;
            this.aContactListlength = this.aContactList.length;
            // console.log('aAccountId =>', this.aAccountId);
            console.log('aContactList => ', this.aContactList);
            // console.log('data =>', data);
        })
        .catch((error)=>{
            this.error = error;
            this.aContactList = undefined;
        });
    }

    //새로고침
    refreshList(){
        this.callaContactList();
    }

    // Edit
    recordEdit(event){
            this.targetId = event.target.dataset.msg;
            console.log('TargetId =>', this.targetId);

        // aContact__c Edit page로 이동
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.targetId,
                objectApiName: 'aContact__c',
                actionName: 'edit'
            },
        });
    }

    // Delete
    recordDelete(event){
        this.targetId = event.target.dataset.msg;
        console.log('DeleteId =>', this.targetId);

        deleteRecord(this.targetId)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted',
                    variant: 'success'
                })
            );
            
            this.callaContactList();
            
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error deleting record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

}