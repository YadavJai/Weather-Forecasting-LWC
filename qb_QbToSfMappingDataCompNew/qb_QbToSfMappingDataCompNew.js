import { LightningElement, track, wire, api } from 'lwc';
import getNameSpace from "@salesforce/apex/Qb_ConfigController.getNameSpace";
import fetchSfToqbConfigData from "@salesforce/apex/Qb_ConfigController.getExistingQbTosfConfigData";
import fetchSfToqbConfigDataById from '@salesforce/apex/Qb_ConfigController.getExistingQBTosfConfigDataById'
import sObjSelectionList from "@salesforce/apex/Qb_ConfigController.getSObjectSelectList";
import companySelectionList from "@salesforce/apex/Qb_ConfigController.getCompanyList";
import createRequiredField from "@salesforce/apex/QB_MetadataUtilityController.createRequiredField";
import getResponse from "@salesforce/apex/QB_CreateUpdateSObject.createQBRecord";
//Added this check by PK on 15th Apr for admin list on this page
//import getContractTypeSelectListForAdmin from "@salesforce/apex/qb_ConfigController.getContractTypeSelectListForAdmin";
import QbObjectTypeList from "@salesforce/apex/Qb_ConfigController.getqbObjectTypeSelection";
//import ApplicableToSelectionList from "@salesforce/apex/qb_ConfigController.getApplicableToSelectList";
import fetchQBEntityFields from "@salesforce/apex/Qb_ConfigController.fetchQBEntityFields";
import sObjFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllFields";
import sObjExternalIdFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllExternalIdFields";
import RelatedEntitiesList from "@salesforce/apex/Qb_ConfigController.fetchAllRelatedEntitiesForqbToSF";
import saveSftoqbConfigData from "@salesforce/apex/Qb_ConfigController.saveQBTosfMapConfigData";
import createRequiredFieldRelated from "@salesforce/apex/QB_MetadataUtilityController.createRequiredFieldRelated";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';
import jsonData from '@salesforce/resourceUrl/Default_Mapping';


import QB_Object_Level_Errors from '@salesforce/label/c.QB_Object_Level_Errors';

import QB_Customer_Object_Validation_Error from '@salesforce/label/c.QB_Customer_Object_Validation_Error';


import QB_Blank_Fields_Mapping from '@salesforce/label/c.QB_Blank_Fields_Mapping';
import QB_Blank_Related_Fields_Mapping from '@salesforce/label/c.QB_Blank_Related_Fields_Mapping';
import QB_Duplicate_Mapping_For_Related_Modal from '@salesforce/label/c.QB_Duplicate_Mapping_For_Related_Modal';

import customLabels from 'c/qb_CustomLabels';

export default class Qb_QbToSfMappingDataCompNew extends LightningElement {
    
    @api origin;
    @track selectedSObjectTypeOption;
    @track qbOptions = new Array();
    @track QuickbookOptionsList = new Array();
    @track isSfqbConfigNotEmpty = false;
    @track showSpinner = false;

    @track QbToSfConfigDataList = new Array();
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
    @track QbToSfDefaultData = new Array();

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

    constructor() {
        super();
    }

    connectedCallback() {
        // this.getQBOperationList();
        this.loadDefaultMapping();
        this.MappingTypeOptions = [{ label: 'Field Mapping', value: 'fieldMapping' },
        { label: 'Related Data Mapping', value: 'relatedDataMapping' }];

        this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
        ////console.log.log("is ont empty990", this.isSfqbConfigNotEmpty);

        ////console.log.log('this.QbToSfConfigDataList 214 ',JSON.stringify(this.QbToSfConfigDataList));

        this.fetchCustomLabels();
    }

    // Qb Sync Button Label
    fetchCustomLabels() {
        let customLabel = new customLabels();
        customLabel.getCustomLabels()
        .then((label) => {
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

    @wire(fetchSfToqbConfigData) SfToqbConfigData(resp) {
        ////console.log.log('line 79',JSON.stringify(resp));
        if (resp.data) {

            ////console.log.log('SfToqbConfigData response data', JSON.stringify(resp.data))
            ////console.log.log(JSON.stringify(resp.data))
            let tempArray = []
            if (resp.data && resp.data.length > 0) {
                resp.data.forEach(obj => {
                    let tempObj = {};
                    tempObj = { ...obj };
                    tempObj.qbReferenceFieldDisabled = obj.hic_qbmadeasy__QB_Operation__c == 'Insert' ? true : false;
                    tempArray.push(tempObj)
                });
            }
            this.QbToSfConfigDataList = tempArray
            this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
            if (this.QbToSfConfigDataList.length <= 0) {
                this.loadingMessage = 'No data';
            }
            this.inProgress = false;
        } else if (resp.error) {
            ////console.log.log("err", resp.error);
            this.error = resp.error;
            this.inProgress = false;
        }
        ////console.log.log('QbToSfConfigDataList >>', JSON.stringify(this.QbToSfConfigDataList));
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
            ////console.log.log('companies',resp.data);
            let qbCompanyOptionList = [];
            resp.data.forEach(currentItem => {
                // let name = currentItem.substring(0, currentItem.lastIndexOf("_") );
                // let realmId = currentItem.substring(currentItem.lastIndexOf("_") + 1, currentItem.length);
                let name = currentItem.Label;
                let realmId = currentItem.companyId;
                ////console.log.log('name',name);
                ////console.log.log('realmId',realmId);
                let companyOptions =  { label: name, value: realmId };
                qbCompanyOptionList.push(companyOptions);
            });
            this.companyOptions = qbCompanyOptionList;
            this.error = undefined;
            ////console.log.log('qbcompanies',JSON.stringify(qbCompanyOptionList));
        } else if (resp.error) {
            ////console.log.log('companies error',resp.error);
            this.error = resp.error;
            this.companyOptions = undefined;
        }
    }


    // getQBOperationList() {
    //     var QBOperationOptionsList = [
    //         { label: '--None--', value: '--None--' },
    //         { label: 'Insert', value: 'Insert' },
    //         { label: 'Update', value: 'Update' },
    //         // { label: 'Upsert', value: 'Upsert' } Commented By Sameer 28_10_2022
    //     ];
    //     this.QBOperationOptionsList = QBOperationOptionsList;
    // }

    // Commented By Sameer 28_10_2022 Start
    /*
    getQBReferenceList() {
        var QBReferenceFieldOptionsList = [
            { label: '--None--', value: '--None--' }
        ];
        this.QBReferenceFieldOptionsList = QBReferenceFieldOptionsList;
    }
    */
    // End

    /*
        @wire(getContractTypeSelectListForAdmin,{objectType:'$selectedObjectTypeOption'}) qbTypeSelList(resp) { 
                
        ////console.log.log(resp.data);
        if (resp.data) {
            this.QuickbookOptionsList = resp.data;
            this.error = undefined;            
        } else if (resp.error) {
            
            this.error = resp.error;
            this.QuickbookOptionsList = undefined;
        }     
    } 
    
    @wire(ApplicableToSelectionList) ApplicableToSelList(resp) {        
        if (resp.data) {
            var applicableOptionList = [{label:'--None--',value:'--None--'}];
            resp.data.forEach(currentItem => {
                applicableOptionList.push(currentItem);
            });
            this.ApplicableToOptionsList = applicableOptionList; 
            this.error = undefined;
        } else if (resp.error) {
            this.error = resp.error;
            this.ApplicableToOptionsList = undefined;
        }     
    } 
*/
    handlechangeToggle(event){
        try{
            ////console.log.log('in handle change toggle',event.detail.checked);
            ////console.log.log('this.QbToSfConfigDataList pre2>>>',JSON.stringify(this.QbToSfConfigDataList));
            ////console.log.log('this.QbToSfConfigDataList defaultdata>>>',JSON.stringify(this.QbToSfDefaultData));
            this.isSfqbConfigNotEmpty = true;
            if(event.detail.checked){
                if(this.QbToSfConfigDataList.length>0){
                    
                    this.QbToSfDefaultData.forEach(obj => {
                        let defaultData = obj;
                        ////console.log.log('in this.QbToSfDefaultData.forEach json',JSON.stringify(obj));
                        let existingObj = this.QbToSfConfigDataList.find(item => item.hic_qbmadeasy__SF_Entity__c === defaultData.hic_qbmadeasy__SF_Entity__c && item.hic_qbmadeasy__QB_Entity__c === defaultData.hic_qbmadeasy__QB_Entity__c );
                    
                        
                        ////console.log.log('in existingobj json',JSON.stringify(existingObj));
                        if (existingObj) {
                            ////console.log.log('in existing if');
                            if(existingObj.Id){
                                this.deleteId.push(existingObj.Id);
                            }
                            this.QbToSfConfigDataList[this.QbToSfConfigDataList.indexOf(existingObj)] = defaultData;
                            ////console.log.log('this.QbToSfConfigDataList5>>>',JSON.stringify(this.QbToSfConfigDataList));
                            //this.QbToSfConfigDataList[this.QbToSfConfigDataList.indexOf(existingObj)].Id = existingObj.Id;
                        } else {
                            ////console.log.log('in existing else');
                            this.QbToSfConfigDataList.push(defaultData);
                        }
                    });
                }
                else{
                    ////console.log.log('in qb to sf default data');
                    this.QbToSfConfigDataList =  JSON.parse(JSON.stringify(this.QbToSfDefaultData));
                }

            }
            else{
                ////console.log.log('in else handlechagnetoggle');
                //////console.log.log('in else handlechagnetoggle2',JSON.stringify(this.QbToSfConfigDataList));
                //this.QbToSfConfigDataList =  this.QbToSfNonDefualtList;
            }
        }
        catch(ex){
            ////console.log.log('in handle change err',ex.message);
        }
    }

    @wire(QbObjectTypeList) ObjectTypeToSelList(resp) {
        ////console.log.log('QbObjectTypeOptionsList')
        ////console.log.log(resp)

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

    async loadDefaultMapping(){
        let nameSpace;
        await getNameSpace().then(result => {
            nameSpace = result
        })
        .catch(error => {
            ////console.log.log('error', error);
        })

       await fetch(jsonData)
        .then((response) => response.json())
        .then((data) =>{ 
            ////console.log.log('default mapping',data);
            
            this.QbToSfDefaultData = data;
            for (let i = 0; i < this.QbToSfDefaultData.length; i++) {
                this.QbToSfDefaultData[i].hic_qbmadeasy__Company_ID__c = this.realmid;
                this.QbToSfDefaultData[i].hic_qbmadeasy__Historical_Data_Mapping__c = false;
                this.QbToSfDefaultData[i].Name = this.getRandomString(18);
                ////console.log.log('element default',JSON.stringify(this.QbToSfDefaultData[i].fieldsJson));
                let element =  new Array();
                element = this.QbToSfDefaultData[i].fieldsJson;
                ////console.log.log('element default',element);
                for(let j = 0; j < element.length; j++){
                    element[j].Name = this.getRandomString(18);
                    if(element[j].hic_qbmadeasy__SF_Field_Label__c ==='Account.HIC QuickBook Id'){
                        element[j].hic_qbmadeasy__SF_Field__c = 'Account.'+nameSpace+'qbmadeasy_id__c';
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
                            
                            if(relatedDataValues[k].label === 'Product2.HIC QuickBook Id-ItemRef'){
                                
                                relatedDataValues[k].name = 'Product2.'+nameSpace + 'qbmadeasy_id__c' +'-SalesItemLineDetail.ItemRef.value';
                            }
                        }
                    }
                }
                ////console.log.log('element default after222',JSON.stringify(element));
                this.QbToSfDefaultData[i].fieldsJson = element; 
            }
            ////console.log.log('default data new with namespace',JSON.stringify(this.QbToSfDefaultData));
            
        });
        //this.showModalDefault = true;
    }

    renderedCallback() {
        this.template.querySelectorAll('.auto-complete-dropdown-class').forEach(elem => {
            elem.setOptionsAndValues();
        });
    }

    showToast(level, fieldName, QB_Entity) {
        ////console.log.log('QB_Object_Level_Errors>>', QB_Object_Level_Errors);
        var message = fieldName + ' ' + QB_Object_Level_Errors;
        ////console.log.log('Message>>', message);
        if (level == 'Object') {
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: message,
                variant: 'error',
                autoclose: false,
            });
        }
        else if (level == 'Field') {
            ////console.log.log('fieldName>>', fieldName);
                if (fieldName == '') {
                    ////console.log.log('isBlankMappingFound_Line_228', this.isBlankMappingFound);
                    this.isBlankMappingFound = true;
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
        ////console.log.log('QbToSfConfigDataList_Line_372', JSON.stringify(this.QbToSfConfigDataList));

        for (var element of this.QbToSfConfigDataList) {
            if (element.fieldsJson != undefined && element.fieldsJson.length == 0) {
                ////console.log.log('In_If');
                // this.blankObjectMappingName = element.hic_qbmadeasy__SF_Entity__c + '-' + element.hic_qbmadeasy__QB_Entity__c + '-' + element.hic_qbmadeasy__QB_Operation__c; Commented By Sameer 15_11_2022
                this.blankObjectMappingName = element.hic_qbmadeasy__SF_Entity__c + '-' + element.hic_qbmadeasy__QB_Entity__c; 
                arrayOfBlankObjectMappingName.push(this.blankObjectMappingName);
                this.blankObjectMappingName = '';
            }
        }

        ////console.log.log('arrayOfBlankObjectMappingName_Line_381', JSON.stringify(arrayOfBlankObjectMappingName));

        // this.template.querySelectorAll('tr.validate-tablerow').forEach(function (eachRow) {
        for (var eachRow of this.template.querySelectorAll('tr.validate-tablerow')) {
            ////console.log.log('Line_380');
            let colValue = '';
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if (colValue === '') {
                    colValue = eachColumn.value;
                } else {
                    colValue = colValue + '-' + eachColumn.value;
                }
            });
            ////console.log.log('Line_389', colValue);
            if (arrayOfBlankObjectMappingName.includes(colValue)) {
                ////console.log.log('insert_In_Line_391');
                eachRow.querySelector('.validation-error').setAttribute('style', 'display:block');
                eachRow.querySelector('.validation-error').setAttribute('title', 'Row does not have Field Mapping');

                ////console.log.log('Exiting_If');
            }
        }
    }

    validateMappingOnObjectLevel() {
        var level = 'Object';
        var QB_Entity = '';
        // ////console.log.log('testing1234',element.hic_qbmadeasy__Company_ID__c);
        //////console.log.log('Insert_validateMappingOnObjectLevel', this.QbToSfConfigDataList);
        for (var element of this.QbToSfConfigDataList) {
            ////console.log.log('testing1234',element.hic_qbmadeasy__Company_ID__c);
            ////console.log.log('Insert_validateMappingOnObjectLevel', this.QbToSfConfigDataList);
            if (element.hic_qbmadeasy__Company_ID__c == undefined || element.hic_qbmadeasy__Company_ID__c == '' || element.hic_qbmadeasy__Company_ID__c == '--None--') {
                ////console.log.log('companyvalidation',element.hic_qbmadeasy__Company_ID__c);
                this.showToast(level, 'QB Company', QB_Entity);
                return true;
            }
            else if (element.hic_qbmadeasy__QB_Entity__c == '' || element.hic_qbmadeasy__QB_Entity__c == '--None--') {
                this.showToast(level, 'QB Object', QB_Entity);
                return true;
            }
            else if (element.hic_qbmadeasy__SF_Entity__c == '' || element.hic_qbmadeasy__SF_Entity__c == '--None--') {
                this.showToast(level, 'Salesforce Object', QB_Entity);
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

        for (var element of this.QbToSfConfigDataList) {
            let mapForEachInstance = {};
            let availableReqField = [];
            if(element.hic_qbmadeasy__SF_Entity__c){
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__SF_Field__c)
                    });
                    ////console.log.log('temp Array==>', JSON.stringify(tempArray));

                    let duplicateElement;
                    duplicateElement = this.findDuplicate(tempArray);
                    if (duplicateElement != '') {
                        this.showToastForDuplicateMapping(duplicateElement, element.hic_qbmadeasy__SF_Entity__c);
                        isError = true;
                        break;
                    }
                }
            }

            if (isError) {
                var QB_Entity = element.hic_qbmadeasy__SF_Entity__c;
                this.showToast(level, fieldName, QB_Entity);
                break;
            }
        }
        return isError;
    }

    showToastForField(isRelatedMap) {
        ////console.log.log('showToastForField_Called');
        ////console.log.log('QB_Blank_Fields_Mapping_Line_622', QB_Blank_Fields_Mapping);
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: QB_Blank_Fields_Mapping,
            variant: 'error',
            autoclose: false,
        });
        if (isRelatedMap) {
            this.template.querySelector('c-qb_-qb-to-sf-rel-fields-mapping-comp').hightlightBlankFields({});
        }
    }

    showToastForFieldForConstant(isRelatedMap) {
        ////console.log.log('showToastForField_Called');
        ////console.log.log('QB_Blank_Fields_Mapping_Line_622', QB_Blank_Fields_Mapping);
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
        ////console.log.log('checkField_Called');

        this.template.querySelectorAll('tr.validate-field-row').forEach(function (eachRow) {
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                eachColumn.classList.remove('slds-has-error');
            });
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                //////console.log.log('eachColumn >> ', eachColumn.value);
                //////console.log.log('hasWhiteSpace(eachColumn.value) >> ', hasWhiteSpace(eachColumn.value));
                if(eachColumn.value == '' || eachColumn.value == undefined || /^\s/.test(eachColumn.value)) {
                    ////console.log.log('eachColumn >> ', eachColumn.value);
                    eachColumn.classList.add('slds-has-error');
                }
            });
        });
        for (var element of this.QbToSfConfigDataList) {
            if (element.fieldsJson != undefined) {
                for (var fieldEle of element.fieldsJson) {
                    let temp = fieldEle.hic_qbmadeasy__SF_Field__c;
                    let trimVal = temp.trimStart();

                    if (fieldEle.hic_qbmadeasy__Quickbook_Field__c == '' || fieldEle.hic_qbmadeasy__SF_Field__c == '' || trimVal.length != fieldEle.hic_qbmadeasy__SF_Field__c.length) {
                        this.showToastForField(false);
                        return true;
                    }

                    if(fieldEle.hic_qbmadeasy__Constant__c == true  && (/^\s/.test(fieldEle.hic_qbmadeasy__Quickbook_Field__c) || fieldEle.hic_qbmadeasy__Quickbook_Field__c == undefined)){
                        this.showToastForFieldForConstant(false);
                        return true;
                    }
                    
                }
            }
        }
        return false;
    }

    validateRelatedDataMapping() {
        ////console.log.log('Inside_validateRelatedDataMapping');
        for (var element of this.QbToSfConfigDataList) {
            ////console.log.log('Inside_First_Loop');
            if (element.fieldsJson != undefined) {
                for (var fldElement of element.fieldsJson) {
                    ////console.log.log('Inside_Second_Loop');
                    if (fldElement.hic_qbmadeasy__Data_Mapping_Type__c != '' && fldElement.hic_qbmadeasy__Data_Mapping_Type__c == 'relatedDataMapping' && fldElement.hic_qbmadeasy__FieldsMappingData__c.length == 0) {
                        ////console.log.log('QB_Blank_Related_Fields_Mapping>>', QB_Blank_Related_Fields_Mapping);
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: QB_Blank_Related_Fields_Mapping,
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
        ////console.log.log('inside save all', JSON.stringify(this.QbToSfConfigDataList));
        ////console.log.log('inside save', JSON.stringify(this.sfFieldsSelObj));
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
                    ////console.log.log('element>>', JSON.stringify(element));
                    ////console.log.log('colValue>>', JSON.stringify(colValue));
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
            ////console.log.log('ValidateDataList>>', ValidateDataList);
        });


        ////console.log.log('IsError1>>', isError);
        this.isBlankMappingFound = false;
        ////console.log.log('isBlankMappingFound_Line_677', this.isBlankMappingFound);

        if(isError == false){
            isError = this.validateMappingOnObjectLevel();
        }
        ////console.log.log('IsError2>>', isError);
        ////console.log.log('isBlankMappingFound_Line_681', this.isBlankMappingFound);

        if (isError == false) {
            isError = this.checkField();
        }
        ////console.log.log('IsError3>>', isError);
        ////console.log.log('isBlankMappingFound_Line_687', this.isBlankMappingFound);

        if (isError == false) {
            isError = this.validateMappingOnFieldLevel();
        }
        ////console.log.log('IsError4>>', isError);
        ////console.log.log('isBlankMappingFound_Line_693', this.isBlankMappingFound);

        if (isError == false) {
            isError = this.validateRelatedDataMapping();
        }
        ////console.log.log('IsError5>>', isError);
        ////console.log.log('isBlankMappingFound_Line_699', this.isBlankMappingFound);


        

        ////console.log.log('isBlankMappingFound_Line_744', this.isBlankMappingFound);
        if (this.isBlankMappingFound == true && isError == true) {
            this.showToastForBlankMapping();
        }

        if (objectNameNull) {
            this.inProgress = false;
        }
        ////console.log.log('isError>>>',isError);
        if (isError === false) {
            this.isBlankMappingFound = false;
            this.inProgress = true;
            ////console.log.log('Line_790',JSON.stringify(this.QbToSfConfigDataList));
            saveSftoqbConfigData({ SfqbWrapDataList: JSON.stringify(this.QbToSfConfigDataList), deleteId: this.deleteId }).then(result => {
                if (result.success) {
                    this.loadDefaultMapping();
                    ////console.log.log('In_Success');
                    this.createRequiredField();
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Success',
                        message: 'Succesfully Saved',
                        variant: 'success',
                        autoclose: false,
                    });

                    if (result.newData) {
                        ////console.log.log('Called 809');
                        this.QbToSfConfigDataList.forEach(function (elem) {
                            result.newData.forEach(function (re) {
                                if (re.Name === elem.Name) {
                                    delete elem.newRow;
                                    elem.Id = re.Id;
                                    elem.expanded = true;
                                }
                            });

                        });
                    }
                    if (result.hasOwnProperty('newDataMap') && result.newDataMap) {
                        let QbToSfConfigDataList = new Array();
                        this.QbToSfConfigDataList.forEach(element => {
                            if (element.Id == undefined || element.Id == null) {
                                if (result.newDataMap.hasOwnProperty(element.Name)) {
                                    ////console.log.log('hello element')
                                    element['Id'] = result.newDataMap[element.Name];
                                    element['expanded'] = true;
                                    delete element['newRow'];
                                }
                            }
                            QbToSfConfigDataList.push(element);
                        })
                        this.QbToSfConfigDataList = QbToSfConfigDataList;
                    }
                    this.inProgress = false;
                } else {
                    ////console.log.log('In_Else');
                    if (this.QbToSfConfigDataList.length == 0) {
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Success',
                            message: 'Succesfully Saved',
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
        let sobjectApiNameList = [];
        let sobjectApiNameForRelatedList = [];
        for (var key in this.QbToSfConfigDataList) {
            if(this.QbToSfConfigDataList[key].fieldsJson){
                for(var inKey in this.QbToSfConfigDataList[key].fieldsJson){

                    ////console.log.log('keyfieldjson==>', inKey)
                    ////console.log.log('keyfieldjsonvalue==>', this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__Data_Mapping_Type__c);
                    if(this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping'){
                        ////console.log.log('in sobj name',this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__SF_Field__c);
                        sobjectApiNameForRelatedList.push(this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__SF_Field__c);
                    }

                }
            }
            sobjectApiNameList.push(this.QbToSfConfigDataList[key].hic_qbmadeasy__SF_Entity__c);
        }
        if (sobjectApiNameList.length > 0) {
            createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
                ////console.log.log('result on creating field', result)
            })
                .catch(error => {
                    ////console.log.log('error at creating field==>', error);
                })
        }
        if (sobjectApiNameForRelatedList.length > 0) {
            createRequiredFieldRelated({ 'sObjectApiNameList': sobjectApiNameForRelatedList }).then(result => {
                ////console.log.log('result on creating field', result)
            })
                .catch(error => {
                    ////console.log.log('error at creating field==>', error);
                })
        }
    }
    cloneSfToqbFieldConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.fldconfigid;
        let configIdNew = this.getRandomString(18);
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
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
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }

    }
    deleteSfToqbFieldConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
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
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            ////console.log.log('this.QbToSfConfigDataList 123 ',JSON.stringify(this.QbToSfConfigDataList));
        }

    }
    async cloneSfToqbObjectConfigRecord(event) {
        /*let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let QbToSfConfigDataListTemp = new Array();

        let vm = this;
        let configId = this.getRandomString(18);
        let isAssign = false;
        if (this.QbToSfConfigDataList) {
            for(let i = 0; i < this.QbToSfConfigDataList.length; i++){
                let element = this.QbToSfConfigDataList[i] ;
                if (element.Name === objConfigId) {
                    
                    this.QbToSfConfigDataList.splice(i+1,0,{...element,Name:configId});
                    //this.QbToSfConfigDataList[i+1].Name = '123';
                    ////console.log.log('line 937',JSON.stringify(this.QbToSfConfigDataList));
                    break;
                }
            }
        }*/

        /*if (this.QbToSfConfigDataList) {
            var index = 0;
            for (let i = 0; i < this.QbToSfConfigDataList.length; i++) {
                let element = this.QbToSfConfigDataList[i];
                if (element.Id === objConfigId) {
                    if (element.expanded || !element.Id) {
                        isAssign = true;
                        let eachObjConfigRec = Object.assign({}, element);

                        ////console.log.log(JSON.parse(JSON.stringify(eachObjConfigRec)))
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                        eachObjConfigRec = { ...eachObjConfigRec, Name: configId };
                        eachObjConfigRec = { ...eachObjConfigRec, newRow: true };
                        eachObjConfigRec = { ...eachObjConfigRec, Id: null };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {

                        let result = await fetchSfToqbConfigDataById({ 'Id': element.Id });
                        ////console.log.log(result)

                        let localElement = JSON.parse(JSON.stringify(element))
                        localElement = { ...localElement, qbtypeFieldsList: result.qbtypeFieldsList };
                        localElement = { ...localElement, qbtypeTableList: result.qbtypeTableList };
                        localElement = { ...localElement, childSobjList: result.childSobjList };
                        localElement = { ...localElement, fieldsJson: result.fieldsJson };
                        let eachObjConfigRec = Object.assign({}, localElement);
                        ////console.log.log(JSON.parse(JSON.stringify(eachObjConfigRec)))
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, localElement];
                        eachObjConfigRec = { ...eachObjConfigRec, Name: configId };

                        eachObjConfigRec = { ...eachObjConfigRec, newRow: true };
                        eachObjConfigRec = { ...eachObjConfigRec, Id: null };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];

                    }
                } else {
                    isAssign = true;
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
                index++;
            }

            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }*/
    }
    deleteSfToqbObjectConfigRecord(event) {
        ////console.log.log('deleteSfToqbObjectConfigRecord Called');
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let QbToSfConfigDataListTemp = new Array();
        let vm = this;
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
                if (element.Name !== objConfigId) {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                } else {
                    if (element.Id) {
                        vm.deleteId.push(element.Id);
                    }
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }
    }
    @track responseDataTemp = {}

    @track sftoqbResDataList = new Array();
    saveSuccessInfo(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        this.successDisplayPopUp = false;
    }

    setUpdatedValuetoObjConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let dataVal;
        if (event.currentTarget.type === 'checkbox') {
            dataVal = event.detail.checked;
        } else {
            dataVal = event.detail.value;
        }

        //this.sobjectFieldList.find(fld => fld.value === fldelement.hic_qbmadeasy__SF_Parent_Field__c).label;

        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
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
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }
        if (event.currentTarget.name.indexOf('hic_qbmadeasy__QB_Entity__c') !== -1) {
            const field = event.target.name;
            this.selectedObjectTypeOption = event.target.value;
            let index = event.currentTarget.dataset.index;
            fetchQBEntityFields({ 'contractType': this.selectedObjectTypeOption })
                .then(result => {
                    let qbTypeList = [];
                    let qtbTableList = [];
                    for (var key in result) {
                        if (result[key].type != 'Table') {
                            let qbtypeFieldObj = {};
                            qbtypeFieldObj.label = result[key].label;
                            qbtypeFieldObj.value = result[key].value;
                            qbtypeFieldObj.type = result[key].type;
                            qbtypeFieldObj.required = result[key].required;
                            qbtypeFieldObj.dataType = result[key].dataType;
                            qbTypeList.push(qbtypeFieldObj);

                        }
                        else {
                            let qbtypeTableFieldObj = {};
                            qbtypeTableFieldObj.label = result[key].label;
                            qbtypeTableFieldObj.value = result[key].value;
                            qbtypeTableFieldObj.type = result[key].type;
                            qbtypeTableFieldObj.required = result[key].required;
                            qbtypeTableFieldObj.dataType = result[key].dataType;
                            qtbTableList.push(qbtypeTableFieldObj);
                        }
                        this.QbToSfConfigDataList[index].qbtypeFieldsList = qbTypeList;
                        this.QbToSfConfigDataList[index].qbtypeTableList = qtbTableList;
                    }

                })
        }
        else if (event.currentTarget.name.indexOf('hic_qbmadeasy__SF_Entity__c') !== -1) {
            const field = event.target.name;
            this.selectedSObjectTypeOption = event.target.value;
            ////console.log.log(this.selectedSObjectTypeOption);
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

                    let QbToSfConfigDataListInnerTemp = new Array();
                    if (this.QbToSfConfigDataList) {
                        this.QbToSfConfigDataList.forEach(function (element) {
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
                                QbToSfConfigDataListInnerTemp = [...QbToSfConfigDataListInnerTemp, eachObjConfigRec];
                            } else {
                                QbToSfConfigDataListInnerTemp = [...QbToSfConfigDataListInnerTemp, element];
                            }
                        });
                        this.QbToSfConfigDataList = QbToSfConfigDataListInnerTemp;
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
                        let QbToSfConfigDataListInnerTemp = new Array();
                        if (this.QbToSfConfigDataList) {
                            this.QbToSfConfigDataList.forEach(function (element) {
                                if (element.Name === objConfigId) {
                                    let eachObjConfigRec = element;
                                    eachObjConfigRec = { ...eachObjConfigRec, childSobjList: childSobjList };
                                    QbToSfConfigDataListInnerTemp = [...QbToSfConfigDataListInnerTemp, eachObjConfigRec];
                                } else {
                                    QbToSfConfigDataListInnerTemp = [...QbToSfConfigDataListInnerTemp, element];
                                }
                            });
                            this.QbToSfConfigDataList = QbToSfConfigDataListInnerTemp;
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
            ////console.log.log('companyOnclick',name);
            ////console.log.log('companyOnclick',value);
            ////console.log.log('companyOnclick',index);
            this.QbToSfConfigDataList[index].hic_qbmadeasy__RealmId__c = value;
            ////console.log.log('sftoqb with company',JSON.stringify(this.QbToSfConfigDataList[index]));
            ////console.log.log('full sftoqb',JSON.stringify(this.QbToSfConfigDataList));
            
        }
    }

    

    setUpdatedValuetoFieldRecObj(event) {
        try{
        ////console.log.log('line 1146',event);
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let dataVal;

        ////console.log.log('event.detail.checked',event.detail.checked);
        ////console.log.log('event.detail.apiName',event.detail.apiName);
        ////console.log.log('event.detail.value',event.target.value);
        ////console.log.log('event.currentTarget.name',event.currentTarget.name);

        //this.sfFieldsSelObj.find(fld => fld.value === fldelement.hic_qbmadeasy__SF_Parent_Field__c).label;
        //////console.log.log('line 945', this.sfFieldsSelObj.sffieldType);

        let sfFieldsSelObjTemp = this.sfFieldsSelObj;

        ////console.log.log('line 966 '+ JSON.stringify(this.sfFieldsSelObj));

        if (event.currentTarget.type === 'checkbox') {
            dataVal = event.detail.checked;
        } else {
            dataVal = event.detail.value;
        }
        ////console.log.log('dataval',dataVal);

        ////console.log.log('this.QbToSfConfigDataList 1115 ==> ',JSON.stringify(this.QbToSfConfigDataList));

        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {

                if (element.Name === objConfigId) {
                    ////console.log.log(JSON.stringify(element));
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = new Array();
                    if (element.fieldsJson) {

                        element.fieldsJson.forEach(function (fldelement) {
                            if (fldelement.Name === fldConfigId) {
                                let eachfldConfigRec = fldelement;
                                ////console.log.log('apiName>> ' , event.detail.apiName);
                                ////console.log.log('eachfldConfigRec>> ' , JSON.stringify(eachfldConfigRec));
                                if (event.detail.apiName) {
                                    ////console.log.log('line 1186');
                                    eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SF_Field__c': event.detail.apiName };
                                    eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SFChildRelationshipName__c': dataVal };
                                }else{
                                    ////console.log.log('line 1190');
                                    
                                    if(dataVal == true){
                                        ////console.log.log('line 1193');
                                        
                                        let sfdataTypeFromSaveRecord = eachfldConfigRec.hic_qbmadeasy__SF_Field_Data_Type__c;
                                        let sfdataTypeForFirstTime = sfFieldsSelObjTemp.sffieldType;
                                        let sfdataType;
                                        

                                        if(sfdataTypeForFirstTime != undefined){
                                            sfdataType = sfdataTypeForFirstTime;
                                        }else if(sfdataTypeFromSaveRecord != undefined){
                                            sfdataType = sfdataTypeFromSaveRecord;
                                        }

                                        if(sfdataType != 'DATE' && sfdataType != 'DATETIME' && sfdataType != 'TIME'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': false , 'isDateTime': false , 'isTime': false, hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }
                                        

                                        if(sfdataType == 'DATE'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': true , 'isDateTime': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }else if(sfdataType == 'DATETIME'){
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': true , 'isDate': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }else if(sfdataType == 'TIME'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': false , 'isDate': false, 'isTime':true , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }
                                        
                                    }else if(dataVal == false){
                                        ////console.log.log('line 1196');

                                        let sfdataTypeFromSaveRecord = eachfldConfigRec.hic_qbmadeasy__SF_Field_Data_Type__c;
                                        let sfdataTypeForFirstTime = sfFieldsSelObjTemp.sffieldType;
                                        let sfdataType;
                                        

                                        if(sfdataTypeForFirstTime != undefined){
                                            sfdataType = sfdataTypeForFirstTime;
                                        }else if(sfdataTypeFromSaveRecord != undefined){
                                            sfdataType = sfdataTypeFromSaveRecord;
                                        }

                                        if(sfdataType != 'DATE' && sfdataType != 'DATETIME' && sfdataType != 'TIME'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': false , 'isDateTime': false , 'isTime': false, hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }
                                        

                                        if(sfdataType == 'DATE'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': true , 'isDateTime': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }else if(sfdataType == 'DATETIME'){
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': true , 'isDate': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }else if(sfdataType == 'TIME'){
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': false , 'isDate': false, 'isTime':true , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        }
                                    }else{
                                        ////console.log.log('in constant value update');
                                        ////console.log.log('event curre');
                                        eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal};
                                        
                                    }
                                    //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal};
                                }
                                if (event.currentTarget.name === 'hic_qbmadeasy__SF_Field__c') {
                                    ////console.log.log('line 1194');
                                    if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        ////console.log.log('line 1196');
                                        let childRelationName = '';
                                        element.childSobjList.forEach(function (childOption) {
                                            if (childOption.value === dataVal) {
                                                ////console.log.log('line 1200');
                                                childRelationName = childOption.value;
                                            }
                                        });
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SFChildRelationshipName__c: childRelationName };
                                    }
                                }
                                if (event.currentTarget.name === 'hic_qbmadeasy__Quickbook_Field__c') {
                                    ////console.log.log('line 1208');
                                    if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: 'table' };
                                    }
                                    else if(eachfldConfigRec.hic_qbmadeasy__Constant__c === true){
                                

                                        

                                        eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__Quickbook_Field__c': dataVal};
                                        
                                        
                                        

                                    } 
                                    else {
                                        ////console.log.log('line 1212');
                                        let fieldInfo = event.target.options.find(opt => opt.value === event.detail.value);
                                        if (fieldInfo) {
                                            ////console.log.log('line 1215');
                                            let fieldLabel = fieldInfo.label;
                                            let qb_fieldTypeSplted = fieldLabel.split(':');
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: qb_fieldTypeSplted[0].trim() };
                                        }
                                    }

                                }
                                if (event.currentTarget.name === 'hic_qbmadeasy__Data_Mapping_Type__c') {
                                    ////console.log.log('line 1218');
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
                    ////console.log.log(JSON.stringify(eachObjConfigRec));
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            ////console.log.log('this.QbToSfConfigDataList 1250 ==> ',JSON.stringify(this.QbToSfConfigDataList));
        }
        }
        catch(ex){
            ////console.log.log('constant', ex.message);
        }
    }

    setUpdatedRelMappings(event) {
        ////console.log.log('Details_Event', JSON.stringify(event.detail));
        this.RelFieldsMappingList = event.detail;
    }

    saveRelDataMappings(event) {
        try{
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let RelatedFldMapList = this.RelFieldsMappingList;
        let QbToSfConfigDataListTemp = new Array();

        ////console.log.log('QbToSfConfigDataList_Line_1147', JSON.stringify(this.QbToSfConfigDataList));
        ////console.log.log('RelFieldsMappingList_Line_1147', JSON.stringify(this.RelFieldsMappingList));
        var isError = false;


        //var arrayOfRequiredFields = ["Detail Type", "Amount", "ItemRef"];
        var arrayOfRequiredFields = [];
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
                ////console.log.log('In_Loop_RelFieldsMappingList');
                if (element.cp_fieldLabel == '' || element.qb_fieldName == '') {
                    isError = true;
                    break;
                }
                else {
                    if (element.isConstant == true) {
                        ////console.log.log('isConstant_True');
                        if (element.sf_fieldName == '' || element.sf_fieldLabel == '') {
                            isError = true;
                            ////console.log.log('showToastForField_Method_Calling');
                        }
                    } else if (element.isConstant == false) {
                        ////console.log.log('isConstant_False');
                        if (element.sf_fieldName == '' || element.sf_fieldLabel == '' || element.sf_field2Name == '' || element.sf_field2Label == '') {
                            ////console.log.log('IN_One');
                            isError = true;
                        }
                        else if (element.referenceCount == 0 && (element.sf_fieldName == undefined || element.sf_fieldLabel == undefined)) {
                            ////console.log.log('IN_Two');
                            isError = true;
                        }
                        else if (element.referenceCount == 1 && (element.sf_field2Name == undefined || element.sf_field2Label == undefined)) {
                            ////console.log.log('IN_Three');
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
                ////console.log.log('Line_1200');
                for (var element of this.RelFieldsMappingList) {
                    if (element.cp_fieldLabel != undefined && element.cp_fieldLabel != '') {
                        arrayOfSelectedFields.push(element.cp_fieldLabel);
                    }
                }
                ////console.log.log('Line_1206');
                for (let i = 0; i < arrayOfRequiredFields.length; i++) {
                    if (!arrayOfSelectedFields.includes(arrayOfRequiredFields[i])) {
                        ////console.log.log('In_If_Of_Required');
                        requiredFieldMissing = arrayOfRequiredFields[i];
                        isError = true;
                        break;
                    }
                }
                ////console.log.log('Line_1214');
                if (isError == true) {
                    var message = requiredFieldMissing + ' is missing for Line.'
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: message,
                        variant: 'error',
                        autoclose: false,
                    });
                    this.template.querySelector('c-qb_-qb-to-sf-rel-fields-mapping-comp').hightlightBlankFields({});
                }
                else if (isError == false) {
                    let duplicateElement = '';
                    duplicateElement = this.findDuplicate(arrayOfSelectedFields);
                    if (duplicateElement != '') {
                        isError = true;
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Error',
                            message: QB_Duplicate_Mapping_For_Related_Modal + ' ' + duplicateElement + '.',
                            variant: 'error',
                            autoclose: false,
                        });
                        this.template.querySelector('c-qb_-qb-to-sf-rel-fields-mapping-comp').hightlightBlankFields({});
                    }
                }
            }
        }



        ////console.log.log('isError', isError);
        if (isError == false) {
            if (this.QbToSfConfigDataList) {
                this.QbToSfConfigDataList.forEach(function (element) {
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
                                                    //relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + sfFieldLabel, name: eachItem.qb_fieldName + '-' + sfFieldName }];
                                                    relatedDataValuesList = [...relatedDataValuesList, { label: sfFieldLabel + '-' + eachItem.cp_fieldLabel, name: sfFieldName + '-' + eachItem.qb_fieldName }];
                                                }
                                                else {
                                                    //relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + eachItem.sf_fieldLabel, name: eachItem.qb_fieldName + '-' + eachItem.sf_fieldName }];
                                                    relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.sf_fieldLabel + '-' + eachItem.cp_fieldLabel, name: eachItem.sf_fieldName + '-' + eachItem.qb_fieldName }];
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
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                    }
                });
                this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            }
            this.reldatadisplayPopup = false;
        }
        }
        catch(ex){
            ////console.log.log('related error', ex.message);
        }


    }



    removeRelMappingsFromContainerList(event) {
        let delItemName = event.detail.item.name;
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let QbToSfConfigDataListTemp = new Array();
        ////console.log.log('line 1422 ',JSON.stringify(this.QbToSfConfigDataList));
        try{
            if(this.QbToSfConfigDataList) {
                for(let i = 0; i < this.QbToSfConfigDataList.length; i++){
                    
                    let element = this.QbToSfConfigDataList[i] ;
                    if(element.Name === objConfigId) {
                        ////console.log.log('inside if');
                        if(element.fieldsJson){
                            ////console.log.log('inside fieldJson');
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    ////console.log.log('success');
                                    ////console.log.log('delItemName ==> 14 ', delItemName);
                                    let delItemNameSplitArray = delItemName.split('-');
                                    fldelement.hic_qbmadeasy__FieldsMappingData__c.forEach(function (item,index){
                                        
    
                                        if(item.isReferenceMapping == true){
                                            ////console.log.log('line 1440',item.sfrelationName+'.'+item.sf_field2Name);
                                            //if(item.qb_fieldName != 'DetailType' && item.qb_fieldName != 'Amount' && item.qb_fieldName != 'SalesItemLineDetail.ItemRef.value'){
                                                if(delItemNameSplitArray[0] == item.qb_fieldName && delItemNameSplitArray[1] == item.sfrelationName+'.'+item.sf_field2Name){
                                                    
                                                    fldelement.hic_qbmadeasy__FieldsMappingData__c.splice(index,1);
                                                }
                                            //}
                                            
                                        }
    
                                        //if(item.qb_fieldName != 'DetailType' && item.qb_fieldName != 'Amount' && item.qb_fieldName != 'SalesItemLineDetail.ItemRef.value'){
                                            if(delItemNameSplitArray[0] == item.qb_fieldName && delItemNameSplitArray[1] == item.sf_fieldName){
                                            
                                                fldelement.hic_qbmadeasy__FieldsMappingData__c.splice(index,1);
                                            }
                                        //}

                                        /*if(item.qb_fieldName == 'DetailType' || item.qb_fieldName == 'Amount' || item.qb_fieldName == 'SalesItemLineDetail.ItemRef.value'){
                                            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                                                title: 'Error',
                                                message: 'QB_Estimate_Object_Validation_Error_For_CustomerRef',
                                                variant: 'error',
                                                autoclose: false,
                                            });
                                        }*/
                                            
                                        
                                        
                                        
                                    });
    
                                    fldelement.hic_qbmadeasy__RelatedDataValues__c.forEach(function (item,index){
                                        ////console.log.log('line 14 58 ', JSON.stringify(item));
                                        ////console.log.log(' del Name ', delItemName);
                                        ////console.log.log(' item Name ', item.name);
                                        let val = item.name.split('-');
                                        if(delItemName == item.name){
                                            ////console.log.log('SuccessFully');
                                            //if(val[0] != 'DetailType' && val[0] != 'Amount' && val[0] != 'SalesItemLineDetail.ItemRef.value'){
                                                fldelement.hic_qbmadeasy__RelatedDataValues__c.splice(index,1);
                                            //}
                                            
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            }
        }catch(ex){
            ////console.log.log('in ex 124', ex.message);
        }
        
        /*if (this.QbToSfConfigDataList) {
            try {
                this.QbToSfConfigDataList.forEach(function (element) {
                    if (element.Name === objConfigId) {
                        let eachObjConfigRec = element;
                        let fieldsJsonListTemp = new Array();
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.configId === fldConfigId) {
                                    let eachfldConfigRec = fldelement;
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        let RelatedFldMapList = fldelement.hic_qbmadeasy__FieldsMappingData__c;
                                        let RelatedFldDataValList = fldelement.hic_qbmadeasy__RelatedDataValues__c;
                                        if (RelatedFldDataValList) {
                                            let RelatedFldDataValTemp = new Array();
                                            RelatedFldDataValList.forEach(function (relfldelement) {
                                                if (relfldelement.name !== delItemName) {
                                                    RelatedFldDataValTemp = [...RelatedFldDataValTemp, relfldelement];
                                                }
                                            });
                                            RelatedFldDataValList = RelatedFldDataValTemp;
                                            let RelatedFldMapListTemp = new Array();
                                            let SplitedValList = delItemName.split('-');
                                            RelatedFldMapList.forEach(function (relfldelement) {
                                                if (relfldelement.sf_fieldName !== SplitedValList[0] && relfldelement.qb_fieldName !== SplitedValList[1]) {
                                                    RelatedFldMapListTemp = [...RelatedFldMapListTemp, relfldelement];
                                                }
                                            });
                                            RelatedFldMapList = RelatedFldMapListTemp;
                                        }
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__FieldsMappingData__c: RelatedFldMapList };
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__RelatedDataValues__c: RelatedFldDataValList };
                                    }
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                                } else {
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                }
                            });
                        }
                        eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                    }
                });
                this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            } catch (error) {
                this.error = error;
            }
        }*/

    }

    openRelfldMappingPopup(event) {
        ////console.log.log('openRelfldMappingPopup called');
        ////console.log.log(event.data);
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        this.relObjConfigId = objConfigId;
        this.relFldConfigId = fldConfigId;
        this.sfChildObjName = event.currentTarget.dataset.sffieldname;
        let cpChildObjName = event.currentTarget.dataset.cpfieldname;
        let childFieldsListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            try {
                let RelFieldsMappingListTemp = new Array();
                this.QbToSfConfigDataList.forEach(function (element) {
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
                ////console.log.log('in 1571 ', error.message);
            }
        }
        this.reldatadisplayPopup = true;
    }

    validateBlankFieldsOnModal(){
        ////console.log.log('in 11 ');
        ////console.log.log('in 12', this.querySelectorAll('.displayPopup-sf-field-error'));
        
        
        /*this.querySelector('.displayPopup-sf-field-error').forEach(function (eachColumn) {
            ////console.log.log('Line_1606');
            if (eachColumn.value == '' || eachColumn.value == undefined) {
                ////console.log.log('Line_338s');
                eachColumn.classList.add('slds-has-error');
            }
        });*/
    }

    

    saveSfFieldNameValue(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let QbToSfConfigDataListTemp = new Array();
        let sfFieldsSelObjTemp = this.sfFieldsSelObj;
        ////console.log.log('sfFieldsSelObjTemp ===> '+ JSON.stringify(sfFieldsSelObjTemp));
        
        let allValid = true;
        ////console.log.log('line 1624 ',JSON.stringify(this.QbToSfConfigDataList));
        if (this.QbToSfConfigDataList) {
            try {
                this.QbToSfConfigDataList.forEach(element => {
                    if (element.Name === objConfigId) {
                        let eachObjConfigRec = element;
                        let fieldsJsonListTemp = new Array();
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(fldelement => {
                                if (fldelement.Name === fldConfigId) {
                                    let eachfldConfigRec = fldelement;
                                    ////console.log.log('eachfldConfigRec>>', JSON.stringify(eachfldConfigRec));
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'fieldMapping') {
                                        if(fldelement.hic_qbmadeasy__Constant__c){
                                            let sfdataType = sfFieldsSelObjTemp.sffieldType;

                                            ////console.log.log('sfdataType ===> '+ sfdataType);

                                            

                                            //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};


                                            if(sfFieldsSelObjTemp.sffieldType != 'DATE' && sfFieldsSelObjTemp.sffieldType != 'DATETIME' && sfFieldsSelObjTemp.sffieldType != 'TIME'){
                                                eachfldConfigRec = { ...eachfldConfigRec,'isDate': false , 'isDateTime': false , 'isTime': false, hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                            }

                                            if(sfFieldsSelObjTemp.sffieldType == 'DATE'){
                                                eachfldConfigRec = { ...eachfldConfigRec,'isDate': true , 'isDateTime': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                            }else if(sfFieldsSelObjTemp.sffieldType == 'DATETIME'){
                                                
                                                eachfldConfigRec = { ...eachfldConfigRec,  'isDateTime': true , 'isDate': false, 'isTime':false , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                            }else if(sfFieldsSelObjTemp.sffieldType == 'TIME'){
                                                eachfldConfigRec = { ...eachfldConfigRec, 'isDateTime': false , 'isDate': false, 'isTime':true , hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                            }
                                        }
                                        if (sfFieldsSelObjTemp.isReferenceMapping) {

                                            this.template.querySelectorAll('[data-objconfigidcustom="' +objConfigId+ '"]').forEach(compName=>{
                                                let isValid = compName.checkValidity();
                                                ////console.log.log(isValid)
                                                allValid = allValid && isValid;
                                                                                                                               
                                            });
                                            ////console.log.log('line 1416' , allValid)

                                            var sfFieldLabelString = '';
                                            var sfFieldNameString = '';
                                            let p = 2;
                                            ////console.log.log('TestCheck >>' + sfFieldsSelObjTemp['sfrelation' + p + 'Name']);
                                            for (let i = 1; i <= sfFieldsSelObjTemp.referenceCount; i++) {
                                                if (i > 1) {
                                                    sfFieldLabelString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                    sfFieldNameString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                }
                                                else {
                                                    sfFieldLabelString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                    sfFieldNameString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                }
                                            }
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: true };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: sfFieldsSelObjTemp.referenceCount };
                                            //eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sfrelationName + '.' + sfFieldsSelObjTemp.sffieldlabel };
                                            // eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldLabelString + sfFieldsSelObjTemp['sfparentField'+(sfFieldsSelObjTemp.referenceCount && sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.referenceCount : '')+'Label'] };

                                            if(!this.isSFReferenceObjNotNull){
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: false };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: 0 };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sffieldlabel };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldsSelObjTemp.sffieldName };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: '' };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: '' };
                                                
                                            }else{
                                                if(allValid){
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldLabelString + (sfFieldsSelObjTemp.referenceCount > 1 ? this['RefrenceField' + sfFieldsSelObjTemp.referenceCount + 'List'].find(fld => fld.value === sfFieldsSelObjTemp['sfparentField' + sfFieldsSelObjTemp.referenceCount + 'Name']).label : this.RefrenceFieldList.find(fld => fld.value === sfFieldsSelObjTemp.sfparentFieldName).label) }; //by Saurabh
                                                
                                                
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldNameString + sfFieldsSelObjTemp['sfparentField' + (sfFieldsSelObjTemp.referenceCount && sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.referenceCount : '') + 'Name'] }; //by Saurabh
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: sfFieldsSelObjTemp.sfreferenceObj };
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: sfFieldsSelObjTemp.sffieldName };

                                                
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object2__c: sfFieldsSelObjTemp.sfreferenceObj2 };
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field2__c: (sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.sffield2Name : '') };
                                                }
                                            }
                                            
                                            
                                            

                                        } else {
                                            let componentName = this.template.querySelector('[data-objconfigidcustom="' +objConfigId+ '"]')
                                            let isValid = componentName.checkValidity();
                                            ////console.log.log(isValid)
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
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                    }
                });
                this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                ////console.log.log('line 1064-QbToSfConfigDataList>>' + JSON.stringify(this.QbToSfConfigDataList));
                if(allValid){
                    this.closeInsertFieldPopup();
                }
                
            } catch (error) {
                this.error = error;
                //////console.log.log(JSON.stringify(error.message));
            }
        }
    }

    handleSuccessForResponse(event) {
        let name = event.target.name;
        let value = event.detail.value;
        ////console.log.log(event.target.name);
        let sfFieldsSelObjtemp = { ... this.sffieldforResponseFinal };

        if (name === 'qbId') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, qbId: value };
        } else if (name === 'errorcode') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcode: value };
        } else {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcodemsg: value };
        }

        this.sffieldforResponseFinal = { ...this.sffieldforResponseFinal, ...sfFieldsSelObjtemp };
        ////console.log.log(JSON.stringify(this.sffieldforResponse))
    }

    @track sffieldforResponseFinal = {};
    handleSaveForSuccess(event) {
        try {
            let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
            let tempList = JSON.parse(JSON.stringify(this.QbToSfConfigDataList))
            tempList.forEach(element => {
                if (element.Name == objConfigId) {
                    element.sffieldforResponseFinal = this.sffieldforResponseFinal;
                }
            });
            ////console.log.log(tempList);
            this.QbToSfConfigDataList = tempList;
            this.successDisplayPopUp = false;
            this.sffieldforResponseFinal = {};
        } catch (e) {
            ////console.log.log(e)
        }
    }

    isSFReferenceObjNotNull = false;

    setUpdatedValuetoSfFieldRec(event) {
        ////console.log.log('setUpdatedValuetoSfFieldRec Called');

        try{
            let fieldName = event.detail.value;
            ////console.log.log('fieldName ==> ',fieldName);
            let fieldLabel = event.target.options.find(opt => opt.value === event.detail.value).label;
            let fieldType =  event.target.options.find(opt => opt.value === event.detail.value).type;
            ////console.log.log('fieldLabel ==> ',fieldLabel);

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
                                    sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: false, referenceCount: 0, sffieldName: fieldName, sffieldlabel: fieldLabel, sffieldType: fieldType, sfrelationName: '', sfreferenceObj: '', sfparentFieldName: '' };
                                }
                            }
                        });
                        this.sfFieldsSelObj = sfFieldsSelObjtemp;
                    }
                    if (isRefField) {
                        this.isReferenceField = true;
                        this.inProgress = true;
                        let RefrenceFieldListLength = 0;
                        sObjExternalIdFieldsList({ sobjectName: referenceObj }).then(result => {
                            this.inProgress = false;
                            this.RefrenceFieldList = result;
                            RefrenceFieldListLength= this.RefrenceFieldList.length;
                            if(RefrenceFieldListLength > 0){
                                this.isSFReferenceObjNotNull = true;
                            }else{
                                this.isSFReferenceObjNotNull = false;
                            }
                            ////console.log.log('this.RefrenceFieldList ==>',RefrenceFieldListLength);
                            ////console.log.log('RefrenceFieldList >>' + JSON.stringify(this.RefrenceFieldList));
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
            ////console.log.log('in exc',ex.message);
        }

        
    }

    async openSfFieldSelectionPopup(event) {
        ////console.log.log('openSfFieldSelectionPopup Called');
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
        if (this.QbToSfConfigDataList) {
            try {
                this.QbToSfConfigDataList.forEach(element => {
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
                                                this.isSFReferenceObjNotNull = true;
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
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = element.fieldsJson;
                    if (!fieldsJsonListTemp) {
                        fieldsJsonListTemp = [];
                    }
                    fieldsJsonListTemp = [...fieldsJsonListTemp, { Name: fldConfigId, hic_qbmadeasy__Data_Mapping_Type__c: 'fieldMapping', hic_qbmadeasy__Constant__c: false, hic_qbmadeasy__isRelatedMap__c: false, hic_qbmadeasy__Referenced_Mapping__c: false, hic_qbmadeasy__SF_Field__c: '', hic_qbmadeasy__SFChildRelationshipName__c: '', hic_qbmadeasy__Quickbook_Field__c: '', hic_qbmadeasy__Quickbook_Field_Type__c: '' }];
                    eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }
    }
    addSFToqbConfigRow() {
        this.QbToSfConfigDataList = [...this.QbToSfConfigDataList, { Name: this.getRandomString(18), hic_qbmadeasy__SF_Entity__c: '', hic_qbmadeasy__QB_Entity__c: '', hic_qbmadeasy__FieldsMappingData__c: '', hic_qbmadeasy__DataMappingDirection__c: 'qb to SF', fieldsJson: new Array(), qbtypeFieldsList: new Array(), childSobjList: new Array(), newRow: true }];
        this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
    }

    expandCollapseFunction(event) {
        try {
            ////console.log.log('QbToSfConfigDataList line 1020', JSON.stringify(this.QbToSfConfigDataList));
            let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.dataset.objconfigid;
            let SwitchAction = event.currentTarget.dataset.switchto;

            let configId = event.currentTarget.dataset.configid;
            let index = event.currentTarget.dataset.index;

            let QbToSfConfigDataListTemp = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
            ////console.log.log('QbToSfConfigDataListTemp line 1020', JSON.stringify(QbToSfConfigDataListTemp));
            //////console.log.log('this.sfFieldsSelObj 123 ===> '+ JSON.stringify(this.sfFieldsSelObj));
            let vm = this;

            if (configId && configId != null && QbToSfConfigDataListTemp[index].fieldsJson == undefined) {
                QbToSfConfigDataListTemp[index].showSpinner = true;
                vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                QbToSfConfigDataListTemp = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                vm.showSpinner = true;

                fetchSfToqbConfigDataById({ 'Id': configId }).then(function (result) {
                    ////console.log.log('fetch by id');
                    QbToSfConfigDataListTemp[index].qbtypeFieldsList = result.qbtypeFieldsList;
                    QbToSfConfigDataListTemp[index].qbtypeTableList = result.qbtypeTableList;
                    QbToSfConfigDataListTemp[index].childSobjList = result.childSobjList;
                    let fieldsJson = [];
                    if (result.fieldsJson != null) {


                        result.fieldsJson.forEach(elementT => {

                            if (elementT.hic_qbmadeasy__RelatedDataValues__c != null) {

                                let tempElement = { ...elementT, 'hic_qbmadeasy__RelatedDataValues__c': JSON.parse(elementT.hic_qbmadeasy__RelatedDataValues__c) };
                                tempElement = { ...tempElement, 'hic_qbmadeasy__FieldsMappingData__c': JSON.parse(elementT.hic_qbmadeasy__FieldsMappingData__c) };

                                //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': true , 'isDateTime': false, 'isTime':false };

                                tempElement = { ...tempElement, 'hic_qbmadeasy__FieldsMappingData__c': JSON.parse(elementT.hic_qbmadeasy__FieldsMappingData__c) };


                                fieldsJson.push(tempElement);
                            } else {
                                let temp = {...elementT};
                                if(elementT.hic_qbmadeasy__SF_Field_Data_Type__c == 'DATE'){
                                    temp = {...elementT, 'isDate': true , 'isDateTime': false, 'isTime':false};
                                }else if(elementT.hic_qbmadeasy__SF_Field_Data_Type__c == 'DATETIME'){
                                    temp = {...elementT, 'isDate': false , 'isDateTime': true, 'isTime':false};
                                }else if(elementT.hic_qbmadeasy__SF_Field_Data_Type__c == 'TIME'){
                                    temp = {...elementT, 'isDate': false , 'isDateTime': false, 'isTime':true};
                                }else{
                                    temp = {...elementT, 'isDate': false , 'isDateTime': false, 'isTime':false}
                                }
                                //fieldsJson.push(elementT)
                                fieldsJson.push(temp)
                            }
                        });
                    }
                    ////console.log.log('fieldsJson ===> '+ JSON.stringify(fieldsJson));
                    //////console.log.log('this.sfFieldsSelObj 123 ===> '+ JSON.stringify(vm.sfFieldsSelObj));
                    QbToSfConfigDataListTemp[index].fieldsJson = fieldsJson;
                    QbToSfConfigDataListTemp[index].showSpinner = false;
                    ////console.log.log(QbToSfConfigDataListTemp)
                    QbToSfConfigDataListTemp[index].expanded = true;
                    QbToSfConfigDataListTemp[index].showSpinner = false;
                    vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                    let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                    let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                    let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                    let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                    let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                    if (vm.QbToSfConfigDataList) {
                        vm.QbToSfConfigDataList.forEach(function (element) {
                            if (element.Name === objConfigId) {
                                ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                                ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                                entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                            }
                        });
                    }
                });

            } else {
                let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                let ExpandExpandOrCollapseIcon = entitySelectRow.querySelector(`.add-collapse-icon`);
                ExpandExpandOrCollapseIcon.iconName = ExpandExpandOrCollapseIcon.iconName=='utility:add'? 'utility:dash' :'utility:add';
                if (vm.QbToSfConfigDataList) {
                    vm.QbToSfConfigDataList.forEach(function (element) {
                        if (element.Name === objConfigId) {
                            ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                            ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                            entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                        }
                    });
                }
                QbToSfConfigDataListTemp[index].showSpinner = true;
                vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                QbToSfConfigDataListTemp = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                vm.showSpinner = true;
                fetchQBEntityFields({ 'contractType': QbToSfConfigDataListTemp[index].hic_qbmadeasy__QB_Entity__c }).then(function (result) {
                    let qbTypeList = [];
                    let qtbTableList = [];
                    for (var key in result) {
                        if (result[key].type != 'Table') {
                            let qbtypeFieldObj = {};
                            qbtypeFieldObj.label = result[key].label;
                            qbtypeFieldObj.value = result[key].value;
                            qbtypeFieldObj.type = result[key].type;
                            qbtypeFieldObj.required = result[key].required;
                            qbtypeFieldObj.dataType = result[key].dataType;
                            qbTypeList.push(qbtypeFieldObj);

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
                        vm.QbToSfConfigDataList[index].qbtypeFieldsList = qbTypeList;
                        vm.QbToSfConfigDataList[index].qbtypeTableList = qtbTableList;
                    }
                });
                vm.QbToSfConfigDataList[index].expanded = true;
                vm.QbToSfConfigDataList[index].showSpinner = false;

                

            }

            ////console.log.log('QbToSfConfigDataList line 1021', JSON.stringify(this.QbToSfConfigDataList));
        } catch (e) {
            ////console.log.log('line 11105');
            ////console.log.log(JSON.stringify(e));
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

    /*get isSFReferenceObjNotNull() {
        return (this.sfFieldsSelObj && this.sfFieldsSelObj.sfreferenceObj && this.sfFieldsSelObj.sfreferenceObj != '' ? true : false);
    }*/

    get isSFReferenceObj2NotNull() {
        return (this.sfFieldsSelObj && this.sfFieldsSelObj.sfreferenceObj2 && this.sfFieldsSelObj.sfreferenceObj2 != '' ? true : false);
    }
}