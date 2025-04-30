import { LightningElement, track, wire, api } from 'lwc';
import getNameSpace from "@salesforce/apex/Qb_ConfigController.getNameSpace";
import fetchSfToqbConfigData from "@salesforce/apex/Qb_ConfigController.getExistingSfToqbConfigData";
import fetchSfToqbConfigDataById from '@salesforce/apex/Qb_ConfigController.getExistingSfToqbConfigDataById'
import sObjSelectionList from "@salesforce/apex/Qb_ConfigController.getSObjectSelectList";
import companySelectionList from "@salesforce/apex/Qb_ConfigController.getCompanyList";
import createRequiredField from "@salesforce/apex/QB_MetadataUtilityController.createRequiredField";
import getResponse from "@salesforce/apex/QB_CreateUpdateSObject.createQBRecord";

import QbObjectTypeList from "@salesforce/apex/Qb_ConfigController.getqbObjectTypeSelection";

import fetchQBEntityFields from "@salesforce/apex/Qb_ConfigController.fetchQBEntityFields";
import sObjFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllFields";
import RelatedEntitiesList from "@salesforce/apex/Qb_ConfigController.fetchAllRelatedEntitiesForqbToSF";
import saveSftoqbConfigData from "@salesforce/apex/Qb_ConfigController.saveSFToqbMapConfigData";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
import createRequiredFieldRelated from "@salesforce/apex/QB_MetadataUtilityController.createRequiredFieldRelated";


import jsonData from '@salesforce/resourceUrl/Default_Mapping_SfToQb';

import customLabels from 'c/qb_CustomLabels';

export default class Qb_SfToQbMappingDataComp extends LightningElement {
    
    @api origin;
    @track selectedSObjectTypeOption;
    @track qbOptions = new Array();
    @track QuickbookOptionsList = new Array();
    @track isSfqbConfigNotEmpty = false;
    @track showSpinner = false;

    @track SfToqbConfigDataList = new Array();
    @track companyOptions = new Array();
    @track sObjectOptions = new Array();
    @track QBOperationOptionsList = new Array();
    @track QBReferenceFieldOptionsList = new Array();
    @track qbTypeOptionsList = new Array();
    @track ApplicableToOptionsList = new Array();
    @track QbObjectTypeOptionsList = new Array();
    @track sobjectFieldList = new Array();
    @track MappingTypeOptions = new Array();
    @track selectedObjectTypeOption;
    @track displayPopup = false;
    @track RefrenceFieldList = new Array();
    @track RefrenceField2List = new Array();
    @track isReferenceField = false;
    referenceCount = 1;
    @track sfFieldsSelObj = {};
    @track inProgress = true;
    @track loadingMessage = 'Loading Configuration ...';
    deleteId = [];
    @track reldatadisplayPopup = false;
    @track RelFieldsMappingList = new Array();
    @track sfChildObjName;
    @track cpChildObjFields;
    @track relObjConfigId;
    @track relFldConfigId;

    @track errorDisplayPopUp = false;
    @track handleQbResErrorMsg;
    @track handleErrorCode;
    @api recordId;
    isBlankMappingFound = false;
    blankObjectMappingName = '';
    @track SfToQbDefaultData = new Array();
    @track realmid;
    @track SfToQbConfigDataListBeforeDefault = new Array();
    // Custom Label
    QuickbookCompanyTxt;
    SalesforceObjLabel;
    QuickBookObjLabel;
    FieldMappingTxt;
    ActionTxt;
    CloseTxt;
    DataMappingTxt;
    SFFieldTxt;
    QuickBookTxt;
    ConstantTxt;
    RelatedFieldTxt;
    PleaseWaitTxt;
    InsertTxt;
    RelatedTxt;
    @api isProFeatureEnable;

    @track label;

    constructor() {
        super();
    }
    
    @api
    callingSfToQbChildComp(realmID){
     
        this.template.querySelector('.slds-form-element').checked = false;
        this.load = true;
        this.realmid = realmID;
        this.loadDefaultMapping();
        fetchSfToqbConfigData({
            'companyId' : this.realmid
        })
        .then(resp => {
            
            if (resp) {

            
            let tempArray = []
            if (resp && resp.length > 0) {
                resp.forEach(obj => {
                    let tempObj = {};
                    tempObj = { ...obj };
                    tempObj.qbReferenceFieldDisabled = obj.hic_qbmadeasy__QB_Operation__c == 'Insert' ? true : false;
                    tempObj.objectFieldDisabled = true;
                    tempArray.push(tempObj)
                });
            }
            this.SfToqbConfigDataList = tempArray
            this.isSfqbConfigNotEmpty = this.SfToqbConfigDataList.length > 0;
            if (this.SfToqbConfigDataList.length <= 0) {
                this.loadingMessage = 'No data';
            }
            this.inProgress = false;
            } 
         
        });
    }

    renderedCallback(){
        
    }

    connectedCallback() {
        //console.log('isprofeature enable'+this.isProFeatureEnabled);
        this.loadDefaultMapping();
        this.MappingTypeOptions = [{ label: 'Field Mapping', value: 'fieldMapping' },
        { label: 'Related Data Mapping', value: 'relatedDataMapping' }];

        this.isSfqbConfigNotEmpty = this.SfToqbConfigDataList.length > 0;
       
        this.fetchCustomLabels();
        this.createRequiredFieldForDefault();
    }

    createRequiredFieldForDefault(){
        let sobjectApiNameList = ['Account', 'Opportunity','Product2'];

        if (sobjectApiNameList.length > 0) {
            createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
                
            })
            .catch(error => {
                
            })
        }
    }

    
    fetchCustomLabels() {
        
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
            
            this.label = label;
            this.QuickbookCompanyTxt = label.qbQuickbookCompanyTxt;
            this.SalesforceObjLabel = label.qbSalesforceObjLabel;
            this.QuickBookObjLabel = label.qbQuickBookObjLabel;
            this.FieldMappingTxt = label.qbFieldMappingTxt;
            this.ActionTxt = label.qbConfigureActionTxt;
            this.CloseTxt = label.qbConfigureCloseBtnLbl;
            this.DataMappingTxt = label.qbDataMappingTxt;
            this.SFFieldTxt = label.qbSFfieldTxt;
            this.QuickBookTxt = label.qbQuickBookTxt;
            this.ConstantTxt = label.qbConstantTxt;
            this.RelatedFieldTxt = label.qbRelatedFieldTxt;
            this.PleaseWaitTxt = label.qbPleaseWaitTxt;
            this.InsertTxt = label.qbInsertTxt;
            this.RelatedTxt= label.qbRelatedTxt;
           
        })
    }

    

    @wire(sObjSelectionList) SobjSelList(resp) {
        if (resp.data) {
            this.sObjectOptions = resp.data;
            this.error = undefined;
        } else if (resp.error) {
            this.error = resp.error;
            this.sObjectOptions = undefined;
        }
    }

    @wire(companySelectionList) CompanyList(resp) {
        if (resp.data) {
            
            let qbCompanyOptionList = [];
            resp.data.forEach(currentItem => {
                let name = currentItem.Label;
                let realmId = currentItem.companyId;
               
                let companyOptions =  { label: name, value: realmId };
                qbCompanyOptionList.push(companyOptions);
            });
            this.companyOptions = qbCompanyOptionList;
            this.error = undefined;
           
        } else if (resp.error) {
          
            this.error = resp.error;
            this.companyOptions = undefined;
        }
    }


   
    @wire(QbObjectTypeList) ObjectTypeToSelList(resp) {
        

        if (resp.data) {
            var qbObjectOptionList = [{ label: '--None--', value: '--None--' }];
            resp.data.forEach(currentItem => {
                qbObjectOptionList.push(currentItem);
            });
            this.QbObjectTypeOptionsList = qbObjectOptionList;
            this.error = undefined;
        } else if (resp.error) {
            this.error = resp.error;
            this.QbObjectTypeOptionsList = undefined;
        }
    }

    handlechangeToggle(event){
        try{
           
            this.isSfqbConfigNotEmpty = true;
            if(event.detail.checked){
                if(this.SfToqbConfigDataList.length>0){
                    this.SfToQbConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
                    
                    this.SfToQbDefaultData.forEach(obj => {
                        let defaultData = obj;
                        
                        let existingObj = this.SfToqbConfigDataList.find(item => item.hic_qbmadeasy__SF_Entity__c === defaultData.hic_qbmadeasy__SF_Entity__c && item.hic_qbmadeasy__QB_Entity__c === defaultData.hic_qbmadeasy__QB_Entity__c );
                    
                        
                        
                        if (existingObj) {
                        
                            if(existingObj.Id){
                                if (!this.deleteId.includes(existingObj.Id)) {
                                    this.deleteId.push(existingObj.Id);
                                }
                            }
                            this.SfToqbConfigDataList[this.SfToqbConfigDataList.indexOf(existingObj)] = defaultData;
                           
                        } else {
                           
                            this.SfToqbConfigDataList.push(defaultData);
                        }
                    });
                }
                else{
                    
                    this.SfToqbConfigDataList =  JSON.parse(JSON.stringify(this.SfToQbDefaultData));
                }

            }
            else{
               
                this.SfToqbConfigDataList =  JSON.parse(JSON.stringify(this.SfToQbConfigDataListBeforeDefault));
            }
        }
        catch(ex){
            
        }
    }

    async loadDefaultMapping(){
        let nameSpace;
        await getNameSpace().then(result => {
            nameSpace = result
        })
        .catch(error => {
            
        })

        await fetch(jsonData)
        .then((response) => response.json())
        .then((data) =>{ 
         
            
            this.SfToQbDefaultData = data;
            let refererceFieldMap = {
                "hic_qbmadeasy__Quickbooks_Income_Account_Ref__r.qbmadeasy_internal_id__c":"hic_qbmadeasy__Quickbooks_Income_Account_Ref__r."+nameSpace+"qbmadeasy_internal_id__c", 
                "hic_qbmadeasy__Quickbooks_Asset_Account_Ref__r.qbmadeasy_internal_id__c":"hic_qbmadeasy__Quickbooks_Asset_Account_Ref__r."+nameSpace+"qbmadeasy_internal_id__c",
                "hic_qbmadeasy__Quickbooks_Expense_Account_Ref__r.qbmadeasy_internal_id__c":"hic_qbmadeasy__Quickbooks_Expense_Account_Ref__r."+nameSpace+"qbmadeasy_internal_id__c",
                "hic_qbmadeasy__Quickbooks_Income_Account_Ref__r.qbmadeasy_id__c":"hic_qbmadeasy__Quickbooks_Income_Account_Ref__r."+nameSpace+"qbmadeasy_id__c",
                "hic_qbmadeasy__Quickbooks_Asset_Account_Ref__r.qbmadeasy_id__c":"hic_qbmadeasy__Quickbooks_Asset_Account_Ref__r."+nameSpace+"qbmadeasy_id__c",
                "hic_qbmadeasy__Quickbooks_Expense_Account_Ref__r.qbmadeasy_id__c":"hic_qbmadeasy__Quickbooks_Expense_Account_Ref__r."+nameSpace+"qbmadeasy_id__c",
                "Account.qbmadeasy_internal_id__c":"Account."+nameSpace+"qbmadeasy_internal_id__c",
                "Account.qbmadeasy_id__c":"Account."+nameSpace+"qbmadeasy_id__c"
            
            };
            for (let i = 0; i < this.SfToQbDefaultData.length; i++) {
                this.SfToQbDefaultData[i].hic_qbmadeasy__RealmId__c = this.realmid;
                this.SfToQbDefaultData[i].Name = this.getRandomString(18);
                
                let element =  new Array();
                element = this.SfToQbDefaultData[i].fieldsJson;
    
                for(let j = 0; j < element.length; j++){
                    element[j].Name = this.getRandomString(18);
                    // if(element[j].hic_qbmadeasy__SF_Field_Label__c ==='Account.HIC QuickBook Id'){
                    //     element[j].hic_qbmadeasy__SF_Field__c = 'Account.'+nameSpace+'qbmadeasy_id__c';
                    // }
                    let sfFieldLabel = element[j].hic_qbmadeasy__SF_Field_Label__c;
                    if(sfFieldLabel.includes('HIC QuickBook Id') || sfFieldLabel.includes('HIC QuickBook Internal Id')){
                        //console.log('in line 2312',refererceFieldMap);
                        //console.log('in line 2312 sfFieldLabel',sfFieldLabel);
                        //console.log('in line 2312 element[j].hic_qbmadeasy__SF_Field__c',element[j].hic_qbmadeasy__SF_Field__c);
                        let referenceField = refererceFieldMap[element[j].hic_qbmadeasy__SF_Field__c];
                        //console.log('referencefield',referenceField);
                        
                        element[j].hic_qbmadeasy__SF_Field__c = referenceField;
                    }
                    if(element[j].hic_qbmadeasy__Data_Mapping_Type__c ==='relatedDataMapping'){
                        let relatedElement =  new Array();
                        relatedElement = element[j].hic_qbmadeasy__FieldsMappingData__c;

                        for(let k = 0; k < relatedElement.length; k++){
                            relatedElement[k].configId = this.getRandomString(18);
                            if(relatedElement[k].sf_fieldName === 'product2id'){
                                relatedElement[k].sf_field2Name = nameSpace + 'qbmadeasy_id__c';
                            }
                        }

                        let relatedDataValues = new Array();
                        relatedDataValues = element[j].hic_qbmadeasy__RelatedDataValues__c;
                        for(let k = 0; k < relatedDataValues.length; k++){
                            
                            if(relatedDataValues[k].label === 'ItemRef-Product2.HIC QuickBook Id'){
                                relatedDataValues[k].name = 'SalesItemLineDetail.ItemRef.value-Product2.'+nameSpace + 'qbmadeasy_id__c';
                            }
                        }


                    }
                }
                
                this.SfToQbDefaultData[i].fieldsJson = element; 
            }
            
            
        });
    }

    renderedCallback() {
        this.template.querySelectorAll('.auto-complete-dropdown-class').forEach(elem => {
            elem.setOptionsAndValues();
        });
    }

    showToast(level, fieldName, QB_Entity) {
     
        var message = fieldName + ' ' + this.label.QB_Object_Level_Errors;
        
        if (level == 'Object') {
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: message,
                variant: 'error',
                autoclose: false,
            });
        }
        else if (level == 'Field') {
            if (QB_Entity == 'Customer') {
                
                if (fieldName == 'NoFieldIsSelected') {
                    
                    this.isBlankMappingFound = true;
                }
                else if (fieldName == '') {
                   
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Customer_Object_Validation_Error,
                        variant: 'error',
                        autoclose: false,
                    });
                }

            }
            else if (QB_Entity == 'Item') {
                
                if (fieldName == '') {
                   
                    this.isBlankMappingFound = true;
                }
                else if (fieldName == 'Name') {
                    ////console.log('fieldName>>', fieldName);
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Item_Obj_Error_Name,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'InvStartDate') {
                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Item_Obj_Error_InvStartDate,
                        variant: 'error',
                        autoclose: false,
                    });

                } else if (fieldName == 'Type') {
                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Item_Obj_Error_Type,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'IncomeAccountRef.value') {
                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Item_Obj_Error_IncomeAccountRef,
                        variant: 'error',
                        autoclose: false,
                    });
                } 

            }
            else if (QB_Entity == 'Invoice') {
              
                if (fieldName == '') {
                    
                    this.isBlankMappingFound = true;
                } else if (fieldName == 'CustomerRef.value') {

                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Invoice_Obj_Error_CustomerRef,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'Line') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Invoice_Obj_Error_Line,
                        variant: 'error',
                        autoclose: false,
                    });
                }
            }
            else if (QB_Entity == 'Estimate') {
          
                if (fieldName == '') {
                   
                    this.isBlankMappingFound = true;
                } else if (fieldName == 'CustomerRef.value') {

                   
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Estimate_Obj_Error_CustomerRef,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'Line') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Estimate_Obj_Error_Line,
                        variant: 'error',
                        autoclose: false,
                    });
                }
            }
            else if (QB_Entity == 'payment') {
                
                if (fieldName == '') {
            
                    this.isBlankMappingFound = true;
                } else if (fieldName == 'TotalAmt'){
                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Payment_Obj_Error_TotalAmt,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'CustomerRef.value') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Payment_Obj_Error_CustomerRef,
                        variant: 'error',
                        autoclose: false,
                    });
                }
                else if (fieldName == 'CurrencyRef.value') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Payment_Obj_Error_CurrencyRef,
                        variant: 'error',
                        autoclose: false,
                    });
                }
            }
           
            else if (QB_Entity == 'Bill') {
              
                if (fieldName == '') {
                   
                    this.isBlankMappingFound = true;
                } else if (fieldName == 'VendorRef.value') {

                    
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Bill_Obj_Error_VendorRef,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'Line') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Bill_Obj_Error_Line,
                        variant: 'error',
                        autoclose: false,
                    });
                }
                else if (fieldName == 'CurrencyRef') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Bill_Obj_Error_CurrencyRef,
                        variant: 'error',
                        autoclose: false,
                    });
                }
            }
            else if (QB_Entity == 'Account') {
               
                if (fieldName == '') {
                    
                    this.isBlankMappingFound = true;
                } else if (fieldName == 'Name') {
                  
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Account_Obj_Error_For_Name,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'AcctNum') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Account_Obj_Error_AcctNum,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'TaxCodeRef.value') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Account_Obj_Error_TaxCodeRef,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'AccountType') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Account_Obj_Error_AccountType,
                        variant: 'error',
                        autoclose: false,
                    });
                } else if (fieldName == 'AccountSubType') {
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: this.label.QB_Account_Obj_Error_AccountSubType	,
                        variant: 'error',
                        autoclose: false,
                    });
                }
            }
        }
    }
    showToastForBlankMapping() {
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: 'No mapping found for the highlighted Row.',
            variant: 'error',
            autoclose: false,
        });

        var arrayOfBlankObjectMappingName = [];
      
        for (var element of this.SfToqbConfigDataList) {
            if (element.fieldsJson != undefined && element.fieldsJson.length == 0) {
                ////console.log('In_If');
                this.blankObjectMappingName = element.hic_qbmadeasy__SF_Entity__c + '-' + element.hic_qbmadeasy__QB_Entity__c; 
                arrayOfBlankObjectMappingName.push(this.blankObjectMappingName);
                this.blankObjectMappingName = '';
            }
        }

        
        for (var eachRow of this.template.querySelectorAll('tr.validate-tablerow')) {
           
            let colValue = '';
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if (colValue === '') {
                    colValue = eachColumn.value;
                } else {
                    colValue = colValue + '-' + eachColumn.value;
                }
            });
           
            if (arrayOfBlankObjectMappingName.includes(colValue)) {
                
                eachRow.querySelector('.validation-error').setAttribute('style', 'display:block');
                eachRow.querySelector('.validation-error').setAttribute('title', 'Row does not have Field Mapping');

                
            }
        }
    }

    validateMappingOnObjectLevel() {
        var level = 'Object';
        var QB_Entity = '';
        for (var element of this.SfToqbConfigDataList) {
           
            if (element.hic_qbmadeasy__SF_Entity__c == '' || element.hic_qbmadeasy__SF_Entity__c == '--None--') {
                this.showToast(level, 'Salesforce Object', QB_Entity);
                return true;
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == '' || element.hic_qbmadeasy__QB_Entity__c == '--None--') {
                this.showToast(level, 'QB Object', QB_Entity);
                return true;
            }     
        }
        return false;
    }

    findDuplicate(arry) {
        let resultToReturn = false;
        let duplicateElement = '';
        for (let i = 0; i < arry.length; i++) {
            for (let j = 0; j < arry.length; j++) {
                if (i !== j) {
                    if (arry[i] === arry[j]) {
                        resultToReturn = true;
                        duplicateElement = arry[i];
                        break;
                    }
                }
            }
            if (resultToReturn) {
                break;
            }
        }
        return duplicateElement;
    }

    showToastForDuplicateMapping(duplicateElement, QB_Entity) {
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: 'Duplicate mapping found for ' + duplicateElement + ' field of ' + QB_Entity + ' Object.',
            variant: 'error',
            autoclose: false,
        });
    }

    validateMappingOnFieldLevel() {
        var isError = false;
        var fieldName = '';
        var level = 'Field';

        for (var element of this.SfToqbConfigDataList) {
            let mapForEachInstance = {};
            let availableReqField = [];
            if (element.hic_qbmadeasy__QB_Entity__c && element.qbtypeFieldsList) {
                let requiredFieldList = [];
                element.qbtypeFieldsList.forEach(reqField => {
                    if (reqField && reqField.required == 'true') {
                        requiredFieldList.push(reqField.value);
                    }
                });
                mapForEachInstance[element.hic_qbmadeasy__QB_Entity__c] = requiredFieldList;
            }

            if (element.hic_qbmadeasy__QB_Entity__c == 'Customer') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });
                    

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }

                    //var requiredFieldsofItemObject = ["Name", "InvStartDate" ];
                    var requiredFieldsofItemObject = [];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == 'Item') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });
                    

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }

                    //var requiredFieldsofItemObject = ["Name", "InvStartDate" ];
                    var requiredFieldsofItemObject = [];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == 'Account') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });
                    

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }

                    //var requiredFieldsofItemObject = ["Name"];
                    var requiredFieldsofItemObject = [];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == 'payment') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });
                   

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }
                    //var requiredFieldsofItemObject = ["TotalAmt", "CustomerRef.value"];
                    var requiredFieldsofItemObject = [];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == 'Invoice') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }

                    var requiredFieldsofItemObject = ["Line"];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }
           
            else if (element.hic_qbmadeasy__QB_Entity__c == 'Bill') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                 
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }

                    //var requiredFieldsofItemObject = ["VendorRef.value", "Line"];
                    var requiredFieldsofItemObject = [];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }

            else if (element.hic_qbmadeasy__QB_Entity__c == 'Estimate') {
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__Quickbook_Field__c)
                    });

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__QB_Entity__c);
                        isError = true;
                        break;
                    }
                    //var requiredFieldsofItemObject = ["CustomerRef.value", "Line"];
                    var requiredFieldsofItemObject = ["Line"];
                    for (let i = 0; i < requiredFieldsofItemObject.length; i++) {
                        if (tempArray.includes(requiredFieldsofItemObject[i])) {
                            isError = false;
                        }
                        else {
                            isError = true;
                            fieldName = requiredFieldsofItemObject[i];
                            break;
                        }
                    }
                }
            }

            if (isError) {
                var QB_Entity = element.hic_qbmadeasy__QB_Entity__c;
                this.showToast(level, fieldName, QB_Entity);
                break;
            }
        }
        return isError;
    }
    showToastForField(isRelatedMap) {
       
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: this.label.QB_Blank_Fields_Mapping,
            variant: 'error',
            autoclose: false,
        });
        if (isRelatedMap) {
            this.template.querySelector('c-qb_-sf-to-qb-rel-fields-mapping-comp').hightlightBlankFields({});
        }
    }
    showToastForFieldForConstant(isRelatedMap) {
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: 'Please remove the white spaces',
            variant: 'error',
            autoclose: false,
        });
        if (isRelatedMap) {
            this.template.querySelector('c-qb_-qb-to-sf-rel-fields-mapping-comp').hightlightBlankFields({});
        }
    }
    checkField() {
       
        this.template.querySelectorAll('tr.validate-field-row').forEach(function (eachRow) {
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                eachColumn.classList.remove('slds-has-error');
            });
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                
                if (eachColumn.value == '' || eachColumn.value == undefined || /^\s/.test(eachColumn.value)) {
                    eachColumn.classList.add('slds-has-error');
                }
            });
        });
        for (var element of this.SfToqbConfigDataList) {
            if (element.fieldsJson != undefined) {
                for (var fieldEle of element.fieldsJson) {
                    let temp = fieldEle.hic_qbmadeasy__SF_Field__c;
                    let trimVal = temp.trimStart();

                    if(fieldEle.hic_qbmadeasy__Constant__c == true  && (/^\s/.test(fieldEle.hic_qbmadeasy__SF_Field__c) || fieldEle.hic_qbmadeasy__SF_Field__c == undefined)){
                        this.showToastForFieldForConstant(false);
                        return true;
                    }

                   
                        if (fieldEle.hic_qbmadeasy__Quickbook_Field__c == '' || fieldEle.hic_qbmadeasy__SF_Field__c == '' || trimVal.length != fieldEle.hic_qbmadeasy__SF_Field__c.length) {
                            this.showToastForField(false);
                            return true;
                        }
                    //}
                    

                    
                    
                }
            }
        }
        return false;
    }

    validateRelatedDataMapping() {
      
        for (var element of this.SfToqbConfigDataList) {
            
            if (element.fieldsJson != undefined) {
                for (var fldElement of element.fieldsJson) {
                 
                    if (fldElement.hic_qbmadeasy__Data_Mapping_Type__c != '' && fldElement.hic_qbmadeasy__Data_Mapping_Type__c == 'relatedDataMapping' && fldElement.hic_qbmadeasy__FieldsMappingData__c.length == 0) {
                        
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: this.label.QB_Blank_Related_Fields_Mapping,
                            variant: 'error',
                            autoclose: false,
                        });

                        return true;
                    }
                }
            }
        }
        return false;
    }

    saveAllSfToqbConfigData() {
        
        //console.log('in save all st to qb',JSON.stringify(this.SfToqbConfigDataList));
        let isError = false;
        let ValidateDataList = new Array();
        let objectNameNull = false;

        this.template.querySelectorAll('tr.validate-tablerow').forEach(function (eachRow) {
            eachRow.querySelector('.validation-error').setAttribute('style', 'display:none');
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if (eachColumn.classList && String(eachColumn.classList).indexOf('slds-has-error') > 0) {
                    eachColumn.classList.remove('slds-has-error');
                }
            });

            let colValue = '';
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if (colValue === '') {
                    colValue = eachColumn.value;
                } else {
                    colValue = colValue + '-' + eachColumn.value;
                }
            });
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if ((eachColumn.value == null || eachColumn.value == '' || eachColumn.value == undefined || eachColumn.value == '--None--')
                    && eachColumn.classList && String(eachColumn.classList).indexOf('slds-has-error') < 0) {
                    eachColumn.classList.add('slds-has-error');
                    objectNameNull = true;
                }
            });

            let ValidateDataListTemp = new Array();
            ValidateDataListTemp = ValidateDataList;
            if (ValidateDataList && ValidateDataList.length > 0) {
                ValidateDataList.forEach(function (element) {
                    
                    if (element === colValue) {
                        isError = true;
                        eachRow.querySelector('.validation-error').setAttribute('style', 'display:block');
                        eachRow.querySelector('.validation-error').setAttribute('title', 'Row has Duplicate value');
                        eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                            eachColumn.classList.add('slds-has-error');
                        });
                    } else {
                        if (!ValidateDataListTemp.includes(colValue)) {
                            ValidateDataListTemp = [...ValidateDataListTemp, colValue];
                        }
                    }
                });
            } else {
                ValidateDataListTemp = [...ValidateDataListTemp, colValue];

            }
            ValidateDataList = ValidateDataListTemp;
    
        });


       
        this.isBlankMappingFound = false;
       

        if(isError == false){
            isError = this.validateMappingOnObjectLevel();
        }


        if (isError == false) {
            isError = this.checkField();
        }
      
        if (isError == false) {
            isError = this.validateMappingOnFieldLevel();
        }
       

        if (isError == false) {
            isError = this.validateRelatedDataMapping();
        }
        
        if (this.isBlankMappingFound == true && isError == true) {
            this.showToastForBlankMapping();
        }

        if (objectNameNull) {
            this.inProgress = false;
        }
        
        if (isError === false) {
            this.isBlankMappingFound = false;
            this.inProgress = true;
         
            saveSftoqbConfigData({ SfqbWrapDataList: JSON.stringify(this.SfToqbConfigDataList), deleteId: this.deleteId }).then(result => {
                
                if (result.success) {
                    this.deleteId = [];
                    this.loadDefaultMapping();
                    
                    this.createRequiredField();
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Success',
                        message: 'Mappings Saved Successfully',
                        variant: 'success',
                        autoclose: false,
                    });

                    if (result.newData) {
                        
                        this.SfToqbConfigDataList.forEach(function (elem) {
                            result.newData.forEach(function (re) {
                                if (re.Name === elem.Name) {
                                    delete elem.newRow;
                                    elem.Id = re.Id;
                                    elem.expanded = true;
                                }
                            });

                        });
                        this.SfToQbConfigDataListBeforeDefault = SfToqbConfigDataList;
                        
                    }
                    if (result.hasOwnProperty('newDataMap') && result.newDataMap) {
                        let SfToqbConfigDataList = new Array();
                        this.SfToqbConfigDataList.forEach(element => {
                            if (element.Id == undefined || element.Id == null) {
                                if (result.newDataMap.hasOwnProperty(element.Name)) {
                                    ////console.log('hello element')
                                    element['Id'] = result.newDataMap[element.Name];
                                    element['expanded'] = true;
                                    delete element['newRow'];
                                }
                            }
                            SfToqbConfigDataList.push(element);
                        })
                        this.SfToqbConfigDataList = SfToqbConfigDataList;
                        this.SfToQbConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
                    }
                    this.inProgress = false;
                } else {
                    //////console.log('In_Else');
                    this.deleteId = [];
                    if (this.SfToqbConfigDataList.length == 0) {
                        this.SfToQbConfigDataListBeforeDefault = [];
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Success',
                            message: 'Mappings Saved Successfully',
                            variant: 'success',
                            autoclose: false,
                        });
                    }
                    this.inProgress = false;
                }
            });
        }

    }


    createRequiredField() {
        let sobjectApiNameForRelatedList = [];
        let sobjectApiNameList = [];
        for (var key in this.SfToqbConfigDataList) {
            if(this.SfToqbConfigDataList[key].fieldsJson){
                for(var inKey in this.SfToqbConfigDataList[key].fieldsJson){

                    
                    if(this.SfToqbConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping'){
                        
                        sobjectApiNameForRelatedList.push(this.SfToqbConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__SF_Field__c);
                    }

                }
            }
            sobjectApiNameList.push(this.SfToqbConfigDataList[key].hic_qbmadeasy__SF_Entity__c);
        }
      
        if (sobjectApiNameList.length > 0) {
            createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
                
            })
            .catch(error => {
                
            })
        }
        if (sobjectApiNameForRelatedList.length > 0) {
            createRequiredFieldRelated({ 'sObjectApiNameList': sobjectApiNameForRelatedList }).then(result => {
                ////console.log('result on creating field', result)
            })
                .catch(error => {
                    
                })
        }
    }
    cloneSfToqbFieldConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.fldconfigid;
        let configIdNew = this.getRandomString(18);
        let SfToqbConfigDataListTemp = new Array();
        if (this.SfToqbConfigDataList) {
            this.SfToqbConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = new Array();
                    if (element.fieldsJson) {
                        element.fieldsJson.forEach(function (fldelement) {
                            if (fldelement.Name === fldConfigId) {
                                let eachfldConfigRec = Object.assign({}, fldelement);
                                fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                eachfldConfigRec = { ...eachfldConfigRec, Name: configIdNew };
                                fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                            } else {
                                fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                            }
                        });
                    }
                    eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                } else {
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                }
            });
            this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
        }

    }
    deleteSfToqbFieldConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let SfToqbConfigDataListTemp = new Array();
        if (this.SfToqbConfigDataList) {
            this.SfToqbConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = new Array();
                    if (element.fieldsJson) {
                        element.fieldsJson.forEach(function (fldelement) {
                            if (fldelement.Name !== fldConfigId) {
                                fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                            }
                        });
                    }
                    eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                } else {
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                }
            });
            this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
            ////console.log('this.SfToqbConfigDataList 123 ',JSON.stringify(this.SfToqbConfigDataList));
        }

    }
    async cloneSfToqbObjectConfigRecord(event) {
       
    }
    deleteSfToqbObjectConfigRecord(event) {
        ////console.log('deleteSfToqbObjectConfigRecord Called');
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let SfToqbConfigDataListTemp = new Array();
        let vm = this;
        if (this.SfToqbConfigDataList) {
            this.SfToqbConfigDataList.forEach(function (element) {
                if (element.Name !== objConfigId) {
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                } else {
                    if (element.Id) {
                        vm.deleteId.push(element.Id);
                    }
                }
            });
            this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
        }
    }
    @track responseDataTemp = {}

    @track sftoqbResDataList = new Array();
    saveSuccessInfo(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        this.successDisplayPopUp = false;
    }

    setUpdatedValuetoObjConfigRecord(event) {
        //console.log('in setUpdatedValuetoObjConfigRecord');
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let dataVal;
        if (event.currentTarget.type === 'checkbox') {
            dataVal = event.detail.checked;
        } else {
            dataVal = event.detail.value;
        }

        let SfToqbConfigDataListTemp = new Array();
        if (this.SfToqbConfigDataList) {
            this.SfToqbConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    eachObjConfigRec = { ...eachObjConfigRec, [event.currentTarget.name]: dataVal };
                    if (element.Id) {
                        eachObjConfigRec = { ...eachObjConfigRec, expandedOnly: true };
                    }
                    if (event.currentTarget.name == 'hic_qbmadeasy__QB_Operation__c') {
                        if (dataVal == 'Insert') {
                            eachObjConfigRec = { ...eachObjConfigRec, qbReferenceFieldDisabled: true };
                            eachObjConfigRec = { ...eachObjConfigRec, hic_qbmadeasy__QB_Reference_Field__c: '--None--' };
                        } else {
                            eachObjConfigRec = { ...eachObjConfigRec, qbReferenceFieldDisabled: false };
                        }
                    }
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                } else {
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                }
            });
            this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
        }
        if (event.currentTarget.name.indexOf('hic_qbmadeasy__QB_Entity__c') !== -1) {
            const field = event.target.name;
            //console.log('in 1351');
            this.selectedObjectTypeOption = event.target.value;
            let index = event.currentTarget.dataset.index;
            fetchQBEntityFields({ 'contractType': this.selectedObjectTypeOption,'isSfToQb': true ,'companyId':this.realmid  })
                .then(result => {
                    //console.log('in 1356');
                    let qbTypeList = [];
                    let qtbTableList = [];
                    for (var key in result) {
                        if (result[key].type != 'Table') {
                            //console.log('in 1361');
                            let qbtypeFieldObj = {};
                            qbtypeFieldObj.label = result[key].label;
                            qbtypeFieldObj.value = result[key].value;
                            qbtypeFieldObj.type = result[key].type;
                            qbtypeFieldObj.required = result[key].required;
                            qbtypeFieldObj.dataType = result[key].dataType;
                            qbTypeList.push(qbtypeFieldObj);

                        }
                        else {
                            //console.log('in 1372');
                            let qbtypeTableFieldObj = {};
                            qbtypeTableFieldObj.label = result[key].label;
                            qbtypeTableFieldObj.value = result[key].value;
                            qbtypeTableFieldObj.type = result[key].type;
                            qbtypeTableFieldObj.required = result[key].required;
                            qbtypeTableFieldObj.dataType = result[key].dataType;
                            qtbTableList.push(qbtypeTableFieldObj);
                        }
                        this.SfToqbConfigDataList[index].qbtypeFieldsList = qbTypeList;
                        this.SfToqbConfigDataList[index].qbtypeTableList = qtbTableList;
                    }

                })
        }
        else if (event.currentTarget.name.indexOf('hic_qbmadeasy__SF_Entity__c') !== -1) {
            const field = event.target.name;
            this.selectedSObjectTypeOption = event.target.value;
            ////console.log(this.selectedSObjectTypeOption);
            if (dataVal) {
                this.inProgress = true;
                sObjFieldsList({ sobjectName: dataVal }).then(result => {
                    this.inProgress = false;
                    let sobjFldList = result;
                    let sobjFldMap = {};
                    sobjFldList = [...sobjFldList, { label: 'SF Currency Code', value: 'sf_currencycode', type: 'standard' }];
                    sobjFldList.forEach(function (eachfld) {
                        sobjFldMap = { ...sobjFldMap, [eachfld.value]: eachfld.label };
                    });

                    let SfToqbConfigDataListInnerTemp = new Array();
                    if (this.SfToqbConfigDataList) {
                        this.SfToqbConfigDataList.forEach(function (element) {
                            if (element.Name === objConfigId) {
                                let eachObjConfigRec = element;
                                let fieldsJsonListTemp = new Array();
                                if (element.fieldsJson) {
                                    element.fieldsJson.forEach(function (fldelement) {
                                        let eachfldConfigRec = fldelement;
                                        let fldLabel = sobjFldMap[fldelement.sf_fieldName] === undefined ? '' : sobjFldMap[fldelement.sf_fieldName];
                                        eachfldConfigRec = { ...eachfldConfigRec, sf_fieldLabel: fldLabel };
                                        fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];

                                    });
                                }
                                eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                                SfToqbConfigDataListInnerTemp = [...SfToqbConfigDataListInnerTemp, eachObjConfigRec];
                            } else {
                                SfToqbConfigDataListInnerTemp = [...SfToqbConfigDataListInnerTemp, element];
                            }
                        });
                        this.SfToqbConfigDataList = SfToqbConfigDataListInnerTemp;
                    }
                })
                    .catch(error => {
                        this.inProgress = false;
                        this.error = error;
                    });
                RelatedEntitiesList({ sobjectName: dataVal }).then(result => {
                    if (result) {
                        this.inProgress = false;
                        let childSobjList = result;
                        let SfToqbConfigDataListInnerTemp = new Array();
                        if (this.SfToqbConfigDataList) {
                            this.SfToqbConfigDataList.forEach(function (element) {
                                if (element.Name === objConfigId) {
                                    let eachObjConfigRec = element;
                                    eachObjConfigRec = { ...eachObjConfigRec, childSobjList: childSobjList };
                                    SfToqbConfigDataListInnerTemp = [...SfToqbConfigDataListInnerTemp, eachObjConfigRec];
                                } else {
                                    SfToqbConfigDataListInnerTemp = [...SfToqbConfigDataListInnerTemp, element];
                                }
                            });
                            this.SfToqbConfigDataList = SfToqbConfigDataListInnerTemp;
                        }
                    } else {
                        this.inProgress = false;
                    }
                });
            }

        }
        else if(event.currentTarget.name.indexOf('hic_qbmadeasy__Company_ID__c') !== -1){
            const name = event.target.name;
            const value = event.target.value;
            let index = event.currentTarget.dataset.index;
            
            this.SfToqbConfigDataList[index].hic_qbmadeasy__RealmId__c = value;
         
            
        }
    }

    setUpdatedValuetoFieldRecObj(event) {
        //console.log('in setUpdatedValuetoFieldRecObj bal4569 ');
        try{
            let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
            let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
            let dataVal;
    
        
    
            if (event.currentTarget.type === 'checkbox') {
                dataVal = event.detail.checked;
            } else {
                dataVal = event.detail.value;
            }
    
            
    
            let SfToqbConfigDataListTemp = new Array();
            if (this.SfToqbConfigDataList) {
                this.SfToqbConfigDataList.forEach(function (element) {
    
                    if (element.Name === objConfigId) {
                        
                        let eachObjConfigRec = element;
                        let fieldsJsonListTemp = new Array();
                        if (element.fieldsJson) {
    
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    let eachfldConfigRec = fldelement;
                                    
                                    if (event.detail.apiName) {
                                        
                                        eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SF_Field__c': event.detail.apiName };
                                        eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SFChildRelationshipName__c': dataVal };
                                    }else{
                                       
                                        /* comment By Saurabh */
                                        if(dataVal == true && typeof dataVal=="boolean"){
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__SF_Field_Label__c: '',hic_qbmadeasy__SF_Field__c: '',hic_qbmadeasy__Referenced_Mapping__c:''};
                                        }
                                        else if(dataVal == false){
                                           
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__SF_Field_Label__c: '' , hic_qbmadeasy__SF_Field__c: ''};
                                        }else{
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal};
                                        }
                                        
                                    }
                                    if (event.currentTarget.name === 'hic_qbmadeasy__SF_Field__c') {
                                        
                                        if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                            
                                            let childRelationName = '';
                                            element.childSobjList.forEach(function (childOption) {
                                                if (childOption.value === dataVal) {
                                                  
                                                    childRelationName = childOption.value;
                                                }
                                            });
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SFChildRelationshipName__c: childRelationName };
                                        }
                                    }
                                    if (event.currentTarget.name === 'hic_qbmadeasy__Quickbook_Field__c') {
                                        
                                        if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: 'table' };
                                        } else {
                                            
                                            let fieldInfo = event.target.options.find(opt => opt.value === event.detail.value);
                                            if (fieldInfo) {
                                                //console.log('in fieldInfo 23'+JSON.stringify(fieldInfo));
                                                //console.log('in fieldInfo isRequired'+ fieldInfo.required);
                                                //console.log('in fieldInfo isConditionallyRequired'+ fieldInfo.isConditionallyRequired);
                                                
                                                let isConditionallyRequired = false;
                                                if(fieldInfo.isConditionallyRequired ==='true'){
                                                    isConditionallyRequired = true;
                                                }

                                                let fieldLabel = fieldInfo.label;
                                                let qb_fieldTypeSplted = fieldLabel.split(':');
                        
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: qb_fieldTypeSplted[0].trim() };
                                                //eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Is_Required__c: fieldInfo.required };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Is_Conditionally_Required__c: isConditionallyRequired };
                                                //console.log('in fieldInfo data 213213'+ JSON.stringify(eachfldConfigRec));
                                     
                                            }
                                        }
    
                                    }
                                    if (event.currentTarget.name === 'hic_qbmadeasy__Data_Mapping_Type__c') {
                                        
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__FieldsMappingData__c: new Array() };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__RelatedDataValues__c: new Array() };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SFChildRelationshipName__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__isRelatedMap__c: false };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: false };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field2__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object2__c: '' };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: 0 };
    
                                        if (dataVal === 'relatedDataMapping') {
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__isRelatedMap__c: true };
                                        }
    
                                    }
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                                } else {
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                }
                            });
                        }
                        eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                        
                        SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                    } else {
                        SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                    }
                });
                this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                
            }
        }
        catch(ex){
            //console.log('in setupdatesftoqb',ex.message);
        }
       
    }

    setUpdatedRelMappings(event) {
        
        this.RelFieldsMappingList = event.detail;
    }

    saveRelDataMappings(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let RelatedFldMapList = this.RelFieldsMappingList;
        let SfToqbConfigDataListTemp = new Array();
        var isError = false;
        var arrayOfRequiredFields = [];

        this.SfToqbConfigDataList.forEach(function (element) {
            if (element.Name === objConfigId) {
                
                if(element.hic_qbmadeasy__QB_Entity__c === 'Estimate'){
                    arrayOfRequiredFields = [];
                }
                else if(element.hic_qbmadeasy__QB_Entity__c === 'Bill'){
                    arrayOfRequiredFields = [];
                }
            }
        });

        
        var arrayOfSelectedFields = [];
        var requiredFieldMissing = '';


        if (this.RelFieldsMappingList.length == 0) {
            isError = true;
            if (isError == true) {
                this.showToastForField(true);
            }
        }
        else if (this.RelFieldsMappingList.length > 0) {
            for (var element of this.RelFieldsMappingList) {
                
                if (element.cp_fieldLabel == '' || element.qb_fieldName == '') {
                    isError = true;
                    break;
                }
                else {
                    if (element.isConstant == true) {
                       
                        if (element.sf_fieldName == '' || element.sf_fieldLabel == '') {
                            isError = true;
                            
                        }
                    } else if (element.isConstant == false) {
                       
                        if (element.sf_fieldName == '' || element.sf_fieldLabel == '' || element.sf_field2Name == '' || element.sf_field2Label == '') {
                            
                            isError = true;
                        }
                        else if (element.referenceCount == 0 && (element.sf_fieldName == undefined || element.sf_fieldLabel == undefined)) {
                            
                            isError = true;
                        }
                        else if (element.referenceCount == 1 && (element.sf_field2Name == undefined || element.sf_field2Label == undefined)) {
                           
                            isError = true;
                        }
                    }
                }
                if (isError == true) {
                    break;
                }
            }
            if (isError == true) {
                this.showToastForField(true);
            }
            else if (isError == false) {
             
                for (var element of this.RelFieldsMappingList) {
                    if (element.cp_fieldLabel != undefined && element.cp_fieldLabel != '') {
                        arrayOfSelectedFields.push(element.cp_fieldLabel);
                    }
                }
                
                for (let i = 0; i < arrayOfRequiredFields.length; i++) {
                    if (!arrayOfSelectedFields.includes(arrayOfRequiredFields[i])) {
                        
                        requiredFieldMissing = arrayOfRequiredFields[i];
                        isError = true;
                        break;
                    }
                }
            
                if (isError == true) {
                    var message = requiredFieldMissing + ' is missing for Line.'
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: message,
                        variant: 'error',
                        autoclose: false,
                    });
                    this.template.querySelector('c-qb_-sf-to-qb-rel-fields-mapping-comp').hightlightBlankFields({});
                }
                else if (isError == false) {
                    let duplicateElement = '';
                    duplicateElement = this.findDuplicate(arrayOfSelectedFields);
                    if (duplicateElement != '') {
                        isError = true;
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: this.label.QB_Duplicate_Mapping_For_Related_Modal + ' ' + duplicateElement + '.',
                            variant: 'error',
                            autoclose: false,
                        });
                        this.template.querySelector('c-qb_-sf-to-qb-rel-fields-mapping-comp').hightlightBlankFields({});
                    }
                }
            }
        }



        
        if (isError == false) {
            if (this.SfToqbConfigDataList) {
                this.SfToqbConfigDataList.forEach(function (element) {
                    if (element.Name === objConfigId) {
                        let eachObjConfigRec = element;
                        let fieldsJsonListTemp = new Array();
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    let eachfldConfigRec = fldelement;
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        let relatedDataValuesList = new Array();
                                        if (RelatedFldMapList) {
                                            RelatedFldMapList.forEach(function (eachItem) {
                                                if (eachItem.isReferenceMapping) {
                                                    var sfFieldLabel = eachItem.sfrelationName;
                                                    var sfFieldName = eachItem.sfrelationName;
                                                    let i = 1;
                                                    for (i; i <= eachItem.referenceCount; i++) {
                                                        if (i > 1) {
                                                            sfFieldLabel += eachItem['sfrelation' + i + 'Name'] + '.';
                                                            sfFieldName += eachItem['sfrelation' + i + 'Name'] + '.';
                                                        } else if (i == 1) {
                                                            sfFieldLabel = eachItem.sfrelationName + '.';
                                                            sfFieldName = eachItem.sfrelationName + '.';
                                                        }
                                                    }
                                                    sfFieldLabel += eachItem['sf_field' + i + 'Label'];
                                                    sfFieldName += eachItem['sf_field' + i + 'Name'];
                                                    relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + sfFieldLabel, name: eachItem.qb_fieldName + '-' + sfFieldName }];
                                                }
                                                else {
                                                    relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + eachItem.sf_fieldLabel, name: eachItem.qb_fieldName + '-' + eachItem.sf_fieldName }];
                                                }
                                            });
                                        }
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__FieldsMappingData__c: RelatedFldMapList };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__RelatedDataValues__c: relatedDataValuesList };
                                    }
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                                } else {
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                }
                            });
                        }
                        eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                        SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                    } else {
                        SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                    }
                });
                this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
            }
            this.reldatadisplayPopup = false;
        }
    }



    removeRelMappingsFromContainerList(event) {
        let delItemName = event.detail.item.name;
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let SfToqbConfigDataListTemp = new Array();
        
        try{
            if(this.SfToqbConfigDataList) {
                for(let i = 0; i < this.SfToqbConfigDataList.length; i++){
                    
                    let element = this.SfToqbConfigDataList[i] ;
                    if(element.Name === objConfigId) {
                       
                        if(element.fieldsJson){
                         
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    
                                    let delItemNameSplitArray = delItemName.split('-');
                                    fldelement.hic_qbmadeasy__FieldsMappingData__c.forEach(function (item,index){
                                        
    
                                        if(item.isReferenceMapping == true){
                                            
                                                if(delItemNameSplitArray[0] == item.qb_fieldName && delItemNameSplitArray[1] == item.sfrelationName+'.'+item.sf_field2Name){
                                                    
                                                    fldelement.hic_qbmadeasy__FieldsMappingData__c.splice(index,1);
                                                }                     
                                        }                                     
                                            if(delItemNameSplitArray[0] == item.qb_fieldName && delItemNameSplitArray[1] == item.sf_fieldName){
                                            
                                                fldelement.hic_qbmadeasy__FieldsMappingData__c.splice(index,1);
                                            }        
                                    });
    
                                    fldelement.hic_qbmadeasy__RelatedDataValues__c.forEach(function (item,index){
             
                                        let val = item.name.split('-');
                                        if(delItemName == item.name){
                                            
                                            
                                                fldelement.hic_qbmadeasy__RelatedDataValues__c.splice(index,1);           
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            }
        }catch(ex){
            
        }
        
       

    }

    openRelfldMappingPopup(event) {
        
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        this.relObjConfigId = objConfigId;
        this.relFldConfigId = fldConfigId;
        this.sfChildObjName = event.currentTarget.dataset.sffieldname;
        let cpChildObjName = event.currentTarget.dataset.cpfieldname;
        let childFieldsListTemp = new Array();
        if (this.SfToqbConfigDataList) {
            try {
                let RelFieldsMappingListTemp = new Array();
                this.SfToqbConfigDataList.forEach(function (element) {
                    if (element.Name === objConfigId) {
                        if (element.qbtypeTableList) {
                            element.qbtypeTableList.forEach(function (tableElement) {
                                if (tableElement.value === cpChildObjName) {
                                    let cpChildFields = new Array();
                                    cpChildFields = JSON.parse(tableElement.tableColumns);
                                    if (cpChildFields) {
                                        cpChildFields.forEach(function (chldElement) {
                                            childFieldsListTemp = [...childFieldsListTemp, { label: chldElement.optionName, value: chldElement.value }];//changed value from OptionName
                                        });
                                    }
                                }
                            });
                        }
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {

                                        RelFieldsMappingListTemp = fldelement.hic_qbmadeasy__FieldsMappingData__c;
                                    }
                                }
                            });
                        }
                    }
                });
                this.cpChildObjFields = childFieldsListTemp;
                this.RelFieldsMappingList = RelFieldsMappingListTemp;
            } catch (error) {
                this.error = error;
                
            }
        }
        this.reldatadisplayPopup = true;
    }

    validateBlankFieldsOnModal(){
        
      
    }

    saveSfFieldNameValue(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let SfToqbConfigDataListTemp = new Array();
        let allValid = true;
        let sfFieldsSelObjTemp = this.sfFieldsSelObj;
        ////console.log('line 1562==>',JSON.stringify(this.SfToqbConfigDataList));
        if (this.SfToqbConfigDataList) {
            try {
                this.SfToqbConfigDataList.forEach(element => {
                    
                    if (element.Name === objConfigId) {
                        let eachObjConfigRec = element;
                        let fieldsJsonListTemp = new Array();
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(fldelement => {
                                if (fldelement.Name === fldConfigId) {
                                    let eachfldConfigRec = fldelement;
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'fieldMapping') {
                                        
                                        if (sfFieldsSelObjTemp.isReferenceMapping) {
                                            this.template.querySelectorAll('[data-objconfigidcustom="' +objConfigId+ '"]').forEach(compName=>{
                                                let isValid = compName.checkValidity();
                                               
                                                allValid = allValid && isValid;
                                                                                                                               
                                            });
                                            
                                            
                                                
                                            ////console.log('line 1620');
                                            var sfFieldLabelString = '';
                                            var sfFieldNameString = '';
                                            let p = 2;
                                            ////console.log('TestCheck >>' , sfFieldsSelObjTemp['sfrelation' + p + 'Name']);
                                            ////console.log('sfFieldsSelObjTemp.referenceCount',sfFieldsSelObjTemp.referenceCount);
                                            for (let i = 1; i <= sfFieldsSelObjTemp.referenceCount; i++) {
                                                ////console.log('line 15822');
                                                if (i > 1) {
                                                    ////console.log('line 1580');
                                                    sfFieldLabelString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                    sfFieldNameString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                }else {
                                                    ////console.log('line 1585');
                                                    sfFieldLabelString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                    sfFieldNameString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                }
                                            }

                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: true };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: sfFieldsSelObjTemp.referenceCount };
                                            
                                            if(allValid){
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldLabelString + (sfFieldsSelObjTemp.referenceCount > 1 ? this['RefrenceField' + sfFieldsSelObjTemp.referenceCount + 'List'].find(fld => fld.value === sfFieldsSelObjTemp['sfparentField' + sfFieldsSelObjTemp.referenceCount + 'Name']).label : this.RefrenceFieldList.find(fld => fld.value === sfFieldsSelObjTemp.sfparentFieldName).label) };
                                            
                                            }
                                            
                                            
                                            
                                            ////console.log('line 1585');
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldNameString + sfFieldsSelObjTemp['sfparentField' + (sfFieldsSelObjTemp.referenceCount && sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.referenceCount : '') + 'Name'] };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: sfFieldsSelObjTemp.sfreferenceObj };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: sfFieldsSelObjTemp.sffieldName };

                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object2__c: sfFieldsSelObjTemp.sfreferenceObj2 };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field2__c: (sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.sffield2Name : '') };

                                        } else {
                                            
                                            objConfigId
                                            let componentName = this.template.querySelector('[data-objconfigidcustom="' +objConfigId+ '"]')
                                            let isValid = componentName.checkValidity();
                                          
                                            allValid = allValid && isValid;
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: false };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: 0 };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sffieldlabel };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldsSelObjTemp.sffieldName };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: '' };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: '' };
                                        }

                                    }
                                   
                                    
                                        fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                                    
                                } else {
                                    
                                    
                                        fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                    
                                    
                                }
                            });
                        }
                        
                        
                            eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                            SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                        
                        
                    } else {
                        
                        
                        SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                        
                        
                    }
                });
                
                
                
                this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                if(allValid){
                    this.closeInsertFieldPopup();
                }
                
            } catch (error) {
                this.error = error;
                
            }
        }
    }

    handleSuccessForResponse(event) {
        let name = event.target.name;
        let value = event.detail.value;
       
        let sfFieldsSelObjtemp = { ... this.sffieldforResponseFinal };

        if (name === 'qbId') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, qbId: value };
        } else if (name === 'errorcode') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcode: value };
        } else {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcodemsg: value };
        }

        this.sffieldforResponseFinal = { ...this.sffieldforResponseFinal, ...sfFieldsSelObjtemp };
       
    }

    @track sffieldforResponseFinal = {};
    handleSaveForSuccess(event) {
        try {
            let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
            let tempList = JSON.parse(JSON.stringify(this.SfToqbConfigDataList))
            tempList.forEach(element => {
                if (element.Name == objConfigId) {
                    element.sffieldforResponseFinal = this.sffieldforResponseFinal;
                }
            });
            
            this.SfToqbConfigDataList = tempList;
            this.successDisplayPopUp = false;
            this.sffieldforResponseFinal = {};
        } catch (e) {
            ////console.log(e)
        }
    }

    setUpdatedValuetoSfFieldRec(event) {
        

        try{
            let fieldName = event.detail.value;
            let fieldLabel = event.target.options.find(opt => opt.value === event.detail.value).label;

            if(fieldLabel) {
                if (event.currentTarget.dataset.type === 'primary') {
                    let referenceObj = '';
                    let relationShip = '';
                    let isRefField = false;
                    let sfFieldsSelObjtemp = {};
                    if (this.sobjectFieldList) {
                        this.sobjectFieldList.forEach(element => {
                            if (element.value === fieldName) {
                                if (element.type === 'REFERENCE') {
                                    isRefField = true;
                                    referenceObj = element.referenceObj;
                                    relationShip = element.relationShip;
                                    sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: true, referenceCount: this.referenceCount, sffieldName: fieldName, sffieldlabel: fieldLabel, sfrelationName: relationShip, sfreferenceObj: referenceObj, sfparentFieldName: '' };
                                } else {
                                    sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: false, referenceCount: 0, sffieldName: fieldName, sffieldlabel: fieldLabel, sfrelationName: '', sfreferenceObj: '', sfparentFieldName: '' };
                                }
                            }
                        });
                        this.sfFieldsSelObj = sfFieldsSelObjtemp;
                    }
                    if (isRefField) {
                        this.isReferenceField = true;
                        this.inProgress = true;
                        sObjFieldsList({ sobjectName: referenceObj }).then(result => {
                            this.inProgress = false;
                            this.RefrenceFieldList = result;
                        });
                    }
                }
                else if (event.currentTarget.dataset.type === 'secondary') {
                    let referenceObj2 = '';
                    let relationShip2 = '';
                    let isRefField2 = false;
                    let sfFieldsSelObjtemp = this.sfFieldsSelObj ? this.sfFieldsSelObj : {};
                    this.referenceCount = (sfFieldsSelObjtemp.referenceCount ? sfFieldsSelObjtemp.referenceCount : this.referenceCount);
                    if (this.RefrenceFieldList) {
                        this.RefrenceFieldList.forEach(element => {
                            if (element.value === fieldName) {
                                if (element.type === 'REFERENCE') {
                                    let oldFieldValue = sfFieldsSelObjtemp.sffield2Name;
                                    let newFieldValue = fieldName;
                                    if (oldFieldValue != newFieldValue) {
                                        this.referenceCount++;
                                    }
                                    isRefField2 = true;
                                    referenceObj2 = element.referenceObj;
                                    relationShip2 = element.relationShip;
                                    sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: relationShip2, sfreferenceObj2: referenceObj2, sfparentFieldName: fieldName, sfparentField2Name: '' };
                                } else {
                                    this.referenceCount = 1;
                                    sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: '', sfreferenceObj2: '', sfparentFieldName: fieldName, sfparentField2Name: '' };
                                }
                            }
                        });
                        this.sfFieldsSelObj = sfFieldsSelObjtemp;
                    }
                    if (isRefField2) {
                        this.inProgress = true;
                        sObjFieldsList({ sobjectName: referenceObj2 }).then(result => {
                            this.inProgress = false;
                            this.RefrenceField2List = result;
                        });
                    }
                }
                else {
                    this.referenceCount = (this.sfFieldsSelObj.referenceCount ? this.sfFieldsSelObj.referenceCount : this.referenceCount);
                    this.sfFieldsSelObj = { ...this.sfFieldsSelObj, ['sfparentField' + (this.referenceCount && this.referenceCount > 1 ? this.referenceCount : '') + 'Name']: fieldName };
                    this.sfFieldsSelObj = { ...this.sfFieldsSelObj, referenceCount: this.referenceCount };
                    this.referenceCount = 1;
                }
            }
        }catch(ex){
            
        }

        
    }

    async openSfFieldSelectionPopup(event) {
        
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        this.relObjConfigId = objConfigId;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        this.relFldConfigId = fldConfigId;
        this.sfFieldsSelObj = {};
        let sobjectName = event.currentTarget.dataset.sobjectname;
        let parentSobjName = event.currentTarget.dataset.parentobjectname;
        let parentSobj2Name = event.currentTarget.dataset.parentobject2name;

        if (sobjectName) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: sobjectName }).then(result => {
                this.inProgress = false;
                this.sobjectFieldList = result;

                this.isReferenceField = true;

            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                });
        }

        if (parentSobjName) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: parentSobjName }).then(result => {
                this.inProgress = false;
                this.RefrenceFieldList = result;
            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                });
        }

        if (parentSobj2Name) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: parentSobj2Name }).then(result => {
                this.inProgress = false;
                this.RefrenceField2List = result;
            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                });
        }

        let sfFieldsSelObjTemp = {};
        if (this.SfToqbConfigDataList) {
            try {
                this.SfToqbConfigDataList.forEach(element => {
                    if (element.Name === objConfigId) {
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(fldelement => {
                                if (fldelement.Name === fldConfigId) {
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'fieldMapping') {
                                        if (fldelement.hic_qbmadeasy__Referenced_Mapping__c) {
                                            let reffieldNameList = fldelement.hic_qbmadeasy__SF_Field__c.split('.');
                                            let reffieldLabelList = fldelement.hic_qbmadeasy__SF_Field_Label__c.split('.');
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, isReferenceMapping: fldelement.hic_qbmadeasy__Referenced_Mapping__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, referenceCount: fldelement.hic_qbmadeasy__Reference_Count__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldName: fldelement.hic_qbmadeasy__SF_Parent_Field__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldlabel: this.sobjectFieldList.find(fld => fld.value === fldelement.hic_qbmadeasy__SF_Parent_Field__c).label };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfreferenceObj: fldelement.hic_qbmadeasy__SF_Parent_Object__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfrelationName: reffieldNameList[0] };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffield2Name: fldelement.hic_qbmadeasy__SF_Parent_Field2__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffield2label: (fldelement.hic_qbmadeasy__SF_Parent_Field2__c && fldelement.hic_qbmadeasy__SF_Parent_Field2__c != "" ? this.RefrenceFieldList.find(fld => fld.value === fldelement.hic_qbmadeasy__SF_Parent_Field2__c).label : '') };
                                            if (fldelement.hic_qbmadeasy__Reference_Count__c === 1) {
                                                sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfparentFieldName: reffieldNameList[1] };
                                            }
                                            else if (fldelement.hic_qbmadeasy__Reference_Count__c === 2) {
                                                sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfreferenceObj2: fldelement.hic_qbmadeasy__SF_Parent_Object2__c };
                                                sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfrelation2Name: reffieldNameList[1] };
                                                sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfparentFieldName: fldelement.hic_qbmadeasy__SF_Parent_Field2__c };
                                                sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfparentField2Name: reffieldNameList[2] };
                                            }
                                        } else {
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, isReferenceMapping: fldelement.hic_qbmadeasy__Referenced_Mapping__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldName: fldelement.hic_qbmadeasy__SF_Field__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldlabel: fldelement.hic_qbmadeasy__SF_Field_Label__c };
                                        }
                                    }

                                }
                            });
                        }
                    }
                });
                this.sfFieldsSelObj = sfFieldsSelObjTemp;
            } catch (error) {
                this.error = error;
            }
        }
        this.displayPopup = true;
    }
    closeInsertFieldPopup() {
        this.displayPopup = false;
        this.reldatadisplayPopup = false;
    }
    addSFToqbFieldMappingRow(event) {
        let objConfigId = event.currentTarget.parentElement.dataset.objconfigid;
        let fldConfigId = this.getRandomString(18);
        let SfToqbConfigDataListTemp = new Array();
        if (this.SfToqbConfigDataList) {
            this.SfToqbConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = element.fieldsJson;
                    if (!fieldsJsonListTemp) {
                        fieldsJsonListTemp = [];
                    }
                    fieldsJsonListTemp = [...fieldsJsonListTemp, { Name: fldConfigId, hic_qbmadeasy__Data_Mapping_Type__c: 'fieldMapping', hic_qbmadeasy__Constant__c: false, hic_qbmadeasy__isRelatedMap__c: false, hic_qbmadeasy__Referenced_Mapping__c: false, hic_qbmadeasy__SF_Field__c: '', hic_qbmadeasy__SFChildRelationshipName__c: '', hic_qbmadeasy__Quickbook_Field__c: '', hic_qbmadeasy__Quickbook_Field_Type__c: '' , hic_qbmadeasy__Is_Required__c: false,hic_qbmadeasy__Is_Conditionally_Required__c: false,}];
                    eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, eachObjConfigRec];
                } else {
                    SfToqbConfigDataListTemp = [...SfToqbConfigDataListTemp, element];
                }
            });
            this.SfToqbConfigDataList = SfToqbConfigDataListTemp;
        }
    }
    addSFToqbConfigRow() {
        this.SfToqbConfigDataList = [...this.SfToqbConfigDataList, { Name: this.getRandomString(18), hic_qbmadeasy__SF_Entity__c: '', hic_qbmadeasy__QB_Entity__c: '', hic_qbmadeasy__FieldsMappingData__c: '', hic_qbmadeasy__DataMappingDirection__c: 'SF to qb',hic_qbmadeasy__RealmId__c:this.realmid, fieldsJson: new Array(), qbtypeFieldsList: new Array(), childSobjList: new Array(), newRow: true }];
        this.isSfqbConfigNotEmpty = this.SfToqbConfigDataList.length > 0;
    }

    expandCollapseFunction(event) {
        try {
            
            let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.dataset.objconfigid;
            let SwitchAction = event.currentTarget.dataset.switchto;
            //console.log('SwitchAction>>>',SwitchAction);
            let configId = event.currentTarget.dataset.configid;
            let index = event.currentTarget.dataset.index;
            if(SwitchAction =='expand' && (this.SfToqbConfigDataList[index].hic_qbmadeasy__SF_Entity__c =='' || this.SfToqbConfigDataList[index].hic_qbmadeasy__QB_Entity__c == '' )){
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Error',
                    message: 'Please Select Both Salesforce and Quickbooks Object',
                    variant: 'error',
                    autoclose: false,
                });
                return;
            }
            let SfToqbConfigDataListTemp = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
            let vm = this;
            //console.log('configId is this>>>',configId);
            //console.log('SfToqbConfigDataListTemp[index].fieldsJson asdfsdfs',JSON.stringify(SfToqbConfigDataListTemp[index].fieldsJson));
            if(SfToqbConfigDataListTemp[index].fieldsJson != undefined && SfToqbConfigDataListTemp[index].fieldsJson.length == 0){
                //console.log('SfToqbConfigDataListTemp[index].fieldsJson is undefined');
            }   
            if (configId && configId != null && SfToqbConfigDataListTemp[index].fieldsJson == undefined) {
                //console.log('in line 2305');
                SfToqbConfigDataListTemp[index].showSpinner = true;
                vm.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                SfToqbConfigDataListTemp = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
                vm.showSpinner = true;

                fetchSfToqbConfigDataById({ 'Id': configId,'companyId':this.realmid }).then(function (result) {
                    ////console.log('fetch by id');
                    //console.log('in line 2313');
                    SfToqbConfigDataListTemp[index].qbtypeFieldsList = result.qbtypeFieldsList;
                    SfToqbConfigDataListTemp[index].qbtypeTableList = result.qbtypeTableList;
                    SfToqbConfigDataListTemp[index].childSobjList = result.childSobjList;
                    let fieldsJson = [];
                    if (result.fieldsJson != null) {


                        result.fieldsJson.forEach(elementT => {

                            if (elementT.hic_qbmadeasy__RelatedDataValues__c != null) {

                                let tempElement = { ...elementT, 'hic_qbmadeasy__RelatedDataValues__c': JSON.parse(elementT.hic_qbmadeasy__RelatedDataValues__c) };
                                tempElement = { ...tempElement, 'hic_qbmadeasy__FieldsMappingData__c': JSON.parse(elementT.hic_qbmadeasy__FieldsMappingData__c) };
                                fieldsJson.push(tempElement);
                            } else {
                                fieldsJson.push(elementT)
                            }
                        });
                    }
                    SfToqbConfigDataListTemp[index].fieldsJson = fieldsJson;
                    SfToqbConfigDataListTemp[index].showSpinner = false;
                    ////console.log(SfToqbConfigDataListTemp)
                    SfToqbConfigDataListTemp[index].expanded = true;
                    SfToqbConfigDataListTemp[index].showSpinner = false;
                    vm.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                    let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                    let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                    let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                    let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                    let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                    let ExpandOrCollapseIcon = entitySelectRow.querySelector (` .add-collapse-icon`);
                ExpandOrCollapseIcon.iconName = ExpandOrCollapseIcon.iconName == 'utility:add' ? 'utility:dash' : 'utility:add';
                ////console.log('ExpandOrCollapseIcon.iconName',ExpandOrCollapseIcon.iconName);
                    if (vm.SfToqbConfigDataList) {
                        vm.SfToqbConfigDataList.forEach(function (element) {
                            if (element.Name === objConfigId) {
                                ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                                ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                                entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                            }
                        });
                    }
                });

            } else if(SfToqbConfigDataListTemp[index].fieldsJson != undefined && SfToqbConfigDataListTemp[index].fieldsJson.length == 0){
                //console.log('in line 2360');
                let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                let ExpandOrCollapseIcon = entitySelectRow.querySelector (` .add-collapse-icon`);
                ExpandOrCollapseIcon.iconName = ExpandOrCollapseIcon.iconName == 'utility:add' ? 'utility:dash' : 'utility:add';
                
                if (vm.SfToqbConfigDataList) {
                    //console.log('in line 2371');
                    vm.SfToqbConfigDataList.forEach(function (element) {
                        if (element.Name === objConfigId) {
                            //console.log('in line 2374');
                            ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                            ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                            entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                        }
                    });
                }
                SfToqbConfigDataListTemp[index].objectFieldDisabled = true;
                SfToqbConfigDataListTemp[index].showSpinner = true;
                vm.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                SfToqbConfigDataListTemp = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
                vm.showSpinner = true;
                fetchQBEntityFields({ 'contractType': SfToqbConfigDataListTemp[index].hic_qbmadeasy__QB_Entity__c,'isSfToQb': true ,'companyId':this.realmid }).then(function (result) {
                    //console.log('in line 2387 again');
                    let qbTypeList = [];
                    let qtbTableList = [];
                    let requiredFieldsJson = [];
                    let fieldsJsonConditionallyRequired = [];
                    for (var key in result) {
                        let tempElementRequired = {};
                        let tempElementCondRequired = {};
                        //console.log('in result',JSON.stringify(result));
                        if (result[key].type != 'Table') {
                            
                            let qbtypeFieldObj = {};
                            qbtypeFieldObj.label = result[key].label;
                            qbtypeFieldObj.value = result[key].value;
                            qbtypeFieldObj.type = result[key].type;
                            qbtypeFieldObj.required = result[key].required;
                            qbtypeFieldObj.dataType = result[key].dataType;
                            qbtypeFieldObj.isConditionallyRequired=result[key].isConditionallyRequired;
                            qbTypeList.push(qbtypeFieldObj);

                            if(result[key].required == 'true'){
                                //console.log('in 2398');
                                tempElementRequired =  { Name: vm.getRandomString(18),
                                    "hic_qbmadeasy__Is_Required__c": true,
                                    "hic_qbmadeasy__Is_Conditionally_Required__c": false,
                                    "hic_qbmadeasy__Data_Mapping_Type__c": "fieldMapping",
                                    "hic_qbmadeasy__Constant__c": false,
                                    "hic_qbmadeasy__isRelatedMap__c": false,
                                    "hic_qbmadeasy__Referenced_Mapping__c": false,
                                    "hic_qbmadeasy__SF_Field__c": "",
                                    "hic_qbmadeasy__SFChildRelationshipName__c": "",
                                    "hic_qbmadeasy__Quickbook_Field__c": result[key].value,
                                    "hic_qbmadeasy__Quickbook_Field_Type__c": result[key].type
                                    //"hic_qbmadeasy__Is_Required__c":"REQUIRED"
                                };
                                requiredFieldsJson.push(tempElementRequired);
                                
                            }
                            //console.log('is conditionally ',result[key]);
                            //console.log('is conditionally label',result[key].label);
                            ////console.log('is conditionally requere',result[key].isConditionallyRequired);
                            if(result[key].isConditionallyRequired == 'true'){
                                //console.log('in 2414');
                                tempElementCondRequired =  { Name: vm.getRandomString(18),
                                    "hic_qbmadeasy__Is_Required__c": false,
                                    "hic_qbmadeasy__Is_Conditionally_Required__c": true,
                                    "hic_qbmadeasy__Data_Mapping_Type__c": "fieldMapping",
                                    "hic_qbmadeasy__Constant__c": false,
                                    "hic_qbmadeasy__isRelatedMap__c": false,
                                    "hic_qbmadeasy__Referenced_Mapping__c": false,
                                    "hic_qbmadeasy__SF_Field__c": "",
                                    "hic_qbmadeasy__SFChildRelationshipName__c": "",
                                    "hic_qbmadeasy__Quickbook_Field__c": result[key].value,
                                    "hic_qbmadeasy__Quickbook_Field_Type__c": result[key].type,
                                    //"hic_qbmadeasy__Is_Required__c":"CONDITIONAL"
                                };
                                fieldsJsonConditionallyRequired.push(tempElementCondRequired);
                                
                            }
                            //process required
                            

                            

                        }
                        else {
                            let qbtypeTableFieldObj = {};
                            qbtypeTableFieldObj.label = result[key].label;
                            qbtypeTableFieldObj.value = result[key].value;
                            qbtypeTableFieldObj.type = result[key].type;
                            qbtypeTableFieldObj.required = result[key].required;
                            qbtypeTableFieldObj.dataType = result[key].dataType;
                            qbtypeTableFieldObj.tableColumns = result[key].tableColumns;
                            qtbTableList.push(qbtypeTableFieldObj);
                        }
                        vm.SfToqbConfigDataList[index].qbtypeFieldsList = qbTypeList;
                        vm.SfToqbConfigDataList[index].qbtypeTableList = qtbTableList;
                        let fieldJson = [...requiredFieldsJson, ...fieldsJsonConditionallyRequired];
                        vm.SfToqbConfigDataList[index].fieldsJson = fieldJson;
                        
                    }
                });
                vm.SfToqbConfigDataList[index].expanded = true;
                vm.SfToqbConfigDataList[index].showSpinner = false;
            }else {
                //console.log('in expand collpase 2441');
                let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                let ExpandOrCollapseIcon = entitySelectRow.querySelector (` .add-collapse-icon`);
                ExpandOrCollapseIcon.iconName = ExpandOrCollapseIcon.iconName == 'utility:add' ? 'utility:dash' : 'utility:add';
                
                if (vm.SfToqbConfigDataList) {
                    //console.log('in expand collpase 2375');
                    vm.SfToqbConfigDataList.forEach(function (element) {
                        if (element.Name === objConfigId) {
                            //console.log('in expand collpase 2378');
                            ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                            ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                            entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                        }
                    });
                }
                SfToqbConfigDataListTemp[index].objectFieldDisabled = true;
                SfToqbConfigDataListTemp[index].showSpinner = true;
                vm.SfToqbConfigDataList = SfToqbConfigDataListTemp;
                SfToqbConfigDataListTemp = JSON.parse(JSON.stringify(this.SfToqbConfigDataList));
                vm.showSpinner = true;
                fetchQBEntityFields({ 'contractType': SfToqbConfigDataListTemp[index].hic_qbmadeasy__QB_Entity__c,'isSfToQb': true,'companyId':this.realmid  }).then(function (result) {
                    //console.log('in expand collpase 2391');
                    let qbTypeList = [];
                    let qtbTableList = [];
                    for (var key in result) {
                        if (result[key].type != 'Table') {
                            //console.log('in expand collpase 2396');
                            let qbtypeFieldObj = {};
                            qbtypeFieldObj.label = result[key].label;
                            qbtypeFieldObj.value = result[key].value;
                            qbtypeFieldObj.type = result[key].type;
                            qbtypeFieldObj.required = result[key].required;
                            qbtypeFieldObj.dataType = result[key].dataType;
                            qbtypeFieldObj.isConditionallyRequired=result[key].isConditionallyRequired;
                            
                            qbTypeList.push(qbtypeFieldObj);

                        }
                        else {
                            //console.log('in expand collpase 2407');
                            let qbtypeTableFieldObj = {};
                            qbtypeTableFieldObj.label = result[key].label;
                            qbtypeTableFieldObj.value = result[key].value;
                            qbtypeTableFieldObj.type = result[key].type;
                            qbtypeTableFieldObj.required = result[key].required;
                            qbtypeTableFieldObj.dataType = result[key].dataType;
                            qbtypeTableFieldObj.tableColumns = result[key].tableColumns;
                            qtbTableList.push(qbtypeTableFieldObj);
                        }
                        vm.SfToqbConfigDataList[index].qbtypeFieldsList = qbTypeList;
                        vm.SfToqbConfigDataList[index].qbtypeTableList = qtbTableList;
                    }
                });
                vm.SfToqbConfigDataList[index].expanded = true;
                vm.SfToqbConfigDataList[index].showSpinner = false;
            }
        } catch (e) {
           //console.log('in expand collapse error',e);
        }

    }
    getRandomString(len) {
        let RandomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        let randStr = '';
        while (randStr.length < len) {
            randStr += RandomChars[Math.floor(Math.random() * RandomChars.length)];
        }
        return randStr;
    }

    /**************************Vf page icon Css****** */
    get vfpageErrorIconCss() {
        return (this.origin == 'VisualforcePage' ? 'iconCss' : '');
    }

    get isSFReferenceObjNotNull() {
        return (this.sfFieldsSelObj && this.sfFieldsSelObj.sfreferenceObj && this.sfFieldsSelObj.sfreferenceObj != '' ? true : false);
    }

    get isSFReferenceObj2NotNull() {
        return (this.sfFieldsSelObj && this.sfFieldsSelObj.sfreferenceObj2 && this.sfFieldsSelObj.sfreferenceObj2 != '' ? true : false);
    }
}