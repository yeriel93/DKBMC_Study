/**
 * @description       : Case record에 status가 cloes가 아닌 경우 메일 발송
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 08-31-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public with sharing class sendMail_Batch implements Database.Batchable<aCase__C> {

    public Database.QueryLocator start(Database.BatchableContext bc) {}
	
	public void execute(Database.BatchableContext BC, List<aCase__C> scope){}

    
	public void finish(Database.BatchableContext BC){}
}