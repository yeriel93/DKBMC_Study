import { LightningElement, track, api, wire } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
//import LightningModal from 'lightning/modal';

export default class TestModal extends NavigationMixin(LightningElement) {
    @api recordId; // api 어노테이션으로 recordId 받아오기 => 이렇게 선언할 경우 record detail 페이지에서는 현재페이지의 recordId 가져옴
    @api contents;
    @api modalOpen = false; //modal의 표시를 제어하기 위한 Boolean 값

    connectedCallback(){ //connectedCallback 은 Component가 Dom에 생성된후 동작되는 함수 => init 메소드와 동일
        console.log('recordId =>', this.recordId);
        console.log('contents =>', this.contents);
    }

    handleSuccess(event){//submit 성공후 동작 처리 메소드
        console.log('Handle Success');
        console.log('event detail => ', JSON.parse(JSON.stringify(event.detail)));
        this.showMyToast('success', 'Success', '저장완료');

        this.navigateToRecordPage(event.detail.id);
    }

    handleClose(){ //modal을 닫기위한 메소드
        //this.close('Close');

        //const closeEv = new CustomEvent('closemodal'); //custom Event 의 이름이 'closemodal'일경우 => 부모 컴포넌트에서 onclosemodal 로 받을수 있음 (onclick,onchange 처럼 callback함수 등록)
        //this.dispatchEvent(closeEv);

        this.dispatchEvent(new CloseActionScreenEvent()); //action Button 등록할경우 close 할때 사용

    }

    navigateToRecordPage(accountId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: accountId,
                actionName: 'view'
            }
        });
    }

    showMyToast(variant, title, msg, mode){
		let dismissible = mode != undefined ? mode : 'dismissible';
		const event = new ShowToastEvent({ // showToastEvent 에 필요한 정보들
			"variant" : variant,
			"title" : title,
			"message" : msg,
			"mode" : dismissible //mode는 없어도 됨
		});
		this.dispatchEvent(event);
	}
}