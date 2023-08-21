({
    /**
     * @description 초기화 (Prefix 및 필드 선택 관련 정보 조회)
     */
    getInitData : function(component) {
        let action = component.get("c.getInitData");
        let recordId = component.get("v.recordId");
		action.setCallback(this, function(response) {
            let state = response.getState();

            if (state === "SUCCESS") {
                let returnValue = response.getReturnValue();
                console.log(JSON.stringify(returnValue));

                component.set("v.prefix", returnValue.prefix);
                component.set("v.listAvailable", returnValue.listField);
                component.set("v.listRequiredField", ['fm_ProductCode__c','fm_PriceBookEntryName__c']);
                component.set("v.listSelected", returnValue.listRequiredField);
                component.set("v.listSelectedSave", returnValue.listRequiredField);
                
                let visualforceUrl = returnValue.prefix + '/apex/QuotePDFCreate?Id=' + recordId + "&listSelectedField=" + returnValue.listRequiredField ;      
                component.set("v.vfPageUrl", visualforceUrl);
                console.log( 'visualforceUrl :: ' + visualforceUrl) ;

                console.log( 'returnValue.listField :: ' + JSON.stringify(returnValue.listField));
			} else if (state === "INCOMPLETE") {
                alert("From server: " + response.getReturnValue());
            } else if (state === "ERROR") {
                var errors = response.getError();
                if(errors) {
                    if(errors[0] && errors[0].message) {
                        this.showToast('ERROR', errors[0].message);
                        console.log("Error message: " + errors[0].message);
                    }
                }
                else {
                    console.log("Unknown error");
                }
            }
        });

        $A.enqueueAction(action);
    },

    /**
     * @description 파일 생성 진행
     */
     doCreateFile : function(component) {
        var action = component.get("c.doCreateFile");
        let saveType = component.get("v.saveType");
        let listSelectedSave = component.get("v.listSelectedSave");
		action.setParams({
            recordId : component.get("v.recordId"),
            saveType : saveType,
            listSelectedSave : listSelectedSave.toString()
		});
		action.setCallback(this, function(response) {
            let state = response.getState();

            if(state === "SUCCESS") {
                let returnValue = response.getReturnValue();
                console.log(JSON.stringify(returnValue));

                this.showToast("info", saveType+" 파일이 견적에 성공적으로 저장되었습니다.");
                
                $A.get("e.force:closeQuickAction").fire();
                $A.get("e.force:refreshView").fire();
                
			} else if(state === "ERROR") {
                var errors = response.getError();
                if(errors) {
                    if(errors[0] && errors[0].message) this.showToast("error", errors[0].message);
                } else {
                    this.showToast("error", "Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    /**
     * @description 토스트 메세지 출력 이벤트 발생
     * @param {string} type 메세지 유형 (success, error, info, warning, other)
     * @param {string} message 토스트에 보여질 메세지
     */
	showToast : function(type, message) {
        let evt = $A.get("e.force:showToast");
        evt.setParams({
            key     : "info_alt",
            type    : type,
            message : message
        });
        evt.fire();
    },
})