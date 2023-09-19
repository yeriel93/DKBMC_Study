import { LightningElement } from 'lwc';
import TestLightningModal from 'c/testLightningModal';

export default class TestParentElement extends LightningElement {
    
    handleOpen(){
        this.openModal();
    }

    async openModal (){
        const result = await TestLightningModal.open({
            size : 'medium',
            headerTitle : '모달입니당'
        });

        console.log('result = ', result);
    }
}