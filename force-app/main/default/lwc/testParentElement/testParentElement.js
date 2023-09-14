import { LightningElement } from 'lwc';
import TestLightningModal from 'c/testLightningModal';

export default class TestParentElement extends LightningElement {
    
    connectedCallback(){
        this.openModal();
    }

    async openModal (){
        const result = await TestLightningModal.open({
            size : 'medium'
        });

        console.log('result = ', result);
    }
}