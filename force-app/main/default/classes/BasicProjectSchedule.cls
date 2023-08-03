/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 05-15-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class BasicProjectSchedule implements Schedulable {
    
    public void execute(SchedulableContext ctx) {
        
        //AccountBatch
        AccountCloneBatch accBatch = new AccountCloneBatch();
        Database.executeBatch(accBatch);

        //ContactBatch
        ContactCloneBatch conBatch = new ContactCloneBatch();
        Database.executeBatch(conBatch);
    }
}