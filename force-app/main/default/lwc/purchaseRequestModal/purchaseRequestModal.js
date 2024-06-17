/**
 * @description       : 
 * @author            : yeonji.lim@dkbmc.com
 * @group             : 
 * @last modified on  : 17-06-2024
 * @last modified by  : yeonji.lim@dkbmc.com
**/
import { LightningElement } from 'lwc';
import LightningModal from 'lightning/modal';

export default class PurchaseRequestModal extends LightningModal {
    
    connectedCallback() {
        console.log('구매요청 모달 시작');
    }

    /* 모달 끄기 - 구매요청 obj listView로 이동 */
    modalClose(){
        window.history.back();
    }
}