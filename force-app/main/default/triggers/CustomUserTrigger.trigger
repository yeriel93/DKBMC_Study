/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 08-02-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
trigger CustomUserTrigger on Custom_User__c(before insert, before update, after insert, after update) {

    switch on Trigger.OperationType {
        
        when BEFORE_INSERT {
            uniqueCaseOrigin();
        }

        when BEFORE_UPDATE {
            uniqueCaseOrigin();
        }

        when AFTER_INSERT {
            
        }

        when AFTER_UPDATE {
            
        }
    }

    List<Custom_User__c> toProces = null;

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // insert
    public static void uniqueCaseOrigin(){
        
        try {

            Set<String> origin = new Set<String>();

            for(Custom_User__c c : trigger.new){
                origin.add(c.Origin__c);
            }
            
            List<Custom_User__c> targetList = [SELECT Id FROM Custom_User__c WHERE Origin__c IN :origin];
    
            if(targetList != null){
                throw new customMyException('faild');
            }

        } catch (customMyException e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }

       
    }

// custom Exception class 생성  
public class customMyException extends Exception {}
















}