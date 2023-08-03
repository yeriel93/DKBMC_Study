/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 07-31-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
trigger aCaseTeamTrigger on aCase_Team_Member__c (before insert ,after insert, after update, after delete) {
    
    switch on Trigger.OperationType {
        
        when BEFORE_INSERT {
            uniqueKey();
        }

        when AFTER_INSERT {
            insertTeam();
        }

        when AFTER_DELETE {
            deleteTeam();
        }
    }
    
    public static void uniqueKey(){
        
        for(aCase_Team_Member__c t : trigger.new){
            t.unique_key__c = String.valueOf(t.Parent_ID__c) + String.valueOf(t.UserOrGroupId__c) ;
        }
    }

    //insert
    public static void insertTeam(){
    	List<aCase__share> aCaseShrs = new List<aCase__share>();
        
        for(aCase_Team_Member__c team : trigger.new){
            aCaseShrs.add(new aCase__share(ParentId = team.Parent_ID__c,
                                           UserOrGroupId = team.UserOrGroupId__c,
                                           AccessLevel = team.AccessLevel__c,
                                           RowCause = team.RowCause__c
            
            ));
        }
        if(aCaseShrs.size()>0){
            insert aCaseShrs;
        }
    }

    //delete
    public static void deleteTeam(){

        List<Id> pId = new List<Id>();
        List<Id> userId = new List<Id>();

        for(aCase_Team_Member__c t : trigger.old){
            pId.add(t.Parent_ID__c);
            userId.add(t.UserOrGroupId__c);
        }

        List<aCase__share> targetIds = [SELECT Id FROM aCase__share WHERE ParentId IN :pId AND UserOrGroupId IN :userId];

        if(targetIds.size() > 0){
            delete targetIds;
        }
    }
}