({
    // 초기화 (Get related cContact List)
    fnInit : function(cmp, event, helper) {
        //rowaction
        var actions = [
            {label: "Edit", name: "edit"},
            {label: "Delete", name: "delete"}
        ];

        // 컬럼
        cmp.set('v.columns',[
            {label: 'Name', fieldName: 'Name', type: 'text'},
            {label: 'Title', fieldName: 'Title__c', type: 'text'},
            {label: 'Phone', fieldName: 'Phone__c', type: 'text'},
            { type: 'action', typeAttributes: { rowActions: actions }},
        ]);

        helper.getInitData(cmp);

        
    },


    handleRowAction : function(cmp, event, helper){
        var action = event.getParam('action');
        var row = event.getParam('row');

        switch (action.name) {
            case 'edit':
                helper.udpateData(cmp, row);
                break;

            case 'delete':
                helper.removeData(cmp, row);
                break;
        }
    },

})
