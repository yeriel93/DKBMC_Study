/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 09-07-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class aContactController {
    
    @AuraEnabled
    public static User getName(Id inputId){
        try {
            return[
                SELECT Id, Name
                FROM User
                WHERE Id = :inputId
            ];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Object getNametoId(String objName, String Id){
        try {
            
            // 동적 SOQL 쿼리를 작성
            String dynamicQuery = 'SELECT Name FROM ' + objName + ' WHERE Id = :Id limit 1';
            
            // 동적 SOQL 쿼리를 실행
            Object getObj = Database.query(dynamicQuery);

            // System.debug('objName = '+ objName);
            // System.debug('Id = '+ Id);
            // System.debug('Dynamic SOQL Query: ' + dynamicQuery);
            // System.debug('getObj = ' + getObj);

            return getObj;

        } catch (Exception e) {
            System.debug('message => ' + e.getMessage());
            System.debug('trace => ' + e.getStackTraceString());

            throw new AuraHandledException(e.getMessage());
        }
    }
}