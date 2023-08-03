import { LightningElement,api } from 'lwc';
// import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CloseaCase extends LightningElement {
    @api recordId

    modalClose(){
        this.dispatchEvent(new CustomEvent("closeevent"));
    }

    connectedCallback(){
        console.log('recordId =>', this.recordId);
    }

    onSuccenss(){
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '수정 완료'
        });
        this.dispatchEvent(event); //이벤트 전달

        // 알림 후 모달창 종료
        this.dispatchEvent(new CustomEvent("closeevent"));
    }
}