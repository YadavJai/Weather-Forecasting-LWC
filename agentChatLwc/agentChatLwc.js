import { api, LightningElement,track } from 'lwc';
import sendQuery from '@salesforce/apex/AgentChatHandler.sendQuery';
import quickieBot from '@salesforce/resourceUrl/Quickie_Bot';

export default class AgentChatLwc extends LightningElement {

    @track isQueryInserted;
    @track isTooltipVisible = false;
    @track queryAndResponseList = [];
    @track disableInputField = false;
    @track quickieBotUrl = quickieBot;

    showTooltip() {
        // this.isTooltipVisible = true;
    }

    hideTooltip() {
        //this.isTooltipVisible = false;
    }



    /**
     * @description: This method will handle the query inserted by the user and provide the response to the user
    */
    handleQueryInsertion(){
        try{
            console.log('handleQueryInsertion');
            const query = this.template.querySelector('.input-box').value;
            if(query == ''){
                return;
            }
            this.isQueryInserted = true;
            this.disableInputField = true;
            console.log(query);
            this.queryAndResponseList.push({
                isQuery:true,
                query:query 
            })
            console.log(JSON.stringify(this.queryAndResponseList));
            this.template.querySelector('.input-box').value = '';
            sendQuery({query:query}).then((response)=>{
                console.log('response', response);
                this.disableInputField = false;
                const parsedResponse = JSON.parse(response);
                const agentResponse = parsedResponse.value;
                console.log(agentResponse);
                this.queryAndResponseList.push({
                    isQuery:false,
                    response:agentResponse
                })
            })
        }catch(e){
            console.log('Error occurred in handleQueryInsertion', e.getMessage());
        }
    }

    handleKeyDown(event){
        if(event.key == 'Enter'){
            this.handleQueryInsertion();
        }
    }



    /**
     * @description: fill the input value same as the point
     */
    @api
    fillPointValueInInputField(point){
        console.log('point' + point);
        this.template.querySelector('.input-box').value = point;
    }

}