/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
<<<<<<< HEAD
 * @last modified on  : 04-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
=======
 * @last modified on  : 2024-01-31
 * @last modified by  : woomg@dkbmc.com
>>>>>>> 7afa8b8403a033141c3abbded2bd9343195391dc
**/
@IsTest
public with sharing class UserAdminChangeOwnerController_Test {
    static String profileId;
    static User user1;
    static User user2;
    static {
        profileId = [SELECT id FROM Profile LIMIT 1].id;

        user1 = new User(
<<<<<<< HEAD
            Username='test01@partner.test.com',
            LastName='test01',
            Email='test01@partner.test.com',
=======
            Username='test01@partner.samsung.com',
            LastName='test01',
            Email='test01@partner.samsung.com',
>>>>>>> 7afa8b8403a033141c3abbded2bd9343195391dc
            Alias='test01',
            TimeZoneSidKey='Asia/Seoul',
            LocaleSidKey='ko',
            EmailEncodingKey='UTF-8',
            ProfileId=profileId,
            LanguageLocaleKey='ko',
            FederationIdentifier ='test01'
        );
        insert user1;

        user2 = new User(
<<<<<<< HEAD
            Username='test02@partner.test.com',
            LastName='test02',
            Email='test02@partner.test.com',
=======
            Username='test02@partner.samsung.com',
            LastName='test02',
            Email='test02@partner.samsung.com',
>>>>>>> 7afa8b8403a033141c3abbded2bd9343195391dc
            Alias='test02',
            TimeZoneSidKey='Asia/Seoul',
            LocaleSidKey='ko',
            EmailEncodingKey='UTF-8',
            ProfileId=profileId,
            LanguageLocaleKey='ko',
            FederationIdentifier ='test02'
        );
        insert user2;

    }

    @isTest
    private static void testMethodOne(){
        String objectNames = 'Account';
        String memberNames = 'AccountTeamMember,CaseTeamMember,CollaborationGroupMember,GroupMember,OpportunityTeamMember,UserAccountTeamMember,UserTeamMember';

        Test.startTest();
        system.debug(UserAdminChangeOwnerController.getObjectFrames(objectNames, memberNames));
        UserAdminChangeOwnerController.MemberSetClass msc = new UserAdminChangeOwnerController.MemberSetClass('AccountTeamMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('CaseTeamMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('CollaborationGroupMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('GroupMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('OpportunityTeamMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('UserAccountTeamMember');
        msc = new UserAdminChangeOwnerController.MemberSetClass('UserTeamMember');
        system.debug(UserAdminChangeOwnerController.getMemberedRecordCount(user2.Id, msc));
        system.debug(UserAdminChangeOwnerController.getMemberedRecords(user2.Id, msc, 1));
        try{
            system.debug(UserAdminChangeOwnerController.removeMember(msc, new list<String>{user2.Id}));        
        } catch(Exception e){
            system.debug(e.getMessage());
        }
        Test.stopTest();
    }
}