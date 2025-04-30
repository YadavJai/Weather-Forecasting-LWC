import { LightningElement,api,track } from 'lwc';

export default class Warning_Modal extends LightningElement {

@api showWarningModal=false;
@api modalDeveloperName;
@api modalCompanyId;
@api modalCompanyIndex;
@api message;
@api setName;
@api setId;
@api emailBatch;

handleYesEvent(){
    if(this.modalCompanyId){
    const detail = {
        devName:this.modalDeveloperName,
        compId:this.modalCompanyId,
        compInd:this.modalCompanyIndex
    };
    this.dispatchEvent(new CustomEvent("yesevent",{
        detail:detail
    }));    
    }
    else if(this.setName){
        const detail = {
            setName:this.setName,
            setId:this.setId,
            emailBatch:this.emailBatch
        }
        this.dispatchEvent(new CustomEvent("yesevent",{
            detail:detail
        }));
    }
}

handleNoEvent(){
    this.dispatchEvent(new CustomEvent("noevent"));    
}

}