/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 18-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
import { LightningElement } from 'lwc';

const columns = [
    { label: 'Label', fieldName: 'name' },
    { label: 'Website', fieldName: 'website', type: 'url' },
    { label: 'Phone', fieldName: 'phone', type: 'phone' },
    { label: 'Balance', fieldName: 'amount', type: 'currency' },
    { label: 'CloseAt', fieldName: 'closeAt', type: 'date' },
];

export default class PurchaseRequestModal extends LightningElement {

    catecoryValue;
    columns = columns;

    get catecoryOptions() {
        return [
            { label: '필기류', value: 'C01' },
            { label: '사무용품', value: 'C02' },
            { label: '사무기기', value: 'C03' },
        ];
    }

    /* 카테고리 변경 이벤트 */
    handleCatecoryChange(event) {
        this.value = event.detail.value;
    }

    connectedCallback() {
        console.log('구매요청 모달 시작');
    }

    /* 모달 끄기 - 구매요청 obj listView로 이동 */
    modalClose(){
        window.history.back();
    }
}