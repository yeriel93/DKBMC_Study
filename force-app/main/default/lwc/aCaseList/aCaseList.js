import { LightningElement,api, wire, track } from 'lwc';
import getaCaseRecords from '@salesforce/apex/aCaseController.getaCaseRecords';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import aCase_OBJECT from '@salesforce/schema/aCase__c';
import Status_FIELD from '@salesforce/schema/aCase__c.Status__c';
import Origin_FIELD from '@salesforce/schema/aCase__c.Origin__c';

// Lightning Message Service
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import aCase_FILTERED_MESSAGE from '@salesforce/messageChannel/aCaseFiltered__c';
import aCase_SELECTED_MESSAGE from '@salesforce/messageChannel/aCaseSelected__c';

// rowAction label
const actions = [
    { label: 'Edit', name: 'Edit' },
    { label: 'Delete', name: 'Delete' },
    { label: 'DetailCard', name: 'DetailCard' },
];

// dataTable columns
const columns = [
    { label: 'Name', 
        fieldName: 'aCaseURL', 
        type:'url', 
        typeAttributes:{ label:{fieldName: 'Name'}}, 
        sortable: true,
        editable: true},
    { label: 'Subject__c', fieldName: 'Subject__c', sortable: true, editable: true },
    { label: 'Status__c', 
        fieldName: 'Status__c', 
        type: 'picklistColumn', 
        sortable: true, 
        editable: true,
        typeAttributes:{placeholder: 'Choose Status', 
                        options: { fieldName: 'pickListOptions'},
                        value: { fieldName: 'Status__c'}, // default value for picklist
                        context: { fieldName: 'Id' } // binding aCase Id with context variable to be returned back
                        }
    },
    { label: 'Origin__c', 
        fieldName: 'Origin__c', 
        type: 'picklistColumn', 
        sortable: true, 
        editable: true,
        typeAttributes:{placeholder: 'Choose Origin__c', 
                        options: { fieldName: 'pickListOrigin'},
                        value: { fieldName: 'Origin__c'}, // default value for picklist
                        context: { fieldName: 'Id' } // binding aCase Id with context variable to be returned back
                        }
    },
    { label: 'CreatedDate', fieldName: 'CreatedDate', type: 'date', sortable: true, editable: true },
    { label: 'Owner', fieldName: 'OwnerName', sortable: true, editable: true },
    { type: 'action', typeAttributes: { rowActions: actions }}
];

export default class ACaseList extends NavigationMixin(LightningElement) {
    columns = columns;
    aCaseFilterSubscription;
    searchKeywordList;
    @track dataList;
    @track sortBy;
    @track sortDirection;
    @track viewAllUrl = '';
    @track pickListOptions;
    @track pickListOrigin;
    saveDraftValues = [];
    allList = true;
    showSpinner = false;
    editmodal = false;

    // messageContext 객체
    @wire(MessageContext) 
    messageContext;

    connectedCallback() {
        this.callList();
        // Filter component에서 보내준 데이터 받기
        this.aCaseFilterSubscription = subscribe(
            this.messageContext,
            aCase_FILTERED_MESSAGE,
            (message) => this.handleFilterChange(message)
        );
    }
    
    //Filter component에서 보내준 데이터 전달 
    handleFilterChange(message) {
        // console.log('message = ', message.filters);
        //메세지로 넘어온 데이터는 proxy(프록시)때문에 제대로 된 데이터가 apex로 안 넘어갈 수 있어서 한번 풀어서 다시 리스트로 넣어줌
        let parseList = [];
        message.filters.forEach(i =>{
            parseList.push(i);
        });
    
        this.searchKeywordList = parseList;
        // console.log('List => searchKeywordList ', JSON.parse(JSON.stringify(this.searchKeywordList)));
        
        this.callList();
    }

    //aCase List 가져오기 
    callList(){
        getaCaseRecords({searchKeywords : this.searchKeywordList})
        .then((data)=>{
            this.dataList = data;
            // console.log('dataList = ', this.dataList);

            if(this.dataList){
                this.dataList.forEach(i => {
                    i['aCaseURL'] = '/lightning/r/aCase__c/'+i['Id'] +'/view';
                    i['OwnerName'] = i.Owner.Name;
                    i['pickListOptions'] = this.pickListOptions;
                    i['pickListOrigin'] = this.pickListOrigin;
                });
            }
        })
        .catch((error) => {
            console.log('callList Error=>', error);
        });
    }

// ======================================================= dataTable editable =============================================================
    //aCase__c object 메타데이터 가져오기
    @wire(getObjectInfo,{ objectApiName: aCase_OBJECT})
    objectInfo;
    
    //Status__c value 값 가져오기 
    @wire(getPicklistValues, { recordTypeId: "$objectInfo.data.defaultRecordTypeId", fieldApiName: Status_FIELD})
    wirePickList({error, data}) {
        if (data) {
            this.pickListOptions = data.values;
            // console.log('getPicklistValues data (Status_FIELD) =', data.values);
            this.callList();

        } else if (error) {
            console.log('error =>', error);
        }
    }

    //Origin__c value 값 가져오기 
    @wire(getPicklistValues, { recordTypeId: "$objectInfo.data.defaultRecordTypeId", fieldApiName: Origin_FIELD})
    PickList({error, data}) {
        if (data) {
            this.pickListOrigin = data.values;
            // console.log('getPicklistValues data (Origin__c) =', data.values);
            this.callList();

        } else if (error) {
            console.log('error =>', error);
        }
    }

    // dataTable에서 하나의 필드값 수정 후 저장이벤트
    handleSave(event){
        this.showSpinner = true;
        this.allList = false;
        // console.log('draftValues', event.detail.draftValues);
        this.saveDraftValues = event.detail.draftValues;
        
        const recordInputs = this.saveDraftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        //레코드 업데이트
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises)
        .then(res => {
            this.ShowToast('Success', 'Records Updated Successfully!', 'success', 'dismissable');
            this.saveDraftValues = [];
            // return this.refresh();

        }).catch(error => {
            this.ShowToast('Error', 'An Error Occured!!', 'error', 'dismissable');

        }).finally(() => {
            this.saveDraftValues = [];
            this.callList();
            this.showSpinner = false;
            this.allList = true;
        });
    }

    //알림
    ShowToast(title, message, variant, mode){
        const evt = new ShowToastEvent({
                title: title,
                message:message,
                variant: variant,
                mode: mode
        });
        this.dispatchEvent(evt);
    }

// ======================================================== dataTable sort =============================================================

    //정렬 이벤트
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    //정렬 데이터
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.dataList));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.dataList = parseData;
    }

// ======================================================== dataTable rowAction =============================================================

    //rowAction
    handleRowAction(event){
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        // console.log('actionName =>', actionName);
        // console.log('row =>', row);

        switch(actionName){
            case 'Edit' :
                this.editRow(row);
                break;
            case 'Delete' :
                this.deleteRow(row);
                break;
            case 'DetailCard' :
                this.detailCardRow(row);
                break;
            default:
        }
    }

    // 레코드 수정 modal 띄우기
    editRow(row){
        // console.log('edit row =>', row);
        this.editId = row.Id;
        // console.log('editId =>', this.editId);
        
        //edit modal 띄우기
        this.editmodal = true;
    }
    
    // 레코드 삭제
    deleteRow(row){
        // console.log('delete row =>', row);
        // var { id } = row;
        // var index = this.findRowIndexById(id);
        const deleteId = row.Id;
        console.log('deleteId =>', deleteId);
        // console.log('before data =>', this.data);
        
        deleteRecord(deleteId)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Record deleted',
                    variant: 'success'
                })
            );
                
            //삭제 후 변경된 리스트를 다시 불러오지만 서버단에 가지고 않고 js에서 리스트에서 바로 삭제하도록 구현해보자
            this.callList();
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

    //디테일 카드로 id값 넘기기 
    detailCardRow(row){
        // console.log('name', row);
        let selectData = {
            aCaseId : row.Id,
            aCaseName : row.Name,
            aCaseSubject : row.Subject__c 
        };
        // console.log('selectData ', selectData);

        publish(this.messageContext, aCase_SELECTED_MESSAGE, {
            aCaseId: selectData
        });

    }

    // edit modal 닫기
    closeEditModal(){
        this.editmodal = false;
        this.callList();
    }
}