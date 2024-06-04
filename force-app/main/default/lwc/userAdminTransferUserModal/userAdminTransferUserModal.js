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

import shutoutUser from '@salesforce/apex/UserAdminController.shutoutUser';

import USER_ID            from '@salesforce/schema/User.Id';
import USER_LASTNAME      from '@salesforce/schema/User.LastName';
import USER_FIRSTNAME     from '@salesforce/schema/User.FirstName';
import USER_ALIAS         from '@salesforce/schema/User.Alias';
import USER_TITLE         from '@salesforce/schema/User.Title';
import USER_PROFILE_ID    from '@salesforce/schema/User.ProfileId';
import USER_USERROLE_ID   from '@salesforce/schema/User.UserRoleId';
import USER_IS_ACTIVE     from '@salesforce/schema/User.IsActive';
import USER_USERNAME      from '@salesforce/schema/User.Username';
import USER_EMAIL         from '@salesforce/schema/User.Email';
import USER_DIVISION      from '@salesforce/schema/User.Division';
import USER_DEPARTMENT    from '@salesforce/schema/User.Department';
import USER_SSO_ID        from '@salesforce/schema/User.FederationIdentifier';

export default class UserAdminTransferUserModal extends LightningElement {

	@api	userData;
	@api	oldUser;

	@track User = {
		Id         : USER_ID,
		LastName   : USER_LASTNAME,
		FirstName  : USER_FIRSTNAME,
		Alias      : USER_ALIAS,
		Title      : USER_TITLE,
		ProfileId  : USER_PROFILE_ID,
		RoleId     : USER_USERROLE_ID,
		IsActive   : USER_IS_ACTIVE,
		Username   : USER_USERNAME,
		Email      : USER_EMAIL,
		Division   : USER_DIVISION,
		Department : USER_DEPARTMENT,
		SSOID      : USER_SSO_ID,
	};

	async handleSubmit(event){
		try {
			this.log('click submit');
			event.preventDefault();       // stop the form from submitting
	
			this.showSpinner = false;
			// const result = await shutoutUser({ userId : this.oldUser.Id });

			// if(result){
			// 	this.showMyToast('success', 'Information', 'User successfully transfered.');
			// 	const fields = event.detail.fields;
			// 	this.template.querySelector('lightning-record-edit-form').submit(fields);
			// } else {
			// 	this.showMyToast('error', 'Error', 'User transfer error.');
			// }
			this.showSpinner = false;
			this.closeModal();
		} catch(e){
			this.log('handleSubmit exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
			this.closeModal();
		}
	}

	handleSuccess(event){
		this.log('on success');
		this.closeModal();
	}

	closeModal(){
		var customEvent = new CustomEvent("close", { detail : { modalName : 'transfer'}});
		this.dispatchEvent(customEvent);
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