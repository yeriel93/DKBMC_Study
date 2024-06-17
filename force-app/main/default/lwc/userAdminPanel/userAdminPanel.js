/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 05-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
const DEBUG = false;	// 디버그 모드 비활성화
// const DEBUG = true;		// 디버그 모드 활성화

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import checkSystemAdmin from '@salesforce/apex/UserAdminController.checkSystemAdmin';

export default class UserAdminPanel extends LightningElement {

	@track	isAdmin = false;
	@track	activeTab = 'users';

	/* 
    * 로그인한 User의 profile이 Admin인지 체크
    */
	async connectedCallback(){
		try {
			const result = await checkSystemAdmin();
			// ⬇ 이렇게만 작동시키면 비동기 작업이 완료이 되지 않아 결과값을 콘솔에 찍었을때 "Promise {<pending>}" 이런식으로 찍힘	
			// const result = checkSystemAdmin();	

			this.log('checkSystemAdmin -> ', result);
			this.isAdmin = result;
		} catch(e){
			this.log('connectedCallback exception -> ', e);
			this.errorHandler(e);
		}
	}

	clickTab(event){
		// event.preventDefault();
		// event.stopPropagation();
		this.activeTab = event.target.value;
		this.log("tab click = ", this.activeTab);
	}

	log(msg, variable){ if(DEBUG){ console.log(msg, variable == undefined ? '' : variable); } }

	errorHandler(error){
		if(error.body != undefined){
			this.showMyToast('error', 'Error', error.body.message, 'sticky');
		} else if(error.message != undefined){
				this.showMyToast('error', 'Error', error.message, 'sticky');
		} else if(typeof error == 'string'){
			this.showMyToast('error', 'Error', error, 'sticky');
		} else {
			console.log('Unknown error -> ', error);
			this.showMyToast('error', 'Error', 'Unknown error in javascript controller/helper.', 'sticky');
		}
	}

	showMyToast(variant, title, msg, mode){
		let dismissible = mode != undefined ? mode : 'dismissible';
		const event = new ShowToastEvent({
			"variant" : variant,
			"title" : title,
			"message" : msg,
			"mode" : dismissible
		});
		this.dispatchEvent(event);
	}
}