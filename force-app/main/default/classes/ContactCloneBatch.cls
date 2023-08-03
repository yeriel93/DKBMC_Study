/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 05-19-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class ContactCloneBatch implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        
        String query = 'SELECT Id, Account.cAccountId__c, cContactId__r.cAccountName__c, ReportsTo.cContactId__c, IsDeleted, MasterRecordId, AccountId, LastName, FirstName, Salutation, Name, OtherStreet, OtherCity, OtherState, OtherPostalCode, OtherCountry, OtherLatitude, OtherLongitude, OtherGeocodeAccuracy, OtherAddress, MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry, MailingLatitude, MailingLongitude, MailingGeocodeAccuracy, MailingAddress, Phone, Fax, MobilePhone, HomePhone, OtherPhone, AssistantPhone, ReportsToId, Email, Title, Department, AssistantName, LeadSource, Birthdate, Description, OwnerId, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, LastActivityDate, LastCURequestDate, LastCUUpdateDate, LastViewedDate, LastReferencedDate, EmailBouncedReason, EmailBouncedDate, IsEmailBounced, PhotoUrl, Jigsaw, JigsawContactId, CleanStatus, IndividualId, Level__c, Languages__c, cContactId__c'
                       + ' FROM Contact';
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext bc, List<Contact> scope){
        List<cContact__c> cConList = new List<cContact__c>();

    //------------------------------------------------------------------------------------------------------------------------------------------    
        //insert + update = upsert        
        for(Contact c : scope){
            if(c.cContactId__c == null){
                cConList.add(new cContact__c(Contact_Id__c = c.Id,
                                            LastName__c = c.LastName,
                                            FirstName__c = c.FirstName,
                                            Name = c.FirstName==null ? c.LastName : c.LastName+' '+c.FirstName,
                                            cAccountName__c = c.Account?.cAccountId__c,
                                            Title__c = c.Title,
                                            Department__c = c.Department,
                                            Birthdate__c = c.Birthdate,
                                            ReportsTo__c = c.ReportsTo?.cContactId__c == c.Id ? null : c.ReportsTo?.cContactId__c,
                                            LeadSource__c = c.LeadSource,
                                            Phone__c = c.Phone,
                                            HomePhone__c = c.HomePhone,
                                            Mobile__c = c.MobilePhone,
                                            OtherPhone__c = c.OtherPhone,
                                            Fax__c = c.Fax,
                                            Email__c = c.Email,
                                            Assistant__c = c.AssistantName,
                                            AssistantPhone__c = c.AssistantPhone,
                                            Description__c = c.Description
                                            ));
            }else if(c.cContactId__c != null){
                cConList.add(new cContact__c(Id = c.cContactId__c,
                                            Contact_Id__c = c.Id,
                                            LastName__c = c.LastName,
                                            FirstName__c = c.FirstName,
                                            Name = c.FirstName==null ? c.LastName : c.LastName+' '+c.FirstName,
                                            cAccountName__c = c.Account?.cAccountId__c,
                                            Title__c = c.Title,
                                            Department__c = c.Department,
                                            Birthdate__c = c.Birthdate,
                                            ReportsTo__c = c.ReportsTo?.cContactId__c == c.Id ? null : c.ReportsTo?.cContactId__c,
                                            LeadSource__c = c.LeadSource,
                                            Phone__c = c.Phone,
                                            HomePhone__c = c.HomePhone,
                                            Mobile__c = c.MobilePhone,
                                            OtherPhone__c = c.OtherPhone,
                                            Fax__c = c.Fax,
                                            Email__c = c.Email,
                                            Assistant__c = c.AssistantName,
                                            AssistantPhone__c = c.AssistantPhone,
                                            Description__c = c.Description
                                            ));
            }
        }
        
        Map <String, String> updateData = new Map<String,String>();
        List<Contact> updateConList = new List<Contact>();
        try {
            if(cConList.size() > 0){
                upsert cConList;
                // System.debug(cConList);

                for(cContact__c cc : cConList){
                    updateData.put(cc.Contact_Id__c, cc.Id);
                }
                for(Contact con : scope){
                    if(con.cContactId__c == null){
                        con.cContactId__c = updateData.get(con.Id);
                        updateConList.add(con);
                    }
                }
                update updateConList;
            }

        } catch (Exception e) {
            System.debug(e);
        }
//------------------------------------------------------------------------------------------------------------------------------------------      
        //delete
        List<cContact__c> deleteData = [SELECT Id FROM cContact__c WHERE Contact_Id__c = NULL];
        if(deleteData.size() > 0) {
            delete deleteData;
        }
    }

    public void finish(Database.BatchableContext bc){
        // execute any post-processing operations
    }
}