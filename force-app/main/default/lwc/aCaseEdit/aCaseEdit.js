import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'
import Name_FIELD from "@salesforce/schema/aCase__c.Name";
import getaCantactData from '@salesforce/apex/aCaseController.getaCantactData'

export default class ACaseEdit extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;
    data;
    aContactPhone;
    aContactEmail;
    Name;
    
    connectedCallback(){
        getaCantactData({recordId: this.recordId})
        .then((data)=>{
            // console.log('aContact data =>', data);
            this.aContactPhone = data.aContactId__r.Phone__c;
            this.aContactEmail = data.aContactId__r.Email__c;
        })
        .catch((error)=>{
            console.log('error =>', error);
        });
    }

    modalClose(){
        this.dispatchEvent(new CustomEvent('close'));
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

    handleOnSuccess(){
        this.showAlert();

        if(this.isNew == true){
            //new page로 이동 (Save & New 버튼 눌렀을때)
        } else{
            this.dispatchEvent(new CustomEvent('close'));
        }
    }

     // 알림
     showAlert(){
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '수정 완료'
        });
        this.dispatchEvent(event); //이벤트 전달
    }
}