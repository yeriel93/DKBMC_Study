/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 07-31-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class aCaseController {

    // aCaseAllList page
    @AuraEnabled
    public static List<aCase__c> getaCaseRecords(List<Map<String,String>> searchKeywords){

        try {
            System.debug('searchKeywords => ' + searchKeywords);

            String query = 'SELECT Id, Name, aContactId__r.Name, Subject__c, Origin__c, Status__c, Priority__c, CreatedDate, Owner.Name FROM aCase__c ';
            String whereStr = '';
            String whereStr2 = '';

            List<String> whereList = new List<String>();
            for(Map<String,String> obj : searchKeywords){
                if(obj.get('value') != ''){
                    whereStr = obj.get('fieldName') + ' LIKE  \'%' + obj.get('value') + '%\'';
                    whereList.add(whereStr);
                }
            }
            
            if(whereList.size() > 0){
                whereStr2 = String.join(whereList, ' AND ');
                // System.debug('whereStr2 => ' + whereStr2);
                query += ' WHERE ' + whereStr2 + ' ORDER BY CreatedDate desc';
            }else{
                query += 'ORDER BY CreatedDate desc';
            }
            System.debug('query => ' + query);
            
            List<aCase__c> aCaseList = Database.query(query);

            System.debug('aCaseList =>' + aCaseList);
            return aCaseList;
            
        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
            
            throw new AuraHandledException(e.getMessage());
        }
    }

    // aCaseView page
    @AuraEnabled
    public static aCase__c getRecordById(String recordId){
        try {
            aCase__c record = [
                SELECT Id, Name, Subject__c, Status__c, Priority__c
                FROM aCase__c
                WHERE Id = :recordId
            ];

            System.debug('record =>' + record);
            return record;
            
        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());

            throw new AuraHandledException(e.getMessage());
        }
    }

    // aCaseEdit page
    @AuraEnabled
    public static aCase__c getaCantactData(String recordId){
        try {
            aCase__c data = [
                SELECT Id, Name, aContactId__r.Phone__c, aContactId__r.Email__c
                FROM aCase__c
                WHERE Id = :recordId
            ];

            System.debug('aContactData =>' + data);
            return data;

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());

            throw new AuraHandledException(e.getMessage());
        }
    }
}