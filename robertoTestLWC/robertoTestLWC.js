import { LightningElement } from 'lwc';

export default class RobertoTestLWC extends LightningElement {

    numberData  = 234324;

    method1(para1){

    }

    //lifecycle hooks
    constructor(){
        super();
        console.log('constructor');
    }

    connectedCallback(){
        console.log('connectedCallback');
    }

    renderedCallback(){
        console.log('renderedCallback');
    }

    disconnectedCallback(){
        console.log('disconnectedCallback');
    }




}