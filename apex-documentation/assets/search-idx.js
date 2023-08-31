export default [
    {
        "title": "Home",
        "fileName": "index.html",
        "text": "Home Project Home Use the apexdox.homePagePath  setting to point to an HTML file that contains details about your project. The body of the HTML will show up here instead of this default!"
    },
    {
        "title": "aAccountController",
        "fileName": "aAccountController.html",
        "text": "aAccountController : Signature public with sharing class aAccountController Author : yeonji.lim@dkbmc.com aAccountController Methods getName(inputId) relatedaContact(aAccountId) upsertaContact(upsertData) getName(inputId) Signature @AuraEnabled public static User getName(Id inputId) relatedaContact(aAccountId) Signature @AuraEnabled public static List<aContact__c> relatedaContact(String aAccountId) upsertaContact(upsertData) Signature @AuraEnabled public static void upsertaContact(List<aContact__c> upsertData)"
    },
    {
        "title": "aCaseController",
        "fileName": "aCaseController.html",
        "text": "aCaseController : Signature public with sharing class aCaseController Author : yeonji.lim@dkbmc.com aCaseController Methods getaCantactData(recordId) getaCaseRecords(searchKeywords) getRecordById(recordId) getaCantactData(recordId) Signature @AuraEnabled public static aCase__c getaCantactData(String recordId) getaCaseRecords(searchKeywords) Signature @AuraEnabled public static List<aCase__c> getaCaseRecords(List<Map<String,String>> searchKeywords) getRecordById(recordId) Signature @AuraEnabled public static aCase__c getRecordById(String recordId)"
    },
    {
        "title": "aCaseTeamController",
        "fileName": "aCaseTeamController.html",
        "text": "aCaseTeamController : Signature public with sharing class aCaseTeamController Author : yeonji.lim@dkbmc.com aCaseTeamController Methods getaCaseTeamList(recordId) getaCaseTeamList(recordId) Signature @AuraEnabled public static List<aCase_Team_Member__c> getaCaseTeamList(String recordId)"
    },
    {
        "title": "AccountCloneBatch",
        "fileName": "AccountCloneBatch.html",
        "text": "AccountCloneBatch : Signature public class AccountCloneBatch implements Database.Batchable<sObject> Author : yeonji.lim@dkbmc.com AccountCloneBatch Methods execute(bc, records) finish(bc) start(bc) execute(bc, records) Signature public void execute(Database.BatchableContext bc, List<Account> records) finish(bc) Signature public void finish(Database.BatchableContext bc) start(bc) Signature public Database.QueryLocator start(Database.BatchableContext bc)"
    },
    {
        "title": "AccountDataController",
        "fileName": "AccountDataController.html",
        "text": "AccountDataController : Signature public class AccountDataController Author : yeonji.lim@dkbmc.com AccountDataController Methods fetchContact() fetchContact() Signature @AuraEnabled(cacheable=true) public static List<Contact> fetchContact()"
    },
    {
        "title": "aContactController",
        "fileName": "aContactController.html",
        "text": "aContactController : Signature public with sharing class aContactController Author : yeonji.lim@dkbmc.com aContactController Methods getName(inputId) getName(inputId) Signature @AuraEnabled public static User getName(Id inputId)"
    },
    {
        "title": "BasicProjectSchedule",
        "fileName": "BasicProjectSchedule.html",
        "text": "BasicProjectSchedule : Signature public class BasicProjectSchedule implements Schedulable Author : yeonji.lim@dkbmc.com BasicProjectSchedule Methods execute(ctx) execute(ctx) Signature public void execute(SchedulableContext ctx)"
    },
    {
        "title": "cContactController",
        "fileName": "cContactController.html",
        "text": "cContactController : Signature public with sharing class cContactController Author : yeonji.lim@dkbmc.com cContactController Methods getRelatedcContactList(cAccountId) removeRecord(recordId) getRelatedcContactList(cAccountId) Signature @AuraEnabled public static List<cContact__c> getRelatedcContactList(String cAccountId) removeRecord(recordId) Signature @AuraEnabled public static void removeRecord(String recordId)"
    },
    {
        "title": "ContactCloneBatch",
        "fileName": "ContactCloneBatch.html",
        "text": "ContactCloneBatch : Signature public class ContactCloneBatch implements Database.Batchable<sObject> Author : yeonji.lim@dkbmc.com ContactCloneBatch Methods execute(bc, scope) finish(bc) start(bc) execute(bc, scope) Signature public void execute(Database.BatchableContext bc, List<Contact> scope) finish(bc) Signature public void finish(Database.BatchableContext bc) start(bc) Signature public Database.QueryLocator start(Database.BatchableContext bc)"
    },
    {
        "title": "sendMail_Batch",
        "fileName": "sendMail_Batch.html",
        "text": "sendMail_Batch : Signature public with sharing class sendMail_Batch implements Database.Batchable<aCase__C> Author : yeonji.lim@dkbmc.com sendMail_Batch Methods execute(BC, scope) finish(BC) start(bc) execute(BC, scope) Signature public void execute(Database.BatchableContext BC, List<aCase__C> scope) finish(BC) Signature public void finish(Database.BatchableContext BC) start(bc) Signature public Database.QueryLocator start(Database.BatchableContext bc)"
    }
];
