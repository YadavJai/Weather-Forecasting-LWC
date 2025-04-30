import { LightningElement,api,track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import customLabels from 'c/qb_CustomLabels';


export default class WelcomeAfterSignComp extends NavigationMixin(LightningElement) {
    
    @api isSalesforce;
    @api realmId ='';
    @api companyLabel = '';
    @api isConnectionSuccessful=false;
    @track iconProperty={
        name:'utility:check',
        iconClass:'success-icon'
    }
    @track isErrorOccurred;
    
    // For custom labels
    @api welcomeMessage;
    welcomeCongratsMessage;
    welcomeClickProceed;


    constructor() {
        super();
    }

    connectedCallback() {
        this.loadCustomLabel();
    }

    renderedCallback(){
        if(this.isErrorOccurred){
            this.template.querySelector('.slds-button').classList.remove('success-style');
            this.template.querySelector('.slds-button').classList.add('error-style');
            this.template.querySelector('.main-div').classList.remove('success-div');
            this.template.querySelector('.main-div').classList.add('error-div');
            this.template.querySelectorAll('.text').forEach((element)=>{
                element.classList.add('slds-text-color_error');
                element.classList.remove('slds-text-color_success');
            });

            
        }
    }

    loadCustomLabel(){

        let customLabel = new customLabels();
        customLabel.getCustomLabels().then((label)=>{
            if(!this.isSalesforce){
                //Success case
                if(this.realmId && this.companyLabel){
                    this.welcomeMessage = label.qbWelcomeLoginQuickBooks;
                    this.welcomeCongratsMessage = label.qbWelcomeCongrats;
                    this.welcomeClickProceed = label.qbWelcomeClickProceed;
                //Failure case
                }else{
                    this.iconProperty.name="utility:close";
                    this.iconProperty.iconClass="error-icon";
                    this.welcomeMessage = label.qbWelcomeLoginErrorQuickBooks;
                    this.welcomeCongratsMessage = label.qbWelcomeError;
                    this.welcomeClickProceed = label.qbWelcomeClickProceed;
                    this.isErrorOccurred=true;
                }
            // When Calling from salesforce authorization controller
            }else{
                //Success case
                if(this.isConnectionSuccessful){
                    this.welcomeMessage = label.qbWelcomeLoginSalesforce;
                    this.welcomeCongratsMessage = label.qbWelcomeCongrats;
                    this.welcomeClickProceed = label.qbWelcomeClickProceed;
                //Failure case
                }else{
                    this.iconProperty.name="utility:close";
                    this.iconProperty.iconClass="error-icon";
                    this.welcomeMessage = label.qbWelcomeLoginErrorQuickBooks;
                    this.welcomeCongratsMessage = label.qbWelcomeError;
                    this.welcomeClickProceed = label.qbWelcomeClickProceed;
                    this.isErrorOccurred=true;
                }
            }
        }).catch((error)=>{
            //console.log('Error while getting the custom labels');
        });
    }



    createCookie(value){     
        var cookieName = 'companyInfoCookie';
        var expires;
        var day = 1;
        const date = new Date();

        date.setTime(date.getTime() + (day * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
        document.cookie = cookieName + "=" + escape(value) + expires + "; path=/"; 
    }

    handleClick(event){
        try{
            let urlToOpen;
            if(this.isSalesforce){
                urlToOpen = '/lightning/n/hic_qbmadeasy__QB_Package_Configure';
            }else{
                urlToOpen = '/lightning/n/hic_qbmadeasy__QB_Package_Configure';
            }
            
            window.open(urlToOpen,"_self");
        }
        catch(ex){
            ////console.log('exception is',ex);
        }
    }
}