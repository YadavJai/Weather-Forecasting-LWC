import { LightningElement, track } from "lwc";
import getLogsData from "@salesforce/apex/GetCustomMetadataController.getLogsData";
import saveLogChanges from "@salesforce/apex/GetCustomMetadataController.saveLogChanges";


export default class Qb_DebuggingComp extends LightningElement {
  @track isChecked;
  @track isLoaded = false;

  saveChanges(event) {
    let dayOfExpiration = this.template.querySelector('[data-name="dateInput"]').value;
    let vm = this;
    if (dayOfExpiration > 0 && dayOfExpiration <= 30) {
      vm.isLoaded = false;
      saveLogChanges({ isEnabled: vm.isChecked, inputValue: dayOfExpiration })
        .then((result) => {
          vm.isLoaded = true;
          vm.template
            .querySelector("c-qb_-custom-toast-comp")
            .showCustomTostMessage({
              title: "Successfully Saved",
              variant: "success",
              autoclose: true,
            });
        })
        .catch((error) => {
          vm.template
            .querySelector("c-qb_-custom-toast-comp")
            .showCustomTostMessage({
              title: "Error Occurred",
              message: 'Error Occurred',
              variant: "error",
              autoclose: true,
            });
          ////console.log(error.message);
          ////console.log('Value not changed');
        });
    }
  }

  handleToggle(){
    this.isChecked = this.template.querySelector('[data-name=logCheckBox]').checked;
  }

  navigateToLogs() {
    window.open('/lightning/o/hic_qbmadeasy__Log__c/list');
  }

  // get isLogDisabled(){
  //   return !this.isChecked;
  // }
  connectedCallback() {
    ////console.log('Connected Debugging>>>');
    this.handleGetLogsData();
  }

  async handleGetLogsData(){
    await getLogsData()
    .then((data) => {
      this.isLoaded = true;
      ////console.log('Fetched Data Successfully',JSON.stringify(data));
      this.template.querySelector('[data-name="dateInput"]').value = data.hic_qbmadeasy__LogExpirationDays__c;
      this.isChecked = data.hic_qbmadeasy__Allow_Log_Generation__c;
    })
    .catch((error) => {
      ////console.log("Error fetching debugging status", error);
    });
  }



}