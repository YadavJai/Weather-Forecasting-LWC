import { LightningElement,api,track } from 'lwc';
// import fetchCustomRecs from "@salesforce/apex/GetCustomMetadataController.fetchCustomRecs";
// import getDefaultData from "@salesforce/apex/HandleDefaultSetting.getDefaultData";

export default class Qb_DefaultSettingComp extends LightningElement {
// @track compRecordsList;
// @track isLoaded=true;
// @track isZero=false;
// invoiceValue = '--Select Value--';
// selectedAccount;
// itemValue='--Select Value--';

//     connectedCallback(){
//         this.isLoaded=false;
//     }

//     removeLoader(){
//         this.isLoaded=true;
//     }

//     get invoiceOptions() {
//         return [
//             { label: 'New', value: 'new' },
//             { label: 'In Progress', value: 'inProgress' },
//             { label: 'Finished', value: 'finished' },
//         ];
//     }

//     get itemOptions() {
//         return [
//             { label: 'Service', value: 'Service' },
//             { label: 'Inventory', value: 'Inventory' },
//             { label: 'Non-Inventory', value: 'Non-Inventory' },
//         ];
//     }

//     invoiceHandleChange(event) {
//         this.invoiceValue = event.detail.value;
//     }

//     itemHandleChange(event){
//         this.itemValue=event.detail.value;
//     }

//     handleHover(event){
//         try{
//             var modal = event.target.parentElement.querySelector('.myModal');
//             modal.style.display = 'block';
//         }catch(error){
//             //////console.log('exception ',error);
//             console.error('error message ',error.message);
//         }
//     }

//     handleHoverOut(event) {
//         var modal = event.target.parentElement.querySelector('.myModal');
//         modal.style.display="none";
//     }


//     connectedCallback() {
//         fetchCustomRecs({})
//             .then((data) => {
//                 this.isLoaded = true;
//                 this.compRecordsList=data;
//                 if (this.compRecordsList.length == 1) {
//                     this.template.querySelector('lightning-accordion').activeSectionName = this.compRecordsList[0].Label;
//                 }
//                 else if(this.compRecordsList.length==0){
//                   this.ifZero=true;
//                 }
//             })
//             .catch((e) => {
//                 //////console.log("Error>>>>>>>>>>>>>>" + e.message);
//             })
//     }
}