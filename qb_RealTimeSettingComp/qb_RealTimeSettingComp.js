import { LightningElement, api, track } from "lwc";
import getMetadataObj from "@salesforce/apex/HandleRealTimeMetadata.getMetadataObj";
import updateRealtimeConfigMetadata from '@salesforce/apex/HandleRealTimeMetadata.updateRealtimeConfigMetadata';

export default class Qb_RealTimeSettingComp extends LightningElement {
    @api qbToSfCompanyrecords;
    @track ifZero;
    @track isLoaded = false;
    @track customMetadataList;
    @track errorOccured;
    @track ifNoProFeature;
    @track ifNoCompany;
    //@track notPremium;
    //@track isProFeatureActivated;

    // get options() {
    //     return [
    //         { label: 'New', value: 'new' },
    //         { label: 'In Progress', value: 'inProgress' },
    //         { label: 'Finished', value: 'finished' }
    //     ];
    // }

    connectedCallback() {
        this.handleGetRealTimeConfigData();
    }


    handleGetRealTimeConfigData(){
        getMetadataObj({})
            .then((result) => {
                this.isLoaded = true;

                console.log('Result>>>>', JSON.stringify(result));
                console.log('Result is company found' , result.isCompanyFound);
                if(!result.isSuccess){
                    this.template.querySelector("c-qb_-custom-toast-comp").showCustomTostMessage({
                        title: "Error Occured",
                        message:result.errMessage,
                        variant: "error",
                        autoclose: true,
                    }); 
                    this.errorOccured = true;
                    return;
                }
                // if(!result.isProFeatureActivated){
                //     //this.isProFeatureActivated = false;
                //     this.ifNoProFeature = true;
                //     return;
                // }
                console.log('Not returned')
                if(!result.isCompanyFound){
                   // this.ifZero = true;
                    this.ifNoCompany = true;
                    return;
                }
                
                console.log('Json result>>>>>>>>>>>>>' , JSON.stringify(result));
                let jsonArray = JSON.stringify(result.realTimeConfigureList);
                console.log('JsonArray>>>>>>>>>>' , JSON.stringify(jsonArray));
                console.log('JsonArray464564>>>>>>>>>>' , jsonArray);
                const parsedJson = JSON.parse(jsonArray);
                console.log('Parsed JSON>>>>>>' , parsedJson);
                this.customMetadataList = parsedJson.map(company => {
                company.data = JSON.parse(company.data);
                return company;
                });
                console.log('this.customMetadataList[0].qbCompanyName>>' , this.customMetadataList[0].qbCompanyName);
                // Convert the JSON object into an array of key-value pairs
                // this.customMetadataList = jsonArray.map(item => {
                //     let key = Object.keys(item)[0]; // Extract the company name as key
                //     let valueString = item[key]; // Extract the value as a string
                //     let valueArray = JSON.parse(valueString); // Parse the value into an array
                //     return {
                //         key: key,
                //         value: valueArray
                //     }; // Return the key-value pair
                // });
                if (this.customMetadataList.length == 1) {
                    this.template.querySelector('lightning-accordion').activeSectionName = this.customMetadataList[0].qbCompanyName;
                }
                // else if (this.customMetadataList.length == 0) {
                //     this.ifZero = true;
                // }   


                //this.isProFeatureActivated = true;
            })
            .catch((e) => {
                console.log("Error: " + e.message);
            });
    }





    // handleAddMoreButton(event) {
    //     try {
    //         let companyName = (event.target.parentElement.parentElement.label);
    //         let newObjTemp = {
    //             isChecked: false,
    //             objectName: '',
    //             isStandard: false,
    //             iconName: 'standard:channel_programs'
    //         }
    //         this.customMetadataList.find(item => item.key === companyName).value.push(newObjTemp);
    //     } catch (e) {
    //         console.log(e.message);
    //     }
    // }

    handleSaveButton() {
        console.log('test 2', JSON.stringify(this.customMetadataList));
        // let customMetadataListString = JSON.stringify(this.customMetadataList);
        updateRealtimeConfigMetadata({realTimeConfigValue: this.customMetadataList}).then(()=>{
            console.log('Fetched Successfully');
        })
        //saveQbToSfConfigData({ SfqbWrapDataList: JSON.stringify(this.QbToSfConfigDataList), deleteId: this.deleteId }).then(result => {
        this.template.querySelector("c-qb_-custom-toast-comp").showCustomTostMessage({
            title: "Successfully Saved",
            variant: "success",
            autoclose: true,
        }); 
    }

    // handleComboBox(event) {
    //     try {
    //         let currentIndex = event.target.dataset.index;
    //         let currentObjectName = event.target.value;
    //         let currentCompanyName = event.target.dataset.label;
    //         this.customMetadataList.find(item => item.key === currentCompanyName).value[currentIndex].objectName = currentObjectName;
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // }

    handleCheckBox(event) {
        try {
            let currentIndex = event.target.dataset.index;
            let currentCompanyName = event.target.dataset.label;
            console.log('company name 23',currentCompanyName);
            console.log(' this.customMetadataList333', this.customMetadataList);
            this.customMetadataList.forEach((item)=>{
                console.log('Item value>>>' , JSON.stringify(item));
                console.log('Item value2>>>' , item.qbCompanyName);
                console.log('Item value3>>>' , currentCompanyName);
                if(item.qbCompanyName == currentCompanyName){
                    console.log('first>>>');
                    let innerValue = item.data;
                    console.log('second>>>');
                    console.log(innerValue[currentIndex].isChecked, 'isCHecked');
                    innerValue[currentIndex].isChecked = event.target.checked;
                }
            })
            //this.customMetadataList.find(item => item.qbCompanyName === currentCompanyName).data[currentIndex].isChecked = event.target.checked;
        } catch (error) {
            console.log(error.message);
        }
    }
}