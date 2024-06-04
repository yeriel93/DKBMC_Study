/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
const DEBUG = true;

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import retrieveLicense from '@salesforce/apex/UserAdminController.retrieveLicense';

export default class UserAdminLicense extends LightningElement {

	@track	licenses = {};

	async connectedCallback(){
		try {
			const result = await retrieveLicense();
			this.licenses = result;
			this.licenses.avail = result.total - result.used;
			this.log('license -> ', this.licenses);
		} catch(e){
			this.log('connectedCallback exception -> ', e);
			this.errorHandler(e);
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