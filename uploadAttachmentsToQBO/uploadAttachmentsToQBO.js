import { LightningElement, api } from 'lwc';
import getRelatedAttachments from '@salesforce/apex/QbAttachmentController.getAttachments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class UploadAttachmentsToQBO extends LightningElement {
    @api recordId;

    connectedCallback(){
        console.log('in connected callback',this.recordId);
    }

    handleUpload() {
        getRelatedAttachments({ recordId: this.recordId })
            .then(attachments => {
                attachments.forEach(attachment => {
                    this.uploadToQuickBooks(attachment);
                });
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    async uploadToQuickBooks(attachment) {
        console.log('in uploadToQuickBooks',JSON.stringify(attachment));
        console.log('in uploadToQuickBooks',attachment.Name);
        const accessToken = 'eyJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwiYWxnIjoiZGlyIn0..8ueFAl--3pDn3MjD6o_jDg.sColYfJzu0kZ59mLH0Rfxb8RTUGTtwKWW8_MHJ8Ad888PY-8S_1sCdXbmJLo7FQyxxhUr9ei2Sp-coB-d009SlbH0L6sjYHg1spsfLKcI1TXvIl0c2tTvDCzxYyHCY_2IDcI3N1sPnLJ-V0ZyZO8KaDDXBjG8NQKPwqfhTUDKmnDZY-5cER83_YVZyLIYSlwQ76zyJ1lhF2-9Wpl_bv0yzY4uXifL6EdI-_UpPwREeiC5SNNCv5dl6HpdbijkxM8Nu3iwY5oMMrSIQY3aC-srbwdw2vYqBXaSgTtKJ5Xiw0ZVShe7imwiztqRJpCLVgkLRhcOuks7oQ1JapqJr_UEhJoHtLRKmkBFWHVtni1O0A5eQJl7ETicpLVerFOEGvJCgelawHN39-rXMYpzX-xqfLavZ3BMAsFomXm7HhZg6to3vL6eWzKFCAsTwPJh9ZqyOa66gMaVjyJKIhE7gHe4dtMLc4NKz5EywFYsjkmB10GNOxp12KqzJbbI8X8i88UGiNwip-L9oLD3oasZgtWfgQAV-MaM5KVDQblMTLSOLwKlD45tJaetCdH3ACI2NE3OZbZkzX5MI7_-CgxKk4rnHwLvoV4XSQX7UJwXtLPqLfuhMu63eqxmSne6n0Edd6oaej70N5lDe6jfkQc-QHE1i26ULBVr02NAjg_bu56DCLNfRZFucUV-oNs174W-WbyKxqza4SECPjWA7ctZayvToj1679zgqRoZLI4frCKdwDT8YOhTf7W-nMPrdQkMn11.Bn1QMNF6vqdwWpmN24fDsw';
        const realmId = '4620816365300666430';
        const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/upload`;

        const formData = new FormData();
        formData.append('file', new Blob([attachment.Body], { type: attachment.ContentType }), attachment.Name);
        formData.append('fileName', attachment.Name);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        if (response.ok) {
            this.showToast('Success', `Attachment ${attachment.Name} uploaded successfully`, 'success');
        } else {
            this.showToast('Error', `Failed to upload ${attachment.Name}`, 'error');
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}