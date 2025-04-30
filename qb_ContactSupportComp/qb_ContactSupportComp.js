import { LightningElement,api } from 'lwc';

export default class Qb_ContactSupportComp extends LightningElement {
    @api message;
    handleSubmit(event) {
        let vm=this;
        event.preventDefault(); // Prevent the default form submission
        let query = this.template.querySelector('[data-name="description"]').value;
        // //console.log('query>>>',query);
        if(!query){

            vm.template
            .querySelector("c-qb_-custom-toast-comp")
            .showCustomTostMessage({
              title: "Error",
              message: 'Please Enter your Query.',
              variant: "error",
              autoclose: true,
         }); 

         return;
         
        }
        // Form submission logic here
        //console.log("Form submitted");
        //i want to create a custom event for my parent component
        try{
            const submitEvent = new CustomEvent("submitevent", {
                detail:{
                description:this.template.querySelector('[data-name="description"]').value
                }
            })
            // vm.template.querySelectorAll('lightning-input').forEach((element)=>{
            //     element.value='';
            // })
            vm.template.querySelector('lightning-textarea').value='';
            //console.log('Detail'+JSON.stringify(submitEvent.detail));
            // Fire the custom event
            vm.dispatchEvent(submitEvent);
        }
        catch(error){
            //console.log('Error Occured in Contact Support');
        }
    }
}