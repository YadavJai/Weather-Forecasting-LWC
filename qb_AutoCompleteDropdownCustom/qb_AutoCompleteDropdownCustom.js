import { LightningElement, api, track } from 'lwc';

/** The delay used when debouncing event handlers before invoking functions. */
const delay = 350;
export default class qb_AutoCompleteDropdownCustom extends LightningElement {

    //functional properties
    @api fieldLabel;
    @api disabled = false;
    @track openDropDown = false;
    @track inputValue = "";
    @api placeholder = "";
    @api options;
    @track optionsToDisplay;
    @api value = "";
    @track label = "";
    @api readOnly = false;
    @api requiredInput = false;
    @track dropDownOpen = false;
    @track selectedValue = '';
    @track hasError = false;
    @api origin;
    @api name;

    delayTimeout;

    //constructor
    constructor() {
        super();
    }

    connectedCallback() {

        this.setOptionsAndValues();
        ////console.log.log('value_Line_35', this.value);


    }

    renderedCallback() {
        ////console.log.log('value_Line_41', this.value);

        if (this.openDropDown) {
            this.dropDownOpen = this.openDropDown;
            this.template.querySelectorAll('.search-input-class').forEach(inputElem => {
                inputElem.focus();
            });

            this.template.querySelectorAll('.checkIcon').forEach(inputElem => {
                //inputElem.className = "slds-hide";
                inputElem.classList.add("slds-hide");
                inputElem.classList.remove("slds-show");
            });

            this.template.querySelectorAll('[data-id="' + this.value + '"]').forEach(inputElem => {
                //inputElem.className = "slds-show";
                inputElem.classList.remove("slds-hide");
                inputElem.classList.add("slds-show");
                inputElem.focus();
            });

        }

    }

    //Public Method to set options and values
    @api setOptionsAndValues() {
        /*Added by Sameer 06.10.2022 start */


        ////console.log.log('value==>>', this.value);


        //End


        this.optionsToDisplay = (this.options && this.options.length > 0 ? this.options : []);
        ////console.log.log('optionsToDisplay>>', JSON.stringify(this.optionsToDisplay));
        if (this.value && this.value != "") {
            let label = this.getLabel(this.value);
            ////console.log.log('Line_81');
            if (label && label != "") {
                ////console.log.log('Line_83');
                this.label = label;
            }
        }
        else {
            ////console.log.log('Enter in Else Part>>');
            this.label = "";
        }
        // ////console.log.log('this.this.options',JSON.stringify(this.options))
    }

    //Method to get Label for value provided
    getLabel(value) {
        ////console.log.log('Line_96', JSON.stringify(this.options));
        if (this.options) {
            let selectedObjArray = this.options.filter(obj => obj.value === value);
            if (selectedObjArray && selectedObjArray.length > 0) {
                return selectedObjArray[0].label;
            }
        }
        return null;
    }

    //Method to close listbox dropdown
    closeDropdown(event) {
        if (event.relatedTarget && event.relatedTarget.tagName == 'UL' && event.relatedTarget.className.includes('customClass')) {
            if (this.openDropDown) {
                this.template.querySelectorAll(".search-input-class").forEach(inputElem => {
                    inputElem.focus();
                });
            }
        } else {
            window.setTimeout(() => {
                this.toggleOpenDropDown(false);
            }, 300);
        }
    }

    //Method to handle readonly input click
    handleInputClick(event) {
        // ////console.log.log('called 104',JSON.stringify(this.options)) 

        if (this.readOnly == false && !this.disabled) {
            this.resetParameters();
            this.toggleOpenDropDown(true);
        }
    }

    closedropDownIcon(event) {
        ////console.log.log('closedropDownIcon called');
        this.toggleOpenDropDown(false);
    }
    opendropDownIcon(event) {
        this.toggleOpenDropDown(true);
    }

    //Method to handle key press on text input
    handleKeyPress(event) {
        const searchKey = event.target.value;
        this.setInputValue(searchKey);
        if (this.delayTimeout) {
            window.clearTimeout(this.delayTimeout);
        }

        this.delayTimeout = setTimeout(() => {
            //filter dropdown list based on search key parameter
            this.filterDropdownList(searchKey);
        }, delay);
    }

    //Method to filter dropdown list
    filterDropdownList(key) {

        const filteredOptions = this.options.filter(item => item.label.toLowerCase().includes(key.toLowerCase()));
        this.optionsToDisplay = filteredOptions;
    }

    //Method to handle selected option in listbox
    optionClickHandler(event) {
        try{
        ////console.log.log('optionclick handler called')
        const value = event.target.closest('li').dataset.value;
        const label = event.target.closest('li').dataset.label;
        const apiName = event.target.closest('li').dataset.type;
        const relatedname = event.target.closest('li').dataset.relatedname;
       

        this.setvalues(value, label);
        this.toggleOpenDropDown(false);
        const detail = {};
        detail["value"] = value;
        detail["apiName"] = apiName;
        detail['relatedname'] = relatedname;
        this.selectedValue = value;
        ////console.log.log('detail>>', detail);
        this.dispatchEvent(new CustomEvent('change', { detail: detail }));
        ////console.log.log('on line 160', this.options.length)
        ////console.log.log('optionClickHandler_line_174', JSON.stringify(this.optionsToDisplay));
        if(label != null){
            this.template.querySelectorAll('.qb_custom-field').forEach(item => {
             let fieldValue=item.value;
             let fieldLabel=item.label;            
             if(!label){
                 //item.setCustomValidity(fieldErrorMsg+' '+fieldLabel);
             }
             else{
                 item.setCustomValidity("");
             }
             item.reportValidity();
         });

        }
    }catch(e){
        ////console.log.log(JSON.stringify(e))
    }
    }

    //Method to reset necessary properties
    resetParameters() {
        this.setInputValue("");
        this.optionsToDisplay = this.options;
    }

    //Method to set inputValue for search input box
    setInputValue(value) {
        this.inputValue = value;
    }

    //Method to set label and value based on 
    //the parameter provided
    setvalues(value, label) {
        this.label = label;
        this.value = value;
    }

    //Method to toggle openDropDown state
    toggleOpenDropDown(toggleState) {
        this.openDropDown = toggleState;
    }

    //getter setter for labelClass
    get labelClass() {
        return (this.fieldLabel && this.fieldLabel != "" ? 'slds-form-element__label slds-show' : 'slds-form-element__label slds-hide');
    }
    get varient() {
        return (this.fieldLabel && this.fieldLabel != "" ? '' : 'label-hidden');
    }
    //getter setter for dropDownClass
    get dropDownClass() {

        return (this.openDropDown ? "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open" : "slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click");

    }

    get isDropdownOpen() {
        return (this.openDropDown ? true : false);
    }


    // validation error
    @api checkValidity() {

        const allValid = [...this.template.querySelectorAll('.qb_custom-field')]
            .reduce((validSoFar, inputCmp) => {
                ////console.log.log(inputCmp.value)
                if(!inputCmp.value){
                    inputCmp.setCustomValidity("Field is required");
                    ////console.log.log(inputCmp.value)
                    ////console.log.log(inputCmp)
                    
                    //inputCmp.classList.add('customError')
                }else{
                    inputCmp.setCustomValidity("");
                }
                inputCmp.reportValidity();
                return validSoFar && inputCmp.checkValidity();
            }, true);

        return allValid;
    }
}