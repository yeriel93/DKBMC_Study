import { LightningElement } from 'lwc';
// image
import IMAGE_RESOURCE from '@salesforce/resourceUrl/sample';
import jsPDF from '@salesforce/resourceUrl/jsPDF';
import { loadScript } from 'lightning/platformResourceLoader';

export default class CJFWConfirmationOfBalance extends LightningElement {
    imageUrl = IMAGE_RESOURCE;
    
    renderedCallback(){
        console.log(this.contact.data);
        loadScript(this, jsPDF ).then(() => {});
        if (this.jsPdfInitialized) {
            return;
        }
        this.jsPdfInitialized = true;
    }

}