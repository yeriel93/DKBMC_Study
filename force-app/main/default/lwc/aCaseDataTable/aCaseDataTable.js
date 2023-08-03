import LightningDatatable from "lightning/datatable";
import aCasePickList from "./aCasePickList.html";
import pickListStatic from "./pickListStatic.html";
import lookupColumn from './lookupColumn.html';

export default class CustomDataTable extends LightningDatatable {
    
    static customTypes = {
        
        picklistColumn: {
            template: pickListStatic,
            editTemplate: aCasePickList,
            standardCellLayout: true,
            typeAttributes: ['label', 'placeholder', 'options', 'value', 'context', 'variant','name']
        },

        // lookupColumn: {
        //     template: lookupColumn,
        //     standardCellLayout: true,
        //     typeAttributes: ['value', 'fieldName', 'object', 'context', 'name', 'fields', 'target']
        // }
    };
}