/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 07-25-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class aCaseTeamController {
    
    @AuraEnabled
    public static List<aCase_Team_Member__c> getaCaseTeamList(String recordId){
        try {
            List<aCase_Team_Member__c> TeamList = [SELECT Id, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, RowCause__c, AccessLevel__c, Parent_ID__c, UserOrGroupId__r.Name
                                                    FROM aCase_Team_Member__c
                                                    WHERE Parent_ID__c =:recordId
                                                    ]; 

            System.debug('TeamList =>' + TeamList);
            return TeamList;

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());

            throw new AuraHandledException(e.getMessage());
        }
    }
}