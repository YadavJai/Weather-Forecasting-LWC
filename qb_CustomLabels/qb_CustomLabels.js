// syncQB
import qbSyncButtonLabel from '@salesforce/label/c.QB_Sync_Button';
import qbConvertToInvoiceButtonLabel from '@salesforce/label/c.QB_Convert_To_Invoice_Button_Label';
import qbSendEstimateButtonLabel from '@salesforce/label/c.QB_Send_Estimate_Button_Label';
import qbRedirectButtonLabel from '@salesforce/label/c.QB_Redirect_Button_Label';

// welcomeAfterSignComp
import qbWelcomeLoginSalesforce from '@salesforce/label/c.QB_Welcome_Login_Message_Salesforce';
import qbWelcomeLoginQuickBooks from '@salesforce/label/c.QB_Welcome_Login_Message_QB';
import qbWelcomeCongrats from '@salesforce/label/c.QB_Welcome_Congrats';
import qbWelcomeClickProceed from '@salesforce/label/c.QB_Welcome_Click_Proceed';
import qbWelcomeError from '@salesforce/label/c.QB_Welcome_Error';
import qbWelcomeLoginErrorQuickBooks from '@salesforce/label/c.Qb_Welcome_Error_Message_QB';

// qBConfigureNew
import qbSupportWebsite from '@salesforce/label/c.QB_Support_Website';
import qbContactSupportText from '@salesforce/label/c.QB_Contact_Support';
import qbMoreCompanyText from '@salesforce/label/c.QB_More_Company_Text';
import qbConfigureCompanyNameTxt from '@salesforce/label/c.QB_Company_Name';
import qbConfigureCompanyIdTxt from '@salesforce/label/c.QB_Company_Id';
import qbConfigureCompanyStatusTxt from '@salesforce/label/c.QB_Status';
import qbConfigureActionTxt from '@salesforce/label/c.QB_Action';
import qbConfigureSerialNoTxt from '@salesforce/label/c.QB_Serial_Number';
import qbConfigureEmailTxt from '@salesforce/label/c.QB_Email_Text';
import qbConfigureCancelCloseTxt from '@salesforce/label/c.QB_Cancel_Close_text';
import qbConfigureSubmitBtnLbl from '@salesforce/label/c.QB_Submit_Label';
import qbConfigureWarningBtnLbl from '@salesforce/label/c.QB_Warning_Button_Label';
import qbConfigureCancelBtnLbl from '@salesforce/label/c.QB_Cancel_Button_Label';
import qbConfigureOkBtnLbl from '@salesforce/label/c.QB_OK_Button_Label';
import qbConfigureCloseBtnLbl from '@salesforce/label/c.QB_Close_Button_Label';
import qbConfigureRefreshBtnLbl from '@salesforce/label/c.QB_Refresh_Button_Label';
import qbConfigureConnectBtnLabel from '@salesforce/label/c.QB_Connect_Button_Label';
import qbChangesLostWarning from '@salesforce/label/c.QB_Changes_lost_warning';
import qbMultiCompanyTxt from '@salesforce/label/c.QB_Multi_Company_Control';
import qbCompanyConfigHeader from '@salesforce/label/c.QB_Company_configuration_header';
import qbSelectQuickbookHeader from '@salesforce/label/c.QB_Select_Quickbook_Header';
import qbBackgroundSetupMessage from '@salesforce/label/c.QB_Background_setup_mssg';
import qbBuiltMssgPt1 from '@salesforce/label/c.QB_Built_message_p1';
import qbBuiltMssgPt2 from '@salesforce/label/c.QB_Built_message_p2';
import qbTersmConditionTxt from '@salesforce/label/c.QB_Terms_and_Conditions_text';
import qbAttentionTxt from '@salesforce/label/c.QB_Attention_text';
import qbFetchingRecordsTxt from '@salesforce/label/c.QB_Fetching_records_message';
import qbUpdateQbMessage from '@salesforce/label/c.QB_Update_quickbook_message';
import qbProcessMessageHeader from '@salesforce/label/c.QB_Process_Message_Header';
import qbProcessMessageOp1 from '@salesforce/label/c.QB_Process_Message_option1';
import qbProcessMessageOp2 from '@salesforce/label/c.QB_Process_Message_option2';

// qb_SfToQbMappingDataComp & qb_QbToSfMappingDataCompNew
import qbQuickbookCompanyTxt from '@salesforce/label/c.QB_Quickbook_Company_Label'
import qbSalesforceObjLabel from '@salesforce/label/c.QB_Salesforce_object_label';
import qbQuickBookObjLabel from '@salesforce/label/c.QB_QuickBooks_oject_label';
import qbFieldMappingTxt from '@salesforce/label/c.QB_Field_Mapping_text';
import qbDataMappingTxt from '@salesforce/label/c.QB_Data_Mapping_text';
import qbSFfieldTxt from '@salesforce/label/c.QB_SF_Field_Text';
import qbQuickBookTxt from '@salesforce/label/c.QB_QuickBook_Field_Text';
import qbConstantTxt from '@salesforce/label/c.QB_Constant_Text';
import qbRelatedFieldTxt from '@salesforce/label/c.QB_Related_Field_text';
import qbPleaseWaitTxt from '@salesforce/label/c.QB_Please_Wait_text';
import qbInsertTxt from '@salesforce/label/c.QB_Insert_Text';
import qbRelatedTxt from '@salesforce/label/c.QB_Related_Text';


//for toast
import QB_Object_Level_Errors from '@salesforce/label/c.QB_Object_Level_Errors';

import QB_Customer_Object_Validation_Error from '@salesforce/label/c.QB_Customer_Object_Validation_Error';

import QB_Item_Obj_Error_Name from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_Name';
import QB_Item_Obj_Error_InvStartDate from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_InvStartDate';
import QB_Item_Obj_Error_Type from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_Type';

import QB_Item_Obj_Error_AssetAccountRef from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_AssetAccountRef';
import QB_Item_Obj_Error_ExpenseAccountRef from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_ExpenseAccountRef';
import QB_Item_Obj_Error_IncomeAccountRef from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_IncomeAccountRef';
import QB_Item_Obj_Error_QtyOnHand from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_QtyOnHand';
import QB_Item_Obj_Error_TrackQtyOnHand from '@salesforce/label/c.QB_Item_Object_Validation_Error_For_TrackQtyOnHand';

import QB_Invoice_Obj_Error_CustomerRef from '@salesforce/label/c.QB_Invoice_Object_Validation_Error_For_CustomerRef';
import QB_Invoice_Obj_Error_Line from '@salesforce/label/c.QB_Invoice_Object_Validation_Error_For_Line';

import QB_Estimate_Obj_Error_CustomerRef from '@salesforce/label/c.QB_Estimate_Object_Validation_Error_For_CustomerRef';
import QB_Estimate_Obj_Error_Line from '@salesforce/label/c.QB_Estimate_Object_Validation_Error_For_Line';

import QB_Account_Obj_Error_For_Name from '@salesforce/label/c.QB_Account_Object_Validation_Error_For_Name';
import QB_Account_Obj_Error_AcctNum from '@salesforce/label/c.QB_Account_Object_Validation_Error_For_AcctNum';
import QB_Account_Obj_Error_TaxCodeRef from '@salesforce/label/c.QB_Account_Object_Validation_Error_For_TaxCodeRef';
import QB_Account_Obj_Error_AccountType from '@salesforce/label/c.QB_Account_Object_Validation_Error_For_AccountType';
import 	QB_Account_Obj_Error_AccountSubType from '@salesforce/label/c.QB_Account_Object_Validation_Error_For_AccountSubType';

import QB_Bill_Obj_Error_VendorRef from '@salesforce/label/c.QB_Bill_Object_Validation_Error_For_VendorRef';
import 	QB_Bill_Obj_Error_CurrencyRef from '@salesforce/label/c.QB_Bill_Object_Validation_Error_For_CurrencyRef';
import QB_Bill_Obj_Error_Line from '@salesforce/label/c.QB_Bill_Object_Validation_Error_For_Line';

import QB_Payment_Obj_Error_TotalAmt from '@salesforce/label/c.QB_Payment_Object_Validation_Error_For_TotalAmt';
import QB_Payment_Obj_Error_CustomerRef from '@salesforce/label/c.QB_Payment_Object_Validation_Error_For_CustomerRef';
import QB_Payment_Obj_Error_CurrencyRef from '@salesforce/label/c.QB_Payment_Object_Validation_Error_For_CurrencyRef';

import QB_Employee_Obj_Error_PrimaryAddr from '@salesforce/label/c.QB_Employee_Object_Validation_Error_For_PrimaryAddr';
//import QB_Payment_Object_Validation_Error_For_CustomerRef from '@salesforce/label/c.QB_Payment_Object_Validation_Error_For_CustomerRef';
//import QB_Payment_Object_Validation_Error_For_CurrencyRef from '@salesforce/label/c.QB_Payment_Object_Validation_Error_For_CurrencyRef';

import QB_Blank_Fields_Mapping from '@salesforce/label/c.QB_Blank_Fields_Mapping';
import QB_Blank_Related_Fields_Mapping from '@salesforce/label/c.QB_Blank_Related_Fields_Mapping';
import QB_Duplicate_Mapping_For_Related_Modal from '@salesforce/label/c.QB_Duplicate_Mapping_For_Related_Modal';


let label = {
                qbSyncButtonLabel, qbConvertToInvoiceButtonLabel, qbSendEstimateButtonLabel, qbRedirectButtonLabel,
                qbWelcomeLoginSalesforce, qbWelcomeLoginQuickBooks, qbWelcomeCongrats, qbWelcomeClickProceed,
                qbSupportWebsite, qbContactSupportText, qbMoreCompanyText, qbConfigureCompanyNameTxt, qbConfigureCompanyIdTxt,
                qbConfigureCompanyStatusTxt, qbConfigureActionTxt, qbConfigureSerialNoTxt, qbConfigureEmailTxt, qbConfigureCancelCloseTxt,
                qbConfigureSubmitBtnLbl, qbConfigureWarningBtnLbl, qbConfigureCancelBtnLbl, qbConfigureOkBtnLbl, qbConfigureCloseBtnLbl,
                qbConfigureRefreshBtnLbl, qbConfigureConnectBtnLabel, qbChangesLostWarning, qbMultiCompanyTxt, qbCompanyConfigHeader,
                qbSelectQuickbookHeader, qbBackgroundSetupMessage, qbBuiltMssgPt1, qbBuiltMssgPt2, qbTersmConditionTxt, qbAttentionTxt,
                qbFetchingRecordsTxt, qbUpdateQbMessage, qbProcessMessageHeader, qbProcessMessageOp1, qbProcessMessageOp2,
                qbQuickbookCompanyTxt, qbSalesforceObjLabel, qbQuickBookObjLabel, qbFieldMappingTxt, qbDataMappingTxt, qbSFfieldTxt,
                qbQuickBookTxt , qbConstantTxt, qbRelatedFieldTxt, qbPleaseWaitTxt,qbInsertTxt, qbRelatedTxt,QB_Object_Level_Errors,QB_Customer_Object_Validation_Error,
                QB_Item_Obj_Error_Name,QB_Item_Obj_Error_InvStartDate,QB_Item_Obj_Error_Type,QB_Item_Obj_Error_AssetAccountRef,QB_Item_Obj_Error_ExpenseAccountRef,
                QB_Item_Obj_Error_IncomeAccountRef,QB_Item_Obj_Error_QtyOnHand,QB_Item_Obj_Error_TrackQtyOnHand,QB_Invoice_Obj_Error_CustomerRef,QB_Invoice_Obj_Error_Line,
                QB_Estimate_Obj_Error_CustomerRef,QB_Estimate_Obj_Error_Line,QB_Account_Obj_Error_For_Name,QB_Account_Obj_Error_AcctNum,QB_Account_Obj_Error_TaxCodeRef,
                QB_Account_Obj_Error_AccountType,QB_Account_Obj_Error_AccountSubType,QB_Bill_Obj_Error_VendorRef,QB_Bill_Obj_Error_CurrencyRef,QB_Bill_Obj_Error_Line,
                QB_Payment_Obj_Error_TotalAmt,QB_Payment_Obj_Error_CustomerRef,QB_Payment_Obj_Error_CurrencyRef,QB_Employee_Obj_Error_PrimaryAddr,QB_Blank_Fields_Mapping,
                QB_Blank_Related_Fields_Mapping,QB_Duplicate_Mapping_For_Related_Modal,qbWelcomeError,qbWelcomeLoginErrorQuickBooks
            };

export default class qb_CustomLabels {
    async getCustomLabels() {
        return label;
    }
}