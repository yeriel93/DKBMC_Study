/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 04-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
@isTest
public with sharing class UserAdminController_Test {

    static String profileId;
    static User user;
    static {
        profileId = [SELECT id FROM Profile LIMIT 1].id;

        user = new User(
            Username='SysAdminTestuser99@partner.test.com',
            LastName='test',
            Email='SysAdminTestuser99@partner.test.com',
            Alias='test',
            TimeZoneSidKey='Asia/Seoul',
            LocaleSidKey='ko',
            EmailEncodingKey='UTF-8',
            ProfileId=profileId,
            LanguageLocaleKey='ko',
            FederationIdentifier ='old'
        );
        insert user;
    }

    @isTest
    private static void testMethodOne(){
        list<String> roles = new list<String>();
        list<String> lusr = new list<String>{ user.Id };
        list<String> lname = new list<String>{ user.username };
        Test.startTest();
        system.assertEquals(UserAdminController.checkSystemAdmin(), true);
        system.debug(UserAdminController.retrieveLicense());
        system.debug(UserAdminController.getUserLicenseByDivision(new map<String, Integer>()));
        system.debug(UserAdminController.retrieveRoles());
        system.debug(UserAdminController.retrieveProfile());
        system.debug(UserAdminController.retrieveUsers('', profileId, roles, 'test', 1));
        system.debug(UserAdminController.retrieveLazyUsers('Test', '7', false, 1));
        system.debug(UserAdminController.retrieveLazyUsers('Test', '30', false, 1));
        system.debug(UserAdminController.retrieveLazyUsers('Test', '60', false, 1));
        system.debug(UserAdminController.retrieveLazyUsers('Test', '90', false, 1));
        system.debug(UserAdminController.retrieveFrozenUsers('Test', 1));
        try {
            system.debug(UserAdminController.makeUserDisabled(lusr, 'freeze'));        
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        try {
            system.debug(UserAdminController.frozenHandler(lusr, false));
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        try {
            system.debug(UserAdminController.resetPassword(lusr, 'manual', 'newpassword'));
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        system.debug(UserAdminController.resetPassword(lname, 'forgot', ''));
        try {
            system.debug(UserAdminController.resetPassword(lusr, 'forgot', ''));            
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        try {
            system.debug(UserAdminController.makeUserDisabled(lusr, 'inactive'));        
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        try {
            system.debug(UserAdminController.shutoutUser(user.Id));
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        Test.stopTest();
    }

}