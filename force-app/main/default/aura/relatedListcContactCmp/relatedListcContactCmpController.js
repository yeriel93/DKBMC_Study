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
            // {label: 'Name', fieldName: 'Name', type: 'text'},
            { label: 'Name', 
                fieldName: 'cContactURL', 
                type:'url', 
                typeAttributes:{ label:{fieldName: 'Name'}}},
            {label: 'Title', fieldName: 'Title__c', type: 'text'},
            {label: 'Phone', fieldName: 'Phone__c', type: 'text'},
            { type: 'action', typeAttributes: { rowActions: actions }},
        ]);

        helper.getInitData(cmp);

        
    },


    handleRowAction : function(cmp, event, helper){
        try {
            var action = event.getParam('action');
            var row = event.getParam('row');
            // console.log('row =', row);

            switch (action.name) {
                case 'edit':
                    helper.updateData(cmp, row);
                    break;

                case 'delete':
                    helper.removeData(cmp, row);
                    // 삭제 후 데이터 다시 불러오기 (초기화)
                    helper.getInitData(cmp);
                    break;
            }
        } catch (error) {
            console.log('error Message = ', error.message);
        }
    },

    //cContact new page로 이동
    naviRecordNewpage: function(cmp, event, helper){
        var navigateEvent = $A.get('e.force:navigateToURL');

        if(navigateEvent){
            navigateEvent.setParams({
                "url": "/lightning/o/cContact__c/new"
            });
            navigateEvent.fire(); //event 발생
        }
    },
})
