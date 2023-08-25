({
    getInitData : function(cmp) {
        let action = cmp.get('c.getRelatedcContactList');
        let recordId = cmp.get('v.recordId');
        console.log('recordId = ', recordId);

        action.setParams({'cAccountId' : recordId});
        action.setCallback( this, function(response) {
            if(response.getState()=='SUCCESS') {
                // console.log('getReturnValue = ', response.getReturnValue());
                let cContactList = response.getReturnValue();
                cmp.set('v.data', cContactList);
                cmp.set('v.Listlength', cContactList.length);

                // Name에 레코드 view page url 연결
                cmp.get('v.data').forEach(i => {
                    // console.log('i', i);
                    i['cContactURL'] = '/lightning/r/cContact__c/'+ i['Id'] +'/view'
                });


                if(cContactList.length>0){
                    cmp.set('v.iscContact', true);
                } else {
                    cmp.set('v.iscContact', false);
                }
            }
            else if(response.getState()=='ERROR') {
                console.log('getInitData ERROR =', response.getError()); 
            }
        });
        
        $A.enqueueAction( action ); //실행코드
    },

    //레코드 수정페이지로 이동
    updateData: function(cmp, row){
        let recordId = row.Id;
        var navigateEvent = $A.get('e.force:navigateToURL');

        if(navigateEvent){
            navigateEvent.setParams({
                "url": "/lightning/r/cContact__c/" + recordId + "/edit"
            });
            navigateEvent.fire(); //event 발생
        }
    },

    //레코드 삭제
    removeData: function(cmp, row){
        console.log('delete row = ', row);
        
        let action = cmp.get('c.removeRecord');
        action.setParams({'recordId' : row.Id});
        action.setCallback( this, function(response) {
            if(response.getState()=='SUCCESS') {
                var rows = cmp.get('v.data');
                var rowIndex = rows.indexOf(row);

                rows.splice(rowIndex, 1);
                cmp.set('v.data', rows);
            }
            else if(response.getState()=='ERROR') {
                console.log('getInitData ERROR =', response.getError()); 
            }
        });
        
        $A.enqueueAction( action ); //실행코드
    },
})
