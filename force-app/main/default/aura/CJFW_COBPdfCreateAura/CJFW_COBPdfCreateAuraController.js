({
    
    /**
     * @description 초기화 (Mobile 여부 확인)
     */
    fnInit : function(component, event, helper) {
        if ( $A.get("$Browser.formFactor") != 'DESKTOP')
            component.set('v.isMobile', true);
        console.log('isMobile ::' +  component.get('v.isMobile'));
        helper.getInitData(component);        
    },

    /**
     * @description 조회 필드 선택 후 저장 시 미리보기 화면 재렌더링
     */
    fnSaveFieldSelect : function(component, event, helper) {
        component.set("v.isOpenFieldSelect", false);

        let prefix = component.get("v.prefix");
        let recordId = component.get("v.recordId");
        let listSelected = component.get("v.listSelected"); 

        console.log ( 'listSelected :: ' + listSelected) ; 
        component.set("v.vfPageUrl", '');
    
        let visualforceUrl = prefix + '/apex/QuotePDFCreate?Id=' + recordId + "&listSelectedField=" + listSelected ;
        component.set("v.listSelectedSave", listSelected);
        
        console.log( 'visualforceUrl :: ' + visualforceUrl) ;
        component.set("v.vfPageUrl", visualforceUrl);
    },

    /**
     * @description 조회 필드 선택 화면 Open Toggle
     */
    fnToggleFieldSelect : function(component, event, helper) {
        let isOpenFieldSelect = component.get("v.isOpenFieldSelect");
        component.set("v.isOpenFieldSelect", !isOpenFieldSelect);
    },

    /**
     * @description 파일 생성 진행
     */
    fnCreateFile : function(component, event, helper) {

        component.set("v.showSpinner", true);

        let saveType = event.getSource().getLocalId();
        console.log( "saveType ::: " + saveType );
        component.set("v.saveType", saveType);
        
        helper.doCreateFile(component);
    },
    
    /**
     * @description 파일 생성 화면 닫기
     */
    fnCancel: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire();
        $A.get("e.force:refreshView").fire();
    },

})