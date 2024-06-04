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

import makeUserDisabled from '@salesforce/apex/UserAdminController.makeUserDisabled';

const columns = [
	{ label: 'Name', fieldName: 'Name' },
	{ label: 'Email', fieldName: 'Email' },
	{ label: 'Username', fieldName: 'Username' },
	{ label: 'Division', fieldName: 'DIvision' },
	{ label: 'Department', fieldName: 'Department' },
];

export default class UserAdminLazyToModal extends LightningElement {

	@api	mode;
	@api	users;

	@track	title = '';
	@track	columns = columns;
	@track	employees = [];
	@track	total = 0;
	@track	searchText = '';
	@track	pageNum = 1;
	@track	selectedEmployee = null;
	@track	showSpinner = false;

	connectedCallback(){
		if(this.mode == 'inactive'){
			this.title = 'Make Inactive';
		} else {
			this.title = 'Make Freeze';
		}
		this.log(this.users);
	}

	closeModal(){
		var customEvent = new CustomEvent("close", { detail : { modalName : 'editUser', employee : null }});
		this.dispatchEvent(customEvent);
	}

	async clickMake(){
		try {
			var userIds = [];

			this.users.forEach(usr => {
				userIds.push(usr.id);
			});

			this.showSpinner = true;
			const result = await makeUserDisabled({
				userIds : userIds,
				mode : this.mode
			});

			if(result){
				this.showMyToast('success', 'Information', 'Users successfully inactivated/frozen.');
			}

			this.showSpinner = false;
			this.closeModal();
		} catch(e){
			this.log('clickMake exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
			this.closeModal();		
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