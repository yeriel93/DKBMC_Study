/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 06-16-2023
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
}