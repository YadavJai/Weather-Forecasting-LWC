import { LightningElement,track,api } from 'lwc';

// import recordExistInQb from '@salesforce/apex/Qb_RedirectToQbController.recordExistInQb';
import GET_INTERNAL_ID from '@salesforce/apex/GetCustomMetadataController.getHicInternalIdAndQbEnvr';
//import QBBaseURLForRedirect from '@salesforce/label/c.QBBaseURLForRedirect';
import QB_LOGO from '@salesforce/resourceUrl/qb_icon';
import customLabels from 'c/qb_CustomLabels';

export default class Qb_RedirectToQb extends LightningElement {
    @api recordId;
    @api objectApiName;
    companyId;
    qbEntity;
    qbId;
    @track qbUrl;
    qbBaseUrl;
    qbButtonLabel;

    constructor(){
        super();
    }

    connectedCallback() {
        this.fetchCustomLabels();
    }

    handleRedirectToQuickbookRecord(){
        GET_INTERNAL_ID({'recordId': this.recordId,'objectApi': this.objectApiName})
        .then(result => {
            
            if(result['isSuccess'] === 'true'){
                let hicInternalId = result['qbInternalId'];
                let qbEnvironment = result['qbEnvironment'];
                
                if(qbEnvironment ==='Production'){
                    this.qbBaseUrl = 'https://app.qbo.intuit.com/app/';
                }
                else{
                    this.qbBaseUrl = 'https://app.sandbox.qbo.intuit.com/app/';
                    
                }
                if(hicInternalId!= null){
                    const arr = hicInternalId.split('-');
                    this.companyId = arr[0];
                    this.qbEntity = arr[1];
                    this.qbId = arr[2];
                    if(this.qbEntity === 'Estimate' ){
                        this.qbUrl = this.qbBaseUrl+ this.qbEntity.toLowerCase()+'?txnId='+ this.qbId;
                    }
                    else if(this.qbEntity === 'Customer' ){
                        this.qbUrl = this.qbBaseUrl + 'customerdetail?nameId='+ this.qbId;
                    }
                    else if(this.qbEntity === 'Invoice' ){
                        this.qbUrl = this.qbBaseUrl+ this.qbEntity.toLowerCase()+'?txnId='+ this.qbId;
                    }
                    else if(this.qbEntity === 'Item' ){
                        this.qbUrl = this.qbBaseUrl + 'items';
                    }
                    else if(this.qbEntity==='Bill')
                    {
                        this.qbUrl= this.qbBaseUrl + 'bill?&txnId='+this.qbId;
                    }
                    else if(this.qbEntity==='vendor')
                    {
                        this.qbUrl= this.qbBaseUrl + 'vendordetail?nameId='+this.qbId;
                    }
                    else if(this.qbEntity==='Account')
                    {
                        this.qbUrl = this.qbBaseUrl + 'register?accountId='+this.qbId;
                    }
                    else if(this.qbEntity==='Payment')
                    {
                        this.qbUrl=this.qbBaseUrl + 'recvpayment?txnId='+this.qbId;
                    }
                    else if(this.qbEntity==='PurchaseOrder')
                        {
                            this.qbUrl=this.qbBaseUrl + 'purchaseorder?&txnId='+this.qbId;
                        }
                    else{
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                                title: 'Error',
                                message: 'Redirect is not available.',
                                variant: 'error',
                                autoclose: false,
                            });
                    }
                    if(this.qbUrl){
                        let link = this.template.querySelector('.redirect');
                        //console.log.log('this.qbUrl ==> '+ this.qbUrl);
                        link.setAttribute("href", this.qbUrl);
                        link.setAttribute("target", '_blank');
                        link.click();  
        
                    }
                    
                }
                else{
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: 'Quickbook Id is not found.',
                            variant: 'error',
                            autoclose: false,
                        });
        
                    }
            } 
            else{
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Error',
                    message: 'Quickbook Id is not found.',
                    variant: 'error',
                    autoclose: false,
                });
    
                
            } 
            
            

            

          
        });
        // //console.log.log('this.recordId ', this.recordId);
        // //console.log.log(' this.objectApiName ', this.objectApiName);
        // recordExistInQb({'recordId': this.recordId,'objectApiName': this.objectApiName})
        //     .then(result => {
        //         //console.log.log('result ==> ',JSON.stringify(result));
        //         if(result != null){
        //             if(result['isSuccess'] === 'true'){

        //                 if(result['qbType'] == 'Estimate'){
        //                     this.qbUrl = QBBaseURLForRedirect + '/app/'+ result['qbType'].toLowerCase()+'?txnId='+result['qbId'];
        //                 }else if(result['qbType'] == 'Customer'){
        //                     this.qbUrl = QBBaseURLForRedirect + '/app/customerdetail?nameId='+result['qbId'];
        //                 }/*else if(result['qbType'] == 'Invoice'){
        //                     this.qbUrl = QBBaseURLForRedirect + '/app/'+ result['qbType'].toLowerCase()+'?txnId='+result['qbId'];
        //                 }*/
    
        //                 //this.qbUrl = QBBaseURLForRedirect + '/app/'+ result['qbType'].toLowerCase()+'?txnId='+result['qbId']
        //                 //console.log.log('this.qbUrl ==> 12', this.qbUrl);
                        // let link = this.template.querySelector('.redirect');
                        // //console.log.log('this.qbUrl ==> '+ this.qbUrl);
                        // link.setAttribute("href", this.qbUrl);
                        // link.setAttribute("target", '_blank');
                        // link.click();   
        //             }else{
        //                 this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
        //                     title: 'Error',
        //                     message: result['message'] + '. ' + result['detail'],
        //                     variant: 'error',
        //                     autoclose: false,
        //                 });
        //             }
        //         }
                
               
        //     })
        //     .catch(error => {
        //         //console.log.log('in con error',error.message);
        //     });
    }

    // Qb Icon LOGO
    qbIcon = QB_LOGO;

    // Qb Button Label
    fetchCustomLabels() {
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
            this.qbButtonLabel = label.qbRedirectButtonLabel;
        })
    }
}