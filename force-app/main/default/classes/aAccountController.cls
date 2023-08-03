/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 06-20-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class aAccountController {
    
    @AuraEnabled
    public static User getName(Id inputId){
        try {
            User userRecored = [
                SELECT Id, Name
                FROM User
                WHERE Id = :inputId
                LIMIT 1
            ];
            
            return userRecored;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<aContact__c> relatedaContact(String aAccountId){
        
        try {
            List<aContact__c> aConList = [
                SELECT Id, Name, FirstName__c, LastName__c, Title__c, Email__c, Phone__c
                FROM aContact__c
                WHERE aAccountId__c = :aAccountId
            ];

            System.debug(aConList);
            return aConList;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void upsertaContact(List<aContact__c> upsertData){
        try {
            System.debug(upsertData);
			
            if(upsertData.size()>0) {
                upsert upsertData;
            }

        } catch (Exception e) {
            //throw new AuraHandledException(e.getMessage());
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }
    }
}