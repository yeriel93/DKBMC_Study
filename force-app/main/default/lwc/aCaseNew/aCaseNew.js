import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'

export default class ACaseNew extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;

    modalClose(){
        this.dispatchEvent(new CustomEvent("closeevent"));
    }

    save(){
        this.isNew = false;
    }
    saveNew(){
        this.isNew = true;
    }

    handleOnsubmit(event){
        event.preventDefault(); //이벤트 멈춤
        try{
            const fields = event.detail.fields;
            this.template.querySelector('lightning-record-edit-form').submit(fields);
        } catch(error){
            console.log('error => ', error);
        }
        
    }

    handleOnSuccess(event){
        this.showAlert();

        if(this.isNew == false){
            console.log('id', this.recordId);
            this.dispatchEvent(new CustomEvent("closeevent"));
            // this.navigateToRecordPage(event.detail.id);
        }

        //input value 비워주기
        const inputValue = this.template.querySelectorAll('lightning-input-field');
        console.log('inputValue', inputValue);
        if(inputValue){
            inputValue.forEach(field => {
                field.reset();    
            });
        }
    }

    hadleOnError(event){
        console.log('submit fail');
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