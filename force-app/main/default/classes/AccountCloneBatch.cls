/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 05-17-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class AccountCloneBatch implements Database.Batchable<sObject> {
    
    public Database.QueryLocator start(Database.BatchableContext bc) {
        
        String query = 'SELECT Id, Name, cAccountId__c, ParentId, Parent.cAccountId__c, AccountNumber, Site, Type, Industry, AnnualRevenue, Rating, Phone, Fax, Website, TickerSymbol, Ownership, NumberOfEmployees, Sic, Description' 
                        +' FROM Account';
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext bc, List<Account> records){
        List<cAccount__c> cAccList = new List<cAccount__c>();
       
    //------------------------------------------------------------------------------------------------------------------------------------------    
        //insert + update = upsert
        for(Account a : records){
            if(a.cAccountId__c == null){ // insert
                cAccList.add(new cAccount__c(AccountId__c = a.Id,
                                            Name = a.Name, 
                                            AccountNumber__c = a.AccountNumber,
                                            Site__c = a.Site,
                                            AnnualRevenue__c = a.AnnualRevenue,
                                            Description__c = a.Description,
                                            Employees__c = a.NumberOfEmployees,
                                            Fax__c = a.Fax,
                                            Industry__c = a.Industry,
                                            Ownership__c = a.Ownership,
                                            Parent__c = a.Parent?.cAccountId__c,
                                            Phone__c = a.Phone,
                                            Rating__c = a.Rating,
                                            Sic__c = a.Sic,
                                            TickerSymbol__c = a.TickerSymbol,
                                            Type__c = a.Type,
                                            Website__c = a.Website
                                            ));

            } else if(a.cAccountId__c != null){ //update
                cAccList.add(new cAccount__c(Id = a.cAccountId__c,
                                            AccountId__c = a.Id,
                                            Name = a.Name, 
                                            AccountNumber__c = a.AccountNumber,
                                            Site__c = a.Site,
                                            AnnualRevenue__c = a.AnnualRevenue,
                                            Description__c = a.Description,
                                            Employees__c = a.NumberOfEmployees,
                                            Fax__c = a.Fax,
                                            Industry__c = a.Industry,
                                            Ownership__c = a.Ownership,
                                            Parent__c = a.Parent?.cAccountId__c == a.cAccountId__c ? null : a.Parent?.cAccountId__c,
                                            Phone__c = a.Phone,
                                            Rating__c = a.Rating,
                                            Sic__c = a.Sic,
                                            TickerSymbol__c = a.TickerSymbol,
                                            Type__c = a.Type,
                                            Website__c = a.Website
                                            ));
            }
        }

        List<Account> updateList = new List<Account>();
        Map<String, String> updateData = new Map<String, String>();
        try {
            if(cAccList.size()>0){
                upsert cAccList;

                for(cAccount__c c : cAccList){
                    updateData.put(c.AccountId__c, c.Id);
                }
                for(Account a : records){
                    if(a.cAccountId__c == null){
                        a.cAccountId__c = updateData.get(a.Id);
                        updateList.add(a);
                    }
                }
                update updateList;
            }

        } catch (Exception e) {
            System.debug(e);
        }
    //------------------------------------------------------------------------------------------------------------------------------------------      
        //delete
        List<cAccount__c> deleteData = [SELECT Id FROM cAccount__c WHERE AccountId__c = NULL];
        if(deleteData.size() > 0){
            delete deleteData;
        }

    }

    public void finish(Database.BatchableContext bc){
        // execute any post-processing operations
    }
}