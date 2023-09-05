import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord, getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Name_FIELD from '@salesforce/schema/aAccount__c.Name';
import relatedaContact from '@salesforce/apex/aAccountController.relatedaContact';

export default class ContactRelatedList extends NavigationMixin(LightningElement) {
    @api recordId;
    @api recordName;
    @track viewAllUrl = '';

    aContactList = [];
    error;
    aContactListlength;
    targetId;
    aContactModal = false;


    // 이름 가져오기
    @wire(getRecord, {recordId: '$recordId', fields: Name_FIELD}) 
    NameRecord({error, data}) {
        if(error) {
            this.error = error;
            this.records = undefined;
        } else if(data) {
            this.records = data;
            this.error = undefined;
            // console.log('data =>', data);
            this.recordName = data.fields.Name.value;
            this.generateViewAllUrl();
        }
    }


    connectedCallback(){
        this.getaCotactList();
    }
    
    // aContact List 불러오기
    getaCotactList(){
        relatedaContact({aAccountId: this.recordId})
        .then((data)=>{
            this.aContactList = data;
            this.error = undefined;
            this.aContactListlength = this.aContactList.length;
            this.aContactList = this.aContactList.slice(0,6); //최대 6개까지만 보일 수 있도록 설정
            // console.log('recordId =>', this.recordId);
            // console.log('aContactList => ', this.aContactList);
            // console.log('data =>', data);
            // console.log('aContactListlength =>', this.aContactList.length);
        })
        .catch((error)=>{
            this.error = error;
            this.aContactList = undefined;
        })
    }

    // ContactModal
    NewaContact(){
        this.aContactModal = true;
    }

    closeModal(){
        this.aContactModal = false;
        //window.location.reload();
        this.getaCotactList();
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
            
            // 삭제 완료 후 데이터 다시 가져와서 뿌려주기(새로고침 느낌)
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

    
    generateViewAllUrl(){
        // this[NavigationMixin.Navigate]({
        //     type: 'standard__component',
        //     attributes: {
        //         componentName: 'c__aContactViewAllAura'
        //     },
        //     state: {
        //         c__recordName : this.recordName,
        //         c__aAccountId : this.recordId 
        //     }
        // })

        //url 만들어서 원하는 데이터 같이 던져주기 (쿼리스트링느낌?) -> 데이터 담긴 url을 만들어서 변수에 담고 페이지 생성시 변수에 담아주면됨
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__aContactViewAllAura'
            },
            state: {
                c__recordName : this.recordName,
                c__aAccountId : this.recordId 
            }
        })
        .then(url => {
            this.viewAllUrl = url
            console.log('this.viewAllUrl =>', this.viewAllUrl);
        });
    }
}