import { LightningElement, api} from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

import getPicklistValues from '@salesforce/apex/TaskEditController.getPicklistValues';
import getTask from '@salesforce/apex/TaskEditController.getTask';

export default class TaskEdit extends NavigationMixin(LightningElement) {
    @api recordId;
    Status;
    Subject;
    Priority;

    AssignedValue;
    NameValue;
    RelatedValue;
    StatusValue = 'Not Started';
    SubjectValue = 'Call';
    PriorityValue = 'Normal';
    DateValue;
    CommentValue;

    createdByName;
    lastModifiedByName;

    connectedCallback(){
        console.log('LWC 레코드Id check =', this.recordId);
        this.pickList();
        
        if(this.recordId){
            // Task 데이터 가져오기
            this.getTaskData();
        }
    }

    /* 
    * pickList value 가져오기
    */
    pickList(){
        // Status
        getPicklistValues({ objectName: 'Task', fieldName: 'Status' }) 
        .then((data) => {
            // console.log('data = ', data);
            this.Status = data.map(item => ({
                label: item,
                value: item
            }));
        })
        .catch((error) => {
            console.log('error = ', error);
        })

        // Subject
        getPicklistValues({ objectName: 'Task', fieldName: 'Subject' }) 
        .then((data) => {
            // console.log('data = ', data);
            this.Subject = data.map(item => ({
                label: item,
                value: item
            }));
        })
        .catch((error) => {
            console.log('error = ', error);
        })

        // Priority
        getPicklistValues({ objectName: 'Task', fieldName: 'Priority' }) 
        .then((data) => {
            // console.log('data = ', data);
            this.Priority = data.map(item => ({
                label: item,
                value: item
            }));
        })
        .catch((error) => {
            console.log('error = ', error);
        })
    }
          
    get StatusOptions() {
        return this.Status;
    }

    get SubjectOptions() {
        return this.Subject;
    }

    get PriorityOptions() {
        return this.Priority;
    }

    
    /* Status Change event */
    StatusChange(event) {
        this.StatusValue = event.detail.value;
        console.log('Status =', this.StatusValue);
    }

    /* Subject Change event */
    SubjectChange(event) {
        this.SubjectValue = event.detail.value;
        console.log('Subject =', this.SubjectValue);
    }

    /* Priority Change event */
    PriorityChange(event) {
        this.PriorityValue = event.detail.value;
        console.log('Priority =', this.PriorityValue);
    }


    /* 
    * Task Data 가져오기
    */
    getTaskData(){
        getTask({taskId: this.recordId})
		.then((data) => {
            console.log('Task data = ', data);

            // 데이터가 있는 경우
            if(data && Object.keys(data).length > 0){
                this.AssignedValue = data.Owner.Name;
                this.NameValue = data.Who.Name;
                this.RelatedValue = data.What.Name;
                this.StatusValue = data.Status;
                this.SubjectValue = data.Subject;
                this.PriorityValue = data.Priority;
                this.DateValue = data.ActivityDate;
                this.CommentValue = data.Description;
                this.createdByName = data.CreatedBy.Name;
                this.lastModifiedByName = data.LastModifiedBy.Name;
            }else{
                console.log('데이터 없음');
            }

        })
        .catch((error) => {
            console.log('getTaskData error = ', JSON.stringify(error));
        })
    }

    
    /* modal 닫기 - Task home 화면으로 이동 */
    modalClose(){
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Task',
                actionName: 'home'
            },
        });
    }

}