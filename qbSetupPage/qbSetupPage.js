import { LightningElement,wire,api,track } from 'lwc';
import QB_LOGO from '@salesforce/resourceUrl/qb_fullIcon';
import QB_TO_SF_LOGO from '@salesforce/resourceUrl/Qb_Icon_QbSf';
import SF_TO_QB_LOGO from '@salesforce/resourceUrl/Qb_Icon_SfQb';
import QB_AND_SF_LOGO from '@salesforce/resourceUrl/Qb_Icon_BothConnected';
import QB_AND_SF_DISCONNECTED_LOGO from '@salesforce/resourceUrl/Qb_Icon_NoneConnected';
import deleteAuthMetadata from '@salesforce/apex/GetCustomMetadataController.deleteAuthMetadata';
import LINKEDIN_LOGO from '@salesforce/resourceUrl/LinkedIn_icon';
import FACEBOOK_LOGO from '@salesforce/resourceUrl/FaceBook_icon';
import INSTAGRAM_LOGO from '@salesforce/resourceUrl/Insta_icon';
import TWITTER_LOGO from '@salesforce/resourceUrl/Twitter_icon';
import HEART_LOGO from '@salesforce/resourceUrl/Heart';
import HIC_GIF from '@salesforce/resourceUrl/PageLoadingGif';
import fetchCustomRecs from "@salesforce/apex/GetCustomMetadataController.fetchCustomRecsNew";
import isSandox from '@salesforce/apex/QBUtilityClass.isSandbox';
import sendDataToHistoricalBatch from "@salesforce/apex/QB_sfSendDataToHistoricalBatchClass.sendDataToHistorical";
import  getBatchJobStatus  from '@salesforce/apex/GetCustomMetadataController.getBatchJobStatus';
import fetchQbToSfConfigData from "@salesforce/apex/Qb_ConfigController.getExistingQbTosfHistoricalConfigData";
import fetchQbBatchId from '@salesforce/apex/GetCustomMetadataController.fetchQbBatchId';
import isAnyBatchRunning from "@salesforce/apex/Qb_ConfigController.isBatchInProgress";
import getQbCredMetadataRec from "@salesforce/apex/GetCustomMetadataController.getQbCredMetadataRec";
import customLabels from 'c/qb_CustomLabels';
import revokeQbCompany from "@salesforce/apex/QB_CalloutUtility.revokeQbCompany";
import deleteQbRecordsFromDatabase from "@salesforce/apex/QB_CalloutUtility.deleteQbRecordsFromDatabase"; 
import isDebuggingEnabled from '@salesforce/apex/GetCustomMetadataController.isDebuggingEnabled';
import toggleDebugging from '@salesforce/apex/GetCustomMetadataController.toggleDebugging';
import QB_Connect_Button_Image_Hover  from '@salesforce/resourceUrl/QB_Connect_Button_Image_Hover';
import QB_Connect_Button_Image  from '@salesforce/resourceUrl/QB_Connect_Button_Image';

//import createCustomFieldRecord from '@salesforce/apex/GetCustomMetadataController.createCustomFieldRecords';
import hasProFeaturesPermission from '@salesforce/apex/GetCustomMetadataController.hasProFeaturesPermission';



export default class QbSetupPage extends LightningElement {
    
    @track isCompanySetupSelected = true;
    qbToSfConnectionLogo = QB_TO_SF_LOGO;
    sfToQbConnectionLogo = SF_TO_QB_LOGO;
    qbAndSfConnectionLogo = QB_AND_SF_LOGO
    qbAndSfDisConnectedLogo = QB_AND_SF_DISCONNECTED_LOGO;
    logo = QB_LOGO;
    linkedInLogo = LINKEDIN_LOGO;
    facebookLogo = FACEBOOK_LOGO;
    instagramLogo = INSTAGRAM_LOGO;
    twitterLogo = TWITTER_LOGO;
    heartLogo = HEART_LOGO;
    hicGIF = HIC_GIF;
    isContactSupport = false;
    recordsTemp = [];
    @track currentActiveTab ='sfToQb';
    @track records = [];
    @track newrecords = [];
    @track qbToSfCompanyrecords = [];
    @track qbToSfCompanySingleRec = [];
    @track isContactWarning = false;
    @track isMultiCompanyOpen = false;
    @track isHistoricalChecked = false;
    @track isCurrentCompanySelected  = false;
    @track isSyncOpen = false;
    @api realmId = '';
    @api companyLabel = '';
    currentvalue = '1';
    selectedvalue = 'Company Setup';
    @track isSpinnerLoaded = false;
    @track isAddQuickbooksChecked = false;
    @track openCompanyConnection = false;
    @track yesWantToDelete = false;
    @track isDebugLog = false;
    
    
    clientId;
    clientIdProduction;
    redrectUriForSandbox;
    redrectUriForProduction;
    sfClientId_Prod;
    sfClientId_Sand;
    sfRedrectUriForSandbox;
    sfRedrectUriForProduction;

    value = 'production';
    isBatchCompleted = false;
    @track isFinishOpen = false;
    @track currentStatus;
    @track processed;
    @track batchStatusSpinner = false;
    @track showSpinner = true;
    @track items = [];
    @track progressValue = 0;
    @api origin;
    @api isSalesforce;
    @track emailAlert = '';
    @track currentCompany = 'No company is selected'
    @track isPrivacyNotChecked = true;
    // @track emailList = [{"sr":1,"email":""}];
    @track emailForBatchStatus = '';
    @track emailListarray = [];
    serialNumber = 1;
    @api companyAdded;
    @track batchJobId = [];
    event;
    currentStep = 1;
    isLoaded=false;
    @track isAlreadyAuthorised = false;
    customerObject = {};
    itemObject = {};
    estimateObject = {};
    otherQbRecords = {};
    currentIndex = 0;
    @track isNewCompany = false;
    @track isBidirectionalSetupSelected = false;
    @track environmentChoosen = '';
    @track isenvironmentChoosen = true;
    isHistoricalDataSyncLoaded = false;
    totalNumOfQbRecords = 0;
    totalNumOfQbRecProcessed = 0;
    // Custom Label
    SupportWebsite;
    ContactSupportText;
    MoreCompanyText;
    ConfigureCompanyNameTxt;
    ConfigureCompanyIdTxt;
    ConfigureCompanyStatusTxt;
    ConfigureActionTxt;
    ConfigureSerialNoTxt;
    ConfigureEmailTxt;
    ConfigureCancelCloseTxt;
    ConfigureSubmitBtnLbl;
    ConfigureWarningBtnLbl;
    ConfigureCancelBtnLbl;
    ConfigureOkBtnLbl;
    ConfigureCloseBtnLbl;
    ConfigureRefreshBtnLbl;
    ConfigureConnectBtnLabel;
    ChangesLostWarning;
    MultiCompanyTxt;
    CompanyConfigHeader;
    SelectQuickbookHeader;
    BackgroundSetupMessage;
    BuiltMssgPt1;
    BuiltMssgPt2;
    TersmConditionTxt;
    AttentionTxt;
    FetchingRecordsTxt;
    UpdateQbMessage;
    ProcessMessageHeader;
    ProcessMessageOp1;
    ProcessMessageOp2;
    @track debugButtonLabel ='Enable Debugging?';
    @track pointerDisableForFinish = true;

    qbConnectButtonImageHover = QB_Connect_Button_Image_Hover;
    qbConnectButtonImage = QB_Connect_Button_Image;


    @wire(isDebuggingEnabled)
    wiredIsDebuggingEnabled({ error, data }) {
        //console.log('in debugging log');
        if (data) {
            this.debugButtonLabel = data ? 'Disable Debugging?' : 'Enable Debugging?';
        } else if (error) {
            console.error('Error fetching debugging status', error);
        }
    }


    @api isProFeaturesEnabled = false;

    @wire(hasProFeaturesPermission)
    wiredHasProFeaturesPermission({ error, data }) {
        //console.log('in wiredHasProFeaturesPermission',data);
        //console.log('in wiredHasProFeaturesPermission2',error);
        if (data) {
            //console.log('wiredHasProFeaturesPermission data',data);
            this.isProFeaturesEnabled = data;
        } else if (error) {
            //console.log('wiredHasProFeaturesPermission',error);
            
        }
    }

    // toggleDebugging() {

        // let enableDebug = true;
        // if(this.debugButtonLabel =='Disable Debugging?'){
        //     enableDebug = false;
        // }
    //     let vm = this;
        
    //     //toggleDebugging({ isEnabled: !this.isDebuggingEnabled });
    //     toggleDebugging({ 'isEnabled': enableDebug }).then(function (result) {
    //         //console.log('res');
    //         if(enableDebug == true){
    //             vm.debugButtonLabel = 'Disable Debugging?';
    //         }
    //         else{
    //             vm.debugButtonLabel = 'Enable Debugging?';
    //         }
    //     });
    // }

    get pointerEventsClass(){
        return (this.realmId == undefined  || this.realmId == "" ? 'pointerEventsNone': '');
    }
    get pointerEventsClassForFinish(){
        return (this.pointerDisableForFinish == true ? 'pointerEventsNone': '');
    }
    get isProFeaturesDisabled(){
        return (this.isProFeaturesEnabled ? false:true);
    }

    toggleDebugging() {
        let enableDebug = true;
        if(this.debugButtonLabel =='Disable Debugging?'){
            enableDebug = false;
        }
        let vm = this;
        //let enableDebug = this.debugButtonLabel === 'Disable Debugging?';
        //console.log('enableDebug',enableDebug);
    
        toggleDebugging({ 'isEnabled': enableDebug })
            .then(result => {
                //console.log('Toggle debugging success:', result);
                
                if (enableDebug) {
                    vm.debugButtonLabel = 'Disable Debugging?';
                    
                } else {
                    vm.debugButtonLabel = 'Enable Debugging?';
                }
            })
            .catch(error => {
                console.error('Toggle debugging error:', error);

                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Error',
                    message: error,
                    variant: 'error',
                    autoclose: false,
                });
                
            });
    }
    


    //for same ui mapping
    @track selectedOption = 'QuickBooks Online To Salesforce Mapping';
    @track options = [
        { label: 'QuickBooks Online To Salesforce Mapping', value: 'QuickBooks Online To Salesforce Mapping' },
        { label: 'Salesforce To QuickBooks Online Mapping', value: 'Salesforce To QuickBooks Online Mapping' },
    ];
    @track subOptions = [
        { label: 'Salesforce to Quickbooks', value: 'Salesforce to Quickbooks' },
        { label: 'Quickbooks to Salesforce', value: 'Quickbooks to Salesforce' },
    ];
    @track showSubOptions = false;
    @track sfToQb = false;
    @track qbToSf = true;
    @track onFieldMapping = false;
    @track sfToQbMappingOn = false;
    isSfToQbDataSyncLoaded = false;
    @track message='';
    @track isShowModal=false;
    @track functionName='';
    isDiscModal=false;
    
   
    handleAuthMetadataDelete(detail){
    try{
        //console.log('Delete');
        this.isLoaded =false;
        let authDeveloperName = detail.devName;
        //console.log('authDeveloperNam111e',authDeveloperName);
        let companyId = detail.compId;
        let index = detail.compInd;
        //console.log('index',index);
        //console.log('companyId',companyId);
        let vm = this;

        deleteAuthMetadata({ 'authDeveloperName': authDeveloperName,'companyId':companyId }).then(function (result) {
            //console.log("authDeveloperName result===>", JSON.stringify(result));
            vm.qbToSfCompanyrecords.splice(index, 1);
            if(vm.qbToSfCompanyrecords.length == 0){
                vm.isAlreadyAuthorised = false;
            }
            //console.log("index", JSON.stringify(result));
            vm.isLoaded =true;
        });
        this.hideModal();
    }   
    catch(ex){
        //console.log('in deletemetadata',ex.message);
    }
    //this.yesWantToDelete = true; 
    }

    deleteClick(event){
        //console.log('Hello');
        this.isShowModal=true;
        this.isDiscModal=false; 
        this.modalCompanyId=event.currentTarget.dataset.realmid1;
        this.modalCompanyIndex=event.currentTarget.dataset.index;
        this.modalDeveloperName=event.currentTarget.dataset.developername;
        this.message='Are you sure you want to delete this QuickBooks company?';
        //console.log('Message');
        this.functionName=this.handleAuthMetadataDelete;
        //console.log(this.functionName);
    }


    handleYesEvent(event){
        this.functionName(event.detail);
    }

    NoDelete(){
        this.yesWantToDelete = false;
    }

    hideModal(){
        this.isShowModal=false;
        if(this.isDiscModal){
            this.template.querySelector('.connection-div').style.display="flex";
        }
    }

    yesDelete(event){
        try{
           
            let authDeveloperName12 =this.authDeveloperName;
            //console.log('authDeveloperName2222',authDeveloperName12);
            let index12 = this.index;
            //console.log('index12',index12);
            let vm = this;
            deleteAuthMetadata({ 'authDeveloperName': authDeveloperName12 }).then(function (result) {
                //console.log("authDeveloperName22 result===>", JSON.stringify(result));
                vm.qbToSfCompanyrecords.splice(index12, 1);
                //console.log("index12", JSON.stringify(result));
                vm.isLoaded =true;
            });
            this.yesWantToDelete = false;
        }
        catch(ex){
            //console.log('in deletemetadata',ex.message);
        }
    }
    handleCompanyConnection(event){
        //console.log('in line 210');
        let index = event.currentTarget.dataset.index;
        //console.log('in line 211',event.currentTarget.dataset.index);

        const objectToAdd = this.qbToSfCompanyrecords[index];

        this.qbToSfCompanySingleRec = [];
        this.qbToSfCompanySingleRec.push(objectToAdd);
        // this.array1 = [...this.array1, ...this.array2];
        // this.qbToSfCompanySingleRec = this.qbToSfCompanyrecords[index];
        //console.log('in line 210',this.qbToSfCompanySingleRec);
        //let currentCompany = 
        if(this.openCompanyConnection){
            this.openCompanyConnection = false;
        }
        else{
            this.openCompanyConnection = true;
        }
       
    }
    getQbCredMetadataRecData(){
        getQbCredMetadataRec().then(result => {
                if(result != null){
                    //////console.log('data', JSON.stringify(result));
                    this.clientId = result.hic_qbmadeasy__Qb_Client_Id_For_Sandbox__c;   
                    this.clientIdProduction = result.hic_qbmadeasy__Qb_Client_Id_For_Production__c; 
                    this.redrectUriForSandbox = result.hic_qbmadeasy__QB_Redirect_URL_For_Sandbox__c;
                    this.redrectUriForProduction = result.hic_qbmadeasy__QB_Redirect_URL_For_Production__c;
                    this.sfClientId_Prod = result.hic_qbmadeasy__SF_Production_Client_Id__c;
                    this.sfClientId_Sand = result.hic_qbmadeasy__SF_Sandbox_Client_Id__c; 
                    this.sfRedrectUriForSandbox = result.hic_qbmadeasy__SF_Redirect_Url_For_Sandbox__c;
                    this.sfRedrectUriForProduction = result.hic_qbmadeasy__SF_Redirect_Url_For_Production__c;
                }
               
        })
        .catch(error => {
            ////console.log('error', error);
        })
    }

    redirectOnQb(event){
        this.environmentChoosen = event.currentTarget.dataset.qbenvironment;
        //console.log('onConnectCompany>>>',this.environmentChoosen);
        this.redirectToQuickbookOnline();
    }

    handleOptionChange(event) {
        this.selectedOption = event.target.value;
        
        if (this.selectedOption === 'QuickBooks Online To Salesforce Mapping'){
            this.sfToQbMappingOn = false;
            this.isHistoricalChecked = true;
            this.sfToQb = false;
            this.qbToSf = true;
            this.showSubOptions = false;
        }
        else if (this.selectedOption === 'Salesforce To QuickBooks Online Mapping') {
            if(!this.isSfToQbDataSyncLoaded){
                this.onOpenMappingsProgressForSfToQb();
            }
            this.isHistoricalChecked = false;
            this.sfToQbMappingOn = true;
            this.showSubOppingOn = true;
            this.showSubOptions = true;
            this.qbToSf = false;
            this.sfToQb = true;
            //const objChild = this.template.querySelector('c-qb_-sf-to-qb-mapping-data-comp');
            // ////console.log('in objChild line 149',objChild);
            // objChild.callingSfToQbChildComp();
        } else {
            this.showSubOptions = false;
        }
    }


    constructor() {
        super();
    }

    deleteCookie(){
        let value = "";
        let expires = "";
        document.cookie = 'companyInfoCookie' + "=" + escape(value) + expires + "; path=/";
    }

    //@track progressBarClass;
    connectedCallback(){
        //console.log('in connected call qb configure22');
        // this.registerErrorListener();
        // this.handleSubscribe();
        this.isLoaded = false;
        this.getQbCredMetadataRecData();
        var cookieString = "; " + document.cookie;
        var parts = cookieString.split("; " + 'companyInfoCookie' + "=");
        var cookieData = decodeURIComponent(parts.pop().split(";").shift());
        if(cookieData != ''){
            var cookieVal = JSON.parse(cookieData);
            
            this.companyAdded = true;
            this.companyLabel = cookieVal.CompanyName;
            this.currentCompany = cookieVal.CompanyName;
            this.realmId = cookieVal.CompanyRealmId;
            this.deleteCookie();

            ////console.log('cookie val ',cookieVal);
        } else{
            var cookieVal = {};
            ////console.log('cookie val else',cookieVal);
        }
        ////console.log('origin',this.origin);
        ////console.log('issalesforce',this.isSalesforce);
        ////console.log('companyRealmId',this.companyAdded);
        const realmIdSession = window.sessionStorage.getItem('realmIdSessionStorage');
        const companyNameSession = window.sessionStorage.getItem('companyNameSession');
        ////console.log('realmIdSession>>',realmIdSession);
        this.fetchCustomRecords();
        this.fetchCustomLabels();
        
        if(this.companyAdded ==true && this.companyLabel && this.realmId){
            this.newCompanyModal();
        }
        else if(this.companyAdded ==true){ 
            this.openMultiCompanyModal();
        }
        // else if(realmIdSession != null){
        //     this.realmId = realmIdSession;
        //     this.currentCompany = companyNameSession;
        //     this.showCurrentCompany();
        // }
        
        
    }

   

    handleQbDisconnect(event){
        this.isLoaded = false;
        let companyId =  event.currentTarget.dataset.realmid1;
        let index = event.currentTarget.dataset.index;
        let vm = this;
        //console.log('in handel qb disconnect',event);
        //console.log('in handel qb index',index);
        //console.log('in handel qb companyId',companyId);
        revokeQbCompany({ 'companyId': companyId }).then(function (result) {
            //console.log("result===>",result);
            if(result == '200'){
                //console.log("qbToSfCompanyrecords===>", vm.qbToSfCompanyrecords[index]);
                //vm.qbToSfCompanyrecords[index].isSfToQbConnected = false;
                vm.qbToSfCompanyrecords.forEach(function (element) {
                    if (element.hic_qbmadeasy__RealmId__c === vm.qbToSfCompanySingleRec[index].hic_qbmadeasy__RealmId__c) {
                        element.isSfToQbConnected = false;
                    }
                });
                vm.qbToSfCompanySingleRec[0].isSfToQbConnected = false;
                vm.isLoaded = true;
                //console.log("revoked");
            }
            else{
                vm.isLoaded = true;
                //console.log("unable to revoked");
            }
            
            
        });
    }

    handleQbDatabaseDelete(event){
        //console.log("in handleQbDatabaseDelete");
        
        
        this.isLoaded = false;
        let companyId =  event.currentTarget.dataset.realmid1;
        let index = event.currentTarget.dataset.index;
        let vm = this;
        //console.log("beforein qbToSfCompanyrecords",vm.qbToSfCompanyrecords);
        //console.log("beforein in qbToSfCompanyrecords single",vm.qbToSfCompanyrecords[index]);
        //console.log("beforein singleqbToSfCompanyrecords",vm.qbToSfCompanySingleRec);
        deleteQbRecordsFromDatabase({ 'companyId': companyId }).then(function (result) {
            //console.log("result===>",result);
            if(result == '200'){
                //console.log("qbToSfCompanyrecords===>", vm.qbToSfCompanyrecords[index]);
                //vm.qbToSfCompanyrecords[index].isQbToSfConnected = false;
                vm.qbToSfCompanyrecords.forEach(function (element) {
                    if (element.hic_qbmadeasy__RealmId__c === vm.qbToSfCompanySingleRec[index].hic_qbmadeasy__RealmId__c) {
                        element.isQbToSfConnected = false;
                    }
                });
                vm.qbToSfCompanySingleRec[0].isQbToSfConnected = false;
                vm.isLoaded = true;
                //console.log("after qbToSfCompanyrecords",vm.qbToSfCompanyrecords);
                //console.log("after  in qbToSfCompanyrecords single",vm.qbToSfCompanyrecords[index]);
                //console.log("after  singleqbToSfCompanyrecords",vm.qbToSfCompanySingleRec);
                //console.log("revoked");
            }
            else{
                vm.isLoaded = true;
                //console.log("unable to revoked");
            }
            
            
        });
    }
    
    fetchCustomRecords(){
        
        fetchCustomRecs()
        .then(result =>{
            //console.log('in else fetch custom recors',result);
            if(result.length > 0){
                this.isAlreadyAuthorised = true;
                this.qbToSfCompanyrecords = result;
                this.isLoaded = true;
                //console.log('fetchCustomRecords',this.qbToSfCompanyrecords);
            }
            this.isLoaded = true;
        })
        .catch(error => {
            this.isLoaded = true;
            this.qbToSfCompanyrecords = undefined;
        });
        
    }

    // Custom Labels
    fetchCustomLabels() {
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
            this.SupportWebsite = label.qbSupportWebsite;
            this.ContactSupportText = label.qbContactSupportText;
            this.MoreCompanyText = label.qbMoreCompanyText;
            this.ConfigureCompanyNameTxt = label.qbConfigureCompanyNameTxt;
            this.ConfigureCompanyIdTxt = label.qbConfigureCompanyIdTxt;
            this.ConfigureCompanyStatusTxt = label.qbConfigureCompanyStatusTxt;
            this.ConfigureActionTxt = label.qbConfigureActionTxt;
            this.ConfigureSerialNoTxt = label.qbConfigureSerialNoTxt;
            this.ConfigureEmailTxt = label.qbConfigureEmailTxt;
            this.ConfigureCancelCloseTxt = label.qbConfigureCancelCloseTxt;
            this.ConfigureSubmitBtnLbl = label.qbConfigureSubmitBtnLbl;
            this.ConfigureWarningBtnLbl = label.qbConfigureWarningBtnLbl;
            this.ConfigureCancelBtnLbl  = label.qbConfigureCancelBtnLbl;
            this.ConfigureOkBtnLbl = label.qbConfigureOkBtnLbl;
            this.ConfigureCloseBtnLbl = label.qbConfigureCloseBtnLbl;
            this.ConfigureRefreshBtnLbl = label.qbConfigureRefreshBtnLbl;
            this.ConfigureConnectBtnLabel = label.qbConfigureConnectBtnLabel;
            this.ChangesLostWarning = label.qbChangesLostWarning;
            this.MultiCompanyTxt = label.qbMultiCompanyTxt;
            this.CompanyConfigHeader = label.qbCompanyConfigHeader;
            this.SelectQuickbookHeader = label.qbSelectQuickbookHeader;
            this.BackgroundSetupMessage = label.qbBackgroundSetupMessage;
            this.BuiltMssgPt1 = label.qbBuiltMssgPt1;
            this.BuiltMssgPt2 = label.qbBuiltMssgPt2;
            this.TersmConditionTxt = label.qbTersmConditionTxt;
            this.AttentionTxt = label.qbAttentionTxt;
            this.FetchingRecordsTxt = label.qbFetchingRecordsTxt;
            this.UpdateQbMessage = label.qbUpdateQbMessage;
            this.ProcessMessageHeader = label.qbProcessMessageHeader;
            this.ProcessMessageOp1 = label.qbProcessMessageOp1;
            this.ProcessMessageOp2 = label.qbProcessMessageOp2;
        })
    }

    // onCustomerSupportSubmit(){
    //     let support = this.template.querySelector('lightning-textarea');
    //     let vm = this;
    //     sendCustomerQuery({ 'Query': support.value }).then(function (result) {
    //         ////console.log("result===>", JSON.stringify(result));
    //         if(result['isSuccess'] === 'true'){  
    //             vm.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
    //                 title: 'Success',
    //                 message: result['message'],
    //                 variant: 'success',
    //                 autoclose: false,
    //             });
    //         }else{
    //             vm.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
    //                 title: 'Error',
    //                 message: result['message'],
    //                 variant: 'error',
    //                 autoclose: false,
    //             });
    //         }
            
            
    //     });
    //     ////console.log('onCustomerSupportSubmit',support);


    // }

    // getStatusCode (counter, totalRecords){
    //     let vm = this;

    //     if(counter === undefined){
    //       counter = 0;   
    //     }

    //     if(counter >=totalRecords.length){
    //         this.isLoaded = true;
    //         this.qbToSfCompanyrecords =  this.recordsTemp;
    //         ////console.log('in qbToSfCompanyrecords final counter',this.qbToSfCompanyrecords);
    //          return;
    //     }   

    //     fetchStatusCode({
    //         realmId : totalRecords[counter].hic_qbmadeasy__RealmId__c,
    //         access_token : totalRecords[counter].hic_qbmadeasy__Access_Token__c,
    //     })
    //     .then(result => {
    //         let configObj ={};
    //         configObj.id = totalRecords[counter].Id;
    //         configObj.Label  = totalRecords[counter].Label;
    //         configObj.realmId = totalRecords[counter].hic_qbmadeasy__RealmId__c;
    //         ////console.log('realM>>>>',totalRecords[counter].hic_qbmadeasy__RealmId__c);
    //         //configObj.status = result == 200 ? 'Connected' : 'Disconnected';
    //         configObj.status = 'Connected';
    //         configObj.cssBadge = 'slds-theme_success';

    //         //configObj.cssBadge =  result == 200 ? 'slds-theme_success' : 'slds-theme_error';
    //         configObj.isAuthorised = result == 200 ? false : true;
    //         this.recordsTemp.push(configObj);
    //         counter++;
    //         this.getStatusCode(counter, totalRecords);
    //     })
    //     .catch(error => {
    //         ////console.log("in get status error occured",error);
    //     });   
    // }

    
   
    onCompanySetup(){
        let currentvalue = '1';
        let selectedvalue = 'Company Setup';
       
        this.currentvalue = currentvalue;
        this.selectedvalue = selectedvalue;

        this.isCompanySetupSelected = true;
        this.isHistoricalChecked = false;
        this.isFinishOpen = false;
        this.isCurrentCompanySelected = false;

    }

    
    
    
    renderedCallback() {
        //console.log('in rendered qbConfigure');
        if (this.isHistoricalChecked) {
            //console.log('in rendered 1');
            this.template.querySelector('c-qb_-sf-to-qb-mapping-data-comp').style.display = 'none';
            this.template.querySelector('c-historic-Data-Sync-Modal').style.display = 'block';
        } 
        else if(this.sfToQbMappingOn) {
            //console.log('in rendered 2');
            this.template.querySelector('c-historic-Data-Sync-Modal').style.display = 'none';
            this.template.querySelector('c-qb_-sf-to-qb-mapping-data-comp').style.display = 'block';
        }
        else{
            //console.log('in rendered 3');
            this.template.querySelector('c-historic-Data-Sync-Modal').style.display = 'none';
            this.template.querySelector('c-qb_-sf-to-qb-mapping-data-comp').style.display = 'none';
        }
        
    }

    pathHandler(event,step,value) {
        try{
            ////console.log('in path handler1234',event);
            ////console.log('in path step',step);
            ////console.log('in path value',value);
            ////console.log('realmid222',this.realmId);
            let targetValue = event.currentTarget.value;
            let selectedvalue = event.currentTarget.label;
            
            ////console.log('current value',this.currentvalue);
            ////console.log('selected value',this.selectedvalue);
            if(targetValue == 1){
                this.pointerDisableForFinish = true;
                this.sfToQb = false;
                this.qbToSf = false;
                this.onFieldMapping = false;
                this.isCompanySetupSelected = true;
                this.isHistoricalChecked = false;
                this.sfToQbMappingOn = false;
                this.isFinishOpen = false;
                this.isCurrentCompanySelected = false;
                this.isBidirectionalSetupSelected =false;
                this.currentvalue = targetValue;
                this.selectedvalue = selectedvalue;
                ////console.log('first11');
            }
            else if(targetValue == 2 && this.realmId != undefined && this.realmId != ''){
                this.pointerDisableForFinish = true;
                this.sfToQb = false;
                this.qbToSf = false;
                this.onFieldMapping = false;
                this.isCompanySetupSelected = false;
                this.isHistoricalChecked = false;
                this.sfToQbMappingOn = false;
                this.isFinishOpen = false;
                this.isCurrentCompanySelected = true;
                this.isBidirectionalSetupSelected =false;
                this.currentvalue = targetValue;
                this.selectedvalue = selectedvalue;
                ////console.log('origin',this.origin);
                ////console.log('issalesforce',this.isSalesforce);
                ////console.log('second2');
            }
            else if(targetValue == 3 && this.realmId != undefined && this.realmId != ''){
                this.pointerDisableForFinish = true;
                //console.log('in target 3 again',this.isHistoricalDataSyncLoaded);
                if(!this.isHistoricalDataSyncLoaded){
                    this.onOpenMappingsProgress();
                }
                this.selectedOption = 'QuickBooks Online To Salesforce Mapping';
                this.onFieldMapping = true;
                this.qbToSf = true;
                this.isCompanySetupSelected = false;
                this.isCurrentCompanySelected = false;
                this.isFinishOpen = false;
                this.isHistoricalChecked = true;
                this.isBidirectionalSetupSelected =false;
                this.currentvalue = targetValue;
                this.selectedvalue = selectedvalue;
                ////console.log('third',this.realmId);
            }
            else if(targetValue == 4 && this.realmId != undefined && this.realmId != ''){
                // this.sfToQb = false;
                // this.qbToSf = false;
                // this.onFieldMapping = false;
                // this.currentvalue = targetValue;
                // this.selectedvalue = selectedvalue;
                // this.isBidirectionalSetupSelected =false;
                // ////console.log('in 4');
                // this.isCompanySetupSelected = false;
                // this.isCurrentCompanySelected = false;
                // this.isHistoricalChecked = false;
                // this.sfToQbMappingOn = false;
                // this.isFinishOpen = true;
                // this.currentIndex = 0;
                // this.startHistoricalBatch(false);
                
                
            }
            else if(targetValue == 5){
                this.pointerDisableForFinish = true;
                this.sfToQb = false;
                this.qbToSf = false;
                this.onFieldMapping = false;
                this.currentvalue = targetValue;
                this.selectedvalue = selectedvalue;
                this.isHistoricalChecked = false;
                this.sfToQbMappingOn = false;
                this.isFinishOpen = false;
                this.isCurrentCompanySelected = false;
                this.isCompanySetupSelected = false;
                this.isBidirectionalSetupSelected =true;

                // this.isFinishOpen = true;
                // this.isCompanySetupSelected = false;
                // this.isCurrentCompanySelected = false;
                // this.isHistoricalChecked = false;
                
            }
        }
        catch(ex){
            ////console.log('in path exc',ex.message);
        }
    }

    handleFinishMethod(event){
        ////console.log('called handle parent method',JSON.stringify(event.detail.QbToSfConfigDataList));
        this.isSyncOpen = true;
    }

    async startSyncToSF(){
        try{
            
            
            let isAnyBatchInProgress = await isAnyBatchRunning();
            let foundQbCompData = this.qbToSfCompanyrecords.find(obj => obj.hic_qbmadeasy__RealmId__c === this.realmId);
            let isQbCompConnected =true;
            if (foundQbCompData) {
                // Access the isconnected value of the found object
                isQbCompConnected = foundQbCompData.isSfToQbConnected;
                //console.log('isconnected value:', foundQbCompData);
            }
            //console.log('isQbCompConnected value:', isQbCompConnected);
            ////console.log('isAnyBatchRunning',isAnyBatchInProgress);
            if(isAnyBatchInProgress){
                //console.log('isconnected value:2');
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'A batch is already in process',
                    message: 'Please wait for the batch to finish ' ,
                    variant: 'error',
                    autoclose: false,
                });
            }
            else if(!isQbCompConnected){
                
                //console.log('isconnected value:3333');
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Quickbooks online Company is disconnected',
                    message: 'Please reconnect QB Company ' ,
                    variant: 'error',
                    autoclose: false,
                });
            }
            else{
                this.onFieldMapping = false;
                this.pointerDisableForFinish = false;
                //console.log('isconnected value:55');
                this.progressValue = 0;
                this.isPrivacyNotChecked = true;
                this.isSyncOpen = false;
                let currentvalue = '4';
                let selectedvalue = 'Finished';
                    
                this.currentvalue = currentvalue;
                this.selectedvalue = selectedvalue;
    
                this.isCompanySetupSelected = false;
                this.isCurrentCompanySelected = false;
                this.isHistoricalChecked = false;
    
                this.items = null;
                this.currentIndex = 0;
    
                this.onOpenFinish();
            }

        }
        catch(ex){
            //console.log('in exception isbatch runnig',ex.message);
        }
       

    }
    closeSyncWarningModal(){
        this.isSyncOpen = false;
        this.isPrivacyNotChecked = true;
    }

    onOpenFinish(){
        //if(this.emailAlert != null && this.emailAlert!= ''){
            this.isFinishOpen = true;
            ////console.log('realmid2',this.realmId);
            let realmId = this.realmId;
            ////console.log('before sendDataToHistoricalBatch changes',realmId);
            ////console.log('before sendDataToHistoricalBatch',this.emailListarray);
            this.startHistoricalBatch(true);

        //}
        // else{
        //     this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
        //         title: 'Please fill the email',
        //         message: 'Email will receive sync process info.' ,
        //         variant: 'error',
        //         autoclose: false,
        //     });
        // }


    }

    startHistoricalBatch(startBatch){
        ////console.log('quickBookProcesssId',this.realmId);
        ////console.log('emailList',this.emailForBatchStatus);
        ////console.log('startBatch',startBatch);
        sendDataToHistoricalBatch({
            'quickBookCompanyId' : this.realmId,
            'emailAddress': this.emailForBatchStatus,
            'startBatch':startBatch
        })
        .then(resp => {
            ////console.log('in sendDataToHistoricalBatch ');
            ////console.log('SfToqbConfigData response data', JSON.stringify(resp));
            //console.log('resp>>>>',JSON.stringify(resp));
            this.items = []; 
            this.totalNumOfQbRecords = 0;
            this.totalNumOfQbRecProcessed = 0;	
            this.progressValue = 0;
            let tempArray = [];
            let batchJobIdArray = [];
            if (resp && resp.length > 0) {
                resp.forEach(obj => {
                    //console.log('obj99>>>',obj);
                    let tempObj = {};
                    tempObj = { ...obj };
                    if(obj.hic_qbmadeasy__SF_Entity__c == 'product2'){
                        ////console.log('in if');
                        tempObj.iconName = 'standard:product';
                    }
                    else if(obj.hic_qbmadeasy__SF_Entity__c.endsWith('__c')){
                        tempObj.iconName = 'standard:custom';
                    }
                    else{
                        ////console.log('in else');
                        tempObj.iconName = 'standard:' +obj.hic_qbmadeasy__SF_Entity__c;
                    }
                    
                    if(obj.hic_qbmadeasy__SF_Entity__c == 'hic_qbmadeasy__quickbooks_account__c'){
                        tempObj.hic_qbmadeasy__SF_Label = 'QUICKBOOKS_ACCOUNT__C';
                    }else{
                        tempObj.hic_qbmadeasy__SF_Label = obj.hic_qbmadeasy__SF_Entity__c.toUpperCase();
                    }
                    
                    tempObj.hic_qbmadeasy__QB_Label = obj.hic_qbmadeasy__QB_Entity__c.toUpperCase();
                    tempObj.jobProcessed = '0';
                    tempObj.totalNumOfQbRecInserted = '0';
                    tempObj.totalNoOfJob = obj.totalNoOfQbRecs;
                    if(obj.totalNoOfQbRecs == 0){
                        tempObj.jobStatus = 'No Record is Present';
                    }else{
                        tempObj.jobStatus = 'Not Yet Started';
                    }
                    
                    tempObj.batchJobId = '';
                    this.totalNumOfQbRecords = this.totalNumOfQbRecords + obj.totalNoOfQbRecs;
                    tempArray.push(tempObj);
                    batchJobIdArray.push(obj.batchprocessid);
                });
            }
    
            this.items = tempArray;
            ////console.log('before this.queryRecords totalNumOfQbRecords ', this.totalNumOfQbRecords);
            ////console.log('before this.queryRecords();', JSON.stringify(this.items));
            this.queryRecords();
            //this.handleSubscribe();
            
            
        });

    }

    queryRecords() {
        try{
            ////console.log('in queryRecords()111', this.currentIndex );
            ////console.log('in queryRecords()2', this.items.length );
            
            if(this.currentIndex <= this.items.length){
                ////console.log('in queryRecords()3', JSON.stringify(this.items[this.currentIndex]) );
                const record = this.items[this.currentIndex];
                ////console.log('in queryRecords()4', JSON.stringify(record) );
                ////console.log('in queryRecords()5', record.Id );
                
                if(this.items[this.currentIndex].totalNoOfJob == 0){
                    this.currentIndex = this.currentIndex + 1;
                    this.queryRecords();
                }else{
                    fetchQbBatchId({ 'qbProcessId': record.Id }).then((result) => {
                        ////console.log('in fetchSfToqbConfigDataById>>>1234567',JSON.stringify(result));
                        if(result.hic_qbmadeasy__Batch_Process_Id__c){
                            ////console.log('in fetchSfToqbConfigDataById success');
                            this.items[this.currentIndex].batchJobId = result.hic_qbmadeasy__Batch_Process_Id__c;
                            ////console.log('before  this.pollBatchStatus();',this.items[this.currentIndex].batchJobId );
                            this.pollBatchStatus();
                        }
                        else{
                            ////console.log('in fetchSfToqbConfigDataById else');
                            setTimeout(() => {
                                this.queryRecords();
                            }, 5000); 
                        }
                        
                    })
                    .catch((error) => {
                        ////console.log('in fetchSfToqbConfigDataById error');
                        console.error(error.message);
                    });
                }
                
    
            }
        }
        catch(ex){
            ////console.log('in fetchsftoqberror'+ex.message);
        }

        
    }

    pollBatchStatus() {
        try{
        ////console.log('in pollBatchStatus ');
        ////console.log('in pollBatchStatus1',this.currentIndex);
        ////console.log('in pollBatchStatus2',this.items);
        ////console.log('in pollBatchStatus3',this.items[this.currentIndex]);
        const record = this.items[this.currentIndex];
        ////console.log('in pollBatchStatus record ',record.batchJobId);
        if (record.batchJobId) {
            ////console.log('in record.batchJobId ');
            if (record.jobStatus !== 'Completed' || record.jobStatus !== 'Aborted' || record.jobStatus !== 'Failed') {
                ////console.log('in  record.batchJobId  ');
                getBatchJobStatus({'batchJob':JSON.stringify(record),'realmId':this.realmId})
                .then(res=>{
                    ////console.log('in getBatchJobStatus ',res);
                    //let totalJobProcessed = res.JobItemsProcessed * 10;       
                    // if(totalJobProcessed>=this.items[this.currentIndex].totalNoOfJob){
                    //     totalJobProcessed = this.items[this.currentIndex].totalNoOfJob;
                    // }
                    let totalJobProcessed = res.JobItemsProcessed * 10;       
                    if(totalJobProcessed>=this.items[this.currentIndex].totalNoOfJob){
                        this.items[this.currentIndex].jobProcessed = this.items[this.currentIndex].totalNoOfJob;
                        this.items[this.currentIndex].totalNumOfQbRecInserted = res.totalNumOfQbRecInserted;
                    }
                    else{
                        this.items[this.currentIndex].jobProcessed = totalJobProcessed;
                        this.items[this.currentIndex].totalNumOfQbRecInserted = res.totalNumOfQbRecInserted;
                    }          
                    //this.items[this.currentIndex].jobProcessed = totalJobProcessed;
                    //this.items[this.currentIndex].totalNoOfJob = res.TotalJobItems;
                    this.items[this.currentIndex].jobStatus = res.Status;
                    //this.progressValue = Math.round(((this.items[this.currentIndex].jobProcessed + totalNumOfQbRecProcessed)/totalNumOfQbRecords)*100);
                    if(this.totalNumOfQbRecords == 0){
                        this.progressValue = 100;
                    }else{
                        this.progressValue = Math.round(((this.items[this.currentIndex].jobProcessed + this.totalNumOfQbRecProcessed)/this.totalNumOfQbRecords)*100);
                    }
                    
                    ////console.log('progressValue',this.progressValue);
                    if(res.Status == 'Completed' || res.Status == 'Aborted' || res.Status == 'Failed'){
                        ////console.log('res.Status == Completed');     
                        this.totalNumOfQbRecProcessed = this.totalNumOfQbRecProcessed + this.items[this.currentIndex].jobProcessed;   
                        this.currentIndex = this.currentIndex + 1;
                        this.queryRecords();

                    }
                    else{  
                        ////console.log('res.Status == else');   
                        setTimeout(() => {
                            this.pollBatchStatus();
                        }, 5000); 
                    }
                
                    
                }).catch((error) => {
                    console.error(error);
                });
                
            } 
            else {
                ////console.log('record.jobStatus !== Completed else');   
            }
        } 

        }
        catch(ex){
            ////console.log('in exception pollbatch status',ex.message);
        }
        
        
    }

    // wiredBatchJobStatus(batchJobId){
    //     ////console.log('in wiredBatchJobStatus');
    //     try{
    //         getBatchJobStatus({'batchJobId':this.batchJobId})
    //         .then(res=>{
    //             let totalJobItems = 0;
    //             let totalJobProcessed = 0 ;
    //             for (let i = 0; i < this.items.length; i++) {
    //                 this.items[i].jobProcessed = res[i].JobItemsProcessed;
    //                 //this.items[i].totalNoOfJob = res[i].TotalJobItems;
    //                 this.items[i].jobStatus = res[i].Status;
    //                 totalJobItems = totalJobItems + res[i].TotalJobItems;
    //                 totalJobProcessed = totalJobProcessed + res[i].JobItemsProcessed;
    //             }
    //             // if(totalJobItems == '0'){
    //             //     this.progressValue = 0;
    //             // }
    //             // else{
    //             //     this.progressValue = Math.round((totalJobProcessed/totalJobItems)*100);
    //             // }
    //             this.progressValue = (totalJobItems == 0) ? 0 : Math.round((totalJobProcessed/totalJobItems)*100);

    //             //this.progressValue = Math.round((totalJobProcessed/totalJobItems)*100);
    //             ////console.log('this.progressValue',this.progressValue);
    //             ////console.log('all are equal',this.allAreEqual(this.items));
    //             if(this.allAreEqual(this.items)){
    //                 this.isBatchCompleted = true;
    //                 ////console.log('batch completed stop callout',this.items);
    //             }
    //         }
    //         );
    //     }
    //     catch(ex){
    //         ////console.log('in wired batch exception',ex.message);
    //     }

    // }

    
    // refreshBatchOnInterval() {
    //     try{
    //     this.event = setInterval(() => {
    //         if (this.isBatchCompleted) {
    //             ////console.log('in if setinterval');
    //             this.batchStatusSpinner = true;
    //             clearInterval(this.event);
    //         } else {
    //             this.wiredBatchJobStatus();
    //         }
    //     }, 5000);
    //     }
    //     catch(ex){
    //         ////console.log('in refresh lwc exception',ex.message);
    //     }
    // }

    
    
    openContactSupportModal(){
        ////console.log('in modal');
        this.isContactSupport = true;
    }

    closeContactSupport(){
        ////console.log('close contact');
        this.isContactSupport = false;
        this.yesWantToDelete = false;
    }

    openContactWarningModal(){
        ////console.log('in modal');
        this.isContactWarning = true;
    }

    closeContactWarningModal(){
        ////console.log('close contact');
        this.isContactWarning = false;
    }
    newCompanyModal(){
        ////console.log('in new company modal');
        this.isSpinnerLoaded = true;
        let tempObj = {};
        tempObj.Label = this.companyLabel
        tempObj.realmId = this.realmId
        this.newrecords.push(tempObj);
        this.isAlreadyAuthorised = true;
        //this.isLoaded = true;
        this.isSpinnerLoaded = false;
        // fetchCustomRecs()
        //  .then(result =>{
        //     ////console.log('result',result);
        //     if(result.length > 0){
                
        //     this.isAlreadyAuthorised = true;
        //     this.qbToSfCompanyrecords = result;
        //     this.isLoaded = true;
                   
        //     this.records = result;
        //     this.isSpinnerLoaded = false;
        //     }
        //  })
        //  .catch(error => {
        //     this.isSpinnerLoaded = false;
        //     ////console.log('in error',error);
        //  })
        this.isContactWarning = false;
        this.isNewCompany = true;
    }
    closeNewCompanyModal(){
        this.isNewCompany = false;
        
    }

    openMultiCompanyModal(){
        ////console.log('in modal');
        this.isSpinnerLoaded = true;
        fetchCustomRecs()
         .then(result =>{
            ////console.log('result',result);
            if(result.length > 0){
                
            this.isAlreadyAuthorised = true;
            this.qbToSfCompanyrecords = result;
            this.isLoaded = true;
                   
            this.records = result;
            this.isSpinnerLoaded = false;
            //console.log('fetchCustomRecords openMultiCompanyModal',this.qbToSfCompanyrecords);
            }
         })
         .catch(error => {
            this.isSpinnerLoaded = false;
            ////console.log('in error',error);
         })
         
        this.isContactWarning = false;
        this.isMultiCompanyOpen = true;
    }

    closeMultiCompanyModal(){
        ////console.log('close contact');
        this.isMultiCompanyOpen = false;
    }
    
    openEnableDebugLog(){
       this.isDebugLog = true; 
    }
    openModalForEnvironment(){
        this.isAddQuickbooksChecked = true;
    }

    handleDialogClose() {
        this.isAddQuickbooksChecked = false;
        this.environmentChoosen = '';
        this.isenvironmentChoosen = true;

    }

    
    redirectToSalesforce(event){
        var companyId =  event.currentTarget.dataset.realmid1;
        isSandox().then(resp =>{
            ////console.log(resp);
            if(resp){
                let urlToOpen = '/services/oauth2/authorize?client_id='+this.sfClientId_Sand+'&response_type=code&redirect_uri='+this.sfRedrectUriForSandbox+'&state=sandboxtest_realmid='+companyId;
                //console.log(urlToOpen);
                window.open(urlToOpen);
            }else{
                let urlToOpen = '/services/oauth2/authorize?client_id='+this.sfClientId_Prod+'&response_type=code&redirect_uri='+this.sfRedrectUriForProduction+'&state=productionlive_realmid='+companyId;
                //console.log(urlToOpen);
                window.open(urlToOpen);
            }
        });
    }

    get environmentOptions() {
        return [
            { label: 'Sandbox', value: 'Sandbox' },
            { label: 'Production', value: 'Production' },
        ];
    }

    getChoosenValue(event){
        ////console.log('choosen',event.target.value);
        this.environmentChoosen = event.target.value;
        this.isenvironmentChoosen = false;
    }

    redirectToQuickbookOnline(event){
        //////console.log('in redirect',event.value);
        if(this.environmentChoosen == 'Sandbox'){
            ////console.log('in sandbox');
            isSandox().then(resp =>{
                ////console.log(resp);
                if(resp){
                    let urlToOpen = 'https://appcenter.intuit.com/connect/oauth2?client_id='+this.clientId+'&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri='+this.redrectUriForSandbox+'&state=sandboxtest';
                    ////console.log('urlToOpen1',urlToOpen);
                    window.open(urlToOpen,"_top");       
                }else{
                    let urlToOpen = 'https://appcenter.intuit.com/connect/oauth2?client_id='+this.clientId+'&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri='+this.redrectUriForProduction+'&state=sandboxtest';
                    ////console.log('urlToOpen2',urlToOpen);
                    window.open(urlToOpen,"_top");
                }
            });
        }
        else if(this.environmentChoosen == 'Production'){
            ////console.log('in production');
            isSandox().then(resp =>{
                ////console.log(resp);
                if(resp){
                    let urlToOpen = 'https://appcenter.intuit.com/connect/oauth2?client_id='+this.clientIdProduction+'&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri='+this.redrectUriForSandbox+'&state=productionlive';
                    ////console.log('urlToOpen3',urlToOpen);
                    window.open(urlToOpen,"_top");
                    //window.open(urlToOpen,"_self");
                        
                }else{
                    let urlToOpen = 'https://appcenter.intuit.com/connect/oauth2?client_id='+this.clientIdProduction+'&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri='+this.redrectUriForProduction+'&state=productionlive';
                    ////console.log('urlToOpen4',urlToOpen);
                    window.open(urlToOpen,"_top");
                    //window.open(urlToOpen,"_self");
                }
            });
        }else{
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: 'Please select the QB environment',
                variant: 'error',
                autoclose: true,
            });

        }
    }

    
    

    onDeleteCompany(){
        ////console.log('in delete');
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

    onOpenMappings(){
        try{
            if(!this.isHistoricalDataSyncLoaded){
                this.onOpenMappingsProgress();
            }

            this.emailAlert = this.emailForBatchStatus;
            let currentvalue = '3';
            let selectedvalue = 'Object And Fields Setup';
            this.currentvalue = currentvalue;
            this.selectedvalue = selectedvalue;
            this.isCompanySetupSelected = false;
            this.isCurrentCompanySelected = false;
            this.selectedOption = 'QuickBooks Online To Salesforce Mapping';
            this.onFieldMapping = true;
            this.isHistoricalChecked = true;
            this.isMultiCompanyOpen = false; 
        }
        catch(ex){
            ////console.log('exc',ex.message);
        }  
    }

    
    
    onEditCompany(event){
        try{
            this.realmId = event.currentTarget.dataset.realmid1;
            //console.log(' this.realmId', this.realmId);
            //this.currentCompany = 'Selected Company: '+event.currentTarget.dataset.label;
            this.currentCompany = event.currentTarget.dataset.label;
            //console.log(' this.currentCompany', this.currentCompany);
            window.sessionStorage.setItem('realmIdSessionStorage',this.realmId );
            window.sessionStorage.setItem('companyNameSession',this.currentCompany);
            this.showCurrentCompany();
            //will call onopenmappings
        }
        catch(ex){
            ////console.log('exc',ex.message);
        }  
    }

    showCurrentCompany(){
        try{
            this.currentvalue =  '2';
            this.selectedvalue = 'Current Company';
            this.isCompanySetupSelected = false;
            this.isHistoricalChecked = false;
            this.isFinishOpen = false;
            this.isCurrentCompanySelected = true;
            this.isMultiCompanyOpen = false;
            this.isNewCompany = false;
            this.isHistoricalDataSyncLoaded = false;
            this.isSfToQbDataSyncLoaded = false;

        }
        catch(ex){
            ////console.log('exc 1054',ex.message);
        }
    }


    onOpenMappingsProgress(){
        try{
            ////console.log('start isHistoricalChecked',this.isHistoricalChecked);
            this.isHistoricalDataSyncLoaded = true;
            const objChild = this.template.querySelector('c-historic-Data-Sync-Modal');
            ////console.log('in objChild3',objChild);
            objChild.callingHistoricData(this.realmId);
            
            
        }
        catch(ex){
            ////console.log('exc',ex.message);
        }  
    }
    onOpenMappingsProgressForSfToQb(){
        try{
            ////console.log('in onOpenMappingsProgressForSfToQb');
            this.isSfToQbDataSyncLoaded = true;
            const objChild = this.template.querySelector('c-qb_-sf-to-qb-mapping-data-comp');
            ////console.log('in objChild3',objChild);
            objChild.callingSfToQbChildComp(this.realmId);
            
            
        }
        catch(ex){
            ////console.log('exc',ex.message);
        }  
    }
    
    handleEmailChange(event) {
        this.emailForBatchStatus = event.target.value;
        // const currentIndex = event.target.dataset.index;
        // this.emailList[currentIndex].email = event.target.value;
        ////console.log('email check',JSON.stringify(this.emailForBatchStatus ));
    }

    
    handlePrivacyCheck(event){
       ////console.log('checkbox',event.detail.checked);
       this.isPrivacyNotChecked = !event.detail.checked;

    }
    
    handleHover(){
        try{
            var modal = this.template.querySelector('.myModal');
            //console.log('modal12345608',modal);
            this.template.querySelector('.triangle-bottom').style.display="block";
            modal.style.display = 'block';
        }catch(error){
            //console.log('exception ',error);
            console.error('error message ',error.message);
        }
    }

    handleHoverOut() {
        var modal = this.template.querySelector('.myModal');
        this.template.querySelector('.triangle-bottom').style.display="none";
        modal.style.display="none";
    }

  



    allAreEqual(array) {
        ////console.log('in all are equal22',JSON.stringify(array));
        const result = array.every(element => {
            ////console.log('result element',JSON.stringify(element));
            ////console.log('result element',element.jobStatus);
            if (element.jobStatus === 'Completed') {
                return true;
              }
        });
        return result;
    }


    onEmailValueChange(event){
        this.emailForBatchStatus = event.detail;
        //console.log('onemailvaluechange',event.detail);
    }

    handleConnectToQbButtonHover(event){
        //event.target.setAttribute('src', qbConnectButtonImageHover);
        //console.log('Hover', this.qbConnectButtonImageHover);
        event.target.src = this.qbConnectButtonImageHover;
    }
    handleConnectToQbButtonHoverOut(event){
        //event.target.setAttribute('src', qbConnectButtonImage);
        //console.log('Hove Out');
        event.target.src = this.qbConnectButtonImage;
    }







    

    
}