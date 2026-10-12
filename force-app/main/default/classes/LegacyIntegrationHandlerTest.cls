@IsTest
private class LegacyIntegrationHandlerTest {

    /**
     * Regression test for the incident. A change to Require_Tax_Id required Tax_Id__c
     * for every record and broke the old integration, which never sends one.
     * The legacy path must succeed without a Tax Id.
     */
    @IsTest
    static void regression_legacyPathWithoutTaxIdStillSucceeds() {
        Test.startTest();
        Customer_Onboarding__c rec = LegacyIntegrationHandler.createLegacyRecord(
            'Old Customer Inc', 'owner@example.com', 'Starter'
        );
        Test.stopTest();

        Customer_Onboarding__c saved = [
            SELECT Id, Source__c, Tax_Id__c FROM Customer_Onboarding__c WHERE Id = :rec.Id
        ];
        System.assertEquals('LegacyIntegration', saved.Source__c);
        System.assertEquals(null, saved.Tax_Id__c);
    }

    @IsTest
    static void legacyPathWithBlankCompanyNameStillSucceeds() {
        Customer_Onboarding__c rec = LegacyIntegrationHandler.createLegacyRecord(null, null, null);
        System.assertNotEquals(null, rec.Id);
    }
}
