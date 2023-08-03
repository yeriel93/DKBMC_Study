import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'
import { getRecord } from 'lightning/uiRecordApi';
import getName from '@salesforce/apex/aAccountController.getName'
import NAME_FIELD from '@salesforce/schema/aAccount__c.Name';
import CREATEDBYID_FIELD from '@salesforce/schema/aAccount__c.CreatedById';
import CREATEDATE_FIELD from '@salesforce/schema/aAccount__c.CreatedDate';

const FIELDS = [NAME_FIELD, CREATEDBYID_FIELD, CREATEDATE_FIELD];

export default class AAccountNewModal extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;
    nameRecord;
    records;
    error;
    name;
    createdById;
    createdDate;
    lastModifiedById;
    lastModifiedDate;
    createdByName;
    lastModifiedByName;
    
    //레코드 데이터 가져오기
    @wire(getRecord, {recordId: '$recordId', fields: FIELDS}) 
    getaAccount({error, data}) {
        if(error) {
            this.error = error;
            this.records = undefined;
        } else if(data) {
            this.records = data;
            this.error = undefined;
            console.log('data =>', data);
            this.name = data.fields.Name.value;
            this.createdById = data.fields.CreatedById.value;
            this.createdDate = data.fields.CreatedDate.value;
            this.lastModifiedById = data.lastModifiedById;
            this.lastModifiedDate = data.lastModifiedDate;
            this.getCreatedByName();
            this.getlastModifiedByName();
        }
    }
    
    //CreateByName 가져오기
    getCreatedByName(){
        // console.log('getCreatedByName');
        getName({inputId: this.createdById})
        .then((data) =>{
            console.log('createdByName-data =>', data);
            this.nameRecord = data;
            this.error = undefined;
            this.createdByName = data.Name;
        })
        .catch((error) =>{
            this.error = error;
            this.nameRecord = undefined
        })
    }

     //lastModifiedByName 가져오기
     getlastModifiedByName(){
        // console.log('getlastModifiedByName');
        getName({inputId: this.lastModifiedById}).then((data) =>{
            console.log('lastModifiedBy-data =>', data);
            this.nameRecord = data;
            this.error = undefined;
            this.lastModifiedByName = data.Name;
        })
        .catch((error) =>{
            this.error = error;
            this.nameRecord = undefined
        })
    }




//---------------------------------------------------------------------------------------------------------------------------------- 
    
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
        // console.log('save detail => ', this.isNew);
    }

    saveNew(){
        this.isNew = true;
        // console.log('saveNew detail => ', this.isNew);
    }

    handleOnsubmit(event){
        event.preventDefault();       // stop the form from submitting
        const fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);        
    }

    submitSuccess(event){
        console.log('event detail => ', JSON.parse(JSON.stringify(event.detail)));
        
        this.showNotification(); //alert

        if(this.isNew == true){ //Save & New 눌렀을때
            this.navigateToLightningComponent(); //new modal로 이동
        }else{
            this.modalClose(); //sava 눌렀을때 이전페이지로 이동
        }
    }

    // 알림
    showNotification() {
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '수정 완료',
        });
        this.dispatchEvent(event);
    }

    //new page로 이동 (Save & New 버튼 눌렀을때)
    navigateToLightningComponent() {
        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__aAccountNewAura"
            }
        });
    }
}