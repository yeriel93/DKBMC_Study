import { LightningElement, api, track, wire } from 'lwc';
import getaCaseRecords from '@salesforce/apex/aCaseController.getaCaseRecords';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord } from 'lightning/uiRecordApi';
import aCase_OBJECT from '@salesforce/schema/aCase__c';
import Status_FIELD from '@salesforce/schema/aCase__c.Status__c';
import Priority_FIELD from '@salesforce/schema/aCase__c.Priority__c';
import Origin_FIELD from '@salesforce/schema/aCase__c.Origin__c';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { RefreshEvent } from 'lightning/refresh';

// rowAction label
const actions = [
    { label: 'Edit', name: 'Edit' },
    { label: 'Delete', name: 'Delete' },
];

// dataTable columns
const columns = [
    { label: 'Name', 
        fieldName: 'aCaseURL', 
        type:'url', 
        typeAttributes:{ label:{fieldName: 'Name'}}, 
        sortable: true,
        editable: true},
    // { label: 'ContactName', fieldName: 'contactName', sortable: true, editable: true },
    // { label: 'ContactName', 
    //     fieldName: 'contactName', 
    //     sortable: true, 
    //     // editable: true, 
    //     type: 'lookupColumn',
    //     typeAttributes: {
    //         object: 'aCase', //object name which have lookup field
    //         fieldName: 'aContactId__c',  //lookup API field name 
    //         value: { fieldName: 'aContactId__c' },  //lookup API field name 
    //         context: { fieldName: 'Id' }, 
    //         name: 'aContact__c',  //lookup object API Name 
    //         fields: ['aContactId__r.Name'], //lookup objectAPIName.Name
    //         target: '_self'
    //     },
    // },
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
    // { label: 'Priority__c', 
    //     fieldName: 'Priority__c', 
    //     type: 'picklistColumn', 
    //     sortable: true, 
    //     editable: true,
    //     typeAttributes:{placeholder: 'Choose Priority', 
    //                     options: { fieldName: 'pickListPriority'},
    //                     value: { fieldName: 'Priority__c'}, // default value for picklist
    //                     context: { fieldName: 'Id' } // binding aCase Id with context variable to be returned back
    //                     }
    // },
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
    // { label: 'Case Origin', fieldName: 'Origin__c', sortable: true, editable: true },
    { label: 'CreatedDate', fieldName: 'CreatedDate', type: 'date', sortable: true, editable: true },
    { label: 'Owner', fieldName: 'OwnerName', sortable: true, editable: true },
    { type: 'action', typeAttributes: { rowActions: actions }}
];

export default class ACaseAllList extends NavigationMixin(LightningElement) {
    @api recordId;
    @track dataList;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    @track viewAllUrl = '';
    @track pickListOptions;
    @track pickListPriority;
    @track pickListOrigin;
    @track pickList;
    @track aCaseData;
    allList = true;
    newModal = false;
    editmodal = false;
    showSpinner = false;
    error;
    editId;
    dataListLength;
    Keywords = {};
    searchKeywordList;
    saveDraftValues = [];
    StatusOptions;
    PriorityOptions;
    OriginOptions;

    @track contactData;
    @track data = [];
    lastSavedData = [];
    

    //aCase 리스트 불러오기
    callList(){
        getaCaseRecords({searchKeywords : this.searchKeywordList})
        .then((data)=>{
            this.dataList = data;
            this.dataListLength = this.dataList.length;
            // this.contactData = data;
            // console.log('data = ', data);

            if(this.dataList){
                this.dataList.forEach(i => {
                    i['aCaseURL'] = '/lightning/r/aCase__c/'+i['Id'] +'/view';
                    i['OwnerName'] = i.Owner.Name;
                    i['pickListOptions'] = this.pickListOptions;
                    i['pickListPriority'] = this.pickListPriority;
                    i['pickListOrigin'] = this.pickListOrigin;
                    // if(i.aContactId__c != undefined){
                    //     i['contactName'] = i.aContactId__r.Name;
                    // }
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
            this.StatusOptions = data.values;
            // console.log('getPicklistValues data (Status_FIELD) =', data.values);

            this.callList();

        } else if (error) {
            console.log('error =>', error);
        }
    }

    // //Priority__c value 값 가져오기 
    // @wire(getPicklistValues, { recordTypeId: "$objectInfo.data.defaultRecordTypeId", fieldApiName: Priority_FIELD})
    // PickList({error, data}) {
    //     if (data) {
    //         this.pickListPriority = data.values;
    //         this.PriorityOptions = data.values;
    //         console.log('getPicklistValues data (Priority_FIELD) =', data.values);

    //         this.callList();

    //     } else if (error) {
    //         console.log('error =>', error);
    //     }
    // }

    //Origin__c value 값 가져오기 
    @wire(getPicklistValues, { recordTypeId: "$objectInfo.data.defaultRecordTypeId", fieldApiName: Origin_FIELD})
    PickList({error, data}) {
        if (data) {
            this.pickListOrigin = data.values;
            this.OriginOptions = data.values;

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

// ======================================================== search ======================================================================

    // 검색 이벤트
    searchHandle(){
        // console.log('inputV', this.template.querySelectorAll('.inputTag'));
        const list = this.template.querySelectorAll('.inputTag');
        this.searchKeywordList = [];

        list.forEach(i => {
            // console.log(i.value);
            // console.log('fieldName => ', i.dataset.fieldname);
            this.Keywords = {
                                'fieldName' : i.dataset.fieldname, 
                                'value' : i.value != undefined ? i.value : ''
                            };

            this.searchKeywordList.push(this.Keywords);                    
        });
        console.log('searchKeywordsList =>', JSON.parse(JSON.stringify(this.searchKeywordList)));

        //리스트 불러오기
        this.callList();
    }

    //검색값 리셋
    resetHandle(){
        const list = this.template.querySelectorAll('.inputTag');
        console.log('input =>', list);
        if(list){
            list.forEach(field => {
                field.value = '';
            });
        }
        //리스트 불러오기
        this.searchKeywordList = [];
        this.callList();
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
            default:
        }
    }


    // 레코드 수정 modal 띄우기
    editRow(row){
        console.log('edit row =>', row);
        this.editId = row.Id;
        console.log('editId =>', this.editId);
        
        //edit modal 띄우기
        this.editmodal = true;
    }
    
    // 레코드 삭제
    deleteRow(row){
        console.log('delete row =>', row);
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

// ======================================================== Modal ===============================================================

    // edit modal 닫기
    closeEditModal(){
        this.editmodal = false;
        this.callList();
    }

    // new modal 열기
    openNewModal(){
        this.newModal = true;
    }
    
    //new modal 닫기
    closeNewModal(){
        this.newModal = false;
        this.callList();
    }
    
    //새로고침
    refreshList(){
        this.callList();
    }
}