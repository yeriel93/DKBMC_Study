/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 07-27-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class AccountDataController {
 
    @AuraEnabled (cacheable=true)
    public static List<Contact> fetchContact(){
        return [SELECT Id, Name, Account.Name, AccountId, Email 
                FROM Contact LIMIT 10];       
    }
}