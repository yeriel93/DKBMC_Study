import { LightningElement,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'

export default class AContactNew extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;

    modalClose(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'aContact__c',
                actionName: 'home'
            },
        });
    }

    save(){
        this.isNew = false;
    }

    saveNew(){
        this.isNew = true;
    }

    handleOnsubmit(event){
        event.preventDefault(); //이벤트 멈춤
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);

    }

    handleOnSuccess(event){
        this.showAlert();

        if(this.isNew == false){
            this.navigateToRecordPage(event.detail.id);
        }

        //input value 비워주기
        const inputValue = this.template.querySelectorAll('lightning-input-field');
        if(inputValue){
            inputValue.forEach(field => {
                field.reset();    
            });
        }
    }

    // 알림
    showAlert(){
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '저장 완료'
        });
        this.dispatchEvent(event); //이벤트 전달
    }

    //save 후 detail page로 이동
    navigateToRecordPage(Id){
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                actionName: 'view'
            }
        });
    }

}