({
    // 초기화 (Get related cContact List)
    fnInit : function(component, event, helper) {
        // 컬럼
        component.set('v.columns',[
            {label: 'Name', fieldName: 'Name', type: 'text'},
            {label: 'Title', fieldName: 'Title__c', type: 'text'},
            {label: 'Phone', fieldName: 'Phone__c', type: 'text'},
        ]);

        helper.getInitData(component);
    }
})
