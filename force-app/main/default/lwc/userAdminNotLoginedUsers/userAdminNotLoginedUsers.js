/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
const DEBUG = false;

import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import retrieveLazyUsers from '@salesforce/apex/UserAdminController.retrieveLazyUsers';

const columns = [	
    { label: 'Name', fieldName: 'Name' },
    // { label: 'Last Name', fieldName: 'LastName' },
    // { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Profile', fieldName: 'Profile.Name' },
    { label: 'Role', fieldName: 'Role.Name' },
    { label: 'Active', fieldName: 'IsActive' },
    { label: 'Username', fieldName: 'Username' },
    { label: 'Division', fieldName: 'Division' },
    { label: 'Department', fieldName: 'Department' },
    { label: 'SSO Id', fieldName: 'SSOID' },
    { label: 'Last Login', fieldName: 'LastLogin', cellAttributes: { alignment: 'right' } },
	{ label: 'IsFrozen', fieldName: 'IsFrozen' },
];

const options = [
	{ label : "In 7 days",    value : "7" },
	{ label : "In 30 days",    value : "30" },
	{ label : "In 60 days",    value : "60" },
];

export default class UserAdminNotLoginedUsers extends LightningElement {

	@api	isAdmin;
	
	@track	title = 'Not Logined In... ';
	@track	iconName = 'standard:user';
	@track	summary = '';
	@track	columns = columns;
	@track	timelines = options;
	@track	userList = [];
	@track	timeline = '7';
	@track	includeFrozen = false
	@track	searchText = '';
	@track	pageNum = 1;
	@track	hasRows = true;
	@track	initialized = false;
	@track	showSpinner = false;
	@track	selectedUsers = [];

	@track	total = 0;

	@track	userId = '';
	@track	userData = {};
	@track	editMode = '';
	@track	showEditModal = false;
	@track	showUnfreezeModal = false;

	connectedCallback(){
		this.columns = columns;

		this.queryUsers();
	}
	
	changeTimeline(event){
		this.log('change timeline');
		event.preventDefault();
		event.stopPropagation();

		this.timeline = event.detail.value;
		this.pageNum = 1;
		this.queryUsers(null);
	}

	changeInclude(event){
		this.log('include/exclude inactive');
		event.preventDefault();
		event.stopPropagation();

		this.includeFrozen = event.detail.checked;
		this.pageNum = 1;
		this.queryUsers(null);
	}

	changeSearch(event){
		this.log('click search');
		event.preventDefault();
		event.stopPropagation();

		var searchText = event.detail.value;
		if(searchText.length > 2 || searchText.length == 0){
			this.searchText = searchText;
			this.pageNum = 1;
			this.queryUsers(null);
		}
	}

	loadMore(event){
		this.log('load more');
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
			this.showSpinner = true;
			if(loadMore != null){
				loadMore.isLoading = true;
			}
			const result = await retrieveLazyUsers({
				searchText : this.searchText,
				timeline : this.timeline,
				includeFrozen : this.includeFrozen,
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
			this.log('queryUsers exception -> ', e);
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
	
	clickInactive(event){
		event.preventDefault();
		event.stopPropagation();
		
		if(this.selectedUsers.length < 1){
			this.showMyToast('warning', 'Warning', 'At least one user required!', 'dismissible');
		} else {
			this.editMode = 'inactive';
			this.showEditModal = true;	
		}
	}
	
	clickFreeze(event){
		event.preventDefault();
		event.stopPropagation();
		
		if(this.selectedUsers.length < 1){
			this.showMyToast('warning', 'Warning', 'At least one user required!', 'dismissible');
		} else {
			this.editMode = 'freeze';
			this.showEditModal = true;	
		}
	}

	clickUnfreeze(event){
		event.preventDefault();
		event.stopPropagation();	

		this.showUnfreezeModal = true;	
	}

	closeModal(event){
		this.log('event from child modal -> ', event.detail.modalName);
		switch(event.detail.modalName) {
			case 'editUser':
				this.showEditModal = false;
				this.queryUsers(null);
				break;
			case 'unfreeze':
				this.showUnfreezeModal = false;
				this.queryUsers(null);
				break;
			default :
			this.log('no modal name');
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