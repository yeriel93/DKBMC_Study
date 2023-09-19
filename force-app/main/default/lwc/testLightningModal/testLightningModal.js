import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class TestLightningModal extends LightningModal {
	@api headerTitle;

	connetedCallback(){
		console.log('headerTitle => ', this.headerTitle);
	}

    closeModal() {
        this.close('success');
      }
    
}