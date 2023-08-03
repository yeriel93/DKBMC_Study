/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 05-15-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
trigger CloneContactTrigger on cContact__c (before insert, before update,after insert, after update, before delete) {

    List<Contact> conList = new List<Contact>();
    List<cContact__c> toProces = null;

    switch on Trigger.OperationType {
        
        when BEFORE_INSERT {
            createFullName();
        }

        when AFTER_INSERT {
            insertContactCopy();
        }
        
        when AFTER_UPDATE {
            updateContactCopy();
        }
        
        when BEFORE_DELETE {
            deleteContactCopy();
        }
    }
//------------------------------------------------------------------------------------------------------------------------------------------    
    public static void createFullName() {
        toProces = Trigger.new;
        
        for(cContact__c c : toProces){
            if(c.FirstName__c != null){
                c.Name = c.LastName__c + ' ' + c.FirstName__c;
            }else{
                c.Name = c.LastName__c;
            }
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------    
    //insert
    public static void insertContactCopy() {
        toProces = Trigger.new;

         //ReportsToId
         Set<Id> ids = new Set<Id>();
         for(cContact__c cc : toProces){
            if(cc.ReportsTo__c != null) ids.add(cc.ReportsTo__c);
         }
         List<Contact> reportsTo = [SELECT Id,cContactId__c FROM Contact WHERE cContactId__c IN :ids];
         Map<String, Contact> reportsToContact = new Map<String, Contact>();
         for(Contact c : reportsTo){
            if(reportsTo.size() >0 && !ids.isEmpty()){
                reportsToContact.put(c.cContactId__c, c);
            }
         }

        //AccountId
        Set<Id> aIds = new Set<Id>();
        for(cContact__c ccon : toProces){
            if(ccon.cAccountName__c != null) aIds.add(ccon.cAccountName__c);
        }
        List<Account> accId = [SELECT id,cAccountId__c FROM Account WHERE cAccountId__c IN :aIds ];
        Map<String, Account> accountIds = new Map<String,Account>();
        for(Account a : accId){
            if(accId.size() >0 && !ids.isEmpty()){
                accountIds.put(a.cAccountId__c, a);
            }
        }
        
        for(cContact__c c : toProces){
            if(c.Contact_Id__c == null){
                conList.add(new Contact(cContactId__c = c.Id,
                                        LastName = c.LastName__c,
                                        FirstName = c.FirstName__c,
                                        AccountId = accountIds?.get(c.cAccountName__c)?.Id,
                                        Title = c.Title__c,
                                        Department = c.Department__c,
                                        Birthdate = c.Birthdate__c,
                                        ReportsToId = reportsToContact?.get(c.ReportsTo__c)?.Id,
                                        LeadSource = c.LeadSource__c,
                                        Phone = c.Phone__c,
                                        HomePhone = c.HomePhone__c,
                                        MobilePhone = c.Mobile__c,
                                        OtherPhone = c.OtherPhone__c,
                                        Fax = c.Fax__c,
                                        Email = c.Email__c,
                                        AssistantName = c.Assistant__c,
                                        AssistantPhone = c.AssistantPhone__c,
                                        Description = c.Description__c
                ));
            }
        }
        if(conList.size()>0){
            insert conList;
        }
    }
//------------------------------------------------------------------------------------------------------------------------------------------    
    //update
    public static void updateContactCopy(){
        toProces = Trigger.new;

        Set<Id> cContactId = new Set<Id>();
        Set<Id> AccountId = new Set<Id>();
        Set<Id> ReportsTo = new Set<Id>();
        System.debug('is Blank ? ReportsTo =>' + ReportsTo);
        for(cContact__c cCon : toProces){
            cContactId.add(cCon.Id);
            if(cCon.cAccountName__c != null) AccountId.add(cCon.cAccountName__c);
            if(cCon.ReportsTo__c != null) ReportsTo.add(cCon.ReportsTo__c);
        }

        //Id별로 분리
        Map<String,Set<Id>> ids = new Map<String,Set<Id>>();
        ids.put('cContactId', cContactId);
        ids.put('AccountId', AccountId);
        ids.put('ReportsTo', ReportsTo);
        
        System.debug('cContactId =>' + ids.get('cContactId'));
        System.debug('AccountId =>' + ids.get('AccountId'));
        System.debug('ReportsTo =>' + ids.get('ReportsTo'));

        //id별 cContact 객체
        Map<String, cContact__c> ccData = new Map<String, cContact__c>();
        for(cContact__c t : toProces){
            ccData.put(t.Id, t);
        }
        System.debug('cCon Objcet =>'+ccData);

        //쿼리
        List<Contact> con = [SELECT id, cContactId__c FROM Contact WHERE cContactId__c IN :ids.get('cContactId')];
        
        List<Contact> reports = [SELECT Id, cContactId__c FROM Contact WHERE cContactId__c IN :ids.get('ReportsTo')];
        Map<String, Contact> reportsToContact = new Map<String, Contact>();
        for(Contact c : reports){
            reportsToContact.put(c.cContactId__c, c);
        }

        List<Account> accId = [SELECT id,cAccountId__c FROM Account WHERE cAccountId__c IN :ids.get('AccountId')];
        Map<String, Account> accountIds = new Map<String,Account>();
        for(Account a : accId){
            accountIds.put(a.cAccountId__c, a);
        }

        //업데이트할 데이터 넣기
        for(Contact c : con){
            cContact__c cCon = ccData?.get(c.cContactId__c);
            if(cCon != null){
                System.debug('is Same? =>' + c.Id + ' == '+ reportsToContact?.get(cCon.ReportsTo__c)?.Id);
                conList.add(new Contact(Id = c.Id,
                                        LastName = cCon.Name,
                                        FirstName = '',
                                        AccountId = accountIds?.get(cCon.cAccountName__c)?.Id,
                                        Title = cCon.Title__c,
                                        Department = cCon.Department__c,
                                        Birthdate = cCon.Birthdate__c,
                                        ReportsToId = reportsToContact?.get(cCon.ReportsTo__c)?.Id == c.Id ? null : reportsToContact?.get(cCon.ReportsTo__c)?.Id,
                                        LeadSource = cCon.LeadSource__c,
                                        Phone = cCon.Phone__c,
                                        HomePhone = cCon.HomePhone__c,
                                        MobilePhone = cCon.Mobile__c,
                                        OtherPhone = cCon.OtherPhone__c,
                                        Fax = cCon.Fax__c,
                                        Email = cCon.Email__c,
                                        AssistantName = cCon.Assistant__c,
                                        AssistantPhone = cCon.AssistantPhone__c,
                                        Description = cCon.Description__c
                                        ));
            }
        }
        if(conList.size()>0){
            update conList;
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------    
    //delete
    public static void deleteContactCopy() {
        toProces = Trigger.old;

        Set<Id> ids = new Set<Id>();
        for(cContact__c c : toProces){
            ids.add(c.Id);
        }

        List<Contact> con = [SELECT id FROM Contact WHERE cContactId__c IN :ids];


        delete con;
    }









}