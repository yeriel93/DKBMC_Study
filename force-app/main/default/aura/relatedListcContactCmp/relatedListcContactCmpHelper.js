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


        

    }
})
