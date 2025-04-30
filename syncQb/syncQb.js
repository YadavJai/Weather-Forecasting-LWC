import { LightningElement, api ,track} from 'lwc';
import createQBRecord from "@salesforce/apex/QB_CreateUpdateSObject.createQBRecord";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import QB_LOGO from '@salesforce/resourceUrl/qb_icon';
import customLabels from 'c/qb_CustomLabels';

export default class SyncQb extends LightningElement {
    @api recordId;
    @api objectApiName;
    @api qbType;
    @api qbEntity;
    @api qbCompanyId;
    @api qbButtonLabel;
    @track errMessage='';
    @track isclick=false;
    //@track buttonLabel = 'Sync To Quickbooks';
    qbCompanyIdValue;
    qbEntityValue;
    qbLabel;

    constructor(){
        super();
    }

    connectedCallback(){
        if(this.qbButtonLabel){
            this.qbLabel = this.qbButtonLabel;
        }
        else{
            this.fetchCustomLabels();
        }
        
        
    }

    handleClickSyncQb(){
        ////console.log('handleClickSyncQbToastMsg Called');

        ////console.log('recordId==>', this.recordId);
        ////console.log('qbEntity==>', this.qbEntity);
        ////console.log('qbCompanyId ==>', this.qbCompanyId);
        ////console.log('objectApiName ==>', this.objectApiName);
        this.isclick = true;

        if(this.qbCompanyId === undefined && this.qbEntity === undefined){
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: 'Invalid Configuration',
                variant: 'error',
                autoclose: false,
            });
        }else if(this.qbCompanyId != undefined && this.qbEntity === undefined){
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: 'Invalid Configuration',
                variant: 'error',
                autoclose: false,
            });
        }else if(this.qbCompanyId === undefined && this.qbEntity != undefined){
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: 'Invalid Configuration',
                variant: 'error',
                autoclose: false,
            });
        }else{
            createQBRecord({ 'recordId': this.recordId, 'qbEntityApiName':this.qbEntity , 'qbCompanyIdApiName':this.qbCompanyId ,'objectApiName':this.objectApiName}).then(result => {
                //console.log('result test2 ', JSON.stringify(result));
                //////console.log('line 13 ', result['isSuccess']);
                if(result['isSuccess'] === 'true'){  
                    if(this.qbEntity == 'Project'){
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Success',
                            message: 'Project sync has started and will be completed in a few minutes. You can check the sync status in the HIC QuickBook Status field.',
                            variant: 'success',
                            autoclose: false,
                        });
                    }else{
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Success',
                            message: 'Successfully synced to the Quickbooks',
                            variant: 'success',
                            autoclose: false,
                        });
                    }
                    
                }else if(result['message'] == undefined && result['detail'] == undefined){
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: 'Configuration is incorrect',
                        variant: 'error',
                        autoclose: false,
                    });
                }else{
                    ////console.log('in line 85');
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: result['message'] + ' '+ result['detail'],
                        variant: 'error',
                        autoclose: false,
                    });
                }
                this.isclick = false;
               
            })
            .catch(error => {
                ////console.log('error', error);
                this.isclick = false;
            })
        }
        

    }

    // Qb Sync Icon LOGO
    qbIcon = QB_LOGO;

    // Qb Sync Button Label
    fetchCustomLabels() {
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
            this.qbLabel = label.qbSyncButtonLabel;
        })
    }
}