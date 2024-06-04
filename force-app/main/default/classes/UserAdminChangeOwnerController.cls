/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 04-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public without sharing class UserAdminChangeOwnerController {

	@AuraEnabled
    public static map<String, map<String, Object>> getObjectFrames(String objectNames, String memberNames){
        map<String, map<String, Object>> mObject = new map<String, map<String, Object>>();
        try {
			map<String, ObjectSetClass> mObjFrame = new map<String, ObjectSetClass>();
			map<String, MemberSetClass> mMemFrame = new map<String, MemberSetClass>();

			list<String> lObjName = objectNames.split(',');
			list<String> lMemName = memberNames.split(',');

			for(String objName : lObjName){
				ObjectSetClass objFrame = new ObjectSetClass(objName.trim());
				mObjFrame.put(objName.trim(), objFrame);
			}
			mObject.put('owned', mObjFrame);

			for(String memName : lMemName){
				MemberSetClass memFrame = new MemberSetClass(memName.trim());
				mMemFrame.put(memName.trim(), memFrame);
			}
			mObject.put('member', mMemFrame);
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return mObject;
    }

	@AuraEnabled
	public static Integer getOwnedRecordCount(String userId, ObjectSetClass obj){
		Integer count = 0;
		try {
			String queryTemplate = 'SELECT COUNT(Id) Total FROM {0} WHERE OwnerId = :userId';
			list<Object> parameters = new list<Object> { obj.name };
			String query = String.format(queryTemplate, parameters);

			AggregateResult ar = Database.query(query);
		
			count = Integer.valueOf(ar.get('Total'));	
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return count;
	}

	@AuraEnabled
	public static Integer getMemberedRecordCount(String userId, MemberSetClass obj){
		Integer count = 0;
		try {
			String queryTemplate = 'SELECT COUNT(Id) Total FROM {0} WHERE {1} = :userId';
			list<Object> parameters = new list<Object> { obj.name, obj.memberField };
			String query = String.format(queryTemplate, parameters);

			AggregateResult ar = Database.query(query);
		
			count = Integer.valueOf(ar.get('Total'));
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return count;
	}

	@AuraEnabled
	public static list<RecordClass> getOwnedRecords(String userId, ObjectSetClass obj, Integer pageNum){
		list<RecordClass> lrec = new list<RecordClass>();
		try {
			String queryTemplate = 'SELECT Id, {0}, LastModifiedDate, Owner.Name FROM {1} WHERE OwnerId = :userId ORDER BY LastModifiedDate DESC';
			list<Object> parameters = new list<Object> { obj.nameField, obj.name };
			String query = String.format(queryTemplate, parameters);

			list<sObject> lso = Database.query(query);
			if(!lso.isEmpty()){
				for(sObject so : lso){
					RecordClass rec = new RecordClass(
						(String) so.get('Id'),
						(String) so.get(obj.nameField),
						(DateTime) so.get('LastModifiedDate'),
						(String) so.getSObject('Owner').get('Name'),
						obj.name
					);
					
					lrec.add(rec);
				}
			}			
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return lrec;
	}

	@AuraEnabled
	public static list<RecordClass> getMemberedRecords(String userId, MemberSetClass obj, Integer pageNum){
		list<RecordClass> lrec = new list<RecordClass>();
		try {
			String qType = 'LastModifiedDate';
			if(obj.name == 'GroupMember'){ // if sObject doesn't have 'LastModifiedDate' field, add OR condition with obj.name here.
				qType = 'SystemModStamp';
			}
			String queryTemplate1 = 'SELECT Id, {0}, {1}, {2}, LastModifiedDate FROM {3} WHERE {4} = :userId ORDER BY LastModifiedDate DESC';
			String queryTemplate2 = 'SELECT Id, {0}, {1}, {2}, SystemModStamp FROM {3} WHERE {4} = :userId ORDER BY SystemModStamp DESC';
			list<Object> parameters = new list<Object> { obj.parentName, obj.parentField, obj.memberField, obj.name, obj.memberField };
			String query = qType == 'LastModifiedDate' ? String.format(queryTemplate1, parameters) : String.format(queryTemplate2, parameters);
			String userName = [SELECT Name FROM User WHERE Id = :userId LIMIT 1].Name;

			list<sObject> lso = Database.query(query);
			if(!lso.isEmpty()){
				for(sObject so : lso){
					list<String> parent = String.valueOf(obj.parentName).split('\\.');
					RecordClass rec = new RecordClass(
						(String) so.get('Id'),
						(String) so.getSObject(parent[0]).get(parent[1]),
						(DateTime) so.get(qType),
						userName,
						obj.parentObject.name,
						(String) so.get(obj.parentField)
					);
					
					lrec.add(rec);
				}
			}			
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return lrec;
	}

	@AuraEnabled
	public static Boolean changeOwner(ObjectSetClass os, list<String> ids, String newUserId){
		Boolean result = false;
		try {
			if(os.name == 'Account' || os.name == 'Opportunity'){
				for(String rId : ids){
					ChangeOwnerService.changeOwner(os.name, rId, newUserId);
				}
			} else {
				String queryTemplate = 'SELECT Id, OwnerId FROM {0} WHERE OwnerId IN :ids';
				list<Object> parameters = new list<Object> { os.name };
				String query = String.format(queryTemplate, parameters);
				list<sObject> lso = Database.query(query);
				if(!lso.isEmpty()){
					for(sObject so : lso){
						so.put('OwnerId', newUserId);
					}

					update lso;
				}
			}
			result = true;
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return result;
	}

	@AuraEnabled
	public static Boolean removeMember(MemberSetClass os, list<String> ids){
		Boolean result = false;
		try {
			String queryTemplate = 'SELECT Id FROM {0} WHERE User__c IN :ids';
			list<Object> parameters = new list<Object> { os.name };
			String query = String.format(queryTemplate, parameters);
			list<sObject> lso = Database.query(query);
			if(!lso.isEmpty()){

				delete lso;
			}
			result = true;
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return result;
	}

	public class ObjectSetClass {
		@AuraEnabled
		public	String	label		{ get; set; }
		@AuraEnabled
		public	String	name		{ get; set; }
		@AuraEnabled
		public	String	prefix		{ get; set; }
		@AuraEnabled
		public	Boolean	isCustom	{ get; set; }
		@AuraEnabled
		public	String	nameField	{ get; set; }
		@AuraEnabled
		public	Integer	count		{ get; set; }

		public ObjectSetClass(){
			this.count = 0;
		}

		public ObjectSetClass(String objName){

			Schema.SObjectType sObjType = ((SObject) Type.forName('Schema',objName).newInstance()).getSObjectType();
			Schema.DescribeSObjectResult dsr = sObjType.getDescribe();
			this.label     = dsr.getLabel();
			this.name      = dsr.getName();
			this.prefix    = dsr.getKeyPrefix();
			this.isCustom  = dsr.isCustom();
			this.nameField = '';
			this.count	   = 0;

			list<Schema.SObjectField> sfs = dsr.fields.getMap().values();
			
			for(Schema.SObjectField sf : sfs){
				Schema.DescribeFieldResult dfr = sf.getDescribe();
				if(dfr.isNameField()){
					this.nameField = dfr.getName();
				}
			}
		}
	}

	public class MemberSetClass {
		@AuraEnabled
		public	String			label			{ get; set; }
		@AuraEnabled
		public	String			name			{ get; set; }
		@AuraEnabled
		public	String			prefix			{ get; set; }
		@AuraEnabled
		public	Boolean			isCustom		{ get; set; }
		@AuraEnabled
		public	String			memberField		{ get; set; }
		@AuraEnabled
		public	String			parentField		{ get; set; }
		@AuraEnabled
		public	String			parentName		{ get; set; }
		@AuraEnabled
		public	ObjectSetClass	parentObject	{ get; set; }
		@AuraEnabled
		public	Integer			count			{ get; set; }

		public MemberSetClass(){
			this.count = 0;
		}

		public MemberSetClass(String objName){

			this.count = 0;
			switch on objName {
				when 'AccountTeamMember' {
					this.label			= 'AccountTeamMember';
					this.name			= 'AccountTeamMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'UserId';
					this.parentField	= 'AccountId';
					this.parentName		= 'Account.Name';
					this.parentObject	= new ObjectSetClass('Account');
				}
				when 'CaseTeamMember' {
					this.label			= 'CaseTeamMember';
					this.name			= 'CaseTeamMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'MemberId';
					this.parentField	= 'ParentId';
					this.parentName		= 'Parent.CaseNumber';
					this.parentObject	= new ObjectSetClass('Case');
				}
				when 'CollaborationGroupMember' {
					this.label			= 'CollaborationGroupMember';
					this.name			= 'CollaborationGroupMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'MemberId';
					this.parentField	= 'CollaborationGroupId';
					this.parentName		= 'CollaborationGroup.Name';
					this.parentObject	= new ObjectSetClass('CollaborationGroup');
				}
				when 'GroupMember' {
					this.label			= 'GroupMember';
					this.name			= 'GroupMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'UserOrGroupId';
					this.parentField	= 'GroupId';
					this.parentName		= 'Group.Name';
					this.parentObject	= new ObjectSetClass('Group');
				}
				when 'OpportunityTeamMember' {
					this.label			= 'OpportunityTeamMember';
					this.name			= 'OpportunityTeamMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'UserId';
					this.parentField	= 'OpportunityId';
					this.parentName		= 'Opportunity.Name';
					this.parentObject	= new ObjectSetClass('Opportunity');
				}
				when 'UserAccountTeamMember' {
					this.label			= 'UserAccountTeamMember';
					this.name			= 'UserAccountTeamMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'UserId';
					this.parentField	= 'OwnerId';
					this.parentName		= 'Owner.Name';
					this.parentObject	= new ObjectSetClass('User');
				}
				when 'UserTeamMember' {
					this.label			= 'UserTeamMember';
					this.name			= 'UserTeamMember';
					this.prefix			= '000';
					this.isCustom		= false;
					this.memberField	= 'UserId';
					this.parentField	= 'OwnerId';
					this.parentName		= 'Owner.Name';
					this.parentObject	= new ObjectSetClass('User');
				}
				when else {
					Schema.SObjectType sObjType = ((SObject) Type.forName('Schema',objName).newInstance()).getSObjectType();
					Schema.DescribeSObjectResult dsr = sObjType.getDescribe();
					this.label			= dsr.getLabel();
					this.name			= dsr.getName();
					this.prefix			= dsr.getKeyPrefix();
					this.isCustom		= dsr.isCustom();
					this.memberField	= '';
					this.parentObject	= null;
		
					list<Schema.SObjectField> sfs = dsr.fields.getMap().values();
					
					for(Schema.SObjectField sf : sfs){
						Schema.DescribeFieldResult dfr = sf.getDescribe();
						if(dfr.isCustom() && String.valueOf(dfr.getType()) == 'REFERENCE'){
							String oname = String.valueOf(dfr.getReferenceTo()[0]);
							if(oname == 'User'){
								this.memberField = dfr.getName();
							} else {
								this.parentField = dfr.getName();
								this.parentObject = new ObjectSetClass(oname);
								this.parentName	= getParentName(this.parentField, this.parentObject.nameField);
							}
						}
					}
				}
			}
		}

		public String getParentName(String fieldName, String parentNameField){
			String parentName = '';
			if(fieldName.endsWith('Id')){
				parentName = fieldName.left(fieldName.length() - 2) + '.' + parentNameField;
			} else if(fieldName.endsWith('__c')){
				parentName = fieldName.left(fieldName.length() - 1) + 'r.' + parentNameField;
			} else {
				parentName = fieldName + '.' + parentNameField;
			}
			return parentName;
		}
	}

	public class RecordClass {
		@AuraEnabled
		public	String			id				{ get; set; }
		@AuraEnabled
		public	String			name			{ get; set; }
		@AuraEnabled
		public	String			url				{ get; set; }
		@AuraEnabled
		public	String			lastModified	{ get; set; }
		@AuraEnabled
		public	String			ownerName		{ get; set; }
		@AuraEnabled
		public	String			objectName		{ get; set; }
		@AuraEnabled
		public	String			parentId		{ get; set; }

		public RecordClass(String id, String name, DateTime lastModified, String ownerName, String objectName){
			this.id				= id;
			this.name			= name;
			this.url			= '/lightning/r/' + objectName + '/' + id + '/view';
			this.lastModified	= lastModified.format('yyyy-MM-dd');
			this.ownerName		= ownername;
			this.objectName  	= objectName;
			this.parentId		= null;
		}
		public RecordClass(String id, String name, DateTime lastModified, String memberName, String objectName, String parentId){
			this.id				= id;
			this.name			= name;
			this.url			= '/lightning/r/' + objectName + '/' + parentId + '/view';
			this.lastModified	= lastModified.format('yyyy-MM-dd');
			this.ownerName		= memberName;
			this.objectName  	= objectName;
			this.parentId		= parentId;

			if(objectName == 'Group'){
				this.url = '/lightning/setup/PublicGroups/page?address=/setup/own/groupdetail.jsp?id=' + parentId.substring(0, 15);
			}
		}
	}
}