import { LightningElement,api,track } from 'lwc';

import createQBInvoiceRecord from "@salesforce/apex/QB_ConvertToInvoiceController.createQBInvoiceRecord";
import GET_INTERNAL_ID from '@salesforce/apex/GetCustomMetadataController.getHicInternalId';
import createRequiredField from "@salesforce/apex/QB_MetadataUtilityController.createRequiredField";
import QB_LOGO from '@salesforce/resourceUrl/qb_icon';
import customLabels from 'c/qb_CustomLabels';

export default class Qb_ConvertToInvoice extends LightningElement {

    @api recordId;
    @api objectApiName;
    @track isclick=false;
    qbButtonLabel;

    constructor(){
        super();
    }

    connectedCallback() {
        this.fetchCustomLabels();
    }

    /*connectedCallback(){
        GET_INTERNAL_ID({ 'recordId': this.recordId,'objectApi':this.objectApiName}).then(result => {
            ////console.log.log('result 123 ===>  '+ JSON.stringify(result));
            val = result;
            if(val != null){
                this.isclick = false;
            }else{
                this.isclick=true;
            }
        })
        .catch(error => {
            ////console.log.log('error', error);
        })
    }*/

    handleClickConvertToInvoice(){
        this.isclick=true;
        let sobjectApiNameList = [];
        sobjectApiNameList.push('hic_qbmadeasy__Invoice__c');
        let vm = this;
        createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
            createQBInvoiceRecord({ 'recordId': vm.recordId,'objectApiName':vm.objectApiName}).then(result => {
                ////console.log.log('result '+ JSON.stringify(result));
                ////console.log.log('line 13 '+ result['isSuccess']);
                if(result['isSuccess'] === 'true'){
                    vm.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Success',
                        message: 'Successfully Converted Estimate into Invoice in Quickbooks',
                        variant: 'success',
                        autoclose: false,
                    });
                }else{
                    vm.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: result['message'] + '. ' + result['detail'],
                        variant: 'error',
                        autoclose: false,
                    });
                }
                vm.isclick=false;
               
            })
            .catch(error => {
                vm.isclick=false;
                ////console.log.log('error', error);
            })
            ////console.log('result on creating field', result)
        })
        .catch(error => {
            ////console.log('error at creating field==>', error);
        })
        
        ////console.log.log('Called handleClickConvertToInvoice');

        // createQBInvoiceRecord({ 'recordId': this.recordId,'objectApiName':this.objectApiName}).then(result => {
        //     ////console.log.log('result '+ JSON.stringify(result));
        //     ////console.log.log('line 13 '+ result['isSuccess']);
        //     if(result['isSuccess'] === 'true'){
        //         this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
        //             title: 'Success',
        //             message: 'Successfully Converted Estimate into Invoice in Quickbooks',
        //             variant: 'success',
        //             autoclose: false,
        //         });
        //     }else{
        //         this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
        //             title: 'Error',
        //             message: result['message'] + '. ' + result['detail'],
        //             variant: 'error',
        //             autoclose: false,
        //         });
        //     }
        //     this.isclick=false;
           
        // })
        // .catch(error => {
        //     this.isclick=false;
        //     ////console.log.log('error', error);
        // })
        
    }

    // Qb Icon LOGO
    qbIcon = QB_LOGO;

    // Qb Button Label
    fetchCustomLabels() {
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
            this.qbButtonLabel = label.qbConvertToInvoiceButtonLabel;
        })
    }
}