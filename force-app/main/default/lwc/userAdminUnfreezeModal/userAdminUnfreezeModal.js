/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
const DEBUG = false;

import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import retrieveFrozenUsers from '@salesforce/apex/UserAdminController.retrieveFrozenUsers';
import frozenHandler from '@salesforce/apex/UserAdminController.frozenHandler';


const columns = [	
    { label: 'Name', fieldName: 'Name' },
    // { label: 'Last Name', fieldName: 'LastName' },
    // { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Profile', fieldName: 'ProfileName' },
    { label: 'Role', fieldName: 'RoleName' },
    { label: 'Active', fieldName: 'IsActive' },
    { label: 'Username', fieldName: 'Username' },
    { label: 'Division', fieldName: 'Division' },
    { label: 'Department', fieldName: 'Department' },
    { label: 'SSO Id', fieldName: 'SSOID' },
    { label: 'Last Login', fieldName: 'LastLogin', cellAttributes: { alignment: 'right' } },
	{ label: 'IsFrozen', fieldName: 'IsFrozen' },
];

export default class UserAdminUnfreezeModal extends LightningElement {
	
	@track	columns = columns;
	@track	userList = [];
	@track	searchText = '';
	@track	pageNum = 1;
	@track	hasRows = true;
	@track	showSpinner = false;
	@track	selectedUsers = [];

	@track	total = 0;

	@track	editMode = '';
	@track	showEditModal = false;
	@track	showEmployeeModal = false;
	@track	showNewModal = false;

	connectedCallback(){
		this.columns = columns;

		this.queryUsers();
	}
	
	changeSearch(event){
		event.preventDefault();
		event.stopPropagation();

		var searchText = event.detail.value;
		if(searchText.length > 2 || searchText.length == 0){
			this.log('changeSearch -> ', searchText)
			this.searchText = searchText;
			this.pageNum = 1;
			this.queryUsers(null);
		}
	}

	loadMore(event){
		console.log('load more');
		event.preventDefault();
		event.stopPropagation();
		
		var target = event.target,
			curPage = this.pageNum,
			total = this.total,
			totalPages = Math.floor(total / 50),
			remain = total % 50;

		if(remain > 0){
			totalPages++;
		}
		if(curPage < totalPages){
			this.pageNum = curPage + 1;
			this.queryUsers(target);
		}
	}

	async queryUsers(loadMore){
		try {
			this.log('queryUsers');
			this.showSpinner = true;
			if(loadMore != null){
				loadMore.isLoading = true;
			}
			const result = await retrieveFrozenUsers({
				searchText : this.searchText,
				pageNum : this.pageNum
			});
	
			this.log('queryUsers -> ', result);
			if(loadMore != null){
				var rawdata = result.data;
				const curData = this.userList;
				const newData = curData.concat(rawdata);
				this.userList = newData;
				this.total = result.total;	
				loadMore.isLoading = false;
			} else {
				this.selectedUsers = [];
				this.userList = result.data;
				this.total = result.total;				
			}
			this.showSpinner = false;
		} catch(e){
			this.log('errors -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
			if(loadMore != null){
				loadMore.isLoading = false;
			}
		}
	}

	selectRow(event){
		event.preventDefault();
		event.stopPropagation();

		this.log('onselect user -> ', event.detail.selectedRows);
		this.selectedUsers = event.detail.selectedRows;
	}
		
	closeModal(){
		var customEvent = new CustomEvent("close", { detail : { modalName : 'unfreeze' }});
		this.dispatchEvent(customEvent);
	}

	async clickUnfreeze(){
		try {
			this.log('clickUnfreeze');
			var userIds = [];

			this.selectedUsers.forEach(usr => {
				userIds.push(usr.id);
			});

			this.showSpinner = true;
			const result = await frozenHandler({
				userIds : userIds,
				mode : false
			});

			if(result){
				this.showMyToast('success', 'Information', 'Users successfully inactivated/frozen.');
			}
			this.showSpinner = false;
			this.closeModal();
		} catch(e){
			this.log('clickUnfreeze exception -> ', e);
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