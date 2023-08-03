import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningConfirm from 'lightning/confirm';
import getRecordById from '@salesforce/apex/aCaseController.getRecordById';
import getaCaseTeamList from '@salesforce/apex/aCaseTeamController.getaCaseTeamList';
import { CurrentPageReference } from 'lightning/navigation';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import PROFILE_FIELD from '@salesforce/schema/User.Profile.Name';

export default class ACaseView extends NavigationMixin(LightningElement) {
    @api recordId;
    userId = USER_ID;
    modal = false;
    editmodal = false;
    teamNewModal = false;
    data;
    error;
    caseNumber;
    subject;
    Status;
    priority;
    teamData;
    teamDataLength;
    TeamBoolean = false;
    accessable = false;
    // accessable = true;
    userProfileName;

    @wire(getRecord, {recordId: '$userId', fields:[PROFILE_FIELD]})
    userData({error, data}){
        if(data){
            console.log('uData => ', data);
            this.userProfileName = data.fields.Profile.displayValue;

            if(this.userProfileName == 'System Administrator'){
                this.accessable = true;
            }

        } else if(error){
            console.log('userData Error=>', error);
        }
    }

    connectedCallback(){
        this.callList();
        this.callaCaseTeamList();
    }

    // @wire(CurrentPageReference)
    // getStateParameters(currentPageReference) {
    //    if (currentPageReference) {
    //         console.log('currentPageReference', currentPageReference);
    //         this.urlId = currentPageReference.state?.id;
    //    }
    // }

    callList(){
        getRecordById({recordId: this.recordId})
        .then((data)=>{
            this.data = data;
            this.error = undefined;
            // console.log('data =>',this.data);
            this.caseNumber = data.Name;
            this.subject = data.Subject__c;
            this.Status = data.Status__c;
            this.priority = data.Priority__c;
        })
        .catch((error) => {
            console.log('callList Error=>', error);
        });
    }

    callaCaseTeamList(){
        getaCaseTeamList({recordId: this.recordId})
        .then((teamData)=>{
            this.teamData = teamData;
            this.error = undefined;
            // console.log('teamData =>',this.teamData);
            // console.log('teamData.length =>',this.teamData.length);
            this.teamDataLength = this.teamData.length;
            
            if(this.teamDataLength>0) this.TeamBoolean = true;
            else this.TeamBoolean = false;
        })
        .catch((error) => {
            console.log('Error=>', error);
        });
    }

    
    editSuccess(event){
        // console.log(event.detail);
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record Number: ' + event.detail.fields.Name.value,
            variant: 'success',
        });
        this.dispatchEvent(evt);

        this.callList();
    }

    openModal(){
        this.modal = true;
    }

    openEditModal(){
        this.editmodal = true;
    }
    
    closeModal(){
        this.modal = false;
        this.editmodal = false;
        this.teamNewModal = false;
        this.callList();
        this.callaCaseTeamList();
    }
    
    openTeamModal(){
        this.teamNewModal = true;
    }


    // aCase 레코드 삭제
    async recordDelete(){
        const result = await LightningConfirm.open({
            message: 'Are you sure you want to delete this aCase?',
            variant: 'Delete aCase',
            theme: 'warning',
            label: 'Delete aCase'
        });

        // console.log('result', JSON.parse(JSON.stringify(result)));

        if(result == true){
            deleteRecord(this.recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                // 삭제 완료 후 All List page로 이동
                this[NavigationMixin.Navigate]({
                    type: "standard__component",
                    attributes: {
                        componentName: "c__aCaseAllListAura"
                    }
                });

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

    // team 레코드 삭제
    teamDelete(event){
        let targetId = event.target.dataset.msg;
        // console.log('targetId', targetId);

        deleteRecord(targetId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                this.callaCaseTeamList();
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