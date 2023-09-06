import { LightningElement, api, track, wire } from 'lwc';
import relatedaContact from '@salesforce/apex/aAccountController.relatedaContact';
import upsertaContact from '@salesforce/apex/aAccountController.upsertaContact';
import { deleteRecord } from 'lightning/uiRecordApi';
// import COM_LAB_CANCEL from '@salesforce/label/c.COM_LAB_CANCEL';

export default class RelatedaContactList extends LightningElement {
    @api recordId;
    @track aContactList = [];
    error;
    id;
    index;

    connectedCallback(){
        this.getaCotactList();
        // console.log('COM_LAB_CANCEL =>', COM_LAB_CANCEL);
    }

    modalClose(){
        // console.log('recordId =>', this.recordId);
        // window.history.back();
        this.dispatchEvent(new CustomEvent("closeevent"));
    }

    // aContact List 불러오기
    getaCotactList(){
        relatedaContact({aAccountId: this.recordId})
        .then((data)=>{
            this.aContactList = data;
            this.error = undefined;
            // console.log('this.aContactList', this.aContactList);
            // console.log('data', data);
        })
        .catch((error)=>{
            this.error = error;
            this.aContactList = undefined;
        })
    }

    //Add 버튼
    addLow(){
        // console.log('before', this.aContactList.length);
        let test = {
            'LastName__c': '',
            'FirstName__c': '',
            'Title__c': '',
            'Phone__c': '',
            'Department__c': '',
            'aAccountId__c' : this.recordId
        };
        this.aContactList.push(test);
        // console.log('after', this.aContactList.length);
        
    }

    //input 태그 data 가져오기
    inputData(event){
        // console.log('event.target=> ', event.target.value);
        // console.log('index', event.target.dataset.idx);
        // console.log('fieldname', event.target.dataset.fieldname);

        this.aContactList[event.target.dataset.idx][event.target.dataset.fieldname] = event.target.value;
        this.aContactList[event.target.dataset.idx]['Id'] = event.target.dataset.id;
        // console.log('aContactList input value check =>', JSON.parse(JSON.stringify(this.aContactList)));
    }
    
    // 저장&수정
    save(){
        console.log('aContactList 업데이트 전 =>', JSON.parse(JSON.stringify(this.aContactList)));
        upsertaContact({upsertData : this.aContactList})
        .then(()=>{
            console.log('aContactList 업데이트 후 =>', JSON.parse(JSON.stringify(this.aContactList)));
            this.modalClose();
        })
        .catch((error)=>{
            this.error = error;
            this.aContactList = undefined;
        })
    }

    // 삭제
    deleteLow(event){
        // console.log('index', event.target.dataset.idx);
        // console.log('id', event.target.dataset.id);

        this.id = event.target.dataset.id;
        this.index = event.target.dataset.idx;

        //레코드 삭제
        deleteRecord(this.id)
        .then(() => {
            // 해당 인덱스 삭제
            this.aContactList.splice(parseInt(this.index),1);
            this.getaCotactList();

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