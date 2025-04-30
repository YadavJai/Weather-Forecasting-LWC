import { LightningElement,api,track } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
export default class Qb_CustomToastComp extends LightningElement {
    @api title;    
    @api message = 'Sample Message';
    @api variant = 'info';
    @api autoclosetime = 1500;
    @api autoclose = false;
    @track istitlerequired = false;
    @api containerCss;
    // variant options error,warning,success,info

    connectedCallback() {
        if( !this.containerCss ){
            this.containerCss = 'slds-notify_container'; 
        }
        //slds-notify_container slds-is-relative
        registerListener('customtostcompload', this.showCustomTostMessage, this);
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }
    @api
    showCustomTostMessage(resp) {
        this.title = resp.title;
        this.message = resp.message;
        this.variant = resp.variant;
        this.autoclose = resp.autoclose;

        if(this.title!=='' && this.title!==' ' && this.title!== null){
            this.istitlerequired = true;
        }else{
            this.istitlerequired = false;
        }      
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-show';        
        if(this.autoclose){
            if(this.variant === 'success'){
                this.delayTimeout = setTimeout(() => {
                    const toastModel1 = this.template.querySelector('[data-id="toastModel"]');
                    toastModel1.className = 'slds-hide';
                }, this.autoclosetime);
                
            }
            if(this.variant === 'error'){
                this.delayTimeout = setTimeout(() => {
                    const toastModel1 = this.template.querySelector('[data-id="toastModel"]');
                    toastModel1.className = 'slds-hide';
                }, this.autoclosetime);
                
            }
        }      
        
    }    
    closeModel() {
        const toastModel = this.template.querySelector('[data-id="toastModel"]');
        toastModel.className = 'slds-hide';
    }
    get mainDivClass() { 
        return 'slds-notify slds-notify_toast slds-theme_'+this.variant;
    }
    get messageDivClass() { 
        return 'slds-icon_container slds-icon-utility-'+this.variant+' slds-icon-utility-success slds-m-right_small slds-no-flex slds-align-top';
    }
    get iconName() {
        return 'utility:'+this.variant;
    }
}