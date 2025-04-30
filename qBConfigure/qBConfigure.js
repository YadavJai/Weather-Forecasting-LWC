import { LightningElement,wire,api,track } from 'lwc';


export default class QBConfigure extends LightningElement {

    @api origin;
    @api isSalesforce;
    @api companyAdded;
    @api realmId = '';
    @api companyLabel = '';

    @track setupActive = true;
    @track configActive;
    @track defaultSettingActive;
    @track permissionActive;
    @track debuggingActive;
    @track realTimeSyncActive;
    @track contactSupportActive;
    @track deleteSettingActive;
    @track chatAgentActive;
   
    handleVerticalTabClick(event) {
        if (event.target.label == "Setup") {
          this.defaultSettingActive = false;
          this.permissionActive = false;
          this.realTimeSyncActive = false;
          this.debuggingActive = false;
          this.configActive = false;
          this.setupActive = true;
          this.deleteSettingActive = false;
          this.contactSupportActive = false;
          this.chatAgentActive = false;
        } else if (event.target.label == "Default Value Settings") {
          this.defaultSettingActive = true;
          this.permissionActive = false;
          this.realTimeSyncActive = false;
          this.debuggingActive = false;
          this.configActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.chatAgentActive = false;
          this.contactSupportActive = false;
        } else if (event.target.label == "Permissions") {
          this.defaultSettingActive = false;
          this.permissionActive = true;
          this.realTimeSyncActive = false;
          this.debuggingActive = false;
          this.configActive = false;
          this.chatAgentActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.contactSupportActive = false;
        } else if (event.target.label == "Enable Debugging") {
          this.defaultSettingActive = false;
          this.permissionActive = false;
          this.realTimeSyncActive = false;
          this.debuggingActive = true;
          this.configActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.contactSupportActive = false;
          this.chatAgentActive = false;
        } else if (event.target.label == "Real-Time Sync Settings") {
          this.defaultSettingActive = false;
          this.permissionActive = false;
          this.realTimeSyncActive = true;
          this.debuggingActive = false;
          this.configActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.contactSupportActive = false;
          this.chatAgentActive = false;
        } else if (event.target.label == "Raise a Ticket") {
          this.defaultSettingActive = false;
          this.permissionActive = false;
          this.realTimeSyncActive = false;
          this.debuggingActive = false;
          this.configActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.contactSupportActive = true;
          this.chatAgentActive = false;
        } else if (event.target.label == 'Agent'){
          this.defaultSettingActive = false;
          this.permissionActive = false;
          this.realTimeSyncActive = false;
          this.debuggingActive = false;
          this.configActive = false;
          this.setupActive = false;
          this.deleteSettingActive = false;
          this.contactSupportActive = false;
          this.chatAgentActive = true;
        }
    }


    renderedCallback(){
        if(this.setupActive)
        this.template.querySelector('.setup').classList.add('slds-is-active');
        // this.template.querySelector('.setup').classList.add('test');
    }

    activeMenu(){
        this.template.querySelector('lightning-layout-item').style.display="block";
        this.template.querySelector('.setupComp').size='10';
        this.template.querySelector('.activeMenuIcon').style.display="none";
    }


    deactiveMenu(){
        this.template.querySelector('lightning-layout-item').style.display="none";
        this.template.querySelector('.setupComp').size='12';
        this.template.querySelector('.activeMenuIcon').style.display="block";
    }
 
    //Now using tawk script for contact support
    // onCustomerSupportSubmit(event) {
    //   let vm = this;
    //   let Query = `${event.detail.description}`;
    //   //console.log("Query" + Query);
    //   ////console.log(event.detail.email);
    //   sendCustomerQuery({ Query: Query}).then((result)=>{
    //     //console.log("result===>", JSON.stringify(result));
    //       if (result["isSuccess"] === "true") {
    //         //console.log('Success');
    //         vm.template
    //         .querySelector("c-qb_-custom-toast-comp")
    //         .showCustomTostMessage({
    //           message: 'The email was sent successfully. We will contact you soon.',
    //           variant: "success",
    //           autoclose: true,
    //      }); 
    //       } else {
    //         //console.log('Error');
    //         vm.template
    //         .querySelector("c-qb_-custom-toast-comp")
    //         .showCustomTostMessage({
    //           title: "Form not Submitted",
    //           message: 'Form not Submitted',
    //           variant: "error",
    //           autoclose: true,
    //      }); 
    //       }
    //   })
    //   .catch((error)=>{
    //     //console.log('Error Occured');
    //   })
    //   ////console.log('onCustomerSupportSubmit',support);
    // }

}