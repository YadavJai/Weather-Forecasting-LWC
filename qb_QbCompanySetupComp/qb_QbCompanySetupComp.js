import { LightningElement,track,api,wire } from 'lwc';
import getActivePricebook from '@salesforce/apex/Qb_QbCompanySetupController.getActivePricebook';
import getCurrencySettings from '@salesforce/apex/Qb_QbCompanySetupController.getCurrencySettings';
import getSavedCompanyInfo from '@salesforce/apex/Qb_QbCompanySetupController.getSavedCompanyInfo';
import saveCompanySetupInfo from '@salesforce/apex/Qb_QbCompanySetupController.saveCompanySetupInfo';
import handleQbCustomFields from '@salesforce/apex/Qb_QbCompanySetupController.handleQbCustomFields';
import getAllQbObjectMethod from '@salesforce/apex/Qb_QbCompanySetupController.getAllQbObject';
import saveSyncChangesMethod from '@salesforce/apex/Qb_QbCompanySetupController.saveSyncChangesMethod';
import getIntitialSyncData from '@salesforce/apex/Qb_QbCompanySetupController.getIntitialSyncData';
import HIC_GIF from '@salesforce/resourceUrl/PageLoadingGif';
import DoneGIF from '@salesforce/resourceUrl/QB_Right_Check_Animation';
import GirlGIF from '@salesforce/resourceUrl/QB_Project_Question_Icon';
import getStoreProjectCredentials from '@salesforce/apex/Qb_QbCompanySetupController.getStoreProjectCredentials';
import storeProjectCredentials from '@salesforce/apex/Qb_QbCompanySetupController.storeProjectCredentials';
export default class Qb_QbCompanySetupComp extends LightningElement {
    @track temporaryStoreCurrentStepVar;
    @api companyId;
    @api companyData;
    @track themeStyle;
    @track iconName;
    @track message;
    @track showMessage = false;
    @track priceBookList = [];
    @track qbCompanyList = [];
    @track currencyCodeList = [];
    @track selectedCurrencyValue = '';
    @track showCurrencyCode = false;
    pricebookSelectedValue = '';
    @track isSpinner = false;
    @track isCurrencyMatching = true;
    @track qbHomeCurrency = '';
    @track sfDefaultCurrency = '';
    @api emailForBatchStatus = '';
    @track isQbAccessTokenExpired = false;
    @track isByepassCheckboxChecked = true;
    @track openFieldSetupComp = false;
    showProjectSyncModal = false;
    @track _selected = [];
    qbObjectOptions = [];
    hicGIF = HIC_GIF;
    doneGIF = DoneGIF;
    girlGif = GirlGIF;
    @track numberOfHours = '1';
    @track saveButtonDisabled = false;
    //true if the project sync from sf to qb modal is active 
    isProjectSyncModalActive = false;
    @track currentStep = 1;
    @track step1Active = true;
    @track showLoadingSpinner = false;
    @track step2Active = false;
    @track stepMoreThan1 = false;
    @track isLastStep = false;
    @track projectCredentialsAlreadySaved = false;
    selectedVerificationOption = 'authcode';
    @track userNameInputVal;
    @track passwordInputVal;
    @track authInputVal;
    @track verificationOptions = [
        {
            label: 'Email',
            value: 'Email'
        },
        {
            label: 'Mobile',
            value: 'Mobile'
        },
        {
            label: 'Authentication Code',
            value: 'authcode'
        }
    ]
    @track showEditProjectCredModal;



    connectedCallback(){
        try{
            this.handleGetCustomMetadataDetails();
            ////console.log('company Id',this.companyId);
        }catch(ex){
            ////console.log('Exception occured',ex.message);
        }
    }


    async handleGetCustomMetadataDetails(){
        ////console.log('handleGetCustomMetadataDetails Called',this.companyId);
        this.isSpinner = true;
        try{
            await  getCurrencySettings({'qbCompanyId':this.companyId}).then(result=>{
                ////console.log('currencySettings2>>',JSON.stringify(result));
                this.sfDefaultCurrency = result.SfDefaultCurrency;
                if(result.hasOwnProperty('IsAccessExpired')){
                    this.isQbAccessTokenExpired = result.IsAccessExpired;
                }  
                this.isCurrencyMatching = result.IsDefaultCurrencySame;  
            }).catch(error=>{
                ////console.log('error occured',error);
            });
            
            let standardPricebookId;
            await getActivePricebook().then(result=>{
                if(result != null && result.success && result.message != null && result.message.length > 0){
                    ////console.log('@@@ this is pricebook result ',JSON.stringify(result));
                    this.priceBookList = [];
                    for(let i = 0; i < result.message.length; i++){
                        this.priceBookList.push({label:result.message[i].Name, value:result.message[i].Id});
                        if(result.message[i].IsStandard == true){
                            standardPricebookId = result.message[i].Id
                        }
                    }
                    ////console.log('@@@ this is the Pricebook Result : ',JSON.stringify(this.pricebookList));
                }
            }).catch(error=>{
                ////console.log('@@@ this is pricebook Error ',error);
            });
            await getSavedCompanyInfo({'companyId':this.companyId}).then(result=>{
                if(result != null && result != ''){
                    ////console.log('result>>>>',JSON.stringify(result));
                    
                    if(result.pricebookId != ''){
                        this.pricebookSelectedValue = result.pricebookId;
                    }else if(standardPricebookId!=null && standardPricebookId!=''){
                        this.pricebookSelectedValue = standardPricebookId;
                    }
                    
                    if(result.emailList != ''){
                        this.emailForBatchStatus = result.emailList;
                    }
                    if(result.pricebookId != ''){
                        this.isByepassCheckboxChecked = result.isByepassCheckboxChecked;
                    }
                    
                    
                    
                }
            }).catch(error=>{
                ////console.log('@@@ this is line 180 ',error);
            });
            await getAllQbObjectMethod({companyId: this.companyId}).then((data)=>{
                ////console.log('qb object names' , data);
                data.forEach((option) =>{
                    ////console.log('Obj Name', option);
                    this.qbObjectOptions.push({label: option, value: option});
                }
                ) 
            }).catch(error=>{
                ////console.log('This is error',error.message);
            })
            await getIntitialSyncData({companyId: this.companyId}).then((data)=>{
                ////console.log('dataOfIntitial'+JSON.stringify(data));
                if(data.SelectedSyncObjects){
                    data.SelectedSyncObjects.forEach((result)=>{
                        this._selected.push(result);
                    })
                }
                ////console.log('selected List' , JSON.stringify(this._selected));
                this.numberOfHours = data.HoursToSchedule;
                ////console.log(this._selected,'Selected Object');
            })
           
            this.isSpinner = false;
        }catch(e){
            ////console.log('handleGetAllData Error ==>', error.message);
        }
    }


    handleEditCred(){
        this.showEditProjectCredModal = false;
    }

    handleChange(event){
        try{
            ////console.log('event.target.value', event.target.value);
            ////console.log('event.currentTarget.dataset.name ', event.currentTarget.dataset.name );
            if(event.currentTarget.dataset.name == 'emailName'){
                ////console.log('event.currentTarget.dataset.id', event.currentTarget.dataset.id);
                this.emailForBatchStatus = event.target.value;
                ////console.('this.emailForBatchStatus',this.emailForBatchStatus);
                this.dispatchEvent(new CustomEvent('emailvaluechange',{detail:this.emailForBatchStatus}));
            }
        
            if(event.currentTarget.dataset.name == 'priceBookName'){
                this.pricebookSelectedValue = event.target.value;
            }
            ////console.log('this.selectedCurrencyValue ===>>>>> ', this.selectedCurrencyValue);
        }catch(e){
            ////console.log('handleChange Error ', e.message);
        }
    }
    handleClick(event){
        try{ 
            ////console.log('event.currentTarget.dataset.name ', event.currentTarget.dataset.name );
            if(event.currentTarget.dataset.name == 'saveAndNextBtn'){
    
                let isByepassChecked =  this.template.querySelector('lightning-input[data-name="byepassDuplicateRule"]').checked;
                ////console.log('isByepassChecked',isByepassChecked);
                this.isSpinner = true;
                
                if(this.pricebookSelectedValue){
                    let isError = false;
                    if(!this.isInputValid()){
                        isError = true;
                    }
                    if(!isError){
                        if(this.pricebookSelectedValue != null && this.pricebookSelectedValue != '' && this.pricebookSelectedValue != undefined){
                            let companyConfiguration = {};
                            companyConfiguration.pricebookId = this.pricebookSelectedValue;
                            companyConfiguration.email = this.emailForBatchStatus;
                            companyConfiguration.byepassDuplicateRule = isByepassChecked;
                            saveCompanySetupInfo({'companyConfiguration':companyConfiguration,'companyId':this.companyId}).then(result=>{
                                this.isSpinner = false;
                                this.dispatchEvent(new CustomEvent("saveqbsetup"));
                            }).catch(error=>{
                                this.isSpinner = false;
                                ////console.log('saveCustomSetting Error ==> ', error.message);
                            });
                        }
                    }else{
                        this.isSpinner = false;
                        this.showMessage = true;
                        this.message = 'Please enter valid email';
                        this.iconName = 'utility:error';
                        this.themeStyle = 'slds-notify--toast slds-theme_error';
                    }
                }else{
                    this.isSpinner = false;
                    this.showMessage = true;
                    this.message = 'Please choose a Pricebook';
                    this.iconName = 'utility:error';
                    this.themeStyle = 'slds-notify--toast slds-theme_error';
                }
            }
            if(event.currentTarget.dataset.name == 'previousBtn'){
                this.isSpinner = false;
                this.dispatchEvent(new CustomEvent("clickpreviousbutton"));  
            }
            if(event.currentTarget.dataset.name == 'loadCustomField'){
                this.isSpinner = true;
                handleQbCustomFields({ 'companyId': this.companyId,'calledFromPostInstall':false }).then(result => {
                    ////console.log('success3:', JSON.stringify(result));
                    if(result.success != true){
                        this.isSpinner = false;
                        if(result.message !=''){
                            this.message = result.message;
                        }else{
                            this.message = 'Error Occurred while loading QB custom fields. Try again after refreshing the page.';
                        }
                        this.showMessage = true;
                        this.iconName = 'utility:error';
                        this.themeStyle = 'slds-notify--toast slds-theme_error';
                    }else{
                        this.isSpinner = false;
                        this.showMessage = true;
                        this.message = 'Successfully loaded Custom fields. Please refresh the page if custom fields do not appear in mapping setup.';
                        this.iconName = 'utility:success';
                        this.themeStyle = 'slds-notify--toast slds-theme_success';
                    }
                    
                })
                .catch(error => {
                    this.isSpinner = false;
                    this.message = 'Error Occurred while loading QB custom fields. Error message: '+error ; 
                    this.showMessage = true;
                    this.iconName = 'utility:error';
                    this.themeStyle = 'slds-notify--toast slds-theme_error';
                    
                });
            }
            // if(event.currentTarget.dataset.name == 'loadFieldSetupModal'){
            //     this.openFieldSetupComp = true;
            // }
            
        }catch(e){
            ////console.log('handleClick Error ', e.message);
        }
    }
    handleHover(){
        try{
            var modal = this.template.querySelector('.myModal');
            modal.style.display = 'block';
        }catch(error){
            ////console.log('exception ',error);
            //console.error('error message ',error.message);
        }
    }
    handleHoverOut() {
        var modal = this.template.querySelector('.myModal');
        modal.style.display="none";
    }
    //method to handle project sync from sf to qb config modal
    handleProjectSfToQbSyncModal(){
        try{
            this.showLoadingSpinner = true;
            getStoreProjectCredentials({realmId : this.companyId}).then((result)=>{
                if(result.IsSuccess){
                    this.showEditProjectCredModal = true;
                    this.currentStep = 3;
                    this.stepMoreThan1 = true;
                    this.step1Active = false;
                    this.step2Active = false;
                    this.isLastStep = true;
                    console.log('result:', typeof result.ReturnData);
                    let returnDataJson = JSON.parse(result.ReturnData);
                    this.userNameInputVal = returnDataJson.username;
                    console.log('user name input val', this.userNameInputVal);
                }else{
                    this.showEditProjectCredModal = false;
                    this.currentStep = 1;
                    this.stepMoreThan1 = false;
                    this.step1Active = true;
                    this.step2Active = false;
                    this.isLastStep = false;
                }
                this.showLoadingSpinner = false; 
            })
            this.isProjectSyncModalActive = true;
        }catch(error){
            this.showLoadingSpinner = false; 
            console.log('error in fetch', error.message);
        }   
    }

    handleProjectModalInput(event){
        try{
            if(event.target.dataset.inputtype == 'username'){
                this.userNameInputVal = event.target.value
            }else if(event.target.dataset.inputtype == 'password'){
                this.passwordInputVal = event.target.value;
            }else if(event.target.dataset.inputtype == 'authinput'){
                this.authInputVal = event.target.value;
            }
        }catch(error){
            console.log('Error Occurred', this.error.message);
        }
    }



    //method to handle step change in project sync from sf to qb modal
    // handleStepChange(event){
    //     try{
    //         console.log('step: ', this.currentStep, this.userNameInputVal,this.passwordInputVal,this.authInputVal);
    //         if(event.target.value == 3){
    //             if(!this.userNameInputVal || !this.passwordInputVal || !this.authInputVal){
    //                 this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
    //                     title: 'Error',
    //                     message: 'Pleaase fill all the required fields',
    //                     variant: 'error',
    //                     autoclose: true,
    //                 });
    //                 return; 
    //             }
    //         }
    //         this.currentStep = parseInt(event.target.value);
    //         console.log('currentStep',this.currentStep); 
    //         if(this.currentStep == 1){
    //            this.step1Active = true;  
    //            this.stepMoreThan1 = false;
    //            this.isLastStep = false;
    //            this.step2Active = false;          
    //         }else if(this.currentStep == 2){
    //             this.stepMoreThan1 = true;
    //             this.step1Active = false;
    //             this.isLastStep = false;
    //             this.step2Active = true;
    //         }else if(this.currentStep == 3){
    //             this.showLoadingSpinner = true;
    //             this.makeCalloutProjectSfToQb();
    //         }    
    //     }catch(error){
    //         console.log(error.message , 'handleStepChange');
    //     } 
    // }
    //method to handle step change in project sync from sf to qb modal
    handleStepChange(event){
        try{
            console.log('step: ', this.currentStep, this.userNameInputVal,this.passwordInputVal,this.authInputVal);
            if(event.target.value == 3){
                if((!this.userNameInputVal || this.userNameInputVal.trim() === "") || (!this.passwordInputVal || this.passwordInputVal.trim() === "") || (!this.authInputVal || this.authInputVal.trim() == "")){
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: 'Please fill all the required fields',
                        variant: 'error',
                        autoclose: true,
                    });
                    return;
                }
            }
            this.temporaryStoreCurrentStepVar = parseInt(event.target.value);
            console.log('currentStep',this.currentStep);
            if(this.temporaryStoreCurrentStepVar == 1){
               this.step1Active = true;
               this.stepMoreThan1 = false;
               this.isLastStep = false;
               this.step2Active = false;
               this.currentStep = this.temporaryStoreCurrentStepVar;
            }else if(this.temporaryStoreCurrentStepVar == 2){
                this.stepMoreThan1 = true;
                this.step1Active = false;
                this.isLastStep = false;
                this.step2Active = true;
                this.currentStep = this.temporaryStoreCurrentStepVar;
            }else if(this.temporaryStoreCurrentStepVar == 3){
                this.showLoadingSpinner = true;
                this.makeCalloutProjectSfToQb();
            }
        }catch(error){
            console.log(error.message , 'handleStepChange');
        }
    }

    get currentSteps(){
        console.log('@@@@@getter value',this.currentStep);
        return this.currentStep.toString();
    }


    // handlePrevOrNextButton(event){
    //     try{
    //         console.log(event.target.dataset.buttontype);
    //         console.log('step: ', this.currentStep, this.userNameInputVal,this.passwordInputVal,this.authInputVal);
    //         if(event.target.dataset.buttontype == 'prev'){
    //             this.currentStep = this.currentStep - 1;
    //             console.log('Step Change prev:', this.currentStep);
                
    //         }else if(event.target.dataset.buttontype == 'next'){
    //             if(this.currentStep == 2){
    //                 if(!this.userNameInputVal || !this.passwordInputVal || !this.authInputVal){
    //                 this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
    //                     title: 'Error',
    //                     message: 'Please fill all the required fields',
    //                     variant: 'error',
    //                     autoclose: true,
    //                 });
    //                 return; 
    //             }
    //             }
    //             this.currentStep = this.currentStep + 1;
    //             console.log('Step Change next:', this.currentStep);
    //         }
    //         if(this.currentStep == 1){
    //             this.step1Active = true;  
    //             this.stepMoreThan1 = false;
    //             this.isLastStep = false;
    //             this.step2Active = false;          
    //         }else if(this.currentStep == 2){
    //             this.stepMoreThan1 = true;
    //             this.step1Active = false;
    //             this.isLastStep = false;
    //             this.step2Active = true;
    //         }else if(this.currentStep == 3){
    //             this.makeCalloutProjectSfToQb();
    //             this.showLoadingSpinner = true;
    //         }
    //     }catch(error){
    //         console.log(error.message);
    //     }
    // }

    handlePrevOrNextButton(event){
        try{
            console.log(event.target.dataset.buttontype);
            console.log('step: ', this.currentStep, this.userNameInputVal,this.passwordInputVal,this.authInputVal);
            if(event.target.dataset.buttontype == 'prev'){
                this.temporaryStoreCurrentStepVar = this.currentStep - 1;
                console.log('Step Change prev:', this.currentStep);
            }else if(event.target.dataset.buttontype == 'next'){
                if(this.currentStep == 2){
                    if((!this.userNameInputVal || this.userNameInputVal.trim() === "") || (!this.passwordInputVal || this.passwordInputVal.trim() === "") || (!this.authInputVal || this.authInputVal.trim() == "")){
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: 'Please fill all the required fields',
                            variant: 'error',
                            autoclose: true,
                        });
                        return;
                    }
                }
                this.temporaryStoreCurrentStepVar = this.currentStep + 1;
                console.log('Step Change next:', this.currentStep);
            }
            if(this.temporaryStoreCurrentStepVar == 1){
                this.step1Active = true;
                this.stepMoreThan1 = false;
                this.isLastStep = false;
                this.step2Active = false;
                this.currentStep = this.temporaryStoreCurrentStepVar;
            }else if(this.temporaryStoreCurrentStepVar == 2){
                this.stepMoreThan1 = true;
                this.step1Active = false;
                this.isLastStep = false;
                this.step2Active = true;
                this.currentStep = this.temporaryStoreCurrentStepVar;
            }else if(this.temporaryStoreCurrentStepVar == 3){
                this.makeCalloutProjectSfToQb();
                this.showLoadingSpinner = true;
            }
        }catch(error){
            console.log(error.message);
        }
    }

    //this is the method used to make callout 
    makeCalloutProjectSfToQb(){
        try{
            storeProjectCredentials({
                userName: this.userNameInputVal,
                password: this.passwordInputVal,
                securityToken: this.authInputVal,
                companyId: this.companyId
            }).then((result)=>{
                if(result.IsSuccess){
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Success',
                        message: 'Successfully Logged In',
                        variant: 'success',
                        autoclose: true,
                    });
                    this.stepMoreThan1 = true;
                    this.step1Active = false;
                    this.step2Active = false;
                    this.isLastStep = true;
                    this.currentStep = this.temporaryStoreCurrentStepVar;
                }else{
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: result.ErrorMessage,
                        variant: 'error',
                        autoclose: true,
                    });
                }
                this.showLoadingSpinner = false;
            })
        }catch(error){
            this.showLoadingSpinner = false;
            console.log(error.message,'makeCalloutProjectSfToQb');
        }
    }

    



    handleNotifyClose(event){
        this.showMessage = false;
        this.message = '';
        this.iconName = '';
        this.themeStyle = '';
    }
    isInputValid() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if(!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
    
        });
        return isValid;
    }

    handleProjectSync(){
        if(this.qbObjectOptions.length == 0){
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: 'Please configure the mapping in the next step before attempting again.',
                variant: 'error',
                autoclose: true,
            });
            return;
        }
        this.showProjectSyncModal = true;
    }

    handleCloseModal(event){
        console.log('event called',event.currentTarget.dataset.modaltype,event.target);
        if(event.currentTarget.dataset.modaltype == 'qbtosf'){
            this.showProjectSyncModal = false;
        }else if(event.currentTarget.dataset.modaltype == 'sftoqb'){
            this.isProjectSyncModalActive = false;
        }
    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }
    handleQbObjectChange(e) {
        this._selected = e.detail.value;
        ////console.log('This is selected', this._selected);
    }
    numberOfHoursMethod(event){
        this.numberOfHours = event.target.value;
    }
    saveSyncChanges(){
        try{
            this.saveButtonDisabled = true;
            ////console.log('Hello' + this._selected);
            if(this.numberOfHours == null || this.numberOfHours >= 24 || this.numberOfHours < 1){
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Error',
                    message: 'Please enter number of hours in range 1 - 23',
                    variant: 'error',
                    autoclose: true,
                });
                this.saveButtonDisabled = false;
                return;
            }
            //console.log('typeof this.numberOfHours>>',typeof this.numberOfHours);
            if(typeof this.numberOfHours == 'string' && this.numberOfHours.includes('.')){
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Error',
                    message: 'Please enter integer value only',
                    variant: 'error',
                    autoclose: true,
                });
                this.saveButtonDisabled = false;
                return;
            }
            let companyDetailMap = {
                'companyId' : this.companyId,
                'selectedObjects' : this._selected,
                'hoursToSchedule' : this.numberOfHours
            };
            ////console.log(companyDetailMap.selectedObjects);
            saveSyncChangesMethod({companyDetails : JSON.stringify(companyDetailMap)}).then(result =>{
                ////console.log('Changes Saved' + result);
                if(result.isSuccess){
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Success',
                        message: 'Saved Changes Successfully',
                        variant: 'success',
                        autoclose: true,
                    });
                }else{
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: result.message,
                        variant: 'error',
                        autoclose: true,
                    });
                }
                this.saveButtonDisabled = false;
            })
        }catch(e){
            this.saveButtonDisabled = false;
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: e.message,
                variant: 'error',
                autoclose: true,
            });
            //console.log('Exception occurred', e.message);
        }
    }
   
    
}