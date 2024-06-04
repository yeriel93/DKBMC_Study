public with sharing class TaskEditController {

    /* 
    * PickList value 가져오기
    */
    @AuraEnabled(cacheable=true)
    public static List<String> getPicklistValues(String objectName, String fieldName) {
        List<String> picklistValues = new List<String>();

        // 특정 object에 특정 field 정보를 가져옴
        Schema.DescribeFieldResult fieldResult = Schema.getGlobalDescribe().get(objectName).getDescribe().fields.getMap().get(fieldName).getDescribe();

        if(fieldResult.isAccessible()) {
            List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
            for(Schema.PicklistEntry entry : entries) {
                picklistValues.add(entry.getLabel());
            }
        }
        return picklistValues;
    }

    /* 
    * Task record 가져오기
    */
    @AuraEnabled
    public static Task getTask(string taskId){

        try {
            System.debug('taskId =' + taskId);

            List<Task> data = [SELECT Id, Owner.Name, Status, Subject, Who.Name, ActivityDate, What.Name, Priority, Description, CreatedBy.Name, LastModifiedBy.Name
                    FROM Task
                    WHERE Id = :taskId
                    LIMIT 1];
            
            if(data.size()>0){
                return data[0];
            }

            System.debug('task data =' + data);

        } catch (Exception e) {
            System.debug('Error Message => ' + e.getMessage());
            System.debug('Error Line => ' + e.getStackTraceString());
        }
        return new Task();
    }
}