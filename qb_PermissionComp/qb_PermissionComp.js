import { LightningElement, api, track } from "lwc";
import adminPermission from "@salesforce/apex/QB_PermissionControlHandler.adminPermission";
import businessPermission from "@salesforce/apex/QB_PermissionControlHandler.businessPermission";
import readOnlyPermission from "@salesforce/apex/QB_PermissionControlHandler.readOnlyPermission";
import modifyAllUser from "@salesforce/apex/QB_PermissionControlHandler.modifyAllUsers";
import getAllSets from "@salesforce/apex/QB_PermissionControlHandler.getAllSets";
import assignAdditionalPermissions from '@salesforce/apex/QB_PermissionControlHandler.assignAppAndVFPagesPermissions';

export default class Qb_permissionComp extends LightningElement {
  @api isVisible;
  @track adminPermissionUsers;
  @track readOnlyPermissionUsers;
  @track businessPermissionUsers;
  @track modifyAllUsersList;
  @track isLoaded = true;
  @track adminPermissionIsEmpty = false;
  @track adminModifyAllIsEmpty = false;
  @track businessPermissionIsEmpty = false;
  @track readOnlyPermissionIsEmpty = false;
  @track allPermissionSetsMap;
  @track allSetsIsEmpty=false;

  handleTab(event) {
    try {
      // Prevent the default action of the link
      event.preventDefault();

      // Get the ID of the clicked tab item
      const tabItemId = event.target.getAttribute("aria-controls");

      // Hide all tab contents and remove 'slds-is-active' class from all tab items
      const tabContents = this.template.querySelectorAll(
        ".slds-tabs_default__content",
      );
      const tabItems = this.template.querySelectorAll(
        ".slds-tabs_default__item",
      );
      tabContents.forEach((content) => {
        content.classList.add("slds-hide");
      });
      tabItems.forEach((item) => {
        item.classList.remove("slds-is-active");
      });

      // Show the selected tab content and mark the clicked tab item as active
      this.template
        .querySelector(`#${tabItemId}`)
        .classList.remove("slds-hide");
      event.currentTarget.classList.add("slds-is-active");
    } catch (Error) {
      console.log("Error while checking" + Error);
    }
  }

  
  navigateToLogs(){
    window.open('/lightning/setup/PermSets/home/list');
  }

  connectedCallback() {
    console.log("Hello");
    try {
      this.isLoaded = false;
      //to get user with admin permission set
      adminPermission()
        .then((result) => {
          this.adminPermissionUsers = result;
          if (this.adminPermissionUsers.length == 0){
            this.adminPermissionIsEmpty = true;
          }
          console.log(JSON.stringify(this.adminPermissionUsers) + "amdin>>>>>>>>>" );
          console.log(this.adminPermissionIsEmpty,this.adminPermissionUsers.length);
        })
        .catch((error) => {
          console.log("Error" + error.message);
        });

      //to get user with business permission set
      businessPermission()
        .then((result) => {
          this.businessPermissionUsers = result;
          if (this.businessPermissionUsers.length == 0)
            this.businessPermissionIsEmpty = true;
          console.log(JSON.stringify(this.businessPermissionUsers) + ">>>>>>>>>");
          console.log(this.businessPermissionIsEmpty,this.businessPermissionUsers.length);
        })
        .catch((error) => {
          console.log("Error");
        });

      //to get user with readOnly Permission set
      readOnlyPermission()
        .then((result) => {
          this.readOnlyPermissionUsers = result;
          if (this.readOnlyPermissionUsers.length == 0)
            this.readOnlyPermissionIsEmpty = true;
          console.log(JSON.stringify(this.readOnlyPermissionUsers));
          console.log(this.readOnlyPermissionIsEmpty,this.readOnlyPermissionUsers.length);
        })
        .catch((error) => {
          console.log("Error");
        });

      //to get user with modify all permission
      modifyAllUser()
        .then((data) => {
          this.modifyAllUsersList = data;
          if (this.modifyAllUsersList.length == 0)
            this.adminModifyAllIsEmpty = true;
          console.log(JSON.stringify(this.modifyAllUsersList));
          console.log(this.adminModifyAllIsEmpty, this.modifyAllUsersList);
        })
        .catch((error) => {
          console.log("error");
        });

      //to get all the permission sets
      getAllSets()
        .then((data) => {
          //console.log('All sets++++++++++++++'+JSON.stringify(getAllSets));
          this.allPermissionSetsMap = data;
          this.isLoaded = true;
          if(data.length==0)this.allSetsIsEmpty=true;
          console.log(this.allSetsIsEmpty+'set is empty>>>>>>>>>>>>>');
          console.log(JSON.stringify(this.allPermissionSetsMap));
        })
        .catch((error) => {
          console.log("Error" + error.message);
          this.isLoaded = true;
        });


      //To give app and vf page permissions
      assignAdditionalPermissions()
        .then(() => {
            console.log('Apex method executed successfully');
        })
        .catch(error => {
            console.error('Error in executing Apex method:', error);
        });
    } catch (e) {
      console.log("Error" + e);
    }
  }
}