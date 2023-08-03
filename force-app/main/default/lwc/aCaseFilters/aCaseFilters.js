import { LightningElement, api, track, wire } from 'lwc';

// Lightning Message Service and a message channel
import { publish, MessageContext } from 'lightning/messageService';
import aCase_FILTERED_MESSAGE from '@salesforce/messageChannel/aCaseFiltered__c';

export default class ACaseFilters extends LightningElement {
    delayTimeout;
    error;
    StatusOptions = [
        {label: 'New', value: 'New'},
        {label: 'Working', value: 'Working'},
        {label: 'Escalated', value: 'Escalated'},
        {label: 'Closed', value: 'Closed'}
    ];
    OriginOptions = [
        {label: 'Phone', value: 'Phone'},
        {label: 'Web', value: 'Web'},
        {label: 'Email', value: 'Email'}
    ];

    Keywords;
    searchKeywordList;

    @wire(MessageContext)
    messageContext;

    SearchName(event){
        console.log('name = ', event.target.value);
        // this.delayedFireFilterChangeEvent();
    }


    // 검색 이벤트
    searchHandle(){
        try {
            const list = this.template.querySelectorAll('.inputTag');
            this.searchKeywordList = [];

            list.forEach(i => {
                // console.log('fieldValue => ',i.value);
                // console.log('fieldName => ', i.dataset.fieldname);
                this.Keywords = {
                                    'fieldName' : i.dataset.fieldname, 
                                    'value' : i.value != undefined ? i.value : ''
                                };

                this.searchKeywordList.push(this.Keywords);                    
            });
            console.log('filter => searchKeywordsList =', JSON.parse(JSON.stringify(this.searchKeywordList)));

            publish(this.messageContext, aCase_FILTERED_MESSAGE, {
                filters: this.searchKeywordList
            });

        } catch (error) {
            console.log('error', error);
        }
            
    }

    //검색값 리셋
    resetHandle(){
        const list = this.template.querySelectorAll('.inputTag');
        console.log('input =>', list);
        if(list){
            list.forEach(col => {
                col.value = '';
            });
        }
        //리스트 불러오기
        this.searchKeywordList = [];
        publish(this.messageContext, aCase_FILTERED_MESSAGE, {
            filters: this.searchKeywordList
        });
    }

}