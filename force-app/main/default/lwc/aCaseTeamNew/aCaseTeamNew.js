import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ACaseTeamNew extends LightningElement {
    @api recordId;

    modalClose(){
        this.dispatchEvent(new CustomEvent('close'));
    }
    
    //저장 후 
    teamSaveSuccess(){
        const event = new ShowToastEvent({
            variant: 'success',
            title: 'Success',
            message: '등록 완료'
        });
        this.dispatchEvent(event); //이벤트 전달

        //모달창 종료 
        this.dispatchEvent(new CustomEvent('close'));
    }

    fail(event){
        console.log('error.detail = ', event.detail);
        console.log('errorCode = ', event.detail.output.errors[0].errorCode);

        let errorCode = event.detail.output.errors[0].errorCode;

        if(errorCode == 'DUPLICATES_DETECTED'){
            this.ToastEventHandle('warning', 'Duplicates User', '이미 해당 레코드에는 선택한 user가 등록되어있습니다.');
        
        }else if(errorCode == 'CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY'){
            this.ToastEventHandle('warning', 'Check Owner', '해당 레코드의 Owner에게 권한을 부여할 수 없습니다.');
        }
    }

    ToastEventHandle(variant, title, message){
        const ToastEvent = new ShowToastEvent({
            variant: variant,
            title: title,
            message: message
        });
        this.dispatchEvent(ToastEvent); //이벤트 전달
    }
}