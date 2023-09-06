import { LightningElement, api, wire } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import relatedaContact from '@salesforce/apex/aAccountController.relatedaContact'

const actions = [
    {label: 'Edit', name: 'Edit'},
    {label: 'Delete', name: 'Delete'}
];

const columns = [
    { label: 'Name', fieldName: 'Name' },
    { label: 'Title', fieldName: 'Title__c' },
    { label: 'Department', fieldName: 'Department__c' },
    { label: 'phone', fieldName: 'Phone__c' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class AContactViewAll extends NavigationMixin(LightningElement) {
    @api aAccountId;
    @api aAccountName;
    columns = columns;
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'Edit':
                this.recordEdit(row);
                break;
            case 'Delete':
                this.recordDelete(row);
                break;
            default:
        }
    }

    // Edit
    recordEdit(row){
        // console.log('TargetId =>', row.Id);

        // aContact__c Edit page로 이동
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: row.Id,
                objectApiName: 'aContact__c',
                actionName: 'edit'
            },
        });
    }

    // Delete
    recordDelete(row){
        // console.log('TargetId =>', row.Id);

        deleteRecord(row.Id)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted',
                    variant: 'success'
                })
            );
            
            // 목록 새로고침
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