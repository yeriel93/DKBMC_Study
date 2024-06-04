/**
 * @description       : 
 * @author            : woomg@dkbmc.com
 * @group             : 
 * @last modified on  : 04-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
public without sharing class ChangeOwnerService implements DataBase.Batchable<String>, DataBase.stateful, DataBase.AllowsCallouts {
	/**
	 * OwnerChangeOptionType
	 * =====================
	 * EnforceNewOwnerHasReadAccess						// for All sObjects
	 * KeepAccountTeam									// for Account
	 * KeepSalesTeam									// for Opportunity
	 * KeepSalesTeamGrantCurrentOwnerReadWriteAccess	// for Opportunity
	 * SendEmail										// Send notification email to new owner
	 * TransferAllOwnedCases							// for Account, need also TransferOwnedOpenCases
	 * TransferArticleAllVersions						// for Knowledge
	 * TransferArticleOwnedArchivedVersions				// for Knowledge
	 * TransferArticleOwnedPublishedVersion				// for Knowledge
	 * TransferContacts									// for Account
	 * TransferContracts								// for Account
	 * TransferNotesAndAttachments						// for All sObject which has Notes and Atatchments
	 * TransferOpenActivities							// for All sObject which has Activities
	 * TransferOrders									// for Account
	 * TransferOthersOpenOpportunities					// for Account, need also TransferOwnedOpenOpportunities
	 * TransferOwnedClosedOpportunities					// for Account
	 * TransferOwnedOpenCases							// for Account
	 * TransferOwnedOpenOpportunities					// for Account
	**/

	public static String urlTemplate = 'https://{0}/services/Soap/u/54.0/{1}?_HttpMethod=PATCH';

	public static String xmlBodyTemplate = '' +
		'<soapenv:Envelope\n' +
		'    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"\n' +
		'    xmlns:tns="urn:partner.soap.sforce.com"\n' +
		'    xmlns:ens="urn:sobject.partner.soap.sforce.com">\n' +
		'    <soapenv:Header>\n' +
        '        <tns:SessionHeader>\n' +
        '            <tns:sessionId>{0}</tns:sessionId>\n' +
        '        </tns:SessionHeader>\n' +
        '        <tns:OwnerChangeOptions>\n' +
        '            <tns:options>\n' +
		'{1}' + 
		'            </tns:options>\n' +
        '        </tns:OwnerChangeOptions>\n' +
		'    </soapenv:Header>\n' +
		'	 <soapenv:Body>\n' +
        '        <tns:update>\n' +
        '            <tns:sObjects>\n' +
		'{2}\n' + 
        '            </tns:sObjects>\n' +
        '        </tns:update>\n' +
    	'    </soapenv:Body>\n' +
		'</soapenv:Envelope>';

	public static String sObjectBodyTemplate = '' +
		'                <tns:type>{0}</tns:type>\n' +
		'                <ens:fieldsToNull></ens:fieldsToNull>\n' +
		'                <ens:Id>{1}</ens:Id>\n' +
		'                <OwnerId>{2}</OwnerId>';

	public static String accountOptionTemplate = '' +
		// '                <tns:type>EnforceNewOwnerHasReadAccess</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		'                <tns:type>KeepAccountTeam</tns:type>\n' +
		'                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferContacts</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferContracts</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferNotesAndAttachments</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOpenActivities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOrders</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferAllOwnedCases</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOwnedOpenCases</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOthersOpenOpportunities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOwnedClosedOpportunities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOwnedOpenOpportunities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>SendEmail</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		'';

	public static String opptyOptionTemplate = '' +
		// '                <tns:type>EnforceNewOwnerHasReadAccess</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		'                <tns:type>KeepSalesTeam</tns:type>\n' +
		'                <tns:execute>true</tns:execute>\n' +
		'                <tns:type>KeepSalesTeamGrantCurrentOwnerReadWriteAccess</tns:type>\n' +
		'                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferNotesAndAttachments</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOpenActivities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>SendEmail</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		'';

	public static String otherOptionTemplate = '' +
		// '                <tns:type>EnforceNewOwnerHasReadAccess</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferNotesAndAttachments</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>TransferOpenActivities</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		// '                <tns:type>SendEmail</tns:type>\n' +
		// '                <tns:execute>true</tns:execute>\n' +
		'';

	@AuraEnabled
	public static String changeOwner(String objectName, String recordId, String ownerId){
		String result = '';
		try {
			System.Url mydomain = System.Url.getOrgDomainUrl();
			String url = String.format(urlTemplate, new String[]{ mydomain.getHost(), UserInfo.getOrganizationId() });
			String body = xmlFormatter(objectName, recordId, ownerId);

			HttpRequest req = new HttpRequest();
			req.setEndpoint(url);
			req.setMethod('POST');
			req.setHeader('Content-Type', 'text/xml; charset=utf-8');
			req.setHeader('SOAPAction','{N/A}');
			req.setBody(body);
		  		 
			Http http = new Http();
			HTTPResponse res = http.send(req);

			XmlToJson xtj = new XmlToJson(res.getBody());
			result = xtj.getJsonText();
		} catch (Exception e) {
			throw new AuraHandledException(e.getMessage());
		}

		return result;
	}

	@TestVisible
	private static String xmlFormatter(String objectName, String recordId, String ownerId){
		//String sessionId	= UserInfo.getSessionId();
		String sessionId	= getSessionId();
		String objectBody	= String.format(sObjectBodyTemplate, new String[]{ objectName, recordId, ownerId });
		String changeOption	= objectName == 'Account' ? accountOptionTemplate :
							  objectName == 'Opportunity' ? opptyOptionTemplate : otherOptionTemplate;
		String xmlBody		= String.format(xmlBodyTemplate, new String[]{ sessionId, changeOption, objectBody });

		return xmlBody;
	}

	@TestVisible
	private static String getSessionId(){
        return 'session-id';
        // return Test.isRunningTest() ? 'session-id' : Page.GenerateSessionId4LWC.getContent().toString().replaceAll('\n','');
    }

	/**
	 * Batch change part
	 */
	public String		objectName;
	public list<String>	recordIds;
	public String		ownerId;

	public List<String> start(DataBase.BatchableContext BC){
		return recordIds;
	}

	public void execute(DataBase.BatchableContext BC, List<String> scopeList){
		try {
			for(String recordId : scopeList){
				String result = ChangeOwnerService.changeOwner(this.objectName, recordId, this.ownerId);
			}
		} catch (Exception e){
			system.debug(e.getMessage());
		}
	}

	public void finish(DataBase.BatchableContext BC){
		system.debug('owber change batch finished.');
	}
	
	/**
	 * String xmlString = 
	 * '<?xml version="1.0"?>'
	 * '<rss version="2.0">'
	 * '    <channel>'
	 * '        <title>W3Schools Home Page</title>'
	 * '        <link>https://www.w3schools.com</link>'
	 * '        <description>Free web building tutorials</description>'
	 * '        <item>'
	 * '             <title>RSS Tutorial</title>'
	 * '             <link>https://www.w3schools.com/xml/xml_rss.asp</link>''
	 * '             <description>New RSS tutorial on W3Schools</description>'
	 * '        </item>'
	 * '        <item>'
	 * '             <title>XML Tutorial</title>'
	 * '             <link>https://www.w3schools.com/xml</link>'
	 * '             <description>New XML tutorial on W3Schools</description>'
	 * '        </item>'
	 * '    </channel>'
	 * '</rss>'
	 * Dom.Document xmlData = new Dom.Document();
	 * xmlData.load(xmlString);
	 * system.debug(XmlToJson.parseDocumentToJson(xmlData));
	**/
	public class XmlToJson {
		public String xmlText { get; set; }
		//  Try to determine some data types by pattern
		public Pattern 
			boolPat = Pattern.compile('^(true|false)$'),
			decPat  = Pattern.compile('^[-+]?\\d+(\\.\\d+)?$'), 
			datePat = Pattern.compile('^\\d{4}.\\d{2}.\\d{2}$'), 
			timePat = Pattern.compile('^\\d{4}.\\d{2}.\\d{2} (\\d{2}:\\d{2}:\\d{2} ([-+]\\d{2}:\\d{2})?)?$');

		public XmlToJson(String xmlText){
			this.xmlText = xmlText;
		}

		//  This function converts XML into a json string
		public String getJsonText() {
			try {
				Dom.Document doc = new Dom.Document();
				doc.load(this.xmlText);
				return parseDocumentToJson(doc);
			} catch(Exception e) {
				return '';
			}
		}
	
		//  This function converts XML into a Map
		public map<Object, Object> parseDocumentToMap(Dom.Document doc) {
			return parseNode(doc.getRootElement(), new map<Object, Object>());
		}
		//  This function converts XML into a JSON string
		public String parseDocumentToJson(Dom.Document doc) {
			return JSON.serializePretty(parseDocumentToMap(doc));
		}

		//  Primary function to decode XML
		@TestVisible
		private map<Object, Object> parseNode(Dom.XmlNode node, map<Object, Object> parent) {
			//  Iterate over all child elements for a given node
			for(Dom.XmlNode child: node.getChildElements()) {
				//  Pull out some information
				String nodeText = child.getText().trim();
				String name = child.getName();

				//  Determine data type
				Object value = 
					//  Nothing
					String.isBlank(nodeText) ? null :
					//  Try boolean
					boolPat.matcher(nodeText).find() ? (Object) Boolean.valueOf(nodeText) :
					//  Try decimals
					decPat.matcher(nodeText).find()  ? (Object) Decimal.valueOf(nodeText) :
					//  Try dates
					datePat.matcher(nodeText).find() ? (Object) Date.valueOf(nodeText) :
					//  Try times
					timePat.matcher(nodeText).find() ? (Object) DateTime.valueOf(nodeText) :
					//  Give up, use plain text
					(Object)nodeText;

				//  We have some text to process
				if(value != null) {
					//  This is a pluralized word, make list
					if(name.endsWith('s')) {
						// Add a new list if none exists
						if(!parent.containsKey(name)) {
							parent.put(name, new list<Object>());
						}
						// Add the value to the list
						((list<Object>) parent.get(name)).add(value);
					} else {
						//  Store a new value
						parent.put(name, value);
					}
				} else if(child.getNodeType() == Dom.XmlNodeType.ELEMENT) {
					//  If it's not a comment or text, we will recursively process the data
					map<Object, Object> temp = parseNode(child, new map<Object, Object>());
					//  If at least one node was processed, add a new element into the array
					if(!temp.isEmpty()) {
						//  Again, create or update a list
						if(parent.containsKey(name)) {
							try {
								//  If it's already a list, add it
								((list<Object>)parent.get(name)).add(temp);
							} catch(Exception e) {
								//  Otherwise, convert the element into a list
								parent.put(name, new list<Object> { parent.get(name), temp });
							}
						} else {
							//  New element
							parent.put(name, temp);
						}
					}
				}
			}
			return parent;
		}
	}

	/**
	 * Sample update request and response for success/error/fault
	=======
	request
	=======
	<soapenv:Envelope
		xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
		xmlns:tns="urn:partner.soap.sforce.com"
		xmlns:ens="urn:sobject.partner.soap.sforce.com">
		<soapenv:Header>
			<tns:SessionHeader>
				<tns:sessionId>[[[[[session_id]]]]]</tns:sessionId>
			</tns:SessionHeader>
			<tns:OwnerChangeOptions>
				<tns:options>
					<tns:type>KeepAccountTeam</tns:type>
					<tns:execute>true</tns:execute>
				</tns:options>
			</tns:OwnerChangeOptions>
		</soapenv:Header>
		<soapenv:Body>
			<tns:update>
				<tns:sObjects>
					<tns:type>[[[[sObejct_Name]]]]</tns:type>
					<ens:fieldsToNull></ens:fieldsToNull>
					<ens:Id>[[[[record_id]]]]</ens:Id>
					<OwnerId>[[[[new_owner_id]]]]</OwnerId>
				</tns:sObjects>
			</tns:update>
		</soapenv:Body>
	</soapenv:Envelope>

	=======
	Success
	=======
	<?xml version="1.0" encoding="UTF-8"?>
	<soapenv:Envelope
		xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
		xmlns="urn:partner.soap.sforce.com">
		<soapenv:Header>
			<LimitInfoHeader>
				<limitInfo>
					<current>17006</current>
					<limit>5290000</limit>
					<type>API REQUESTS</type>
				</limitInfo>
			</LimitInfoHeader>
		</soapenv:Header>
		<soapenv:Body>
			<updateResponse>
				<result>
					<id>[[[[record_id]]]]</id>
					<success>true</success>
				</result>
			</updateResponse>
		</soapenv:Body>
	</soapenv:Envelope>

	=====
	Error
	=====
	<?xml version="1.0" encoding="UTF-8"?>
	<soapenv:Envelope
		xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
		xmlns="urn:partner.soap.sforce.com"
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<soapenv:Header>
			<LimitInfoHeader>
				<limitInfo>
					<current>17070</current>
					<limit>5290000</limit>
					<type>API REQUESTS</type>
				</limitInfo>
			</LimitInfoHeader>
		</soapenv:Header>
		<soapenv:Body>
			<updateResponse>
				<result>
					<errors>
						<message>Id not specified in an update call</message>
						<statusCode>MISSING_ARGUMENT</statusCode>
					</errors>
					<id xsi:nil="true"/>
					<success>false</success>
				</result>
			</updateResponse>
		</soapenv:Body>
	</soapenv:Envelope>

	=====
	Fault
	=====
	<?xml version="1.0" encoding="UTF-8"?>
	<soapenv:Envelope
		xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
		<soapenv:Body>
			<soapenv:Fault>
				<faultcode>soapenv:Client</faultcode>
				<faultstring>Missing entity type information. sObject requires a separate &apos;type&apos; field be sent.</faultstring>
			</soapenv:Fault>
		</soapenv:Body>
	</soapenv:Envelope>	
	**/
}