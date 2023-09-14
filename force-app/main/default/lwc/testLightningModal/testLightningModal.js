import { LightningElement } from 'lwc';
import LightningModal from 'lightning/modal';

export default class TestLightningModal extends LightningModal {
    
    closeModal() {
        this.close('success');
      }
    
}