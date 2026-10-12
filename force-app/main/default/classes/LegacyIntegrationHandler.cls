/**
 * Entry point for the old integration. It creates records WITHOUT a Tax Id.
 * It must always set Source__c to LegacyIntegration. Require_Tax_Id skips those records.
 * Do not add a Tax Id requirement here without a plan for the old integration.
 */
public with sharing class LegacyIntegrationHandler {

    public static Customer_Onboarding__c createLegacyRecord(
        String companyName,
        String ownerEmail,
        String product
    ) {
        Customer_Onboarding__c rec = new Customer_Onboarding__c(
            Name = String.isBlank(companyName) ? 'Legacy record' : companyName,
            Company_Name__c = companyName,
            Owner_Email__c = ownerEmail,
            Product__c = product,
            Source__c = 'LegacyIntegration'
        );
        insert rec;
        return rec;
    }
}
