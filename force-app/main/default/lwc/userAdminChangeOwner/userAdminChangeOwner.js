/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 04-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
const DEBUG = false;

import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

import getObjectFrames from '@salesforce/apex/UserAdminChangeOwnerController.getObjectFrames';
import getOwnedRecordCount from '@salesforce/apex/UserAdminChangeOwnerController.getOwnedRecordCount';
import getMemberedRecordCount from '@salesforce/apex/UserAdminChangeOwnerController.getMemberedRecordCount';
import getOwnedRecords from '@salesforce/apex/UserAdminChangeOwnerController.getOwnedRecords';
import getMemberedRecords from '@salesforce/apex/UserAdminChangeOwnerController.getMemberedRecords';
import changeOwner from '@salesforce/apex/UserAdminChangeOwnerController.changeOwner';
import removeMember from '@salesforce/apex/UserAdminChangeOwnerController.removeMember';

// Schema
import USER_NAME_FIELD from '@salesforce/schema/User.Name';

const ownedColumns = [	
    { label: 'Name', fieldName: 'url', type : 'url', typeAttributes : { label : { fieldName : 'name' }, target : '_blank', tooltip : { fieldName: 'name' } } },
    { label: 'Last Modified', fieldName: 'lastModified' },
    { label: 'Owner', fieldName: 'ownerName' }
];

const memberedColumns = [	
    { label: 'Name', fieldName: 'url', type : 'url', typeAttributes : { label : { fieldName : 'name' }, target : '_blank', tooltip : { fieldName: 'name' } } },
    { label: 'Last Modified', fieldName: 'lastModified' },
    { label: 'Member', fieldName: 'ownerName' }
];


export default class UserAdminChangeOwner extends LightningElement {
	@api	isAdmin;
	@api	targetOwnedObjects = 'Account, Contact, MeetingMinutes__c, SalesInLead__c, Opportunity, Contract, CustomerQual__c';
	@api	targetMemberesObjects = 'AccountTeamMember, CaseTeamMember, CollaborationGroupMember, GroupMember, OpportunityTeamMember, UserAccountTeamMember, UserTeamMember, SalesInLeadTeamMember__c, CustomerQualMember__c';

	@track	userId = '';
	@track	oldId;
	@track	numOfSelectedOwned = 'Select a object to change owner of record set.';
	@track	numOfSelectedMembered = 'Select a object to change/remove member for record set.';
	@track	isInitialize = false;
	@track	isRunInitLoad = false;
	@track	showSpinner = false;
	@track	showSelectModal = false;
	@track	selectMode = '';
	@track	username = 'Nobody';
	@track	ownerSet = null;
	@track  memberSet = null;
	@track	ownedList = [];
	@track	memberedList = [];
	@track	ownedPageNum = 1;
	@track	memberedPageNum = 1;
	@track	ownedColumns = ownedColumns;
	@track	memberedColumns = memberedColumns;
	@track	ownedRecords = [];
	@track	selectedOwnedRecords = [];
	@track	memberedRecords = [];
	@track	selectedMemberedRecords = [];
	@track	selectedOwnedObject = '';
	@track	selectedMemberedObject = '';

	@track	classRow  = 'slds-nav-vertical__item ';
	@track	classCount = 'slds-badge slds-col_bump-left slds-theme_success';

	@wire(getRecord, { recordId: '$userId', fields: [ USER_NAME_FIELD ]}) // '$userId'
    getUserInfo({ data, error }) {
        if(data) {
            this.username = data.fields.Name.value;
        }
        if(error) {
            this.log('getUserInfo error ', error);
        }
    }

	async connectedCallback(){
		this.isInitialize = await this.initialize();
	}

	async renderedCallback(){
		this.log('start rendered callback');
		
		if(this.isInitialize){
			//if(!this.isRunInitLoad && this.userId != '' && this.userId != this.oldId){
			if(this.userId != '' && this.userId != this.oldId){
				//this.isRunInitLoad = true;
				this.oldId = this.userId;	
				const result = await this.initLoad();
				this.log('execute initLoad from renderedCallback -> ', result);
			}
		}
	}

	async initialize(){
		var isInit = false;
		try {
			this.showSpinner = true;
			const result = await getObjectFrames({
				objectNames : this.targetOwnedObjects,
				memberNames : this.targetMemberesObjects
			});
			this.log('getObjectFrames -> ', result);

			this.ownerSet = result.owned;
			this.memberSet = result.member;
			
			this.makeObjectList(result.owned, 'owned');
			this.makeObjectList(result.member, 'member');

			isInit = true;
			this.showSpinner = false;;
		} catch(e){
			this.log('initialize exception -> ', e);
			this.errorHandler(e);
			this.showSpinner = false;;	
		}

		return isInit;
	}

	async initLoad(){
		var isLoaded = false;
		try {
			//this.isRunInitLoad = false;
			this.log('initLoad start -> ', this.userId);
			this.showSpinner = true;
			isLoaded = await this.queryOwnedRecordCount();
			isLoaded = await this.queryMemberedRecordCount();
			this.showSpinner = false;
			this.log('initLoad finished -> ', isLoaded);
		} catch(e){
			this.log('initLoad exception -> ', e);
			this.errorHandler(e);
		}
	
		return isLoaded;
	}

	queryOwnedRecordCount(){
		// variable clone, without reference. With the reference, execute renderedCallback multiple times.
		let ownerSet = JSON.parse(JSON.stringify(this.ownerSet)); 
		let props = Object.getOwnPropertyNames(ownerSet);
		let promises = [...props].map(prop => {
			return getOwnedRecordCount({ userId : this.userId, obj : ownerSet[prop]})
				.then(result => {
					ownerSet[prop].count = result;
					this.log('record count -> ', ownerSet[prop].label + ' : ' + ownerSet[prop].count);
				});
		});

		// 복수의 Callout이 모두 완료된 후에 이 메소드를 끝내기 위하여 최종 프로세스로 Promise.all()을 사용함.
		// 또한 이 메소드를 호출하는 상위 메소드는 완료후의 결과를 리턴받기 위하여 'await' 선언을 하여야함.
		return Promise.all(promises)
			.then(_ => {
				this.ownerSet = ownerSet;
				this.makeObjectList(ownerSet, 'owned');
				return true;
			});
	}
	
	queryMemberedRecordCount(){
		// variable clone, without reference. With the reference, execute renderedCallback multiple times.
		let memberSet = JSON.parse(JSON.stringify(this.memberSet)); 
		let props = Object.getOwnPropertyNames(memberSet);
		let promises = [...props].map(prop => {
			return getMemberedRecordCount({ userId : this.userId, obj : memberSet[prop]})
				.then(result => {
					memberSet[prop].count = result;
					this.log('record count -> ', memberSet[prop].label + ' : ' + memberSet[prop].count);
				});
		});

		// 복수의 Callout이 모두 완료된 후에 이 메소드를 끝내기 위하여 최종 프로세스로 Promise.all()을 사용함.
		// 또한 이 메소드를 호출하는 상위 메소드는 완료후의 결과를 리턴받기 위하여 'await' 선언을 하여야함.
		return Promise.all(promises)
			.then(_ => {
				this.memberSet = memberSet;
				this.makeObjectList(memberSet, 'member');
				return true;
			});
	}

	makeObjectList(objs, mode){
		var objectList = Object.values(objs);
		objectList.sort((a, b) => (a.label > b.label) ? 1 : -1)
		objectList.map(item => {
			item.classRow = this.classRow;
			item.classCount = this.classCount;
		})
		if(mode == 'owned'){
			this.ownedList = objectList;	
		} else if(mode == 'member'){
			this.memberedList = objectList
		}
	}

	clickSelect(){
		//this.resetObjectList();
		this.ownedPageNum = 1;
		this.memberedPageNum = 1;
		this.ownedRecords = [];
		this.memberedRecords = [];
		this.selectMode = 'olduser';
		this.showSelectModal = true;
	}
	

	closeModal(event){
		this.log('event from child modal -> ', event.detail.modalName);
		switch(event.detail.modalName) {
			case 'select':
				this.showSelectModal = false;
				var mode = event.detail.mode,
					user =  event.detail.user;
				if(user != null){
					if(mode == 'olduser'){
						this.log('mode -> ', mode);
						this.userId = user.Id;
					} else if(mode == 'newowner'){
						this.log('new owner -> ', user);
						this.handleChangeOwner(user.Id);
					}
				}
				break;
			default :
				this.log('no modal name');
		}
	}

	clickOwnedObject(event){
		event.preventDefault();
		event.stopPropagation();
		if(this.userId != ''){
			var name = event.currentTarget.dataset.name,
			ownedList = this.ownedList;
		
			this.log('object list -> ', ownedList);
			ownedList.map(item => {
				if(item.name == name){
					item.classRow = this.classRow + ' slds-is-active';
				} else {
					item.classRow = this.classRow;
				}
			});
			this.ownedList = ownedList;
			this.selectedOwnedObject = name;
			this.ownedRecords = [];
			this.ownedPageNum = 1;

			this.loadOwnedRecords(null);
		}
	}

	async loadOwnedRecords(loadMore){
		try {
			var name = this.selectedOwnedObject;

			if(loadMore != null){
				loadMore.isLoading = true;
			}
			this.showSpinner = true;
			const result = await getOwnedRecords({
				userId : this.userId,
				obj : this.ownerSet[name],
				pageNum : this.ownedPageNum
			});

			this.log('getOwnedRecords -> ', result);
			if(loadMore != null){
				const curData = this.ownedRecords;
				const newData = curData.concat(result);
				this.ownedRecords = newData;
				loadMore.isLoading = false;
			} else {
				this.ownedRecords = result;
			}
			this.showSpinner = false;;

		} catch(e) {
			this.log('loadOwnedRecords exception -> ', e);
			this.errorHandler(e);	
			this.showSpinner = false;;	
		}
	}

	loadMoreOwned(event){
		this.log('load more');
		event.preventDefault();
		event.stopPropagation();
		
		var name = this.selectedOwnedObject,
			target = event.target,
			curPage = this.ownedPageNum,
			total = this.ownerSet[name].count,
			totalPages = Math.floor(total / 50),
			remain = total % 50;

		if(remain > 0){
			totalPages++;
		}
		if(curPage < totalPages){
			this.ownedPageNum = curPage + 1;
			this.loadOwnedRecords(target);
		}
	}

	selectOwnedRecord(event){
		event.preventDefault();
		event.stopPropagation();

		const selectedRows = event.detail.selectedRows;
		if(selectedRows.length == 0){
			this.numOfSelectedOwned = 'Select a object to change owner of record set.';
			this.selectedOwnedRecords = [];
		} else {
			this.numOfSelectedOwned = selectedRows.length + ' record(s) selected.';
			this.selectedOwnedRecords = selectedRows;
		}
	}

	clickChangeOwner(event){
		event.preventDefault();
		event.stopPropagation();

		if(this.selectedOwnedRecords.length == 0){
			this.showMyToast('warning', 'Warning', 'At least one selected record required.', dismissible);
			//return false;
		}
		this.selectMode = 'newowner';
		this.showSelectModal = true;
	}

	async handleChangeOwner(newUserId){
		try {
			var objectSet = this.ownerSet[this.selectedOwnedObject],
				selectedRecords = this.selectedOwnedRecords,
				ids = [];
		
			this.log('handle change owner -> ', selectedRecords);
			this.log('handle change owner -> ', objectSet);
			this.log('handle change owner -> ', newUserId);
			this.showSpinner = true;
			selectedRecords.forEach(item => {
				ids.push(item.id);
			});

			const result = await changeOwner({
				os : objectSet,
				ids : ids,
				newUserId : newUserId
			});

			if(result){
				this.showMyToast('success', 'Information', 'Owner changed successfully.');
				let refresh = await this.refreshOwnedRecords();
			} else {
				this.showMyToast('error', 'error', 'Error when chage the owner at APEX controller.');
			}
			this.showSpinner = false;
		} catch(e) {
			this.log('handleChangeOwner exception -> ', e);
			this.errorHandler(e);	
			this.showSpinner = false;;	
		}
	}

	async refreshOwnedRecords(){
		this.ownedPageNum = 1;
		this.loadOwnedRecords(null);
		this.showSpinner = true;
		let done = await this.queryOwnedRecordCount();
		this.showSpinner = false;
		return done;
	}

	clickMemberedObject(event){
		event.preventDefault();
		event.stopPropagation();
		if(this.userId != ''){
			var name = event.currentTarget.dataset.name,
				memberedList = this.memberedList;
		
			this.log('object list -> ', memberedList);
			memberedList.map(item => {
				if(item.name == name){
					item.classRow = this.classRow + ' slds-is-active';
				} else {
					item.classRow = this.classRow;
				}
			});
			this.memberedList = memberedList;
			this.selectedMemberedObject = name;
			this.memberedRecords = [];
			this.memberedPageNum = 1;

			this.loadMemberedRecords(null);
		}
	}

	async loadMemberedRecords(loadMore){
		try {
			var name = this.selectedMemberedObject;

			if(loadMore != null){
				loadMore.isLoading = true;
			}
			this.showSpinner = true;
			const result = await getMemberedRecords({
				userId : this.userId,
				obj : this.memberSet[name],
				pageNum : this.memberedPageNum
			});

			this.log('getMemberedRecords -> ', result);
			if(loadMore != null){
				const curData = this.memberedRecords;
				const newData = curData.concat(result);
				this.memberedRecords = newData;
				loadMore.isLoading = false;
			} else {
				this.memberedRecords = result;
			}
			this.showSpinner = false;;

		} catch(e) {
			this.log('loadMemberedRecords exception -> ', e);
			this.errorHandler(e);	
			this.showSpinner = false;;	
		}
	}

	loadMoreMembered(event){
		this.log('load more');
		event.preventDefault();
		event.stopPropagation();
		
		var name = this.selectedMemberedObject,
			target = event.target,
			curPage = this.memberedPageNum,
			total = this.memberSet[name].count,
			totalPages = Math.floor(total / 50),
			remain = total % 50;

		if(remain > 0){
			totalPages++;
		}
		if(curPage < totalPages){
			this.memberedPageNum = curPage + 1;
			this.loadMemberedRecords(target);
		}
	}

	selectMemberedRecord(event){
		event.preventDefault();
		event.stopPropagation();

		const selectedRows = event.detail.selectedRows;
		if(selectedRows.length == 0){
			this.numOfSelectedMembered = 'Select a object to change/remove member for record set.';
			this.selectedMemberedRecords = [];
		} else {
			this.numOfSelectedMembered = selectedRows.length + ' record(s) selected.';
			this.selectedMemberedRecords = selectedRows;
		}
	}

	async clickRemoveMember(event){
		this.log('click remove member', '');
		event.preventDefault();
		event.stopPropagation();

		try {
			var objectSet = this.memberSet[this.selectedMemberedObject],
				selectedRecords = this.selectedMemberedRecords,
				ids = [];
		
			this.log('handle change owner -> ', selectedRecords);
			this.log('handle change owner -> ', objectSet);
			this.showSpinner = true;
			selectedRecords.forEach(item => {
				ids.push(item.id);
			});

			const result = await removeMember({
				os : objectSet,
				ids : ids
			});

			if(result){
				this.showMyToast('success', 'Information', 'Member removed successfully.');
				let refresh = await this.refreshMemberedRecords();
			} else {
				this.showMyToast('error', 'error', 'Error when remove the member at APEX controller.');
			}
			this.showSpinner = false;
		} catch(e) {
			this.log('clickRemoveMember exception -> ', e);
			this.errorHandler(e);	
			this.showSpinner = false;;	
		}
	}

	async refreshMemberedRecords(){
		this.memberedPageNum = 1;
		this.loadMemberedRecords(null);
		this.showSpinner = true;
		let done = await this.queryMemberedRecordCount();
		this.showSpinner = false;
		return done;
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