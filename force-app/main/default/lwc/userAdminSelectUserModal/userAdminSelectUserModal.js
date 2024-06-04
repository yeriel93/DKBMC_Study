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

import retrieveUsers from '@salesforce/apex/UserAdminController.retrieveUsers';

const columns = [	
    { label: 'Name', fieldName: 'Name' },
    // { label: 'Last Name', fieldName: 'LastName' },
    // { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Profile', fieldName: 'Profile.Name' },
    { label: 'Role', fieldName: 'Role.Name' },
    // { label: 'Active', fieldName: 'IsActive' },
    // { label: 'Username', fieldName: 'Username' },
    // { label: 'Division', fieldName: 'Division' },
    // { label: 'Department', fieldName: 'Department' },
    { label: 'KNOX Id', fieldName: 'FederationIdentifier' },
];

export default class UserAdminSelectUserModal extends LightningElement {

	@api	mode;

	@track	columns = columns;
	@track	users = [];
	@track	total = 0;
	@track	searchText = '';
	@track	pageNum = 1;
	@track	selectedUser = null;
	@track	showSpinner = false;

	connectedCallback(){
		this.queryUsers();
	}

	async queryUsers(loadMore){
		this.log('queryUsers');
		try {
			this.showSpinner = true;
			if(loadMore != null){
				loadMore.isLoading = true;
			}
			const result = await retrieveUsers({
				isActive : '',
				profileId : 'All',
				roleIds : [],
				rhq : 'All',
				searchText : this.searchText,
				pageNum : this.pageNum
			});

			this.log('retrieveUsers -> ', result);
			if(loadMore != null){
				const curData = this.users;
				const newData = curData.concat(result.data);
				this.users = newData;
				this.total = result.total;	
				loadMore.isLoading = false;
			} else {
				this.users = result.data;
				this.total = result.total;				
			}
			this.showSpinner = false;
		} catch(e){
			this.log('queryUsers exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
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

	selectRow(event){
		event.preventDefault();
		event.stopPropagation();

		this.log('onselect user -> ', event.detail.selectedRows);
		this.selectedUser = event.detail.selectedRows[0];
	}
	
	onkeypressSearch(event){
		if (event.which == 13){
			this.log('Enter key pressed');
			event.preventDefault();
			event.stopPropagation();
			this.searchText = this.template.querySelector('.searchText').value;

			this.searchUser(null);
		}
	}

	clickSearch(event){
		this.log('cleckSearch');
		event.preventDefault();
		event.stopPropagation();
		this.searchText = this.template.querySelector('.searchText').value;

		this.searchUser(null);
	}

	searchUser(target){
		if(this.searchText.length > 2 || this.searchText.length == 0){
			this.log('Call searchUser -> ', target);
			this.pageNum = 1;
			this.queryUsers(target);
		} else {
			this.showMyToast('warning', 'Warning', 'At least 3 and more characters required!', 'dismissible');
		}
	}

	clickSelect(){
		this.log('click select -> ', this.selectedUser);
		var customEvent = new CustomEvent("close", { detail : { modalName : 'select', user : this.selectedUser, mode : this.mode }});
		this.dispatchEvent(customEvent);
	}

	closeModal(){
		var customEvent = new CustomEvent("close", { detail : { modalName : 'select', user : null, mode : this.mode }});
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