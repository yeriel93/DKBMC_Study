({
    // 초기화 (related contact List 확인)
    fnInit : function(component, event, helper) {
        // 컬럼
        component.set('v.columns',[
            {label: 'Name', fieldName: 'Name', type: 'text'},
            {label: 'Title', fieldName: 'Title__c', type: 'text'},
            {label: 'phone', fieldName: 'phone__c', type: 'text'},
        ]);

        // apex에서 데이터 가져오기 (나중에는 helper에 구현하면 좋을 듯)
        var getData = component.get('c.');
        

        component.set('v.iscContact', true);

    }
})
