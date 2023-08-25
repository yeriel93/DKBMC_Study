import { LightningElement } from 'lwc';

export default class CJFWConfirmationOfBalance extends LightningElement {
    
    connectedCallback(){
        window.print();
    }
    
    generatePDF() {
        window.print();
    }
}