/**
 * Creates onboarding records from the web form.
 * The web form must supply a Tax Id. The Require_Tax_Id validation rule enforces it.
 */
public with sharing class OnboardingService {

    public class OnboardingException extends Exception {}

    public static Customer_Onboarding__c createFromWebForm(
        String companyName,
        String ownerEmail,
        String product,
        String taxId
    ) {
        if (String.isBlank(companyName)) {
            throw new OnboardingException('Company name is required.');
        }
        Customer_Onboarding__c rec = new Customer_Onboarding__c(
            Name = companyName,
            Company_Name__c = companyName,
            Owner_Email__c = ownerEmail,
            Product__c = product,
            Tax_Id__c = taxId,
            Source__c = 'WebForm'
        );
        // A missing Tax Id fails here with a DmlException from the validation rule.
        insert rec;
        return rec;
    }
}
