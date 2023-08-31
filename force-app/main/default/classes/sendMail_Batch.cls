/**
 * @description       : aCase__c record에 status가 cloesd인 경우 메일 발송
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 08-31-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class sendMail_Batch implements Database.Batchable<SObject> {

    // aCase 리스트 가져오기 
    public Database.QueryLocator start(Database.BatchableContext bc) {
       
        String query = 'SELECT Id, OwnerId, Owner.Email, Owner.Name, IsDeleted, Name, CreatedDate, CreatedById, LastModifiedDate, LastModifiedById, SystemModstamp, LastActivityDate, LastViewedDate, LastReferencedDate, aContactId__c, aAccountId__c, Type__c, Reason__c, Status__c, Priority__c, Origin__c, SuppliedEmail__c, SuppliedName__c, SuppliedCompany__c, SuppliedPhone__c, Product__c, EngineeringReqNumber__c, SLAViolation__c, Subject__c, Description__c, Comments__c, delete__c, CreatedDate__c, ClosedDate__c, PotentialLiability__c, customUserId__c'
                    + ' FROM aCase__c';

        return Database.getQueryLocator(query);
    }
	
    // aCase record에 status가 cloesd인 경우 메일 발송
	public void execute(Database.BatchableContext BC, List<aCase__C> scope){
        
        try {

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            for(aCase__c c : scope){
                if(c.Status__c == 'Closed'){
                    // System.debug('case~~~ = ' + c.Name);
                    
                    mail.toaddresses = new String[] {c.Owner.Email};
                    mail. = 'aCase Mail send Test';
                    
                    
                    
                    
                    
                    
                    
                }
            }
            System.debug('mail.toaddresses = ' + mail.toaddresses);

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }
    }

	public void finish(Database.BatchableContext BC){}
} 