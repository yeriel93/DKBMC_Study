/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 05-17-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
trigger CloneAccountTrigger on cAccount__c (after insert, after update, before delete) {
     
    List<cAccount__c> toProces = null;
    
    switch on Trigger.OperationType {
        
        when AFTER_INSERT {
            insertAccountCopy();
        }
        
        when AFTER_UPDATE {
            updateAccountCopy();
        }
        
        when BEFORE_DELETE {
            deleteAccountCopy();
        }
    }
    //------------------------------------------------------------------------------------------------------------------------------------------    
    //insert
    public static void insertAccountCopy(){
        
        List<Account> accList = new List<Account>();
        toProces = Trigger.new;

        //Account는 자기자신의 parent AccountId를 가져옴
        Set<Id> Ids = new Set<Id>();
        for(cAccount__c a : toProces){
            if(a.Parent__c != null) Ids.add(a.Parent__c);
        }

        List<Account> aParents = [SELECT Id,cAccountId__c FROM Account WHERE cAccountId__c IN : Ids];
        Map<String, Account> dataMerge= new Map<String, Account>();
        if(aParents.size() >0 && !Ids.isEmpty()){
            for(Account t : aParents ){
                dataMerge.put(t.cAccountId__c, t);
            }
        }

        for(cAccount__c a : toProces){
            if(a.AccountId__c == null){ 
                accList.add(new Account(Name = a.Name, 
                                    cAccountId__c = a.Id,
                                    AccountNumber = a.AccountNumber__c,
                                    Site = a.Site__c,
                                    AnnualRevenue = Integer.valueOf(a.AnnualRevenue__c),
                                    Description = a.Description__c,
                                    NumberOfEmployees = Integer.valueOf(a.Employees__c),
                                    Fax = a.Fax__c,
                                    Industry = a.Industry__c,
                                    Ownership = a.Ownership__c,
                                    ParentId = dataMerge?.get(a.Parent__c)?.Id,
                                    Phone = a.Phone__c,
                                    Rating = a.Rating__c,
                                    Sic = a.Sic__c,
                                    TickerSymbol = a.TickerSymbol__c,
                                    Type = a.Type__c,
                                    Website = a.Website__c
                                    ));
                System.debug('type? =>' + a.AnnualRevenue__c );
                System.debug('type? =>' + a.Employees__c );
            }
        }
        if(accList.size()>0){
            insert accList;
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------
    //update
    public static void updateAccountCopy() {
        toProces = Trigger.new;
        
        Set<Id> Ids = new Set<Id>();
        Set<Id> pIds = new Set<Id>();
        for(cAccount__c a : toProces){
            Ids.add(a.Id);
            if(a.Parent__c != null)pIds.add(a.Parent__c);
        }

        //ParentId 
        List<Account> pAcc = [SELECT Id,cAccountId__c FROM Account WHERE cAccountId__c IN :pIds];
        Map<String, Account> dataMerge= new Map<String, Account>();
        if(pAcc.size() >0){
            for(Account t : pAcc){
                dataMerge.put(t.cAccountId__c, t);
            }
        }
        
        //update할 아이디 List
        List<Account> acc = [SELECT Id,cAccountId__c FROM Account WHERE cAccountId__c IN :Ids];
        
        //update된 cAccountId에 따른 cAccount객체를 Map에 담음 
        Map<String, cAccount__c> dataMerge2 = new Map<String, cAccount__c>();
        for(cAccount__c test : toProces){
            dataMerge2.put(test.Id, test);
        }
        
        List<Account> updateList = new List<Account>();
        
        for(Account a : acc){
            cAccount__c cAcc = dataMerge2?.get(a.cAccountId__c);
           if(cAcc != null){
                updateList.add(new Account(Id = a.Id,
                                Name = cAcc.Name, 
                                cAccountId__c = cAcc.Id,
                                AccountNumber = cAcc.AccountNumber__c,
                                Site = cAcc.Site__c,
                                AnnualRevenue = Integer.valueOf(cAcc.AnnualRevenue__c),
                                Description = cAcc.Description__c,
                                NumberOfEmployees = Integer.valueOf(cAcc.Employees__c),
                                Fax = cAcc.Fax__c,
                                Industry = cAcc.Industry__c,
                                Ownership = cAcc.Ownership__c,
                                ParentId = dataMerge?.get(cAcc.Parent__c)?.Id,
                                Phone = cAcc.Phone__c,
                                Rating = cAcc.Rating__c,
                                Sic = cAcc.Sic__c,
                                TickerSymbol = cAcc.TickerSymbol__c,
                                Type = cAcc.Type__c,
                                Website = cAcc.Website__c
                                ));
            }
        }
        if(updateList.size()>0){
            update updateList;
        }
    }

//------------------------------------------------------------------------------------------------------------------------------------------
    //delete
    public static void deleteAccountCopy(){
        toProces = Trigger.old;

        Set<Id> ids = new Set<Id>();
        for(cAccount__c c : toProces){
            ids.add(c.Id);
        }
        List<Account> acc = [SELECT id FROM Account WHERE cAccountId__c IN :ids];
        
        if(acc.size()>0){
            delete acc;
        }

    }
}