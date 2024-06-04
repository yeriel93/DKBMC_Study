/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
const DEBUG = false;

import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import resetPassword from '@salesforce/apex/UserAdminController.resetPassword';

const columns = [
	{ label: 'Name', fieldName: 'Name' },
	{ label: 'Email', fieldName: 'Email' },
	{ label: 'Username', fieldName: 'Username' },
	{ label: 'Division', fieldName: 'Division' },
	{ label: 'Department', fieldName: 'Department' }
];

export default class UserAdminPasswordResetModal extends LightningElement {

	@api	users;

	@track	mode;
	@track	columns = columns;
	@track	pattern = '(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}'; // "(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}" 
	@track	employees = [];
	@track	total = 0;
	@track	selectedUser = null;
	@track	newPassword = null;
	@track	confirmPassword = null;
	@track	showSpinner = false;
	@track	showValidation = false;
	@track	showInputSection = false;
	@track	showConfirmed = false;

	closeModal(){
		var customEvent = new CustomEvent("close", { detail : { modalName : 'reset' }});
		this.dispatchEvent(customEvent);
	}

	clickSendReset(){
		this.log('clickSendReset');
		var userInfos = [];

		this.users.forEach(usr => {
			userInfos.push(usr.Username);
		});

		//this.passwordHandler(userInfos, 'sendurl');
		this.closeModal();
	}

	clickResetPassword(){
		this.log('clickResetPassword');
		this.showInputSection = true;
	}

	clickSetPassword(){
		this.log('clickSetPassword');

		if(this.showConfirmed){
			var userInfos = [];
			this.users.forEach(usr => {
				userInfos.push(usr.Id);
			});

			//this.passwordHandler(userInfos, 'manual');
			this.closeModal();
		}
	}

	async passwordHandler(userInfos, mode){
		this.log('passwordHandler -> ', mode);
		try {
			this.showSpinner = true;
			const result = await resetPassword({
				userInfos : userInfos,
				mode : mode,
				newPassword : self.newPassword 
			});

			if(result){
				this.showMyToast('success', 'Information', 'Reset password successfully.');
			}
			this.showSpinner = false;
			this.closeModal();	
		} catch(e){
			console.log('passwordHandler exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
			this.closeModal();
		}
	}

	newFocus(){
		this.showValidation = true;
	}

	newBlur(){
		this.showValidation = false;	
	}

	changeNewPassword(event){
		this.log('Password validation started.');
		var letters = /[A-Za-z]/g,
			number = /[0-9]/g,
			special = /[@$!%*?&]/g;

		this.newPassword = event.target.value;
		if(this.newPassword.match(letters)){
			this.template.querySelector('[data-id="letter"]').classList.remove("invalid");
			this.template.querySelector('[data-id="letter"]').classList.add("valid");
		} else {
			this.template.querySelector('[data-id="letter"]').classList.remove("valid");
			this.template.querySelector('[data-id="letter"]').classList.add("invalid");
		}
		if(this.newPassword.match(number)){
			this.template.querySelector('[data-id="number"]').classList.remove("invalid");
			this.template.querySelector('[data-id="number"]').classList.add("valid");
		} else {
			this.template.querySelector('[data-id="number"]').classList.remove("valid");
			this.template.querySelector('[data-id="number"]').classList.add("invalid");
		}
		if(this.newPassword.match(special)){
			this.template.querySelector('[data-id="special"]').classList.remove("invalid");
			this.template.querySelector('[data-id="special"]').classList.add("valid");
		} else {
			this.template.querySelector('[data-id="special"]').classList.remove("valid");
			this.template.querySelector('[data-id="special"]').classList.add("invalid");
		}
		if(this.newPassword.length >= 8){
			this.template.querySelector('[data-id="length"]').classList.remove("invalid");
			this.template.querySelector('[data-id="length"]').classList.add("valid");
		} else {
			this.template.querySelector('[data-id="length"]').classList.remove("valid");
			this.template.querySelector('[data-id="length"]').classList.add("invalid");
		}

		this.log('Password validation finished.');
	}

	changeConfirmPassword(event){
		this.log('changeConfirmPassword');
		var confirm = event.target.value,
		newPassword = this.newPassword;
		if(newPassword == confirm){
			this.showConfirmed = true;
		} else {
			this.showConfirmed = false;
		}
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