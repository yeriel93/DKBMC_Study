({
    myAction : function(component, event, helper) {

        var pageRef = component.get('v.pageReference');
        console.log('pageRef.state', pageRef.state);
        
        let recordName = pageRef.state.c__recordName;
        component.set('v.recordName', recordName);

        let recordId = pageRef.state.c__aAccountId;
        component.set('v.recordId', recordId);

        let objectName = pageRef.state.c__objectName;
        component.set('v.objectName', objectName);
    }
})