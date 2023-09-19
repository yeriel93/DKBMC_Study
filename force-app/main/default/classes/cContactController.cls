/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 08-23-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class cContactController {
    
    // cContact List 가져오기
    @AuraEnabled
    public static List<cContact__c> getRelatedcContactList(String cAccountId){
        try {
            System.debug('cAccountId = ' + cAccountId);
            
            List<cContact__c> cContactlList = [
                SELECT Name, Title__c, Phone__c
                FROM cContact__c
                WHERE cAccountName__c = :cAccountId
            ];
                
            System.debug('relatedcContactList = ' + cContactlList);
            
            return cContactlList;
        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
            
            throw new AuraHandledException(e.getMessage());

        }
    }

    // record 삭제
    @AuraEnabled
    public static void removeRecord(String recordId){
        try {

            System.debug('delete recordId = ' + recordId);
            
            delete new cContact__c(Id = recordId);
            
        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
            
            throw new AuraHandledException(e.getMessage());
        }
    }
}