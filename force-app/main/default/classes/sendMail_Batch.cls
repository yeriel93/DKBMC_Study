/**
 * @description       : aCase__c record에 status가 cloesd인 경우 메일 발송
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 09-01-2023
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public class sendMail_Batch implements Database.Batchable<SObject> {

    // aCase 리스트 가져오기 
    public Database.QueryLocator start(Database.BatchableContext bc) {
       
        String query = 'SELECT Id, Name, OwnerId, Owner.Email, Owner.Name, Status__c'
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

                    String[] toAddresses = new String[]{c.Owner.Email};
                    
                    mail.setToAddresses(toAddresses);
                    mail.setSubject(c.Owner.Name +'님의 aCase__c record ' + c.Name + '관련 메일입니당!');
                    mail.setHtmlBody('Your Case:<b> ' + c.Id +' </b>has been created.<p>'+
                    'To view your case <a href=https://dkbmc175-dev-ed.develop.lightning.force.com/lightning/r/aCase__c/'+c.Id+'/view>click here.</a>');
                }
            }
            
// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
            // visualforce page를 PDF로 변환해서 파일 첨부하기
            Pagereference pageRef = Page.CJFW_WageTable;
            Blob pdfBlob;
            pdfBlob = pageRef.getContentAsPDF(); // Visualforce 페이지를 PDF로 변환

            // PDF 첨부
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();
            attachment.setFileName('VisualforcePage.pdf');
            attachment.setBody(pdfBlob);
            mail.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment });

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------
            // visualforce page로 그린 화면을 메일에 그리기?
            // visaulforce 에서 이미 pdf로 랜더링을 했을경우 Blob.toString()이 안됨!!!!
            Pagereference pageRef = Page.CJFW_WageTable; 
            Blob pageBlob = pageRef.getContent(); // Visualforce 페이지를 Blob으로 가져옴
            
            // Blob을 UTF-8 문자열로 디코딩
            String pageHtml = pageBlob.toString();
            mail.setHtmlBody(pageHtml);

            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });

        } catch (Exception e) {
            System.debug('message =>' + e.getMessage());
            System.debug('trace =>' + e.getStackTraceString());
        }
    }

	public void finish(Database.BatchableContext BC){}
} 