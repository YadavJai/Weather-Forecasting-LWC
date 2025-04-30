import { LightningElement, track, api } from 'lwc';
import sObjFieldsList from "@salesforce/apex/Qb_ConfigController.fetchSobjAllFields";
//Custom labels
/*import qbRelatedFieldLabel from '@salesforce/label/c.qbRelatedFieldLabel';
import 	SFRelatedFieldLabel from '@salesforce/label/c.SFRelatedFieldLabel';
import 	ConstantMappingFieldLabel from '@salesforce/label/c.ConstantMappingFieldLabel';
import 	ConstantMappingFieldTitleLabel from '@salesforce/label/c.ConstantMappingFieldTitleLabel';
import SkipOnRealTimeSync from '@salesforce/label/c.SkipOnRealTimeSync';*/

export default class Qb_QbToSfRelFieldsMappingComp extends LightningElement {
    @api relatedDataList;
    @api sfChildObjectName;
    @api cpChildObjectFields;
    @api qbToSf = false;
    @track inProgress = false;
    @track maxReferenceCount = 1;
    @track RelatedMappingDataList = new Array();
    @track VisibleRelatedMappingDataList = new Array();
    @track sfchildObjectFieldList = new Array();
    @track cpchildObjectFieldList = new Array();
    @track referenceFieldList = new Array();
    disableRemoveButton;
    /* label = {qbRelatedFieldLabel,SFRelatedFieldLabel,ConstantMappingFieldLabel,
                 ConstantMappingFieldTitleLabel, 
                 SkipOnRealTimeSync};*/
    connectedCallback() {
        let vm = this;

        let sfChildobject = this.sfChildObjectName;
        let ReferenceListTemp = [];
        //let cpChildobject = this.cpChildObjectName;
        ////console.log.log.log('cpChildobject>>' + sfChildobject);
        ////console.log.log.log('cpChildobject>>' + JSON.stringify(this.cpChildObjectFields));
        ////console.log.log.log('relatedDataList>>' + JSON.stringify(this.relatedDataList));
        ////console.log.log.log('relatedDataList2>>' + this.relatedDataList);
        // let referenceFieldListTemp = JSON.stringify(this.relatedDataList);
        ////console.log.log.log('vm.RelatedMappingDataList.length -- 56',vm.RelatedMappingDataList.length);
                
        
        this.cpchildObjectFieldList = this.cpChildObjectFields;
        if (sfChildobject) {
            sObjFieldsList({ sobjectName: sfChildobject }).then(result => {
                ////console.log.log.log('sObjFieldList==>', result);
                //this.referenceFieldList = result;
                this.sfchildObjectFieldList = result;
                ////console.log.log.log('sfchildObjectFieldList_Check>>', JSON.stringify(this.sfchildObjectFieldList));
                vm.RelatedMappingDataList = vm.relatedDataList;
                // ////console.log.log.log('relatedMapping1==>', vm.RelatedMappingDataList);
                // ////console.log.log.log('relatedMapping2==>', vm.relatedDataList);
                // ////console.log.log.log('relatedMapping3==>', JSON.stringify(this.relatedDataList));


                /*for (var value in this.relatedDataList) {
                    if (this.relatedDataList[value].sfreferenceObj) {
                        ////console.log.log.log('pavalue1', this.relatedDataList[value].sfreferenceObj);
                        this.ReferenceListTemp.push(this.relatedDataList[value].sfreferenceObj);
                        // strValue was non-empty string, true, 42, Infinity, [], ...
                    }
                    ////console.log.log.log('pavalue2', this.relatedDataList[value].sfreferenceObj);
                    ////console.log.log.log('pavalue3', this.ReferenceListTemp);
                }*/
                //     sObjFieldsList({ sobjectName: referenceObj }).then(result => {
                //         this.inProgress = false;
                //         this.referenceFieldList = result;
                //         ////console.log.log.log('primary_referenceFieldList>>' + JSON.stringify(this.referenceFieldList));
                //     }); 

                if (vm.RelatedMappingDataList === undefined || vm.RelatedMappingDataList.length === 0) {
                    ////console.log.log.log('in if');
                    vm.disableRemoveButton = true;
                    vm.addBlankMappingFunction();
                }else{
                    ////console.log.log.log('in else');
                    vm.addMappingFunction();
                }

            })
                .catch(error => {
                    this.error = error;
                    ////console.log.log.log(this.error);
                });
        }

    }

    async setUpdatedValuetochildObjMapRec(event) {
        let configId = event.currentTarget.parentElement.parentElement.dataset.configid;
        let fieldLabel = '';
        let dataVal;
        
        // let fieldType = '';
        ////console.log.log.log('event.currentTarget.type>>', JSON.stringify(event.currentTarget));
        ////console.log.log.log('event.currentTarget.type>>', event.currentTarget.dataset.type);
        ////console.log.log.log('event_Details>>', JSON.stringify(event.detail));
        ////console.log.log.log('event_configId>>', configId);

        try{
            if (event.currentTarget.type === 'checkbox') {
                dataVal = event.detail.checked;
            } else if (event.currentTarget.type === 'text') {
                fieldLabel = event.detail.value;
                dataVal = event.detail.value;
            } else {
                fieldLabel = event.target.options.find(opt => opt.value === event.detail.value).label;
                dataVal = event.detail.value;
                
                /*if(event.currentTarget.name === 'sf_fieldName') {
                    fieldType = event.target.options.find(opt => opt.value === event.detail.value).type;
                }*/
            }
            // ////console.log.log.log('fieldType>>', fieldType);
            //////console.log.log.log('fieldLabel>> '+fieldLabel);
            ////console.log.log.log('before_RelatedMappingDataList>>', JSON.stringify(this.RelatedMappingDataList));
            ////console.log.log.log('before_VisibleRelatedMappingDataList>>', JSON.stringify(this.VisibleRelatedMappingDataList));
            let RelatedMappingDataListTemp = [];
            var VisibleRelatedMappingDataListTemp = [];
            ////console.log.log.log('Test Check Promise>>');
            if (this.VisibleRelatedMappingDataList) {
                //this.VisibleRelatedMappingDataList = this.RelatedMappingDataList;// Commented By Sameer 11.20.2022
                ////console.log.log.log('Inside_RelatedMappingDataList>>', this.VisibleRelatedMappingDataList);
                // this.VisibleRelatedMappingDataList.forEach(async element => {  // For_Each_Loop
                for (let element of this.VisibleRelatedMappingDataList) {
                    ////console.log.log.log('element>>', element);
                    ////console.log.log.log('Test Check Promise1>>');
                    ////console.log.log.log('Inside_RelatedMappingDataListForEach>>', element.configId);
                    if (element.configId === configId) {
                        ////console.log.log.log('Inside_IfRelatedMappingDataListForEach>>');
                        let eachConfigRow = element;
                        let eachConfigRowVisible = element;
                        eachConfigRow = { ...eachConfigRow, [event.currentTarget.name]: dataVal };
                        ////console.log.log.log('eachConfigRow>>', eachConfigRow);
                        eachConfigRowVisible = { ...eachConfigRowVisible, [event.currentTarget.name]: dataVal };
                        ////console.log.log.log('eachConfigRowVisible>>', eachConfigRowVisible);
                        if (event.currentTarget.dataset.fieldlabel) {
                            eachConfigRow = { ...eachConfigRow, [event.currentTarget.dataset.fieldlabel]: fieldLabel };
                            eachConfigRowVisible = { ...eachConfigRowVisible, [event.currentTarget.dataset.fieldlabel]: fieldLabel };
                        }
    
                        ////console.log.log.log('dataVal>>', dataVal);
                        if (dataVal) {
                            if (event.currentTarget.dataset.type === 'primary') {
    
                                let referenceObj = '';
                                let relationShip = '';
                                let isRefField = false;
                                let sfFieldOptions = event.target.options;
                                ////console.log.log.log('sfFieldOptions>>', JSON.stringify(sfFieldOptions));
                                if (sfFieldOptions) {
                                    // sfFieldOptions.forEach(fldElement => {  // Nested_For_Each_Loop
                                    for (let fldElement of sfFieldOptions) {
    
                                        ////console.log.log.log('fldElement.value>>', fldElement.value);
                                        if (fldElement.value === dataVal) {
                                            ////console.log.log.log('selectedfieldName>>', dataVal);
                                            if (fldElement.type === 'REFERENCE') {
                                                let referenceCount = 1;
                                                isRefField = true;
                                                referenceObj = fldElement.referenceObj;
                                                relationShip = fldElement.relationShip;
                                                eachConfigRow = { ...eachConfigRow, isReferenceMapping: true, referenceCount: (this.maxReferenceCount && referenceCount <= this.maxReferenceCount ? referenceCount : this.maxReferenceCount), isSFReferenceObjNotNull: true, sfreferenceObj: referenceObj, sfrelationName: relationShip };
                                                eachConfigRowVisible = { ...eachConfigRowVisible, isReferenceMapping: true, referenceCount: (this.maxReferenceCount && referenceCount <= this.maxReferenceCount ? referenceCount : this.maxReferenceCount), isSFReferenceObjNotNull: true, sfreferenceObj: referenceObj, sfrelationName: relationShip };
                                            }
                                            else {
                                                eachConfigRow = { ...eachConfigRow, isReferenceMapping: false, referenceCount: 0, isSFReferenceObjNotNull: false, sfreferenceObj: '', sfrelationName: '' };
                                                eachConfigRowVisible = { ...eachConfigRowVisible, isReferenceMapping: false, referenceCount: 0, isSFReferenceObjNotNull: false, sfreferenceObj: '', sfrelationName: '' };
                                            }
                                        }
                                        // });
                                    }
                                    ////console.log.log.log('primary_eachConfigRow>>', JSON.stringify(eachConfigRow));
                                    ////console.log.log.log('primary_eachConfigRowVisible>>', JSON.stringify(eachConfigRowVisible));
                                }
                                if (isRefField) {
                                    this.inProgress = true;
                                    ////console.log.log.log('referenceObj>>', referenceObj);
                                    await sObjFieldsList({ sobjectName: referenceObj }).then(result => {
                                        this.inProgress = false;
                                        // this.referenceFieldList = result;
                                        eachConfigRowVisible = { ...eachConfigRowVisible, referenceFieldList: result };
                                        ////console.log.log.log('eachConfigRowVisible1==>>', eachConfigRowVisible);
                                        // ////console.log.log.log('primary_eachConfigRowVisible>>' + JSON.stringify(this.eachConfigRowVisible));
                                    }).catch(error => {
                                        this.error = error;
                                        ////console.log.log.log(this.error);
                                    });
                                }
    
                            }
                            else if (event.currentTarget.dataset.type === 'secondary') {
                                let referenceObj2 = '';
                                let relationShip2 = '';
                                let isRefField2 = false;
                                let sfField2Options = event.target.options;
                                if (sfField2Options) {
                                    // sfField2Options.forEach(fldElement => {
                                    for (let fldElement of sfField2Options) {
    
                                        if (fldElement.value === dataVal) {
                                            ////console.log.log.log('selectedfieldName>>', dataVal);
                                            if (fldElement.type === 'REFERENCE') {
                                                let referenceCount = 2;
                                                isRefField2 = true;
                                                referenceObj2 = fldElement.referenceObj;
                                                relationShip2 = fldElement.relationShip;
                                                eachConfigRow = { ...eachConfigRow, referenceCount: (this.maxReferenceCount && referenceCount <= this.maxReferenceCount ? referenceCount : this.maxReferenceCount), sfreferenceObj2: referenceObj2, sfrelation2Name: relationShip2 };
                                                eachConfigRowVisible = { ...eachConfigRowVisible, referenceCount: (this.maxReferenceCount && referenceCount <= this.maxReferenceCount ? referenceCount : this.maxReferenceCount), sfreferenceObj2: referenceObj2, sfrelation2Name: relationShip2 };
                                            }
                                            else {
                                                eachConfigRow = { ...eachConfigRow, referenceCount: 1, sfreferenceObj2: '', sfrelation2Name: '' };
                                                eachConfigRowVisible = { ...eachConfigRowVisible, referenceCount: 1, sfreferenceObj2: '', sfrelation2Name: '' };
                                            }
                                        }
                                    }
                                    // });
                                    ////console.log.log.log('secondary_eachConfigRow>>', JSON.stringify(eachConfigRow));
                                }
                                /*if (isRefField2) {
                                    this.inProgress = true;
                                    await sObjFieldsList({ sobjectName: referenceObj2 }).then(result => {
                                        this.inProgress = false;
                                        // this.referenceField2List = result;
                                        eachConfigRowVisible = { ...eachConfigRowVisible, referenceField2List: result };
                                        ////console.log.log.log('secondary_referenceField2List>>' + JSON.stringify(this.referenceField2List));
                                    });
                                }*/
                            }
                        }
                        ////console.log.log.log('InBetweenPromise1&2_Reference');
                        RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, JSON.parse(JSON.stringify(eachConfigRow))];
                        ////console.log.log.log('eachConfigRowVisible2==>>', eachConfigRowVisible);
                        VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, eachConfigRowVisible];
    
                    } else {
                        ////console.log.log.log('InBetweenPromise1&2');
                        RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, JSON.parse(JSON.stringify(element))];
                        VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, element];
                    }
                    ////console.log.log.log('Test Check Promise2>>');
                }
                // });
                // ////console.log.log.log('innerPromiseArr_value>>', value);
                ////console.log.log.log('Test Check Promise3>>');
                this.RelatedMappingDataList = RelatedMappingDataListTemp;
                this.VisibleRelatedMappingDataList = VisibleRelatedMappingDataListTemp;
                ////console.log.log.log('RelatedMappingDataList_inPromiseAll>>', JSON.stringify(this.RelatedMappingDataList));
                ////console.log.log.log('VisibleRelatedMappingDataList_inPromiseAll>>', JSON.stringify(this.VisibleRelatedMappingDataList));
    
                //Remove referencedFieldList from RelatedMappingDataListTemp
                ////console.log.log.log('remove_ReferenceFieldsListfromMainList>>');
                if (this.RelatedMappingDataList) {
                    this.RelatedMappingDataList.forEach(function (element) {
                        Object.keys(element).forEach(function (key) {
                            if (key.startsWith('referenceField') && key.endsWith('List')) {
                                ////console.log.log.log('referenceField_key>>', key);
                                delete element[key];
                            }
                        });
                    });
                }
            }
    
            // ////console.log.log.log('outerPromiseArr_value>>', value);
            ////console.log.log.log('Test Check Promise4>>');
            ////console.log.log.log('After_RelatedMappingDataList>>', JSON.stringify(this.RelatedMappingDataList));
            ////console.log.log.log('After_VisibleRelatedMappingDataList>>', JSON.stringify(this.VisibleRelatedMappingDataList));
    
            const relmapConfigEvt = new CustomEvent("relmappingconfigchange", {
                detail: this.RelatedMappingDataList
            });
            this.dispatchEvent(relmapConfigEvt);
        }catch(ex){
            ////console.log.log.log('in 99 ',ex.message);
        }
    }

    async addMappingFunction() {
        // let RelatedMappingDataListTemp = new Array();
        ////console.log.log.log('In_addMappingFunction');
        let VisibleRelatedMappingDataListTemp = new Array();
        if (this.RelatedMappingDataList) {
            //this.VisibleRelatedMappingDataList = this.RelatedMappingDataList;
            let vm = this;
            let promise = [];
            // this.VisibleRelatedMappingDataList.forEach(element => {
            for (let element of this.RelatedMappingDataList) {
                ////console.log.log.log('addMappingFunction_PromiseCheck1');
                // RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, element];
                // VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, element];
                // promise.push(new Promise(async (resolve, reject) => {
                ////console.log.log.log('addMappingFunction_PromiseCheck2');
                ////console.log.log.log('element.isReferenceMapping>>', element.isReferenceMapping);
                let eachConfigRow = element;
                if (element.isReferenceMapping) {
                    let referenceCountInt = (vm.maxReferenceCount && element.referenceCount <= vm.maxReferenceCount ? element.referenceCount : vm.maxReferenceCount);
                    ////console.log.log.log('referenceCountInt>>', referenceCountInt);
                    for (referenceCountInt; referenceCountInt <= vm.maxReferenceCount; referenceCountInt++) {
                        ////console.log.log.log('referenceCountInt>>', referenceCountInt);
                        ////console.log.log.log('For_Loop');
                        if (referenceCountInt > 1) {
                            await sObjFieldsList({ sobjectName: element['sfreference' + referenceCountInt + 'Obj'] }).then(result => {
                                eachConfigRow = { ...eachConfigRow, ['referenceField' + referenceCountInt + 'List']: result };
                                ////console.log.log.log('Apex_Call_1');
                            });
                        }
                        else {
                            await sObjFieldsList({ sobjectName: element['sfreferenceObj'] }).then(result => {
                                eachConfigRow = { ...eachConfigRow, ['referenceFieldList']: result };
                                ////console.log.log.log('Apex_Call_2');
                            });
                        }
                    }
                    ////console.log.log.log('eachConfigRow_MappingFunc>>', JSON.stringify(eachConfigRow));
                    VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, eachConfigRow];

                }
                else {
                    VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, eachConfigRow];
                }
                ////console.log.log.log('addMappingFunction_PromiseCheck3');
                // resolve(null);
                // }));
            }

            // });
            ////console.log.log.log('addMappingFunction_PromiseCheck4');
            // Promise.all(promise).then(() => {
            vm.VisibleRelatedMappingDataList = VisibleRelatedMappingDataListTemp;
            ////console.log.log.log('RelatedMappingDataList_ConCall>>', JSON.stringify(vm.RelatedMappingDataList));
            ////console.log.log.log('VisibleRelatedMappingDataList_ConCall>>', JSON.stringify(vm.VisibleRelatedMappingDataList));
            // });
        }
    }

    addBlankMappingFunction() {
        ////console.log.log.log('In_addBlankMappingFunction>>');
        let RelatedMappingDataListTemp = new Array();
        let VisibleRelatedMappingDataListTemp = new Array();
        if (this.VisibleRelatedMappingDataList) {
            ////console.log.log.log('In_If>>');
            ////console.log.log.log('Line_303_RelatedMappingDataList>>', JSON.stringify(this.RelatedMappingDataList));
            ////console.log.log.log('Line_303_VisibleRelatedMappingDataList>>', JSON.stringify(this.VisibleRelatedMappingDataList));
            this.VisibleRelatedMappingDataList.forEach(function (element) {
                ////console.log.log.log('Element_Line_316', JSON.stringify(element));
                RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, JSON.parse(JSON.stringify(element))];
                VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, element];
                ////console.log.log.log('In_Loop>>');
            });
        }
        ////console.log.log.log('Line_no_326_RelatedMappingDataList>>', JSON.stringify(RelatedMappingDataListTemp));
        ////console.log.log.log('Line_no_327_VisibleRelatedMappingDataList>>', JSON.stringify(VisibleRelatedMappingDataListTemp));
        //Remove referencedFieldList from RelatedMappingDataListTemp
        ////console.log.log.log('remove_ReferenceFieldsListfromMainList>>');
        if (RelatedMappingDataListTemp) {
            RelatedMappingDataListTemp.forEach(function (element) {
                Object.keys(element).forEach(function (key) {
                    if (key.startsWith('referenceField') && key.endsWith('List')) {
                        ////console.log.log.log('referenceField_key>>', key);
                        delete element[key];
                    }
                });
            });
        }
        ////console.log.log.log('afterRemovingReferenceList_RelatedMappingDataListTemp>>', JSON.stringify(RelatedMappingDataListTemp));
        ////console.log.log.log('afterRemovingReferenceList_VisibleRelatedMappingDataListTemp>>', JSON.stringify(VisibleRelatedMappingDataListTemp));

        let configId = this.getRandomString(18);
        ////console.log.log.log('configId>>', configId);
        RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, { configId: configId, isConstant: false, sf_fieldName: '', sf_fieldLabel: '', qb_fieldName: '', cp_fieldLabel: '' }];
        VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, { configId: configId, isConstant: false, sf_fieldName: '', sf_fieldLabel: '', qb_fieldName: '', cp_fieldLabel: '' }];
        ////console.log.log.log('Line312>>');
        this.RelatedMappingDataList = RelatedMappingDataListTemp;
        this.VisibleRelatedMappingDataList = VisibleRelatedMappingDataListTemp;
        ////console.log.log.log('Final_RelatedMappingDataList>>', JSON.stringify(RelatedMappingDataListTemp));
        ////console.log.log.log('Final_VisibleRelatedMappingDataList>>', JSON.stringify(VisibleRelatedMappingDataListTemp));

        if(this.RelatedMappingDataList.length > 1){
            this.disableRemoveButton = false;
        }


    }


    @api
    hightlightBlankFields() {
        ////console.log.log.log('Method Called');
        this.template.querySelectorAll('tr.validate-field-row').forEach(function (eachRow) {
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                eachColumn.classList.remove('slds-has-error');
            });
            eachRow.querySelectorAll('.validation-check-for-sf-field').forEach(function (eachColumn) {
                ////console.log.log.log('Line_378');
                if (eachColumn.value == '' || eachColumn.value == undefined) {
                    ////console.log.log.log('Line_338s');
                    eachColumn.classList.add('slds-has-error');
                }
            });
        });
    }

    
    removeMappingFunction(event) {
        this.disableRemoveButton = false;
        let configId = event.currentTarget.parentElement.parentElement.dataset.configid;
        let RelatedMappingDataListTemp = new Array();
        let VisibleRelatedMappingDataListTemp = new Array();
        if (this.VisibleRelatedMappingDataList) {
            this.VisibleRelatedMappingDataList.forEach(function (element) {
                if (element.configId !== configId) {
                    RelatedMappingDataListTemp = [...RelatedMappingDataListTemp, JSON.parse(JSON.stringify(element))];
                    VisibleRelatedMappingDataListTemp = [...VisibleRelatedMappingDataListTemp, element];
                }
            });
            this.RelatedMappingDataList = RelatedMappingDataListTemp;
            this.VisibleRelatedMappingDataList = VisibleRelatedMappingDataListTemp;
        }

        //Remove referencedFieldList from RelatedMappingDataListTemp
        ////console.log.log.log('remove_ReferenceFieldsListfromMainList>>');
        if (this.RelatedMappingDataList) {
            this.RelatedMappingDataList.forEach(function (element) {
                Object.keys(element).forEach(function (key) {
                    if (key.startsWith('referenceField') && key.endsWith('List')) {
                        ////console.log.log.log('referenceField_key>>', key);
                        delete element[key];
                    }
                });
            });
        }
        ////console.log.log.log('Final_RelatedMappingDataList>>', JSON.stringify(this.RelatedMappingDataList));
        ////console.log.log.log('Final_VisibleRelatedMappingDataList>>', JSON.stringify(this.VisibleRelatedMappingDataList));
        ////console.log.log.log('related Length ==> ',this.RelatedMappingDataList.length);
        ////console.log.log.log('Final_VisibleRelatedMappingDataList Length ==> ',this.VisibleRelatedMappingDataList.length);

        if(this.RelatedMappingDataList.length <= 1){
            this.disableRemoveButton = true;
        }

        const relmapConfigEvt = new CustomEvent("relmappingconfigchange", {
            detail: this.RelatedMappingDataList
        });
        this.dispatchEvent(relmapConfigEvt);
    }

    getRandomString(len) {
        let RandomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
        let randStr = '';
        while (randStr.length < len) {
            randStr += RandomChars[Math.floor(Math.random() * RandomChars.length)];
        }
        return randStr;
    }
}