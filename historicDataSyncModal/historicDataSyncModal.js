import { LightningElement,track,wire,api } from 'lwc';
import getNameSpace from "@salesforce/apex/Qb_ConfigController.getNameSpace";
import fetchSfToqbConfigData from "@salesforce/apex/Qb_ConfigController.getExistingQbTosfHistoricalConfigData";
import sObjSelectionList from "@salesforce/apex/Qb_ConfigController.getSObjectSelectList";
import QbObjectTypeList from "@salesforce/apex/Qb_ConfigController.getqbObjectTypeSelection";
import fetchSfToqbConfigDataById from '@salesforce/apex/Qb_ConfigController.getExistingQBTosfConfigDataById';
import fetchQBEntityFields from "@salesforce/apex/Qb_ConfigController.fetchQBEntityFields";
import createRequiredField from "@salesforce/apex/QB_MetadataUtilityController.createRequiredField";
import createRequiredFieldRelated from "@salesforce/apex/QB_MetadataUtilityController.createRequiredFieldRelated";
import saveQbToSfConfigData from "@salesforce/apex/Qb_ConfigController.saveQBTosfMapConfigData";
import sObjFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllFields";
import sObjExternalIdFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllExternalIdFields";
import RelatedEntitiesList from "@salesforce/apex/Qb_ConfigController.fetchAllRelatedEntitiesForqbToSF";
import sendDataToHistoricalBatch from "@salesforce/apex/QB_sfSendDataToHistoricalBatchClass.sendDataToHistorical";
import HIC_GIF from '@salesforce/resourceUrl/PageLoadingGif';


import QB_Object_Level_Errors from '@salesforce/label/c.QB_Object_Level_Errors';
import QB_Blank_Fields_Mapping from '@salesforce/label/c.QB_Blank_Fields_Mapping';
import QB_Blank_Related_Fields_Mapping from '@salesforce/label/c.QB_Blank_Related_Fields_Mapping';
import QB_Duplicate_Mapping_For_Related_Modal from '@salesforce/label/c.QB_Duplicate_Mapping_For_Related_Modal';
import jsonData from '@salesforce/resourceUrl/Default_Mapping';







export default class historicDataSyncModal extends LightningElement {
    
    hicGIF = HIC_GIF;
    @api realmid;
    @track selectedSObjectTypeOption;
    @track qbOptions = new Array();
    @track QuickbookOptionsList = new Array();
    @track isSfqbConfigNotEmpty = false;
    @track showSpinner = false;
    @track QbToSfConfigDataListBeforeDefault = new Array();
    @track QbToSfConfigDataList = new Array();
    @track sObjectOptions = new Array();
    @track showGenericSpinner = false;
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
    //@track contractTypeFieldList = new Array();    
    //@track fieldMappingList = new Array();
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
    @track SFOperationOptionsList = new Array();
    @track SFReferenceFieldOptionsList = new Array();
    @track QbToSfDefaultData = new Array();
    isBlankMappingFound = false;
    blankObjectMappingName = '';
    isLoaded=false;
    @track tagChecked = false;
    showModal = false;
    showModalDefault = false;
    @api isHistoricalClose;
    @track load = false; 
    @track QbToSfNonDefualtList = new Array();
    // this will hold the matching rules 
    @track matchingRuleConditions;
    // this will hold the sf object field for which the matching rule modal is opened
    @track availableSfFieldsListForRule = [];
    //this will hold the qb object field for which the matching rule modal is opened
    @track availableQbFieldsListForRule = [];
    //boolean variable to hide and show matching rule modal
    @track showMatchingRuleModal = false;
    //this variable will hold the MatchingOperator options
    @track matchingOperatorOptions = [
        {
            label: 'Equals',
            value: 'equals'
        },
        {
            label: 'Starts With',
            value: 'startsWith'
        },
        {
            label: 'Ends With',
            value: 'endsWith'
        }
    ];
    //this variable will hold the caseSensitivityType options
    @track caseSensitivityTypeOptions = [
        {
            label:'Case Sensitive',
            value:'caseSensitive'
        },
        {
            label:'Case Insensitive',
            value:"caseInsensitive"
        }
    ];
    //this variable will hold the conditionLogic options
    @track conditionLogicOptions = [
        {
            label:'AND',
            value:'AND'
        },
        {
            label: 'OR',
            value: 'OR'
        }
    ]
    //this variable will hold the qbObject for which matching rule modal is opened
    @track qbObjectForMatchingRule;

    //this variable will hold the sfObject for which matching rule modal is opened
    @track sfObjectForMatchingRule;
    //this variable will hold the index for the current qb config
    @track currentQbConfigIndex;
    //this variable will hold the conditionLogic for the ui
    @track mainConditionLogicForMatchingRule = 'AND';




    DragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.objindex);
    }

    DragOver(event) {
    event.preventDefault();
    
    }

    Drop(event) {
    // Get the data of the dragged element
    const draggedIndex = event.dataTransfer.getData('text/plain');
    const droppedIndex = event.currentTarget.dataset.objindex;

    // Perform the necessary actions to change the position of the rows
    // You can update the data or re-order the array used in the iteration

    // Example: Re-order the array based on the dropped position
    const draggedItem = this.QbToSfConfigDataList[draggedIndex];
    this.QbToSfConfigDataList.splice(draggedIndex, 1);
    this.QbToSfConfigDataList.splice(droppedIndex, 0, draggedItem);
    }

    @api
    callingHistoricData(realmID){
        //////console.log('realmID',realmID);
        //////console.log('realmq2',this.realmid);
        this.tagChecked = false;
        this.template.querySelector('.slds-form-element').checked = false;
        //////console.log('Tempalate Query Selector1',this.template.querySelector('.slds-form-element'));
        this.QbToSfConfigDataListBeforeDefault = [];
        this.deleteId = [];
        this.load = true;
        this.realmid = realmID;
        this.openDefaultPopup();
        fetchSfToqbConfigData({
            'companyId' : this.realmid
        })
        .then(resp => {
            this.isLoaded = true;
            // //////console.log('called>>>fetchSfToqbConfigData55');
            // //////console.log(JSON.stringify(resp));
        

            // //////console.log('SfToqbConfigData response data', JSON.stringify(resp));
            // //////console.log(JSON.stringify(resp));
            let tempArray = []
            if (resp && resp.length > 0) {
                resp.forEach(obj => {
                    let tempObj = {};
                    tempObj = { ...obj };
                    tempObj.qbReferenceFieldDisabled = obj.hic_qbmadeasy__QB_Operation__c == 'Insert' ? true : false;
                    tempArray.push(tempObj)
                });
            }
            this.QbToSfConfigDataList = tempArray;
            ////console.log('SfToqbConfigData response data3', JSON.stringify(this.QbToSfConfigDataList ));
            this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
            if (this.QbToSfConfigDataList.length <= 0) {
                this.loadingMessage = 'No data';
            }
            this.isLoaded  = false;
        

        })
        this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
        //////console.log('this realmId',this.realmid );
    }
    
    @api show() {
        this.showModal = true;
    }
    handleDialogClose() {
        this.ishistoricalClose = false;
        this.showModal = false;
        const selectedEvent = new CustomEvent("ishistoricalclosechange", {
            detail: this.isHistoricalClose 
          });
        this.dispatchEvent(selectedEvent);
    }
    sendDataToHistorical(processId){
        let vm = this;
        sendDataToHistoricalBatch({ 'quickBookProcesssId': processId})
        .then(function (result) {
            //////console.log('result22=>', JSON.stringify(result));
            vm.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Sync Process has started',
                message: 'Batch Job id is:' + result ,
                variant: 'success',
                autoclose: false,
            });
            processId='';
            

            /*if(result != null){
                jobId = result;
            }*/
        })
        .catch(error => {
            //////console.log('in error',error.message)
        })
    }
    syncDataHandler(event){
        let processId = event.currentTarget.dataset.configid;
        //////console.log('in sync9',processId);
        let jobId;
        let vm = this;
        if(processId){
            //////console.log('in send data to historical',processId);
            this.sendDataToHistorical(processId);
            
            
        }
        else{
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error occured',
                message: 'Id is blank.First save the mappings.',
                variant: 'error',
                autoclose: false,
            });
        }

    }

    //This method will be useful for showing the matching rule modal
    // async configureMatchingRuleModal(event) {
    //     try {

    //         this.showGenericSpinner = true;

    //         ////console.log(JSON.stringify(event.target.dataset.matchingruleconditions), 'Data of QbToSfConfigDataList>>');
    
    //         this.currentQbConfigIndex = parseInt(event.target.dataset.index);

    //         this.sfObjectForMatchingRule = event.target.dataset.sfobject;

    //         this.qbObjectForMatchingRule = event.target.dataset.qbobject;

    //         ////console.log(this.qbObjectForMatchingRule,'duplicate rule');
    
    //         if (!event.target.dataset.matchingruleconditions) {
    //             this.matchingRuleConditions = null;
    //         }else{
    //             this.matchingRuleConditions = JSON.parse(event.target.dataset.matchingruleconditions);
    //         }

    //         ////console.log(this.realmid);
    
    //         // Corrected async function declaration
    //         // Fetching QB fields
    //         await fetchQBEntityFields({
    //             'contractType': this.qbObjectForMatchingRule,
    //             'isSfToQb': false,
    //             'companyId': this.realmid
    //         }).then((result) => {
    //             ////console.log('fetchQbEntityFields>>>', JSON.stringify(result));
    //             ////console.log('fetchQb>>');
    //             this.availableQbFieldsListForRule = result.map(field => ({
    //                 label: field.label, // Use the 'label' property as label
    //                 value: field.value   // Use the same 'value' property as value
    //             }));
    //         });

    //         // Fetching sObjectsFields
    //         //////console.log(event.currentTarget.dataset.sfobject);
    //         await sObjFieldsList({ sobjectName:  this.sfObjectForMatchingRule}).then((result) => {
    //             ////console.log('sObjectfetch>>', result);
    //             this.availableSfFieldsListForRule = result.filter(field => field.type !== "REFERENCE") // Exclude objects with 'REFERENCE' type
    //                 .map(field => ({
    //                     label: field.label, // Extract label
    //                     value: field.value  // Extract value
    //                 }));

    //             ////console.log('Ready sf fields', JSON.stringify(this.availableSfFieldsListForRule));
    //         });

    //         this.showGenericSpinner = false;

    //         this.showMatchingRuleModal = true;
    
    //     } catch (Exception) {
    //         ////console.log('Error Occurred in configureMatchingRuleModal', Exception.message);
    //     }
    // }

    //This method will be useful for showing the matching rule modal
    async configureMatchingRuleModal(event) {
        try {

            this.sfObjectForMatchingRule = event.target.dataset.sfobject;

            this.qbObjectForMatchingRule = event.target.dataset.qbobject;

            this.mainConditionLogicForMatchingRule = 'AND';

            if(!this.sfObjectForMatchingRule || !this.qbObjectForMatchingRule){
                this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                    title: 'Matching rules cannot be created. Please select both Salesforce (SF) and QuickBooks (QB) object mappings first.',
                    variant: 'error',
                    autoclose: true,
                });
                return;
            }


            this.showGenericSpinner = true;

            ////console.log(JSON.stringify(event.target.dataset.matchingruleconditions), 'Data of QbToSfConfigDataList>>');
    
            this.currentQbConfigIndex = parseInt(event.target.dataset.index);

            ////console.log(this.qbObjectForMatchingRule,'duplicate rule');
    
            if (!event.target.dataset.matchingruleconditions) {
                this.matchingRuleConditions = null;
            }else{
                this.matchingRuleConditions = JSON.parse(event.target.dataset.matchingruleconditions);
                if(this.matchingRuleConditions != null){
                    if(this.matchingRuleConditions[0].ConditionLogic){
                        this.mainConditionLogicForMatchingRule = this.matchingRuleConditions[0].ConditionLogic;
                    }
                }
                ////console.log(this.matchingRuleConditions,'hello this line 285');
            }

            ////console.log(this.realmid);
    
            // Corrected async function declaration
            // Fetching QB fields
            await fetchQBEntityFields({
                'contractType': this.qbObjectForMatchingRule,
                'isSfToQb': false,
                'companyId': this.realmid
            }).then((result) => {
                ////console.log('fetchQbEntityFields>>>', JSON.stringify(result));
                ////console.log('fetchQb>>');
                this.availableQbFieldsListForRule = result.map(field => ({
                    label: field.label, // Use the 'label' property as label
                    value: field.value   // Use the same 'value' property as value
                }));
                this.availableQbFieldsListForRule = [...this.availableQbFieldsListForRule].sort((a, b) => {
                    // Sort alphabetically by the 'label' property
                    return a.label.localeCompare(b.label);
                });
            });

            // Fetching sObjectsFields
            //////console.log(event.currentTarget.dataset.sfobject);
            await sObjFieldsList({ sobjectName:  this.sfObjectForMatchingRule}).then((result) => {
                ////console.log('sObjectfetch>>', result);
                this.availableSfFieldsListForRule = result.filter(field => field.type !== "REFERENCE") // Exclude objects with 'REFERENCE' type
                    .map(field => ({
                        label: field.label, // Extract label
                        value: field.value  // Extract value
                    }));
                this.availableSfFieldsListForRule = [...this.availableSfFieldsListForRule].sort((a, b) => {
                    // Sort alphabetically by the 'label' property
                    return a.label.localeCompare(b.label);
                });
                ////console.log('Ready sf fields', JSON.stringify(this.availableSfFieldsListForRule));
            });

            this.showGenericSpinner = false;

            this.showMatchingRuleModal = true;
    
        } catch (Exception) {
            ////console.log('Error Occurred in configureMatchingRuleModal', Exception.message);
        }
    }
    


    //handle matching rule row add 
    // handleMatchingRuleRowAdd(event){
    //     try{
    //         const newElement = {
    //             "QBFieldApiName": "",
    //             "QBFieldLabel": "",
    //             "SalesforceFieldApiName": "",
    //             "SalesforceFieldLabel": "",
    //             "MatchingOperator": "",
    //             "ConditionLogic": "",
    //             "SalesforceObject": this.sfObjectForMatchingRule,
    //         };
    //         this.matchingRuleConditions = [
    //             ...this.matchingRuleConditions.slice(0, this.matchingRuleConditions.length - 1),  // Keep all but the last item
    //             { ...this.matchingRuleConditions[this.matchingRuleConditions.length - 1], ConditionLogic: this.mainConditionLogicForMatchingRule }, // Update the last item's ConditionLogic
    //             newElement // Add the new element
    //         ];           
    //         ////console.log(JSON.stringify(this.matchingRuleConditions));
    //     }catch(Exception){
    //         ////console.log('handleMatchingRuleRowAdd',Exception.message);
    //     }
    // }
    //handle matching rule row add 
    handleMatchingRuleRowAdd(event){
        try{
            const newElement = {
                "QBFieldApiName": "",
                "QBFieldLabel": "",
                "SalesforceFieldApiName": "",
                "SalesforceFieldLabel": "",
                "MatchingOperator": "",
                "ConditionLogic": "",
                "ConditionLogicForBackend":"",
                "SalesforceObject": this.sfObjectForMatchingRule,
            };
            this.matchingRuleConditions = [
                ...this.matchingRuleConditions.slice(0, this.matchingRuleConditions.length - 1),  // Keep all but the last item
                { ...this.matchingRuleConditions[this.matchingRuleConditions.length - 1], ConditionLogic: this.mainConditionLogicForMatchingRule }, // Update the last item's ConditionLogic
                newElement // Add the new element
            ];           
            ////console.log(JSON.stringify(this.matchingRuleConditions));
        }catch(Exception){
            ////console.log('handleMatchingRuleRowAdd',Exception.message);
        }
    }







    //Method to close the matching rule modal
    closeMatchingRuleModal(){
        this.showMatchingRuleModal = false;
    }


    
    @wire(sObjSelectionList) SobjSelList(resp) {
        let vm = this;
        if (resp.data) {
            //////console.log('in sobj11',JSON.stringify(resp.data));
            vm.inProgress = true;
            this.sObjectOptions = resp.data;
            this.error = undefined;
            vm.inProgress = false;
            //////console.log('in sobj1');
        } else if (resp.error) {
            //////console.log('in sobj2');
            vm.inProgress = true;
            this.error = resp.error;
            this.sObjectOptions = undefined;
            vm.inProgress = false;
            //////console.log('in sobj2');
        }
    }

    @wire(QbObjectTypeList) ObjectTypeToSelList(resp) {
        //////console.log('QbObjectTypeOptionsList4')
        //////console.log(resp)

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

    // handleClick(event){
    //     try{
    //         if(event.target.dataset.buttonname == 'getstartedbutton'){
    //             this.matchingRuleConditions = 	
    //             [
    //                 {
    //                   "QBFieldApiName": "",
    //                   "QBFieldLabel":"",
    //                   "SalesforceFieldApiName": "",
    //                   "SalesforceFieldLabel": "",
    //                   "MatchingOperator": "",
    //                   "ConditionLogic": "",
    //                   "SalesforceObject": this.sfObjectForMatchingRule,
    //                 }
    //             ]
    //         }
    //     }catch(Exception){
    //         ////console.log('Exception occurred in handleClick',Exception.message);
    //     }
    // }

    handleClick(event){
        try{
            if(event.target.dataset.buttonname == 'getstartedbutton'){
                this.matchingRuleConditions =
                [
                    {
                      "QBFieldApiName": "",
                      "QBFieldLabel":"",
                      "SalesforceFieldApiName": "",
                      "SalesforceFieldLabel": "",
                      "MatchingOperator": "",
                      "ConditionLogic": "",
                      "ConditionLogicForBackend":"",
                      "SalesforceObject": this.sfObjectForMatchingRule,
                    }
                ]
            }
        }catch(Exception){
            ////console.log('Exception occurred in handleClick',Exception.message);
        }
    }






    // handleChange(event){
    //     const numericIndex = parseInt(event.target.dataset.index);
    //     try{
    //         if(event.target.dataset.inputname == 'qbfieldname'){
    //             ////console.log(event.detail.value);
    //             // Map the selected value directly to the label
    //             const selectedOption = this.availableQbFieldsListForRule.find(option => option.value === event.detail.value);
    //             let selectedLabel = selectedOption ? selectedOption.label : '';
    //             ////console.log(selectedLabel);
    //             this.matchingRuleConditions[numericIndex].QBFieldApiName = event.target.value;
    //             this.matchingRuleConditions[numericIndex].QBFieldLabel = selectedLabel;
    //         }else if(event.target.dataset.inputname == 'operator'){
    //             this.matchingRuleConditions[numericIndex].MatchingOperator = event.target.value;
    //         }else if(event.target.dataset.inputname == 'sffieldname'){
    //             const selectedOption = this.availableSfFieldsListForRule.find(option => option.value === event.detail.value);
    //             let selectedLabel = selectedOption ? selectedOption.label : '';
    //             ////console.log(selectedLabel);
    //             this.matchingRuleConditions[numericIndex].SalesforceFieldApiName = event.target.value;
    //             this.matchingRuleConditions[numericIndex].SalesforceFieldLabel = selectedLabel;
    //         }else if(event.target.dataset.inputname == 'logic'){
    //             this.mainConditionLogicForMatchingRule = event.target.value;
    //             ////console.log('maincondition',this.mainConditionLogicForMatchingRule);
    //             this.matchingRuleConditions = this.matchingRuleConditions.map(item => {
    //                     if(item.ConditionLogic != '' && item.ConditionLogic != null){
    //                         item.ConditionLogic = this.mainConditionLogicForMatchingRule;
    //                     }
    //                     return item;
    //             });
    //         }
    //         // this.matchingRuleConditions[numericIndex].SalesforceObject = this.sfObjectForMatchingRule;
    //     }catch(Exception){
    //         ////console.log('Error occurred in handleChange',Exception.message);
    //     }
    // }

    handleChange(event){
        const numericIndex = parseInt(event.target.dataset.index);
        try{
            if(event.target.dataset.inputname == 'qbfieldname'){
                ////console.log(event.detail.value);
                // Map the selected value directly to the label
                const selectedOption = this.availableQbFieldsListForRule.find(option => option.value === event.detail.value);
                let selectedLabel = selectedOption ? selectedOption.label : '';
                ////console.log(selectedLabel);
                this.matchingRuleConditions[numericIndex].QBFieldApiName = event.target.value;
                this.matchingRuleConditions[numericIndex].QBFieldLabel = selectedLabel;
            }else if(event.target.dataset.inputname == 'operator'){
                this.matchingRuleConditions[numericIndex].MatchingOperator = event.target.value;
            }else if(event.target.dataset.inputname == 'sffieldname'){
                const selectedOption = this.availableSfFieldsListForRule.find(option => option.value === event.detail.value);
                let selectedLabel = selectedOption ? selectedOption.label : '';
                ////console.log(selectedLabel);
                this.matchingRuleConditions[numericIndex].SalesforceFieldApiName = event.target.value;
                this.matchingRuleConditions[numericIndex].SalesforceFieldLabel = selectedLabel;
            }else if(event.target.dataset.inputname == 'logic'){
                this.mainConditionLogicForMatchingRule = event.target.value;
                ////console.log('maincondition',this.mainConditionLogicForMatchingRule);
                this.matchingRuleConditions = this.matchingRuleConditions.map(item => {
                        if(item.ConditionLogic != '' && item.ConditionLogic != null){
                            item.ConditionLogic = this.mainConditionLogicForMatchingRule;
                        }
                        return item;
                });
            }
            this.matchingRuleConditions[numericIndex].SalesforceObject = this.sfObjectForMatchingRule;
        }catch(Exception){
            ////console.log('Error occurred in handleChange',Exception.message);
        }
    }










    handlechangeToggle(event){
        try{
             
            //////console.log('Tempalate Query Selector',this.template.querySelector('.slds-form-element'));
            this.isSfqbConfigNotEmpty = true;
            
            
             if(event.detail.checked){
                if(this.QbToSfConfigDataList.length>0){
                    this.QbToSfConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                    //////console.log('in if this.QbToSfConfigDataList',JSON.stringify(this.QbToSfNonDefualtList));
                    //this.QbToSfNonDefualtList = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                    
                    //////console.log('in if this.QbToSfConfigDataList',JSON.stringify(this.QbToSfNonDefualtList));
                    this.QbToSfDefaultData.forEach(obj => {
                        let defaultData = obj;
                        //////console.log('in this.QbToSfDefaultData.forEach json',JSON.stringify(obj));
                        let existingObj = this.QbToSfConfigDataList.find(item => item.hic_qbmadeasy__SF_Entity__c === defaultData.hic_qbmadeasy__SF_Entity__c && item.hic_qbmadeasy__QB_Entity__c === defaultData.hic_qbmadeasy__QB_Entity__c );
                    
                        
                        //////console.log('in existingobj json',JSON.stringify(existingObj));
                        if (existingObj) {
                            defaultData.Name = existingObj.Name;
                            //////console.log('in existing if');
                            if(existingObj.Id){
                                //////console.log('in existing if'+existingObj.Id);
                                if (!this.deleteId.includes(existingObj.Id)) {
                                    this.deleteId.push(existingObj.Id);
                                }
                                
                            }
                            
                            
                            this.QbToSfConfigDataList[this.QbToSfConfigDataList.indexOf(existingObj)] = defaultData;
                            //////console.log('this.QbToSfConfigDataList5>>>',JSON.stringify(this.QbToSfConfigDataList));
                            //this.QbToSfConfigDataList[this.QbToSfConfigDataList.indexOf(existingObj)].Id = existingObj.Id;
                        } else {
                            //////console.log('in existing else');
                            this.QbToSfConfigDataList.push(defaultData);
                        }
                    });
                }
                else{
                    //////console.log('in qb to sf default data');
                    this.QbToSfConfigDataList =  JSON.parse(JSON.stringify(this.QbToSfDefaultData));
                }

            }
            else{
                //////console.log('in else handlechagnetoggle',JSON.stringify(this.QbToSfNonDefualtList));
                this.QbToSfConfigDataList =  JSON.parse(JSON.stringify(this.QbToSfConfigDataListBeforeDefault));
            }
            //////console.log('deletedId2'+this.deleteId);
        }
        catch(ex){
            //////console.log('in handle change err',ex.message);
        }
        
       

    }
   

    

    getSFOperationList() {
        var SFOperationOptionsList = [
            { label: '--None--', value: '--None--' },
            { label: 'Insert', value: 'Insert' },
            { label: 'Update', value: 'Update' },
            { label: 'Upsert', value: 'Upsert' }
        ];
        this.SFOperationOptionsList = SFOperationOptionsList;
    }

    getSFReferenceList() {
        var SFReferenceFieldOptionsList = [
            { label: '--None--', value: '--None--' }
        ];
        this.SFReferenceFieldOptionsList = SFReferenceFieldOptionsList;
    }
    

    

    connectedCallback() {

        //////console.log('in connected qbtosf909',this.QbToSfConfigDataList.length);
        
       
        //////console.log('realmid',this.realmid);
        let vm = this;
        this.getSFOperationList();
        this.getSFReferenceList();
        this.createRequiredFieldForDefault();

        this.MappingTypeOptions = [{ label: 'Field Mapping', value: 'fieldMapping' },
        { label: 'Related Data Mapping', value: 'relatedDataMapping' }];
       
        
        //////console.log("is ont empty2", this.isSfqbConfigNotEmpty);
        
        
        
    }

    createRequiredFieldForDefault(){
        let sobjectApiNameList = ['Account', 'Opportunity','Product2','hic_qbmadeasy__Quickbooks_Account__c','PricebookEntry'];

        if (sobjectApiNameList.length > 0) {
            createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
                ////console.log('result on creating field', result)
            })
            .catch(error => {
                ////console.log('error at creating field==>', error);
            })
        }
    }

    renderedCallback() {
        ////console.log('renderCallbakc:',)
        this.template.querySelectorAll('.auto-complete-dropdown-class').forEach(elem => {
            elem.setOptionsAndValues();
        });
        
    }
    showToast(level, fieldName, QB_Entity) {
       
        var message = fieldName + ' ' + QB_Object_Level_Errors;
        //////console.log('Message>>', message);
        if (level == 'Object') {
            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                title: 'Error',
                message: message,
                variant: 'error',
                autoclose: false,
            });
        }
        else if (level == 'Field') {
            
                //////console.log('fieldName>>', fieldName);
                if (fieldName == '') {
                    //////console.log('isBlankMappingFound_Line_228', this.isBlankMappingFound);
                    this.isBlankMappingFound = true;
                }
                /*else if (fieldName == '') {
                    //////console.log('QB_Customer_Object_Validation_Error>>', QB_Customer_Object_Validation_Error);
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Error',
                        message: QB_Customer_Object_Validation_Error,
                        variant: 'error',
                        autoclose: false,
                    });
                }*/
            
        }
        
    }

    validateMappingOnObjectLevel() {
        var level = 'Object';
        var QB_Entity = '';
        //////console.log('Insert_validateMappingOnObjectLevel2', this.QbToSfConfigDataList);
        for (var element of this.QbToSfConfigDataList) {
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

        for (var element of this.QbToSfConfigDataList) {
            let mapForEachInstance = {};
            let availableReqField = [];
            ////console.log('element>>>',JSON.stringify(element));
            /*if (element.hic_qbmadeasy__QB_Entity__c && element.qbtypeFieldsList) {
                let requiredFieldList = [];
                element.qbtypeFieldsList.forEach(reqField => {
                    if (reqField && reqField.required == 'true') {
                        requiredFieldList.push(reqField.value);
                    }
                });
                mapForEachInstance[element.hic_qbmadeasy__QB_Entity__c] = requiredFieldList;
            }*/

            if(element.hic_qbmadeasy__SF_Entity__c){
                if (element.fieldsJson && element.fieldsJson.length == 0) {
                    isError = true;
                }
                else if (element.fieldsJson && element.fieldsJson.length > 0) {
                    let tempArray = [];
                    element.fieldsJson.forEach(fieldEle => {
                        tempArray.push(fieldEle.hic_qbmadeasy__SF_Field__c)
                    });
                    //////console.log('temp Array==>', JSON.stringify(tempArray));

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
            message: QB_Blank_Fields_Mapping,
            variant: 'error',
            autoclose: false,
        });
        if (isRelatedMap) {
            this.template.querySelector('c-qb_-qb-to-sf-rel-fields-mapping-comp').hightlightBlankFields({});
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
        //////console.log('checkField_Called');
        this.template.querySelectorAll('tr.validate-field-row').forEach(function (eachRow) {
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                eachColumn.classList.remove('slds-has-error');
            });
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                //////console.log('eachColumn >> ', eachColumn.value);
                if (eachColumn.value == '' || eachColumn.value == undefined || /^\s/.test(eachColumn.value)) {
                    eachColumn.classList.add('slds-has-error');
                }
            });
        });
        //////console.log('checkField_Called 490');
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
        //////console.log('Inside_validateRelatedDataMapping');
        for (var element of this.QbToSfConfigDataList) {
            //////console.log('Inside_First_Loop');
            if (element.fieldsJson != undefined) {
                for (var fldElement of element.fieldsJson) {
                    //////console.log('Inside_Second_Loop');
                    if (fldElement.hic_qbmadeasy__Data_Mapping_Type__c != '' && fldElement.hic_qbmadeasy__Data_Mapping_Type__c == 'relatedDataMapping' && fldElement.hic_qbmadeasy__FieldsMappingData__c.length == 0) {
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


    showToastForBlankMapping() {
        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
            title: 'Error',
            message: 'No mapping found for the highlighted Row.',
            variant: 'error',
            autoclose: false,
        });

        var arrayOfBlankObjectMappingName = [];
        //////console.log('QbToSfConfigDataList_Line_372', JSON.stringify(this.QbToSfConfigDataList));

        for (var element of this.QbToSfConfigDataList) {
            if (element.fieldsJson != undefined && element.fieldsJson.length == 0) {
                //////console.log('In_If');
                // this.blankObjectMappingName = element.hic_qbmadeasy__SF_Entity__c + '-' + element.hic_qbmadeasy__QB_Entity__c + '-' + element.hic_qbmadeasy__QB_Operation__c; Commented By Sameer 15_11_2022
                this.blankObjectMappingName = element.hic_qbmadeasy__SF_Entity__c + '-' + element.hic_qbmadeasy__QB_Entity__c; 
                arrayOfBlankObjectMappingName.push(this.blankObjectMappingName);
                this.blankObjectMappingName = '';
            }
        }

        for (var eachRow of this.template.querySelectorAll('tr.validate-tablerow')) {
            //////console.log('Line_380');
            let colValue = '';
            eachRow.querySelectorAll('.validation-check-class').forEach(function (eachColumn) {
                if (colValue === '') {
                    colValue = eachColumn.value;
                } else {
                    colValue = colValue + '-' + eachColumn.value;
                }
            });
            //////console.log('Line_389', colValue);
            if (arrayOfBlankObjectMappingName.includes(colValue)) {
                //////console.log('insert_In_Line_391');
                eachRow.querySelector('.validation-error').setAttribute('style', 'display:block');
                eachRow.querySelector('.validation-error').setAttribute('title', 'Row does not have Field Mapping');

                //////console.log('Exiting_If');
            }
        }
    }
    

    
    saveAllSfToqbConfigData(event) {
        try{
            ////console.log('inside save all2', JSON.stringify(this.QbToSfConfigDataList));
            ////////console.log('inside save', JSON.stringify(this.sfFieldsSelObj));
            let currentName = event.currentTarget.name;
            //////console.log('currentName'+currentName);
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
                        //////console.log('element>>', JSON.stringify(element));
                        //////console.log('colValue>>', JSON.stringify(colValue));
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
                //////console.log('ValidateDataList>>', ValidateDataList);
            });


            //////console.log('IsError1>>', isError);
            this.isBlankMappingFound = false;
            //////console.log('isBlankMappingFound_Line_677', this.isBlankMappingFound);

            if(isError == false){
                //////console.log('IsError1Obj>>', isError);
                isError = this.validateMappingOnObjectLevel();
                //////console.log('IsError1Obj>>', isError);
            }
            //////console.log('IsError2>>', isError);
            //////console.log('isBlankMappingFound_Line_681', this.isBlankMappingFound);

            /* COMMENT */

            if (isError == false) {
                isError = this.checkField();
            }
            //////console.log('IsError3>>', isError);
            //////console.log('isBlankMappingFound_Line_687', this.isBlankMappingFound);

            if (isError == false) {
                //////console.log('IsError1field>>', isError);
                isError = this.validateMappingOnFieldLevel();
                //////console.log('IsError1field>>', isError);
            }
            //////console.log('IsError4>>', isError);
            //////console.log('isBlankMappingFound_Line_693', this.isBlankMappingFound);

            if (isError == false) {
                isError = this.validateRelatedDataMapping();
            }
            
            if (this.isBlankMappingFound == true && isError == true) {
                this.showToastForBlankMapping();
            }

            /* COMMENT */

            if (objectNameNull) {
                this.inProgress = false;
            }
            
            if (isError === false) {
                this.isBlankMappingFound = false;
                this.inProgress = true;
                

                
                this.QbToSfConfigDataList = this.QbToSfConfigDataList.map((item, index) => {
                    return { ...item, hic_qbmadeasy__Historical_Sync_Order__c: index + 1 };
                });
                //////console.log('orderd config list'+JSON.stringify(this.QbToSfConfigDataList));
                
                saveQbToSfConfigData({ SfqbWrapDataList: JSON.stringify(this.QbToSfConfigDataList), deleteId: this.deleteId }).then(result => {
                    //////console.log('result44', result);
                    if (result.success) {
                        //this.QbToSfConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                        //////console.log('In_Success');
                        this.openDefaultPopup();
                        this.deleteId = [];
                        // QbToSfRealtimeDataListFinal = [];
                        //////console.log('In saveQbToSfConfigData 1 success');
                        //////console.log('In saveQbToSfConfigData current name',currentName);
                        if(currentName =='Sync'){
                            this.handleFinishButton();
                        }
                        this.createRequiredField();
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'Success',
                            message: 'Mappings Saved Successfully',
                            variant: 'success',
                            autoclose: true,
                        });

                        if (result.newData) {
                            //////console.log('line 607');
                            //////console.log('In saveQbToSfConfigData 2 newData');
                            this.QbToSfConfigDataList.forEach(function (elem) {
                                result.newData.forEach(function (re) {
                                    if (re.Name === elem.Name) {
                                        delete elem.newRow;
                                        elem.Id = re.Id;
                                        elem.expanded = true;
                                    }
                                });

                            });
                            this.QbToSfConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                        }
                        if (result.hasOwnProperty('newDataMap') && result.newDataMap) {
                            //////console.log('line 620');
                            //////console.log('In saveQbToSfConfigData 3 newDataMap');
                            let QbToSfConfigDataList = new Array();
                            this.QbToSfConfigDataList.forEach(element => {
                                if (element.Id == undefined || element.Id == null) {
                                    if (result.newDataMap.hasOwnProperty(element.Name)) {
                                        //////console.log('hello element')
                                        element['Id'] = result.newDataMap[element.Name];
                                        element['expanded'] = true;
                                        delete element['newRow'];
                                    }
                                }
                                QbToSfConfigDataList.push(element);
                                
                            })
                            this.QbToSfConfigDataList = QbToSfConfigDataList;
                            this.QbToSfConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                            
                            
                        }
                        //this.QbToSfConfigDataListBeforeDefault = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                        
                        this.inProgress = false;
                    } else {
                        //////console.log('In_Else');
                        //////console.log('In saveQbToSfConfigData 4 else');
                        this.deleteId = [];
                        
                        if (this.QbToSfConfigDataList.length == 0) {
                            //////console.log('In saveQbToSfConfigData 5 else in');
                            this.QbToSfConfigDataListBeforeDefault = [];
                            this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                                title: 'Success',
                                message: 'Mappings Saved Successfully',
                                variant: 'success',
                                autoclose: true,
                            });
                        }
                        this.inProgress = false;
                    }
                });
        }

        }
        catch(ex){
            //////console.log('in exception',ex.message)
        }
       

    }
    
    handleFinishButton() {
        // dispatch custom event to call parent method
        //////console.log('in handleButtonClick');
        this.dispatchEvent(new CustomEvent('finishclick',{
            detail:{'QbToSfConfigDataList':this.QbToSfConfigDataList} 
           }));

    }
    

    //method to save the matching rule conditions
    saveMatchingRuleConditions(event){
        try{

            if(this.matchingRuleConditions){
                //checking if any of the checkbox is empty
                for (let record in this.matchingRuleConditions) {
                    if (!this.matchingRuleConditions[record].QBFieldApiName || !this.matchingRuleConditions[record].SalesforceFieldApiName || !this.matchingRuleConditions[record].MatchingOperator) {
                        this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                            title: 'To continue, please ensure that none of the condition fields are left empty.',
                            variant: 'error',
                            autoclose: true,
                        });
                        return; // Stop the function once an empty field is found
                    }
                    this.matchingRuleConditions[record].ConditionLogicForBackend = this.mainConditionLogicForMatchingRule;
                    //console.log('hello');
                }
                //checking if the duplicate row exists
                if(this.hasDuplicateFieldPairs(this.matchingRuleConditions)){
                    this.template.querySelector('c-qb_-custom-toast-comp').showCustomTostMessage({
                        title: 'Duplicate entry detected: The QuickBooks field and Salesforce field combination you are trying to add has already been included.',
                        variant: 'error',
                        autoclose: true,
                    });
                    return;
                }

            }

            this.QbToSfConfigDataList[this.currentQbConfigIndex].hic_qbmadeasy__Matching_Rule_Criteria__c = JSON.stringify(this.matchingRuleConditions);
            this.showMatchingRuleModal = false;
            //console.log('1031 qbToConfigDataList',JSON.stringify(this.QbToSfConfigDataList));
        }catch(Exception){
            console.log('saveMatchingRuleConditions',Exception.message);
        }
    }


    //check if duplicate row exists
    hasDuplicateFieldPairs(list) {
        const seen = new Set();  // A Set to store unique pairs of (QBFieldApiName, SalesforceFieldApiName)
        
        for (let i = 0; i < list.length; i++) {
            const currentObject = list[i];
            const fieldPair = `${currentObject.QBFieldApiName}|${currentObject.SalesforceFieldApiName}`; // Unique key for the pair
            
            if (seen.has(fieldPair)) {
                return true; // Duplicate pair found
            }
            
            seen.add(fieldPair); // Add the pair to the set
        }
        
        return false; // No duplicate pairs found
    }



    createRequiredField() {
        let sobjectApiNameList = [];
        let sobjectApiNameForRelatedList = [];
        //////console.log('qbtosf',JSON.stringify(this.QbToSfConfigDataList));
        for (var key in this.QbToSfConfigDataList) {
            //////console.log('key2==>', key)
            if(this.QbToSfConfigDataList[key].fieldsJson){
                for(var inKey in this.QbToSfConfigDataList[key].fieldsJson){

                    //////console.log('keyfieldjson==>', inKey)
                    //////console.log('keyfieldjsonvalue==>', this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__Data_Mapping_Type__c);
                    if(this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping'){
                        //////console.log('in sobj name',this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__SF_Field__c);
                        sobjectApiNameForRelatedList.push(this.QbToSfConfigDataList[key].fieldsJson[inKey].hic_qbmadeasy__SF_Field__c);
                    }

                }
            }
            sobjectApiNameList.push(this.QbToSfConfigDataList[key].hic_qbmadeasy__SF_Entity__c);
            //////console.log('sobjname',sobjectApiNameList);

        }
        if (sobjectApiNameList.length > 0) {
            createRequiredField({ 'sObjectApiNameList': sobjectApiNameList }).then(result => {
                //////console.log('result on creating field', result)
            })
                .catch(error => {
                    //////console.log('error at creating field==>', error);
                })
        }
        if (sobjectApiNameForRelatedList.length > 0) {
            createRequiredFieldRelated({ 'sObjectApiNameList': sobjectApiNameForRelatedList }).then(result => {
                //////console.log('result on creating field', result)
            })
                .catch(error => {
                    //////console.log('error at creating field==>', error);
                })
        }
    }

    cloneSfToqbFieldConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.parentElement.parentElement.dataset.fldconfigid;
        let configIdNew = this.getRandomString(18);
        //////console.log('fldConfigId 380: ', configIdNew);
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            this.QbToSfConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = new Array();
                    //////console.log('@@@')
                    //////console.log(element)
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
        //////console.log('deleteSfToqbFieldConfigRecord Called');
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        //////console.log('Event 410 line: ', event);
        //////console.log('fldConfigId line 414: ', fldConfigId);
        //////console.log('objConfigId line 415: ', objConfigId);
        let QbToSfConfigDataListTemp = new Array();
        //////console.log('QbToSfConfigDataList line 416: ', this.QbToSfConfigDataList);
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
            //////console.log('line 755',JSON.stringify(this.QbToSfConfigDataList));
        }

    }

    
    
    async cloneSfToqbObjectConfigRecord(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let QbToSfConfigDataListTemp = new Array();

        let vm = this;
        let configId = this.getRandomString(18);
        let isAssign = false;
        if (this.QbToSfConfigDataList) {
            var index = 0;
            for (let i = 0; i < this.QbToSfConfigDataList.length; i++) {
                let element = this.QbToSfConfigDataList[i];
                //////console.log('element.Id line 26' + element.Id);
                if (element.Id === objConfigId) {
                    if (element.expanded || !element.Id) {
                        isAssign = true;
                        ////////console.log('Obj Id >> '+objConfigId);
                        let eachObjConfigRec = Object.assign({}, element);

                        //////console.log(JSON.parse(JSON.stringify(eachObjConfigRec)))
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                        eachObjConfigRec = { ...eachObjConfigRec, Name: configId };
                        eachObjConfigRec = { ...eachObjConfigRec, newRow: true };
                        eachObjConfigRec = { ...eachObjConfigRec, Id: null };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {

                        let result = await fetchSfToqbConfigDataById({ 'Id': element.Id,'companyId':this.realmid  });
                        //////console.log(result)

                        let localElement = JSON.parse(JSON.stringify(element))
                        localElement = { ...localElement, qbtypeFieldsList: result.qbtypeFieldsList };
                        localElement = { ...localElement, qbtypeTableList: result.qbtypeTableList };
                        localElement = { ...localElement, childSobjList: result.childSobjList };
                        localElement = { ...localElement, fieldsJson: result.fieldsJson };
                        let eachObjConfigRec = Object.assign({}, localElement);
                        //////console.log(JSON.parse(JSON.stringify(eachObjConfigRec)))
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, localElement];
                        eachObjConfigRec = { ...eachObjConfigRec, Name: configId };

                        eachObjConfigRec = { ...eachObjConfigRec, newRow: true };
                        eachObjConfigRec = { ...eachObjConfigRec, Id: null };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                        // vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;


                    }
                } else {
                    isAssign = true;
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
                index++;
            }
            //////console.log('here')

            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
        }
    }

    deleteSfToqbObjectConfigRecord(event) {
        //////console.log('deleteSfToqbObjectConfigRecord Called');
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let QbToSfConfigDataListTemp = new Array();
        let vm = this;
        //////console.log('line 498 object ConfigId:', objConfigId);
        //////console.log('Data List in delete', JSON.stringify(this.QbToSfConfigDataList))
        if (this.QbToSfConfigDataList) {
            //////console.log('here line 421',);
            this.QbToSfConfigDataList.forEach(function (element) {
                //////console.log('here line 422');
                if (element.Name !== objConfigId) {
                    //////console.log('here line 423');
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                } else {
                    if (element.Id) {
                        //////console.log('here line 424');
                        vm.deleteId.push(element.Id);
                    }
                }
            });
            //////console.log('line 424', vm.deleteId);
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;

            //////console.log('line 865 '+ JSON.stringify(this.QbToSfConfigDataList));
        }
    }
   
    

    async setUpdatedValuetoObjConfigRecord(event) {
        try{
        let index = event.currentTarget.dataset.index;
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let dataVal;
        let currentName = event.currentTarget.name;
        //////console.log('currentName',currentName);
        //////console.log('in set updated',this.getRandomString(18));
        //let randomString = this.getRandomString(18);
        //////console.log('in set updated index',index);
        //////console.log('in set updated qbtosf', this.QbToSfConfigDataList[index]);
        //////console.log('in set updated qbtosf whole',JSON.stringify(this.QbToSfConfigDataList[index]) );

        if (event.currentTarget.type === 'checkbox') {
            dataVal = event.detail.checked;
        } else {
            dataVal = event.detail.value;
        }

        //////console.log(event.currentTarget.name);
        //////console.log('dataVal:::', dataVal);
        let QbToSfConfigDataListTemp = new Array();

        if (this.QbToSfConfigDataList) {
            for(let element of this.QbToSfConfigDataList){
                if (element.Name === objConfigId) {
                  
                        //////console.log('element Qbname',element.hic_qbmadeasy__QB_Entity__c);
                        //////console.log('element Sfname',element.hic_qbmadeasy__SF_Entity__c);
                        //////console.log('element name',element.Name);
                        //////console.log('obj>>',objConfigId);
                        let eachObjConfigRec = element;
                        eachObjConfigRec = { ...eachObjConfigRec, [event.currentTarget.name]: dataVal };
                        if (element.Id) {
                            eachObjConfigRec = { ...eachObjConfigRec, expandedOnly: true };
                        }
                        if (event.currentTarget.name == 'hic_qbmadeasy__QB_Operation__c') {
                            if (dataVal == 'Insert') {
                                eachObjConfigRec = { ...eachObjConfigRec, qbReferenceFieldDisabled: true };
                                eachObjConfigRec = { ...eachObjConfigRec, hic_qbmadeasy__QB_Reference_Field__c: '--None--' };
                            }   
                            else {
                            eachObjConfigRec = { ...eachObjConfigRec, qbReferenceFieldDisabled: false };
                            }
                        }
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    //}
                }
                
                
                else {
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            }
            
            //////console.log('in loop',this.QbToSfConfigDataList);
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            //////console.log('in loop2',this.QbToSfConfigDataList);
        }
        if (currentName.indexOf('hic_qbmadeasy__QB_Entity__c') !== -1) {
            //////console.log("selectedItem");
            const field = event.target.name;
            this.selectedObjectTypeOption = event.target.value;
            
            //////console.log('this.QbToSfConfigDataList==>', JSON.stringify(this.QbToSfConfigDataList));
            let index = event.currentTarget.dataset.index;
            //////console.log('index 622', index)
            fetchQBEntityFields({ 'contractType': this.selectedObjectTypeOption,'isSfToQb': false,'companyId':this.realmid })
                .then(result => {
                    //////console.log('result====>', result)
                    let qbTypeList = [];
                    let qtbTableList = [];
                    for (var key in result) {
                        //////console.log('key', result[key].type);
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
                            //////console.log('on line 641')
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
                    //////console.log('result==> 624', JSON.stringify(this.QbToSfConfigDataList));

                })
        }
        else if (currentName.indexOf('hic_qbmadeasy__SF_Entity__c') !== -1) {
            //////console.log("selectedSobject");
            const field = currentName;
            //////console.log('selected',field);
            this.selectedSObjectTypeOption = dataVal;
            //////console.log('selected',this.selectedSObjectTypeOption);
            //////console.log(this.selectedSObjectTypeOption);
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
                        ////////console.log('JSON '+JSON.stringify(this.QbToSfConfigDataList));
                    }
                })
                    .catch(error => {
                        this.inProgress = false;
                        this.error = error;
                        ////////console.log(this.error);
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
                        ////////console.log('JSON>>  '+JSON.stringify(this.QbToSfConfigDataList));
                    } else {
                        this.inProgress = false;
                    }
                });
            }

        }
    }
    catch(ex){
        //////console.log('in exc',ex.message)
    }

    }

    setUpdatedValuetoFieldRecObj(event) {
        try{
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let dataVal;
        let sfFieldsSelObjTemp = this.sfFieldsSelObj;
        if (event.currentTarget.type === 'checkbox') {
            ////console.log('1');
            dataVal = event.detail.checked;
        } else {
            ////console.log('2');
            dataVal = event.detail.value;
        }
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            ////console.log('3');
            this.QbToSfConfigDataList.forEach(function (element) {
                if (element.Name === objConfigId) {
                    ////console.log('4');
                    let eachObjConfigRec = element;
                    let fieldsJsonListTemp = new Array();
                    if (element.fieldsJson) {
                        ////console.log('5');
                        element.fieldsJson.forEach(function (fldelement) {
                            if (fldelement.Name === fldConfigId) {
                                ////console.log('6');
                                let eachfldConfigRec = fldelement;
                                ////console.log('fldElement>>>>>>>>>>>>>>>>>>'+JSON.stringify(fldelement));
                                if (event.detail.apiName) {
                                    ////console.log('7');
                                    //////console.log('test');
                                    //////console.log('In apiName>>');
                                    eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SF_Field__c': event.detail.apiName };
                                    eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__SFChildRelationshipName__c': dataVal };
                                } else {
                                    ////console.log('8');
                                    //////console.log('test');
                                    //////console.log('In apiName2>>',event.currentTarget.name);
                                    //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal };
                                    if(dataVal == true&&typeof dataVal=='boolean'){
                                        ////console.log('9');
                                        //////console.log('line 1193');
                                        //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__SF_Field_Label__c: ''};
                                        //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: ''};
                                        
                                        //eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', hic_qbmadeasy__SF_Field_Data_Type__c: sfdataType};
                                        ////console.log(fldelement.hic_qbmadeasy__SF_Field_Data_Type__c+'sffieldType>>>>>>>>>>>>>>');
                                        if(fldelement.hic_qbmadeasy__SF_Field_Data_Type__c != 'DATE' && fldelement.hic_qbmadeasy__SF_Field_Data_Type__c != 'DATETIME' && fldelement.hic_qbmadeasy__SF_Field_Data_Type__c != 'TIME'){
                                            ////console.log('10');
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': false , 'isDateTime': false , 'isTime': false};
                                        }
                                        
                                        if(fldelement.hic_qbmadeasy__SF_Field_Data_Type__c == 'DATE'){
                                            ////console.log('11');
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDate': true , 'isDateTime': false, 'isTime':false};
                                        }else if(fldelement.hic_qbmadeasy__SF_Field_Data_Type__c == 'DATETIME'){
                                            ////console.log('12');
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': true , 'isDate': false, 'isTime':false};
                                        }else if(fldelement.hic_qbmadeasy__SF_Field_Data_Type__c == 'TIME'){
                                            ////console.log('13');
                                            eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal , hic_qbmadeasy__Quickbook_Field__c: '', 'isDateTime': false , 'isDate': false, 'isTime':true};
                                        }
                                    }else if(dataVal == false){
                                        ////console.log('14');
                                        eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal, hic_qbmadeasy__Quickbook_Field__c: ''};
                                    }else{
                                        ////console.log('15');
                                        eachfldConfigRec = { ...eachfldConfigRec, [event.currentTarget.name]: dataVal};
                                        
                                    }
                                }
                                
                                if (event.currentTarget.name === 'hic_qbmadeasy__SF_Field__c') {
                                    ////console.log('16');
                                    if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        ////console.log('17');
                                        let childRelationName = '';
                                        element.childSobjList.forEach(function (childOption) {
                                            if (childOption.value === dataVal) {
                                                ////console.log('18');
                                                childRelationName = childOption.value;
                                            }
                                        });
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SFChildRelationshipName__c: childRelationName };
                                    }
                                }
                                if (event.currentTarget.name === 'hic_qbmadeasy__Quickbook_Field__c') {
                                    ////console.log('19');
                                    if (eachfldConfigRec.hic_qbmadeasy__Data_Mapping_Type__c === 'relatedDataMapping') {
                                        ////console.log('20');
                                        //////console.log('on line 760')
                                        //eachfldConfigRec = { ...eachfldConfigRec, qb_fieldType: 'table' };            //Commented by Sameer - 27.9.22
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: 'table' };
                                    } 
                                    else if(eachfldConfigRec.hic_qbmadeasy__Constant__c === true){
                                        ////console.log('21');
                                        //////console.log('test19');
                                        eachfldConfigRec = { ...eachfldConfigRec, 'hic_qbmadeasy__Quickbook_Field__c': dataVal };
                                    }
                                    else {
                                        //////console.log('test10');
                                        ////console.log('22');
                                        let fieldInfo = event.target.options.find(opt => opt.value === event.detail.value);
                                        if (fieldInfo) {
                                            ////console.log('23');
                                            let fieldLabel = fieldInfo.label;
                                            let qb_fieldTypeSplted = fieldLabel.split(':');
                                            //eachfldConfigRec = { ...eachfldConfigRec, qb_fieldType: qb_fieldTypeSplted[0].trim() };       //Commented by Sameer - 27.9.22
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Quickbook_Field_Type__c: qb_fieldTypeSplted[0].trim() };
                                        }
                                    }
                                }
                                if (event.currentTarget.name === 'hic_qbmadeasy__Data_Mapping_Type__c') {
                                    ////console.log('24');
                                    //initialize all the QB Data Mapping attributes - Start
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
                                    //initialize all the QB Data Mapping attributes - End
                                    if (dataVal === 'relatedDataMapping') {
                                        ////console.log('25');
                                        eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__isRelatedMap__c: true };
                                    }
                                }
                                fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                            } else {
                                ////console.log('26');
                                fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                            }
                        });
                    }
                    eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                    //////console.log(JSON.stringify(eachObjConfigRec));
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                } else {
                    ////console.log('27');
                    QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                }
            });
            this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
            //////console.log('JSON ' + JSON.stringify(this.QbToSfConfigDataList));
        }
    }
    catch(ex){
        //////console.log('in excSetUpdated',ex.message)
    }
    }

    setUpdatedRelMappings(event) {
        this.RelFieldsMappingList = event.detail;


    }
    saveRelDataMappings(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        ////////console.log('ObjMap:  '+objConfigId+'  fldMap: '+fldConfigId);
        let RelatedFldMapList = this.RelFieldsMappingList;
        let QbToSfConfigDataListTemp = new Array();
        //////console.log('Save Re Called>>');
        //////console.log('RelFieldsMappingList_Line894', JSON.stringify(this.RelFieldsMappingList));
        //////console.log('QbToSfConfigDataList_Line895', JSON.stringify(this.QbToSfConfigDataList));
        var isError = false;

        if (this.RelFieldsMappingList.length == 0) {
            isError = true;
            if (isError == true) {
                this.showToastForField(true);
            }
        }else if (this.RelFieldsMappingList.length > 0) {
            //////console.log('line 1290');
            for (var element of this.RelFieldsMappingList){
                if (element.cp_fieldLabel == '' || element.qb_fieldName == '') {
                    //////console.log('line 1212');
                    isError = true;
                    break;
                }
            }
            if (isError == true) {
                this.showToastForField(true);
            }
        }

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
                                                //Added By Sameer 12.10.2022 Start--> 
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
    
                                                    //////console.log('sfFieldLabel_Line_925>>', sfFieldLabel);
                                                    //////console.log('sfFieldName_Line_926>>', sfFieldName);
                                                   // relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + sfFieldLabel, name: eachItem.qb_fieldName + '-' + sfFieldName }];
                                                    relatedDataValuesList = [...relatedDataValuesList, { label: sfFieldLabel + '-' + eachItem.cp_fieldLabel, name: sfFieldName + '-' + eachItem.qb_fieldName }];
                                                }
                                                else {
                                                    //relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + eachItem.sf_fieldLabel, name: eachItem.qb_fieldName + '-' + eachItem.sf_fieldName }]; // Commented By Sameer 06.10.2022
                                                    //relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.cp_fieldLabel + '-' + eachItem.sf_fieldLabel, name: eachItem.qb_fieldName + '-' + eachItem.sf_fieldName }];
                                                      relatedDataValuesList = [...relatedDataValuesList, { label: eachItem.sf_fieldLabel + '-' + eachItem.cp_fieldLabel, name: eachItem.sf_fieldName + '-' + eachItem.qb_fieldName }];
                                                }
                                                //End
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
                //////console.log('JSON QbToSfConfigDataList>>' + JSON.stringify(this.QbToSfConfigDataList));
            }
            this.reldatadisplayPopup = false;
        }
        

    }


    //Method to remove the row from matching rule modal
    handleMatchingRuleRowRemove(event){
        try{
            
            // Get the index of the item to be deleted
            const numericIndex = parseInt(event.target.dataset.index);

            ////console.log('This is before', JSON.stringify(this.matchingRuleConditions));

            // Make sure the index is valid
            if (isNaN(numericIndex) || numericIndex < 0 || numericIndex >= this.matchingRuleConditions.length) {
                console.error('Invalid index or out of bounds');
                return;
            }

            // Remove the item at the specified index by creating a new filtered array
            const updatedConditions = this.matchingRuleConditions.filter((_, index) => index !== numericIndex);

            ////console.log('This is the updateConditions',JSON.stringify(updatedConditions));


            // After removing the item, check if we deleted the last item
            if (numericIndex === this.matchingRuleConditions.length - 1 && numericIndex > 0) {
                // Set the ConditionLogic of the previous row to an empty string if we removed the last row
                updatedConditions[numericIndex - 1].ConditionLogic = '';
            }

            // Update the reactive property with the modified array
            this.matchingRuleConditions = updatedConditions;

            if(this.matchingRuleConditions.length == 0){
                this.matchingRuleConditions = null;
            }

            ////console.log('Updated Conditions:', JSON.stringify(updatedConditions));
        
        }catch(error){
             ////console.log('Error occurred in handleMatchingRuleRowRemove',error.message);
        }
    }




    removeRelMappingsFromContainerList(event) {
        let delItemName = event.detail.item.name;
        //let delItemIndex = event.detail.index;
        ////////console.log('delItemName>> '+delItemName+' delItemIndex>> '+delItemIndex);
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        ////////console.log('ObjMap:  '+objConfigId+'  fldMap: '+fldConfigId);        
        let QbToSfConfigDataListTemp = new Array();
        if (this.QbToSfConfigDataList) {
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
                ////////console.log(JSON.stringify(error.message));
            }
        }

    }

    openRelfldMappingPopup(event) {
        //////console.log(event.data);
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        this.relObjConfigId = objConfigId;
        this.relFldConfigId = fldConfigId;
        this.sfChildObjName = event.currentTarget.dataset.sffieldname;
        let cpChildObjName = event.currentTarget.dataset.cpfieldname;
        //////console.log('relObjConfigId>> ' + this.relObjConfigId);
        //////console.log('fldConfigId>> ' + fldConfigId);
        //////console.log('relfldConfigId>> ' + this.relfldConfigId);
        //////console.log('sfsobjectName>> ' + this.sfChildObjName);
        //////console.log('cpsobjectName>> ' + cpChildObjName);
        let childFieldsListTemp = new Array();
        if (this.QbToSfConfigDataList) {
            try {
                let RelFieldsMappingListTemp = new Array();
                this.QbToSfConfigDataList.forEach(function (element) {
                    if (element.Name === objConfigId) {
                        //////console.log('SFtoQBData_element>>', JSON.stringify(element));
                        if (element.qbtypeTableList) {
                            //////console.log('***********', JSON.stringify(element.qbtypeTableList));
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
                        //////console.log('in this console');
                        ////////console.log(JSON.stringify(element))
                        //////console.log('line no1026_fieldsJson>>', JSON.stringify(element.fieldsJson));
                        if (element.fieldsJson) {
                            element.fieldsJson.forEach(function (fldelement) {
                                if (fldelement.Name === fldConfigId) {
                                    //////console.log('Inside_fldelementName_Check>>', fldelement.Name);
                                    //////console.log('Inside_fldConfigId_Check>>', fldConfigId);
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
                //////console.log('line no.1041_cpChildObjFields>>>', JSON.stringify(this.cpChildObjFields));
                //////console.log('line no.1041_RelFieldsMappingList>>>', JSON.stringify(this.RelFieldsMappingList));

            } catch (error) {
                this.error = error;
                ////////console.log(JSON.stringify(error.message));
            }
        }
        this.reldatadisplayPopup = true;
    }

    saveSfFieldNameValue(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        let QbToSfConfigDataListTemp = new Array();
        let sfFieldsSelObjTemp = this.sfFieldsSelObj;
        let allValid = true;
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
                                    //////console.log('eachfldConfigRec>>', JSON.stringify(eachfldConfigRec));
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'fieldMapping') {
                                        if (sfFieldsSelObjTemp.isReferenceMapping) {
                                            this.template.querySelectorAll('[data-objconfigidcustom="' +objConfigId+ '"]').forEach(compName=>{
                                                let isValid = compName.checkValidity();
                                                allValid = allValid && isValid;
                                                                                                                               
                                            });
                                            //////console.log('line 1416' , allValid)
                                            var sfFieldLabelString = '';
                                            var sfFieldNameString = '';
                                            let p = 2;
                                            //////console.log('TestCheck >>' + sfFieldsSelObjTemp['sfrelation' + p + 'Name']);
                                            for (let i = 1; i <= sfFieldsSelObjTemp.referenceCount; i++) {
                                                if (i > 1) {
                                                    ////console.log('8');
                                                    sfFieldLabelString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                    sfFieldNameString += sfFieldsSelObjTemp['sfrelation' + i + 'Name'] + '.';
                                                }
                                                else {
                                                    ////console.log('9');
                                                    sfFieldLabelString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                    sfFieldNameString = sfFieldsSelObjTemp.sfrelationName + '.';
                                                }
                                            }
                                            
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: true };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: sfFieldsSelObjTemp.referenceCount };
                                            //eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sfrelationName + '.' + sfFieldsSelObjTemp.sffieldlabel };
                                            // eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldLabelString + sfFieldsSelObjTemp['sfparentField'+(sfFieldsSelObjTemp.referenceCount && sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.referenceCount : '')+'Label'] };
                                            if(!this.isSFReferenceObjNotNull){
                                                //////console.log('10');
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: false };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: 0 };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sffieldlabel };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldsSelObjTemp.sffieldName };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: '' };
                                                eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: '' };
                                                
                                            }else{
                                                //////console.log('11');
                                                if(allValid){
                                                    //////console.log('12');
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldLabelString + (sfFieldsSelObjTemp.referenceCount > 1 ? this['RefrenceField' + sfFieldsSelObjTemp.referenceCount + 'List'].find(fld => fld.value === sfFieldsSelObjTemp['sfparentField' + sfFieldsSelObjTemp.referenceCount + 'Name']).label : this.RefrenceFieldList.find(fld => fld.value === sfFieldsSelObjTemp.sfparentFieldName).label) }; //by Saurabh
                                                
                                                
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldNameString + sfFieldsSelObjTemp['sfparentField' + (sfFieldsSelObjTemp.referenceCount && sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.referenceCount : '') + 'Name'] }; //by Saurabh
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: sfFieldsSelObjTemp.sfreferenceObj };
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: sfFieldsSelObjTemp.sffieldName };
                                                
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object2__c: sfFieldsSelObjTemp.sfreferenceObj2 };
                                                    eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field2__c: (sfFieldsSelObjTemp.referenceCount > 1 ? sfFieldsSelObjTemp.sffield2Name : '') };
                                                }
                                            }
                                        }else {
                                            //////console.log('13');
                                            let componentName = this.template.querySelector('[data-objconfigidcustom="' +objConfigId+ '"]');
                                            let isValid = componentName.checkValidity();
                                            //////console.log(isValid)
                                            allValid = allValid && isValid;
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Referenced_Mapping__c: false };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__Reference_Count__c: 0 };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Label__c: sfFieldsSelObjTemp.sffieldlabel };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field__c: sfFieldsSelObjTemp.sffieldName };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Object__c: '' };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Parent_Field__c: '' };
                                            eachfldConfigRec = { ...eachfldConfigRec, hic_qbmadeasy__SF_Field_Data_Type__c:sfFieldsSelObjTemp.sffieldType };
                                        }
                                    }
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, eachfldConfigRec];
                                    ////console.log('>>>>>>>>>>>>>>>>>'+eachfldConfigRec.hic_qbmadeasy__SF_Field_Data_Type__c);
                                } else {
                                    fieldsJsonListTemp = [...fieldsJsonListTemp, fldelement];
                                }
                            });
                        }
                        eachObjConfigRec = { ...eachObjConfigRec, fieldsJson: fieldsJsonListTemp };
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, eachObjConfigRec];
                    } else {
                        //////console.log('15');
                        QbToSfConfigDataListTemp = [...QbToSfConfigDataListTemp, element];
                    }
                });
                this.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                //////console.log('line 1064-QbToSfConfigDataList>>' + JSON.stringify(this.QbToSfConfigDataList));
                if(allValid){
                    //////console.log('16');
                    this.closeInsertFieldPopup();
                }
            } catch (error) {
                this.error = error;
                ////////console.log(JSON.stringify(error.message));
            }
        }
    }

    handleSuccessForResponse(event) {
        let name = event.target.name;
        let value = event.detail.value;
        //////console.log(event.target.name);
        let sfFieldsSelObjtemp = { ... this.sffieldforResponseFinal };

        if (name === 'qbId') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, qbId: value };
        } else if (name === 'errorcode') {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcode: value };
        } else {
            sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, errorcodemsg: value };
        }

        this.sffieldforResponseFinal = { ...this.sffieldforResponseFinal, ...sfFieldsSelObjtemp };
        //////console.log(JSON.stringify(this.sffieldforResponse))
    }
    @track sffieldforResponseFinal = {};
    handleSaveForSuccess(event) {
        try {
            //////console.log('this.sfFieldsSelObj', JSON.stringify(this.sffieldforResponse));
            let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
            // this.sffieldforResponseFinal = {...this.sffieldforResponseFinal};
            //////console.log('this.sffieldforResponseFinal', JSON.stringify(this.sffieldforResponseFinal));
            //let objConfigId =  event.currentTarget.parentElement.parentElement.dataset.objconfigid;
            //////console.log('objConfigId', objConfigId);
            let tempList = JSON.parse(JSON.stringify(this.QbToSfConfigDataList))
            tempList.forEach(element => {
                if (element.Name == objConfigId) {
                    element.sffieldforResponseFinal = this.sffieldforResponseFinal;
                }
            });
            //////console.log(tempList);
            this.QbToSfConfigDataList = tempList;
            /*for(let i=0;i<this.QbToSfConfigDataList.length;i++){
                if (this.QbToSfConfigDataList[i].Name === objConfigId) {
                    this.QbToSfConfigDataList[i].sffieldforResponseFinal = this.sffieldforResponseFinal;
                    break;
                }
            }*/
            //////console.log('this.QbToSfConfigDataList', JSON.stringify(this.QbToSfConfigDataList));
            this.successDisplayPopUp = false;
            this.sffieldforResponseFinal = {};
        } catch (e) {
            //////console.log(e)
        }
    }
    isSFReferenceObjNotNull = false;
    setUpdatedValuetoSfFieldRec(event) {
        //////console.log('console I am in thi');
        //////console.log(JSON.stringify(event.detail))
        let fieldName = event.detail.value;
        let fieldLabel = event.target.options.find(opt => opt.value === event.detail.value).label;
        let fieldType =  event.target.options.find(opt => opt.value === event.detail.value).type;
        // //////console.log('fieldLabel>> '+fieldLabel);
        //let fieldNametemp = '';
        //////console.log('fieldName>>', fieldName);
        //////console.log('fieldLabel>>', fieldLabel);
        //var referenceCounttemp = this.referenceCount;
        //////console.log('referenceCount >>', this.referenceCount);
        //this.referenceCount = (this.referenceCount ? this.referenceCount : 1);
        if (fieldName) {
            //////console.log('fieldType>>', event.currentTarget.dataset.type);
            if (event.currentTarget.dataset.type === 'primary') {
                let referenceObj = '';
                let relationShip = '';
                let isRefField = false;
                let sfFieldsSelObjtemp = {};
                //////console.log('sobjectFieldList>>', JSON.stringify(this.sobjectFieldList));
                if (this.sobjectFieldList) {
                    this.sobjectFieldList.forEach(element => {
                        if (element.value === fieldName) {
                            if (element.type === 'REFERENCE') {
                                isRefField = true;
                                referenceObj = element.referenceObj;
                                relationShip = element.relationShip;
                                // sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: true, referenceCount: this.referenceCount, sffieldName: fieldName, sffieldlabel: fieldLabel, sfrelationName: relationShip, sfreferenceObj: referenceObj, sfparentFieldName: '', sfparentFieldLabel: '' };
                                sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: true, referenceCount: this.referenceCount, sffieldName: fieldName, sffieldlabel: fieldLabel, sfrelationName: relationShip, sfreferenceObj: referenceObj, sfparentFieldName: '' };
                            } else {
                                // sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: false, referenceCount: 0, sffieldName: fieldName, sffieldlabel: fieldLabel, sfrelationName: '', sfreferenceObj: '', sfparentFieldName: '', sfparentFieldLabel: '' };
                                sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, isReferenceMapping: false, referenceCount: 0, sffieldName: fieldName, sffieldlabel: fieldLabel,sffieldType: fieldType, sfrelationName: '', sfreferenceObj: '', sfparentFieldName: '' };
                            }
                        }
                    });
                    this.sfFieldsSelObj = sfFieldsSelObjtemp;
                    //////console.log('line 1019 sfFieldsSelObj', JSON.stringify(this.sfFieldsSelObj));
                }
                if (isRefField) {
                    this.isReferenceField = true;
                    this.inProgress = true;
                    let RefrenceFieldListLength = 0;
                    sObjExternalIdFieldsList({ sobjectName: referenceObj }).then(result => {    // added by Saurabh
                        this.inProgress = false;
                        this.RefrenceFieldList = result;
                        RefrenceFieldListLength= this.RefrenceFieldList.length;
                        if(RefrenceFieldListLength > 0){
                            this.isSFReferenceObjNotNull = true;
                        }else{
                            this.isSFReferenceObjNotNull = false;
                        }
                        //////console.log('this.RefrenceFieldList ==>',RefrenceFieldListLength);
                        //////console.log('RefrenceFieldList >>' + JSON.stringify(this.RefrenceFieldList));
                    });

                    //////console.log('this.RefrenceFieldList 12 ==>',RefrenceFieldListLength);
                    
                }
            }
            else if (event.currentTarget.dataset.type === 'secondary') {
                let referenceObj2 = '';
                let relationShip2 = '';
                let isRefField2 = false;
                //let sfFieldsSelObjtemp = {};
                let sfFieldsSelObjtemp = this.sfFieldsSelObj ? this.sfFieldsSelObj : {};
                this.referenceCount = (sfFieldsSelObjtemp.referenceCount ? sfFieldsSelObjtemp.referenceCount : this.referenceCount);
                //////console.log('sobjectFieldList>>', JSON.stringify(this.RefrenceFieldList));
                if (this.RefrenceFieldList) {
                    this.RefrenceFieldList.forEach(element => {
                        if (element.value === fieldName) {
                            if (element.type === 'REFERENCE') {
                                ////////console.log('element.type>>',element.type);
                                //////console.log('OldValue>>', sfFieldsSelObjtemp.sffield2Name);
                                //////console.log('NewValue>>', fieldName);
                                let oldFieldValue = sfFieldsSelObjtemp.sffield2Name;
                                let newFieldValue = fieldName;
                                if (oldFieldValue != newFieldValue) {
                                    this.referenceCount++;
                                }
                                //////console.log('ReferenceCount_Check>>', this.referenceCount);
                                ////////console.log('line-1202>>',this.referenceCount);
                                isRefField2 = true;
                                referenceObj2 = element.referenceObj;
                                relationShip2 = element.relationShip;
                                //////console.log('line no. 1202 sfFieldsSelObjtemp1>>', JSON.stringify(sfFieldsSelObjtemp));
                                // sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: relationShip2, sfreferenceObj2: referenceObj2, sfparentFieldName: fieldName, sfparentFieldLabel: fieldLabel, sfparentField2Name: '', sfparentField2Label: '' };
                                sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: relationShip2, sfreferenceObj2: referenceObj2, sfparentFieldName: fieldName, sfparentField2Name: '' };
                                //////console.log('line no. 1202 sfFieldsSelObjtemp2>>', JSON.stringify(sfFieldsSelObjtemp));
                            } else {
                                this.referenceCount = 1;
                                //////console.log('line no. 1206 sfFieldsSelObjtemp1>>', JSON.stringify(sfFieldsSelObjtemp));
                                // sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: '', sfreferenceObj2: '', sfparentFieldName: fieldName, sfparentFieldLabel: fieldLabel, sfparentField2Name: '', sfparentField2Label: ''};
                                sfFieldsSelObjtemp = { ...sfFieldsSelObjtemp, referenceCount: this.referenceCount, sffield2Name: fieldName, sffield2label: fieldLabel, sfrelation2Name: '', sfreferenceObj2: '', sfparentFieldName: fieldName, sfparentField2Name: '' };
                                //////console.log('line no. 1208 sfFieldsSelObjtemp2>>', JSON.stringify(sfFieldsSelObjtemp));
                            }
                        }
                    });
                    this.sfFieldsSelObj = sfFieldsSelObjtemp;
                    //////console.log('line 1209 sfFieldsSelObj', JSON.stringify(this.sfFieldsSelObj));
                }
                if (isRefField2) {
                    //this.isReferenceField = true;
                    this.inProgress = true;
                    sObjFieldsList({ sobjectName: referenceObj2 }).then(result => {
                        this.inProgress = false;
                        this.RefrenceField2List = result;
                        //////console.log('RefrenceField2List >>' + JSON.stringify(this.RefrenceField2List));
                    });
                }
            }
            else {
                this.referenceCount = (this.sfFieldsSelObj.referenceCount ? this.sfFieldsSelObj.referenceCount : this.referenceCount);
                //////console.log('referenceCount>>', this.referenceCount);
                this.sfFieldsSelObj = { ...this.sfFieldsSelObj, ['sfparentField' + (this.referenceCount && this.referenceCount > 1 ? this.referenceCount : '') + 'Name']: fieldName };
                //this.sfFieldsSelObj = { ...this.sfFieldsSelObj, sffieldlabel: fieldLabel };
                //this.sfFieldsSelObj = { ...this.sfFieldsSelObj, ['sfparentField' + (this.referenceCount && this.referenceCount > 1 ? this.referenceCount : '') + 'Label']: fieldLabel };
                this.sfFieldsSelObj = { ...this.sfFieldsSelObj, referenceCount: this.referenceCount };
                //////console.log('line 1165 sfFieldsSelObj>>', JSON.stringify(this.sfFieldsSelObj));
                this.referenceCount = 1;
            }
        }
        ////////console.log(JSON.stringify(this.sfFieldsSelObj));
    }

    async openSfFieldSelectionPopup(event) {
        let objConfigId = event.currentTarget.parentElement.parentElement.dataset.objconfigid;
        this.relObjConfigId = objConfigId;
        //////console.log('relObjConfigId>>: ' + this.relObjConfigId);
        let fldConfigId = event.currentTarget.parentElement.parentElement.dataset.fldconfigid;
        this.relFldConfigId = fldConfigId;
        //////console.log('relFldConfigId>>: ' + this.relFldConfigId);
        this.sfFieldsSelObj = {};
        let sobjectName = event.currentTarget.dataset.sobjectname;
        //////console.log('sobjectName>>: ' + sobjectName);
        let parentSobjName = event.currentTarget.dataset.parentobjectname;
        //////console.log('parentSobjName>>: ' + parentSobjName);
        let parentSobj2Name = event.currentTarget.dataset.parentobject2name;
        //////console.log('parentSobj2Name>>: ' + parentSobj2Name);

        if (sobjectName) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: sobjectName }).then(result => {
                this.inProgress = false;
                //////console.log(result);
                this.sobjectFieldList = result;
                ////////console.log('sobjectFieldList>>', JSON.stringify(this.sobjectFieldList));

                ////////console.log('fields types: '+JSON.stringify(this.sobjectFieldList)); 
                this.isReferenceField = true;

            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                    ////////console.log(this.error);
                });
        }

        if (parentSobjName) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: parentSobjName }).then(result => {
                this.inProgress = false;
                this.RefrenceFieldList = result;
                //////console.log('RefrenceFieldList>>', JSON.stringify(this.RefrenceFieldList));
            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                    ////////console.log(this.error);
                });
        }

        if (parentSobj2Name) {
            this.inProgress = true;
            await sObjFieldsList({ sobjectName: parentSobj2Name }).then(result => {
                this.inProgress = false;
                this.RefrenceField2List = result;
                //////console.log('RefrenceField2List>>', JSON.stringify(this.RefrenceField2List));
            })
                .catch(error => {
                    this.inProgress = false;
                    this.error = error;
                    ////////console.log(this.error);
                });
        }

        let sfFieldsSelObjTemp = {};
        //////console.log('QbToSfConfigDataList_length>>', this.QbToSfConfigDataList.length);
        if (this.QbToSfConfigDataList) {
            try {
                this.QbToSfConfigDataList.forEach(element => {
                    //////console.log('element>>', JSON.stringify(element));
                    if (element.Name === objConfigId) {
                        if (element.fieldsJson) {
                            //////console.log('element_fieldsJson>>', JSON.stringify(element.fieldsJson));
                            element.fieldsJson.forEach(fldelement => {
                                //////console.log('fldelement>>', JSON.stringify(fldelement));
                                //if (fldelement.configId === fldConfigId) {        //Commented by Sameer - 26.9.22
                                if (fldelement.Name === fldConfigId) {              //Added by Sameer - 26.9.22
                                    //let eachfldConfigRec = fldelement;
                                    //if (fldelement.mappingType === 'fieldMapping') {                          //Commented by Sameer - 26.9.22
                                    if (fldelement.hic_qbmadeasy__Data_Mapping_Type__c === 'fieldMapping') {    //Added By Sameer - 26.9.22
                                        
                                        if (fldelement.hic_qbmadeasy__Referenced_Mapping__c) {                    //Added By Sameer - 26.9.22
                                            //fldelement.sf_fieldName = fldelement.sf_fieldLabel === '' ? fldelement.sf_fieldName.split('.')[0] + '.' : fldelement.sf_fieldName;        //Commented by Sameer - 27.9.22
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
                                            // sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfparentFieldName: fldelement.hic_qbmadeasy__SF_Parent_Field__c };
                                            // sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sfparentField2Name: fldelement.hic_qbmadeasy__SF_Parent_Field2__c };
                                        } else {
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, isReferenceMapping: fldelement.hic_qbmadeasy__Referenced_Mapping__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldName: fldelement.hic_qbmadeasy__SF_Field__c };
                                            sfFieldsSelObjTemp = { ...sfFieldsSelObjTemp, sffieldlabel: fldelement.hic_qbmadeasy__SF_Field_Label__c };
                                            // sfFieldsSelObjTemp = {...sfFieldsSelObjTemp,sfrelationName:''}; 
                                            // sfFieldsSelObjTemp = {...sfFieldsSelObjTemp,sfreferenceObj:''}; 
                                            // sfFieldsSelObjTemp = {...sfFieldsSelObjTemp,sfparentFieldName:''}; 
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
                    // fieldsJsonListTemp = [...fieldsJsonListTemp, { Name: fldConfigId, hic_qbmadeasy__Data_Mapping_Type__c: 'fieldMapping', hic_qbmadeasy__Constant__c: false, hic_qbmadeasy__isRelatedMap__c: false, hic_qbmadeasy__ReferenceMapping__c: false, hic_qbmadeasy__SF_Field__c: '', sf_childRelationshipName: '', hic_qbmadeasy__Quickbook_Field__c: '', qb_fieldType: '' }];        //Commented by Sameer - 27.9.22
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
       
        this.QbToSfConfigDataList = [...this.QbToSfConfigDataList, { Name: this.getRandomString(18), hic_qbmadeasy__SF_Entity__c: '', hic_qbmadeasy__QB_Entity__c: '', hic_qbmadeasy__FieldsMappingData__c: '', hic_qbmadeasy__DataMappingDirection__c: 'qb to SF',hic_qbmadeasy__Historical_Data_Mapping__c: true,hic_qbmadeasy__QB_Operation__c:"Insert",hic_qbmadeasy__Company_ID__c:this.realmid, fieldsJson: new Array(), qbtypeFieldsList: new Array(), childSobjList: new Array(), newRow: true }];
       
        this.isSfqbConfigNotEmpty = this.QbToSfConfigDataList.length > 0;
       
    }

    expandCollapseFunction(event) {
        try {
            //////console.log('QbToSfConfigDataList line 1020', JSON.stringify(this.QbToSfConfigDataList));
            let objConfigId = event.currentTarget.parentElement.parentElement.parentElement.dataset.objconfigid;
            let SwitchAction = event.currentTarget.dataset.switchto;

            let configId = event.currentTarget.dataset.configid;
            let index = event.currentTarget.dataset.index;
            
            

            let QbToSfConfigDataListTemp = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
            let vm = this;
            //
            

            if (configId && configId != null && QbToSfConfigDataListTemp[index].fieldsJson == undefined) {
                
                QbToSfConfigDataListTemp[index].showSpinner = true;
                vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                QbToSfConfigDataListTemp = JSON.parse(JSON.stringify(this.QbToSfConfigDataList));
                vm.showSpinner = true;

                fetchSfToqbConfigDataById({ 'Id': configId ,'companyId':this.realmid }).then(function (result) {
                    
                    QbToSfConfigDataListTemp[index].qbtypeFieldsList = result.qbtypeFieldsList;
                    QbToSfConfigDataListTemp[index].qbtypeTableList = result.qbtypeTableList;
                    QbToSfConfigDataListTemp[index].childSobjList = result.childSobjList;
                    let fieldsJson = [];
                    if (result.fieldsJson != null) {


                        result.fieldsJson.forEach(elementT => {

                            if (elementT.hic_qbmadeasy__RelatedDataValues__c != null) {

                                let tempElement = { ...elementT, 'hic_qbmadeasy__RelatedDataValues__c': JSON.parse(elementT.hic_qbmadeasy__RelatedDataValues__c) };
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
                                fieldsJson.push(temp);
                                
                            }
                        });
                    }
                    QbToSfConfigDataListTemp[index].fieldsJson = fieldsJson;
                    QbToSfConfigDataListTemp[index].showSpinner = false;
                    
                    
                    
                    QbToSfConfigDataListTemp[index].expanded = true;
                    QbToSfConfigDataListTemp[index].showSpinner = false;
                    vm.QbToSfConfigDataList = QbToSfConfigDataListTemp;
                    let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                    let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                    let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';

                    let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                    let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                    let ExpandOrCollapseIcon = entitySelectRow.querySelector (` .add-collapse-icon`);
                ExpandOrCollapseIcon.iconName = ExpandOrCollapseIcon.iconName =='utility:add'? 'utility:dash' :'utility:add';
                    if (vm.QbToSfConfigDataList) {
                        vm.QbToSfConfigDataList.forEach(function (element) {
                            if (element.Name === objConfigId) {
                                ExpandOrCollapseBtn.setAttribute('data-switchto', ExpandOrCollapseSwitch);
                                ExpandOrCollapseBtn.setAttribute('title', 'Click to ' + ExpandOrCollapseSwitch);
                                entitySelectRow.nextElementSibling.classList.replace(ExpandOrCollapseOldClass, ExpandOrCollapseNewClass);

                            }
                        });
                    }
                    //////console.log('QbToSfConfigDataList_expand>>', JSON.stringify(vm.QbToSfConfigDataList));
                });

            } else {

                //////console.log('in else2');
                let ExpandOrCollapseSwitch = SwitchAction === 'expand' ? 'collapse' : 'expand';
                let ExpandOrCollapseNewClass = SwitchAction === 'expand' ? 'expand-row' : 'collapse-row';
                let ExpandOrCollapseOldClass = SwitchAction === 'expand' ? 'collapse-row' : 'expand-row';
                let entitySelectRow = vm.template.querySelector(`tr[data-objindex="${index}"]`);
                let ExpandOrCollapseBtn = entitySelectRow.querySelector(`.expand-collapse-container`);
                let ExpandOrCollapseIcon = entitySelectRow.querySelector (` .add-collapse-icon`);
                ExpandOrCollapseIcon.iconName = ExpandOrCollapseIcon.iconName =='utility:add'? 'utility:dash' :'utility:add';
                
                
                
              
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
              
                let qbEntity = QbToSfConfigDataListTemp[index].hic_qbmadeasy__QB_Entity__c;
                let sfEntity = QbToSfConfigDataListTemp[index].hic_qbmadeasy__SF_Entity__c;
               
                if(qbEntity =='Customer' && sfEntity =='account'){
                    //////console.log('in qb and sf');
                }
                fetchQBEntityFields({ 'contractType': QbToSfConfigDataListTemp[index].hic_qbmadeasy__QB_Entity__c,'isSfToQb': false,'companyId':this.realmid }).then(function (result) {
                    
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
                            //////console.log('on line 641')
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
        } catch (e) {
            
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
     
     get vfpageErrorIconCss() {
        return (this.origin == 'VisualforcePage' ? 'iconCss' : '');
    }


    get isSFReferenceObj2NotNull() {
        return (this.sfFieldsSelObj && this.sfFieldsSelObj.sfreferenceObj2 && this.sfFieldsSelObj.sfreferenceObj2 != '' ? true : false);
    }
    selectall(event) {
        const toggleList = this.template.querySelectorAll('[data-value^="option"]');
        for (const toggleElement of toggleList) {
            toggleElement.checked = event.target.checked;
        }
    }
    async openDefaultPopup(){
        try{
            let nameSpace;
            await getNameSpace().then(result => {
                nameSpace = result
            })
            .catch(error => {
                //////console.log('error', error);
            })

            await fetch(jsonData)
            .then((response) => response.json())
            .then((data) =>{ 
                //////console.log('default mapping',data);
                
                this.QbToSfDefaultData = data;
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
                for (let i = 0; i < this.QbToSfDefaultData.length; i++) {
                    this.QbToSfDefaultData[i].hic_qbmadeasy__Company_ID__c = this.realmid;
                    this.QbToSfDefaultData[i].Name = this.getRandomString(18);
                    
                    let element =  new Array();
                    element = this.QbToSfDefaultData[i].fieldsJson;
                    //////console.log('element default',element);
                    for(let j = 0; j < element.length; j++){
                        element[j].Name = this.getRandomString(18);
                        let sfFieldLabel = element[j].hic_qbmadeasy__SF_Field_Label__c;
                        if(sfFieldLabel.includes('HIC QuickBook Id') || sfFieldLabel.includes('HIC QuickBook Internal Id')){
                            ////console.log('in line 2312',refererceFieldMap);
                            ////console.log('in line 2312 sfFieldLabel',sfFieldLabel);
                            ////console.log('in line 2312 element[j].hic_qbmadeasy__SF_Field__c',element[j].hic_qbmadeasy__SF_Field__c);
                            let referenceField = refererceFieldMap[element[j].hic_qbmadeasy__SF_Field__c];
                            ////console.log('referencefield',referenceField);
                            
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
                                
                                if(relatedDataValues[k].label === 'Product2.HIC QuickBook Id-ItemRef'){
                                    
                                    relatedDataValues[k].name = 'Product2.'+nameSpace + 'qbmadeasy_id__c' +'-SalesItemLineDetail.ItemRef.value';
                                }
                            }
                        }
                    }
                    //////console.log('element default after',JSON.stringify(element));
                    this.QbToSfDefaultData[i].fieldsJson = element; 
                }
                ////console.log('default data',JSON.stringify(this.QbToSfDefaultData));
                
            });
        }catch(e){
            ////console.log('error line 2346',e);
        }
        
        
    }
    closeDefaultPopup(){
        this.showModalDefault = false;
    }
    

    
    
}