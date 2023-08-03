/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 08-02-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
trigger aCaseChangeOwnerTrigger on aCase__c (before insert, before update) {

    List<aCase__c> toProces = null;
    Map<String, String> userMap = new Map<String, String>();
    List<Custom_User__c> userList = [SELECT Id, userId__c, Origin__c FROM Custom_User__c];

    switch on Trigger.OperationType {
        
        when BEFORE_INSERT {
            insertaCaseRecord();
        }

        when BEFORE_UPDATE {
            updateaCaseRecord();
        }
    }

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // insert
    public static void insertaCaseRecord(){

        try{
            System.debug('trigger.new' + trigger.new);
            toProces = trigger.new;
            
            if(userList != null){
                for(Custom_User__c u : userList){
                    userMap.put(u.Origin__c, u.userId__c);
                }
            }
            
            for(aCase__c c : toProces){
                if(c.Origin__c != 'Phone'){
                    c.OwnerId = userMap.get(c.Origin__c) != null ? userMap.get(c.Origin__c) : UserInfo.getUserId();
                }
            }

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }
    }

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //update
    public static void updateaCaseRecord(){
        List<aCase__c> toProces = null;
        Map<String, String> userMap = new Map<String, String>();
        List<Custom_User__c> userList = [SELECT Id, userId__c, Origin__c FROM Custom_User__c];

        try {
            System.debug('trigger.new' + trigger.new);
            toProces = trigger.new;

            if(userList != null){
                for(Custom_User__c u : userList){
                    userMap.put(u.Origin__c, u.userId__c);
                }
            }

            for(aCase__c c : toProces){
                switch on c.Origin__c {
                    
                    when 'Email' {
                        c.OwnerId = userMap.get('Email') != null ? userMap.get('Email') : UserInfo.getUserId();
                    }
                    when 'Web' {
                        c.OwnerId = userMap.get('Web') != null ? userMap.get('Web') : UserInfo.getUserId();
                    }
                    when else {
                        System.debug('userid = ' + UserInfo.getUserId());
                        c.OwnerId = UserInfo.getUserId();
                    }
                }
            }

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }
    }
}