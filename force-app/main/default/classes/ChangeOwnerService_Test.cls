/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 2024-01-31
 * @last modified by  : woomg@dkbmc.com
**/
@isTest
public with sharing class ChangeOwnerService_Test {

    @isTest
    public static void testMethodOne() {
        Account acc = new Account(name='Hong-ga-ne', OwnerId = UserInfo.getUserId());
        insert acc;

        list<String> ids = new list<String>();
        ids.add(UserInfo.getUserId());

        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator(200));
        system.debug(ChangeOwnerService.changeOwner('Account', acc.Id, UserInfo.getUserId()));
        ChangeOwnerService b = new ChangeOwnerService();
        b.objectName = 'Account';
        b.ownerId = UserInfo.getUserId();
        b.recordIds = ids;
        Database.executeBatch(b, 1);

        system.debug(ChangeOwnerService.getSessionId());
        Test.stopTest();
    }

    public class MockHttpResponseGenerator implements HttpCalloutMock {
        public Integer statusCode;
        public String body = '' +
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soapenv:Envelope' +
        '    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"' +
        '    xmlns="urn:partner.soap.sforce.com">' +
        '    <soapenv:Header>' +
        '        <LimitInfoHeader>' +
        '            <limitInfo>' +
        '                <current>17006</current>' +
        '                <limit>5290000</limit>' +
        '                <type>API REQUESTS</type>' +
        '            </limitInfo>' +
        '        </LimitInfoHeader>' +
        '    </soapenv:Header>' +
        '    <soapenv:Body>' +
        '        <updateResponse>' +
        '            <result>' +
        '                <id>[[[[record_id]]]]</id>' +
        '                <success>true</success>' +
        '            </result>' +
        '        </updateResponse>' +
        '    </soapenv:Body>' +
        '</soapenv:Envelope>';
    
        public MockHttpResponseGenerator(){
            this.statusCode  = 200;
        }
        public MockHttpResponseGenerator(Integer code){
            this.statusCode  = code;
        }
        public HTTPResponse respond(HTTPRequest req) {
            // Optionally, only send a mock response for a specific endpoint
            // and method.
            System.assertEquals('POST', req.getMethod());
            
            // Create a fake response
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'text/xml; charset=utf-8');
            res.setBody(body);
            res.setStatusCode(this.statusCode);
            return res;
        }
    }
}