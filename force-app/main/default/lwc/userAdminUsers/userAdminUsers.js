/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-02-15
 * @last modified by  : woomg@dkbmc.com
**/
const DEBUG = true;

import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import Tree from './tree';

import retrieveRoles from '@salesforce/apex/UserAdminController.retrieveRoles';
import retrieveProfile from '@salesforce/apex/UserAdminController.retrieveProfile';
import retrieveUsers from '@salesforce/apex/UserAdminController.retrieveUsers';

const columns = [	
    { label: 'Name', fieldName: 'Name' },
    // { label: 'Last Name', fieldName: 'LastName' },
    // { label: 'First Name', fieldName: 'FirstName' },
    { label: 'Profile', fieldName: 'Profile' },
    { label: 'Role', fieldName: 'UserRole' },
    { label: 'Active', fieldName: 'IsActive' },
    { label: 'Username', fieldName: 'Username' },
    { label: 'Division', fieldName: 'Division' },
    { label: 'Department', fieldName: 'Department' },
    { label: 'SSO Id', fieldName: 'FederationIdentifier' }
];

export default class UserAdminUsers extends LightningElement {

	@api	isAdmin;
	
	@track	title = 'Users';
	@track	iconName = 'standard:user';
	@track	summary = 'If "DS" is selected, other selections will be ignored.';
	@track	columns;
	@track	profiles = [];
	@track	userList = [];
	@track	roles;
	@track	selectedRoles = [];
	@track	profile = 'All';
	@track	searchText = '';
	@track	pageNum = 1;
	@track	inactive = '';
	@track	hasRows = true;
	@track	initialized = false;
	@track	showSpinner = false;
	@track	selectedUsers = [];
	@track	selectedRows = [];

	@track	total = 0;

	@track	tree;

	@track	userId = '';
	@track	userData = {};
	@track	selectedUser = null;
	@track	transferSSOId = '';
	@track	employeeMode = 'new';
	@track	showEditModal = false;
	@track	showNewModal = false;
	@track	showResetModal = false;
	@track	showTransferModal = false;

	async connectedCallback(){
		try {
			this.log('userAdminUsers connectedCallback');
			// this.divisions = divisions;
			this.columns = columns;
	
			const result = await retrieveProfile();

			this.log('retrieveProfile -> ', result);
			this.buildupProfiles(result);

			this.queryUsers();
		} catch(e){
			this.log('connectedCallback exception -> ', e);
			this.errorHandler(e);		
		}		
	}
	
	async renderedCallback(){
		try {
			if(!this.initialized){
				this.initialized = true;
				const result = await retrieveRoles();

				this.log('retrieveRoles -> ', result);
				this.userRoles = result;
				this.roles = this.buildupRoleTree(result);
				this.log('role tree data -> ', this.roles);
				this.drawTree(this.roles);
			}	
		} catch(e){
			this.log('renderedCallback exception -> ', e);
			this.errorHandler(e);	
		}
	}

	drawTree(data){
		this.log('drawTree ->', data);
		var container = this.template.querySelector('.container');

		var self = this,
			tree = new Tree(container, {
			// 'this' scope do not work inside of Tree constructor.
			data: [{ id: 'All', text: 'DS', children: data }],
			selectMode: 'single',
			loaded: function () {
				self.log('tree loaded');
				self.values = ['All'];
			},
			onChange: function(){
				self.changeRoleTree(self.tree);
			}
		});

		this.tree = tree;
	}

	changeRoleTree(tree){
		this.log('changeRoleTree -> ', tree);
		if(tree != undefined){
			var nodes = tree.selectedNodes,
				ids = [],
				hasRoot = false;
			nodes.forEach(n => {
				if(n.id == 'All'){
					hasRoot = false;
				} else {
					ids.push(n.id);
				}
			});
			if(hasRoot){
				this.selectedRoles = [];
			} else {
				this.selectedRoles = ids;
			}
			this.queryUsers(null);
		}
	}

	changeProfile(event){
		this.log('changeProfile -> ', event.detail.value);
		event.preventDefault();
		event.stopPropagation();
		this.profile = event.detail.value;

		this.queryUsers(null);
	}

	changeDivision(event){
		this.log('changeDivision -> ', event.detail.value);
		event.preventDefault();
		event.stopPropagation();
		this.division = event.detail.value;

		this.queryUsers(null);
	}

	changeSearch(event){
		this.log('changeSearch -> ', event.detail.value);
		event.preventDefault();
		event.stopPropagation();

		var searchText = event.detail.value;
		if(searchText.length > 2 || searchText.length == 0){
			this.searchText = searchText;
			this.queryUsers(null);
		}
	}

	changeInactive(event){
		this.log('changeInactive -> ', event.detail.value);
		event.preventDefault();
		event.stopPropagation();

		var checkbox = this.template.querySelector('.inactive');
		if(checkbox.checked){;
			this.inactive = 'include';
		} else {
			this.inactive = '';
		}

		this.queryUsers(null);
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
			let result = await retrieveUsers({
				isActive : this.inactive,
				profileId : this.profile,
				roleIds : this.selectedRoles,
				// division : this.division,
				searchText : this.searchText,
				pageNum : this.pageNum
			});
			[...result.data].forEach(usr => {
				if(usr.ProfileId != undefined){
					usr.Profile = usr.Profile.Name;
				};
				if(usr.UserRoleId != undefined){
					usr.UserRole = usr.UserRole.Name;
				};
			});
			this.log('retrieveUsers -> ', result);
			if(loadMore != null){
				const curData = this.userList;
				const newData = curData.concat(result.data);
				this.userList = newData;
				this.total = result.total;	
				loadMore.isLoading = false;
			} else {
				this.selectedUsers = [];
				this.selectedRows = [];
				this.userList = result.data;
				this.total = result.total;				
			}
			this.showSpinner = false;
		} catch(e) {
			this.log('queryUsers exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;
			if(loadMore != null){
				loadMore.isLoading = false;
			}
		}
	}

	buildupRoleTree(roles){
		var map = {}, node, roots = [], i;
  
		for (i = 0; i < roles.length; i += 1) {
			map[roles[i].id] = i; // initialize the map
			roles[i].children = []; // initialize the children
		}
		
		for (i = 0; i < roles.length; i += 1) {
			node = roles[i];
			if (node.parentId !== undefined) {
				// if you have dangling branches check that map[node.parentId] exists
				roles[map[node.parentId]].children.push(node);
			} else {
				roots.push(node);
			}
		}

		return roots;
	}

	buildupProfiles(profiles){
		var options = [];
		options.push({'label':'All', 'value':'All'});
		[...profiles].forEach(item => {
			options.push({'label': item.Profile.Name, 'value': item.ProfileId});
		});

		this.profiles = options;
	}

	selectRow(event){
		event.preventDefault();
		event.stopPropagation();

		this.log('onselect user -> ', event.detail.selectedRows);
		this.selectedUsers = event.detail.selectedRows;
	}
	
	editUser(){
		this.log('edit user');
		if(this.selectedUsers.length == 0 || this.selectedUsers.length > 1){
			this.showMyToast('warning', 'Warning', 'Select A USER required', 'dismissible');
			return null;		
		} else {
			//var selectedUser = this.selectedUsers[0];
			this.userId = this.selectedUsers[0].Id;
			this.showEditModal = true;
		}
	}
	
	newUser(){
		this.log('new user');
		this.employeeMode = 'new';
		this.showNewModal = true;
	}

	resetPassword(){
		if(this.selectedUsers.length < 1){
			this.showMyToast('warning', 'Warning', 'At least a selected user required!', 'dismissible');
			return null;		
		} else {
			this.showResetModal = true;
		}		
	}

	transferUser(){
		if(this.selectedUsers.length == 0 || this.selectedUsers.length > 1){
			this.showMyToast('warning', 'Warning', 'Select A USER required', 'dismissible');
			return null;		
		} else {
			this.selectedUser = this.selectedUsers[0];
			this.transferSSOId = this.selectedUser.FederationIdentifier;
			this.employeeMode = 'transfer';
			this.showNewModal = true;
		}
	}

	closeModal(event){
		this.log('event from child modal -> ', event.detail.modalName);
		switch(event.detail.modalName) {
			case 'editUser':
				this.showEditModal = false;
				this.queryUsers(null);
				break;
			case 'newUser':
				this.showNewModal = false;
				this.queryUsers(null);
				break;
			case 'reset':
				this.showResetModal = false;
				this.queryUsers(null);
				break;
			case 'transfer':
				this.showTransferModal = false;
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