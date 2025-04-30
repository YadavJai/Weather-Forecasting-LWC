// import { LightningElement, wire,api,track } from 'lwc';
// import sendEstimateAsPdf from '@salesforce/apex/Qb_SendEstimatePdf.sendEstimateAsPdfFromSalesforce';
// import GET_INTERNAL_ID from '@salesforce/apex/GetCustomMetadataController.getHicInternalId';
// import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import fetchEmailFromQuickbooks from '@salesforce/apex/QB_CalloutUtility.getEmailAddressFromQuickbooks';
// import QB_LOGO from '@salesforce/resourceUrl/qb_icon';
// import customLabels from 'c/qb_CustomLabels';

// export default class Qb_GetEstimateAsPdf extends LightningElement {
//     @api recordId;
//     @api objectApiName;
//     @track isEstimate = true;
//     @track isShowModal = false;
//     @track emailChoosen;
//     @track isSendEmailToSpecifiedAdd = false;
//     isLoaded = true;
//     choosenEmailMethod = 'sendEmail';
//     companyId;
//     qbId;
//     qbEntity;
//     @track specificEmail;
//     qbButtonLabel = 'Send Estimate as an Email and PDF From Salesforce';

//     constructor() {
//         super();
//     }

//     connectedCallback(){
//         //console.log.log('connected');
//         GET_INTERNAL_ID({'recordId': this.recordId,'objectApi': this.objectApiName})
//         .then(result => {
//            //console.log.log('internal id string',result);
//            let hicInternalId = result;
//            if(hicInternalId!= null){
//            const arr = hicInternalId.split('-');
//            this.companyId = arr[0];
//            this.qbEntity = arr[1];
//            this.qbId = arr[2];
//             if(this.qbEntity === 'Invoice' ){
//                 this.qbButtonLabel = 'Send Invoice as an Email and PDF From Salesforce';
//             }
//            }
//         });
//         this.fetchCustomLabels();
//     }

//     getChoosenValue(event){
//         this.choosenEmailMethod = event.target.value;
//         if(this.choosenEmailMethod === 'sendEmail'){
//             //console.log.log('in choosen');
//             this.isSendEmailToSpecifiedAdd = true;
//         }
//         else{
//             this.isSendEmailToSpecifiedAdd = false;
//         }
//     }

//     get emailOption() {
//         return [
//             { label: 'Default Email Same as in Quickbooks', value: 'Default' },
//             { label: 'Specify email Address', value: 'sendEmail' },
//         ];
//     }

//     getEmailValue(event){
//         //console.log.log('email address',event.target.value);
//     }

//     isInputValid() {
//         let isValid = true;
//         let inputFields = this.template.querySelectorAll('.validate');
//         inputFields.forEach(inputField => {
//             if(!inputField.checkValidity()) {
//                 inputField.reportValidity();
//                 isValid = false;
//             }
//             this.specificEmail = inputField.value;
//             //console.log.log('standard validation',this.specificEmail);
//         });
//         return isValid;
//     }

//     handleClickDownload(){
//         //console.log.log('in handle click download');
//         this.isLoaded = false;
        
//         if(this.qbEntity != 'Estimate' && this.qbEntity!= 'Invoice' && this.companyId){
//             this.isLoaded = true;
//             this.showErrorToast('This feature is available for Estimate and Invoice Only');
//         }
//         else if(!this.companyId){
//         this.isLoaded = true;
//         this.showErrorToast('Company Id Or Qb Id is not found');
//         }
//         else if(this.qbEntity === 'Estimate' || this.qbEntity === 'Invoice' ){
//             let isValidEmail = this.isInputValid();
//             if(isValidEmail) {
//                 //console.log.log('valid data');
//                 sendEstimateAsPdf({'companyId': this.companyId,'qbEntity': this.qbEntity,'qbId':this.qbId,'specificEmail':this.specificEmail,'recordId':this.recordId,'objectApiName':this.objectApiName})
//                 .then((result) => {
//                     this.isLoaded = true;
//                     //console.log.log('in send estimate as pdf',JSON.stringify(result));
//                     if(result){
//                         if(result.statusCode == '200' || result.statusCode == '201'){
//                             this.showSuccessToast();
//                         }
//                         else{
//                             this.showErrorToast(result.body);
//                         }
//                     }   
//                 })
//                 .catch(error => {
//                     this.isLoaded = true;
//                     //console.log.log('in con error',error);
//                     this.showErrorToast(error.message);
//                 });
//             }
//             else{
//                 this.isLoaded = true;
//                 this.showErrorToast('Email is not valid');
//             }
//         }

//     }

//     // handleClickDownload(){
        

//     //     sendEstimateAsPdf({'companyId': companyId,'qbEntity': qbEntity,'qbId':qbId,'specificEmail':specificEmail,'recordId':this.recordId,'objectApiName':this.objectApiName})
//     //     .then((result) => {
//     //         //console.log.log('in con success',result);
//     //         // this.isLoaded = true;
//     //         // if(result){
//     //         //     if(result.statusCode == '200' || result.statusCode == '201'){
//     //         //         this.showSuccessToast();
//     //         //     }
//     //         //     else{
//     //         //         this.showErrorToast(result.body);
//     //         //     }
//     //         // }   
//     //     })
//     //     .catch(error => {
//     //         // this.isLoaded = true;
//     //         //console.log.log('in con error',error);
//     //         // this.showErrorToast(error.message);
//     //     });
           
//     // }

//     showSuccessToast() {
//         const event = new ShowToastEvent({
//             title: 'Success.',
//             message: 'You have succesfully sent estimate as a pdf',
//             variant: 'success'
//         });
//         this.dispatchEvent(event);
//     }

//     showErrorToast(err) {
//         const event = new ShowToastEvent({
//             title: 'Error Occured',
//             message: 'Error message:'+err,
//             variant: 'error'
//         });
//         this.dispatchEvent(event);
//     }

//     showModalBox() {
        
        
//         //console.log.log('this.qbId',this.companyId );
//         //console.log.log('this.qbcompany', this.qbEntity);
//         //console.log.log('this.qbentity', this.qbId);
//         GET_INTERNAL_ID({'recordId': this.recordId,'objectApi': this.objectApiName})
//         .then(result => {
//            //console.log.log('internal id string',result);
//            let hicInternalId = result;
//            if(hicInternalId!= null){
//            const arr = hicInternalId.split('-');
//            this.companyId = arr[0];
//            this.qbEntity = arr[1];
//            this.qbId = arr[2];
//             if(this.qbEntity === 'Invoice' ){
//                 this.qbButtonLabel = 'Send Invoice as an Email and PDF From Salesforce';
//             }
//            }
//            if(this.qbEntity != 'Estimate' && this.qbEntity!= 'Invoice' && this.companyId){
//             this.isLoaded = true;
//             this.showErrorToast('This feature is available for Estimate and Invoice Only');
//         }
//         else if(!this.companyId){
//         this.isLoaded = true;
//         this.showErrorToast('Company Id Or Qb Id is not found');
//         }
//         else if(this.companyId && this.qbEntity && this.qbId){
//             this.isShowModal = true;
//             this.isLoaded = false;
//             fetchEmailFromQuickbooks({'companyId':this.companyId,'qbEntity':this.qbEntity,'qbId':this.qbId})
//             .then(result=>{
//                 //console.log.log('in fetch email',JSON.stringify(result));
//                 //let qbEmail = result.body;
//                 ////console.log.log('qbEmail',qbEmail);
//                 if(result && result.body){
//                     this.specificEmail = result.body;
//                     //this.emailId = result;
//                     this.isLoaded = true;
//                     this.isShowModal = true;
//                 }
//                 else{
//                     this.specificEmail = '';
//                     this.isLoaded = true;
//                     //shor error this.ariaModal;
//                 }
                
//             })
//             .catch(err =>{
//                 //console.log.log('in err',err.message);
//                 this.isLoaded = true;
//                 this.showErrorToast(err);

//             });
//         }
//         });
        
//     }
    
//     hideModalBox() {
//         this.isShowModal = false;

//     }
    
//     // Qb Icon LOGO
//     qbIcon = QB_LOGO;

//     // Qb Button Label
//     fetchCustomLabels() {
//         let customLabel = new customLabels();
//         customLabel.getCustomLabels()
//         .then((label) => {
//            // this.qbButtonLabel = label.qbSendEstimateButtonLabel;
//         })
//     }



    
// }