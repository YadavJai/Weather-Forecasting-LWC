import { LightningElement, track, wire,api } from 'lwc';
import sObjSelectionList from "@salesforce/apex/Qb_ConfigController.getSObjectSelectList";
import getQuickbookEntities from '@salesforce/apex/FieldSetupCompController.getQuickbookEntities'; 
import onSavePicklistField from '@salesforce/apex/FieldSetupCompController.onSavePicklistField';


export default class FieldSetupModal extends LightningElement {
    @track isModalOpen = true;
    @track currentStep = '1';
    @track selectedAction;
    @track selectedObject;
    @track fieldLabel = '';
    @track fieldApiName = '';
    @track selectedQBEntity;
    @track isStep1 = true;
    @track isStep2 = false;
    @track isStep3 = false;
    @track objectOptions = [];
    @track qbEntities = [];
    @api companyId;
    @track themeStyle;
    @track iconName;
    @track message;
    @track showMessage = false;

    @wire(getQuickbookEntities)
    getQuickbookEntities({ error, data }) {
        if (data) {
            // Convert the Map<String, String> to the array format required by lightning-combobox
            this.qbEntities = Object.keys(data).map(key => ({ label: data[key], value: key }));
        } else if (error) {
            console.error('Error fetching combobox values:', error);
        }
    }

    @wire(sObjSelectionList) SobjSelList(resp) {
        if (resp.data) {
            this.objectOptions = resp.data;
        } else if (resp.error) {
            this.objectOptions = undefined;
        }
    }
    
    // Options for Step 1
    get step1Options() {
        return [
            { label: 'Create New Field', value: 'create' },
            { label: 'Setup Existing Fields', value: 'setup' }
        ];
    }

    // Open the modal
    handleOpenModal() {
        this.isModalOpen = true;
    }

    // Close the modal
    async handleCloseModal() {
        await this.sendDataToParent();
        this.resetSteps();
    }

    sendDataToParent() {
        console.log('in send data to paraent');
        const event = new CustomEvent('closefieldsetupmodal', {
            detail: false // Passing the inputValue to parent
        });
        this.dispatchEvent(event); // Dispatch the event
    }

    // Reset the steps
    resetSteps() {
        this.currentStep = '1';
        this.isStep1 = true;
        this.isStep2 = false;
        this.isStep3 = false;
        this.selectedAction = null;
        this.selectedObject = null;
        this.fieldLabel = '';
        this.selectedQBEntity = null;
    }

    // Handle action selection change
    handleActionChange(event) {
        this.selectedAction = event.detail.value;
    }

    // Handle object selection change
    handleObjectChange(event) {
        this.selectedObject = event.detail.value;
    }

    // Handle field label change
    handleFieldLabelChange(event) {
        this.fieldLabel = event.detail.value;
    }

    // Handle field API change
    handleApiNameChange(event) {
        this.fieldApiName = event.detail.value;
    }

    // Handle QuickBooks entity selection change
    handleQBEntityChange(event) {
        this.selectedQBEntity = event.detail.value;
    }

    // Move to next step
    handleNext() {
        if (this.currentStep === '1' && this.selectedAction === 'create') {
            this.currentStep = '2';
            this.isStep1 = false;
            this.isStep2 = true;
        } else if (this.currentStep === '2' && this.selectedObject) {
            this.currentStep = '3';
            this.isStep2 = false;
            this.isStep3 = true;
        }
    }

    // Go back to previous step
    handleBack() {
        if (this.currentStep === '2') {
            this.currentStep = '1';
            this.isStep1 = true;
            this.isStep2 = false;
        } else if (this.currentStep === '3') {
            this.currentStep = '2';
            this.isStep2 = true;
            this.isStep3 = false;
        }
    }

    // Save the new field
    handleSave() {

        try{
            if(!this.fieldLabel){
                this.showErrorToast('Field Label cannot be empty.');
                return;
            }
    
            if(!this.fieldApiName){
                this.showErrorToast('Field API Name cannot be empty.');
                return;
            }
    
            if(!this.selectedQBEntity){
                this.showErrorToast('QB Entity cannot be empty.');
                return;
            }
    
            if(!this.selectedObject){
                this.showErrorToast('Sobject cannot be empty.');
                return;
            }
    
            if(!this.companyId){
                this.showErrorToast('Company Id cannot be empty.');
                return;
            }
    
            onSavePicklistField({
                objectApiName: this.selectedObject,
                fieldLabel: this.fieldLabel,
                qbEntity: this.selectedQBEntity,
                qbCompanyId: this.companyId,
                fieldApiName:this.fieldApiName
            })
            .then(() => {
                // Handle success (e.g., show a success message or close the modal)
                this.showSuccessToast('Field created successfully.');
                //this.handleCloseModal();
                // Optionally, refresh data or show a success message
            })
            .catch(error => {
                console.error('Error creating picklist field: ', error);
                this.showMessage = true;
                this.message = error;
                this.iconName = 'utility:error';
                this.themeStyle = 'slds-notify--toast slds-theme_error';
                // Handle error (e.g., show an error message)
            });
        }catch(exception){
            console.log('exception',exception);
        }

        
        
    }


    showErrorToast(error){
        console.log('hi');
        this.showMessage = true;
        this.message = error;
        this.iconName = 'utility:error';
        this.themeStyle = 'slds-notify--toast slds-theme_error';
    }

    showSuccessToast(message){
        console.log('bye');
        this.showMessage = true;
        this.message = message;
        this.iconName = 'utility:success';
        this.themeStyle = 'slds-notify--toast slds-theme_success';
    }
    handleNotifyClose(){
        this.showMessage = false;
    }

}