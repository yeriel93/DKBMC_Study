import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation'
import { getRecord } from 'lightning/uiRecordApi';
import getName from '@salesforce/apex/aContactController.getName'
import NAME_FIELD from '@salesforce/schema/aContact__c.Name';
import CREATEDBYID_FIELD from '@salesforce/schema/aContact__c.CreatedById';
import CREATEDATE_FIELD from '@salesforce/schema/aContact__c.CreatedDate';

const FIELDS = [NAME_FIELD, CREATEDBYID_FIELD, CREATEDATE_FIELD];

export default class AContactEdit extends NavigationMixin(LightningElement) {
    @api recordId;
    isNew = false;
    records;
    error;
    load = false;

    name;
    reatedById;
    createdDate;
    lastModifiedById;
    lastModifiedDate;
    createdByName;
    lastModifiedByName;

    // 레코드 데이터 가져오기
    @wire(getRecord, {recordId: '$recordId', fields: FIELDS}) 
    getaContact({error, data}) {
        if(data){
            this.records = data;
            this.error = undefined;
            // console.log('data =>', data);
            this.name = data.fields.Name.value;
            this.createdById = data.fields.CreatedById.value;
            this.createdDate = data.fields.CreatedDate.value;
            this.lastModifiedById = data.lastModifiedById;
            this.lastModifiedDate = data.lastModifiedDate;
            this.getCreatedByName();
            this.getlastModifiedByName();
        }else if(error){
            this.error = error;
            this.records = undefined;
        }
    }

    handleOnload(){
        console.log('recordId',this.recordId);
        this.load = true;
    }

    //CreateByName 가져오기
    getCreatedByName(){
        // console.log('getCreatedByName');
        getName({inputId: this.createdById})
        .then((data) =>{
            // console.log('createdByName-data =>', data);
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
            // console.log('lastModifiedBy-data =>', data);
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

        if(this.isNew == true){
            this.navigateToLightningComponent(); //new page로 이동 (Save & New 버튼 눌렀을때)
        } else{
            this.modalClose();
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

    //new page로 이동 (Save & New 버튼 눌렀을때)
    navigateToLightningComponent() {
        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__aContactNewAura"
            }
        });
    }






}