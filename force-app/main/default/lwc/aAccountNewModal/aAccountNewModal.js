import { LightningElement,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'

export default class AAccountNewModal extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;

    modalClose(){
        // window.history.back(); //이전페이지로이동
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'aAccount__c',
                actionName: 'home'
            },
        });
    }

    save(){
        this.isNew = false;
        console.log('save detail => ', this.isNew);
    }

    saveNew(){
        this.isNew = true;
        console.log('saveNew detail => ', this.isNew);
    }

    handleOnsubmit(event){
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);        
    }

    submitSuccess(event){
        console.log('event detail => ', event.detail);
        
        this.showNotification(); //alert

        if(this.isNew == false){ //Save 눌렀을때 
            this.navigateToRecordPage(event.detail.id); //detail page로 이동
        }

        //input value 비워주기 
        const inputFields = this.template.querySelectorAll('lightning-input-field');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
                // console.log(field);
            });
        }
    }

    // 알림
    showNotification() {
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '저장 완료'
        });
        this.dispatchEvent(event);
    }

    //detail Page 이동
    navigateToRecordPage(Id) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                actionName: 'view'
            }
        });
    }

}