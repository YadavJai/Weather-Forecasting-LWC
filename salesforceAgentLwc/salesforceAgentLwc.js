import { LightningElement } from 'lwc';

export default class SalesforceAgentLwc extends LightningElement {

    /**
     * @description: This method's work is to handle the click on the points
     */
    handleClickOnPoint(event){
        try{
            const point = event.target.dataset.label;
            console.log(point);
            this.template.querySelector('c-agent-chat-lwc').fillPointValueInInputField(point);
        }catch(ex){
            console.log(ex);
        }
    }


}