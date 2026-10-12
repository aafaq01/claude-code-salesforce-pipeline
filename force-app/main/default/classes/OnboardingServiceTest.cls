@IsTest
private class OnboardingServiceTest {

    @IsTest
    static void webFormWithTaxIdSucceeds() {
        Test.startTest();
        Customer_Onboarding__c rec = OnboardingService.createFromWebForm(
            'Acme Ltd', 'owner@example.com', 'Starter', 'TAX-123'
        );
        Test.stopTest();

        Customer_Onboarding__c saved = [
            SELECT Id, Source__c, Tax_Id__c FROM Customer_Onboarding__c WHERE Id = :rec.Id
        ];
        System.assertEquals('WebForm', saved.Source__c);
        System.assertEquals('TAX-123', saved.Tax_Id__c);
    }

    @IsTest
    static void webFormWithoutTaxIdStillFails() {
        Boolean failed = false;
        try {
            OnboardingService.createFromWebForm('Acme Ltd', 'owner@example.com', 'Starter', null);
        } catch (DmlException e) {
            failed = true;
            System.assert(
                e.getMessage().contains('Tax Id is required'),
                'Unexpected message: ' + e.getMessage()
            );
        }
        System.assert(failed, 'Web form path must still require Tax_Id__c.');
        System.assertEquals(0, [SELECT COUNT() FROM Customer_Onboarding__c]);
    }

    @IsTest
    static void blankSourceIsTreatedAsNotLegacyAndRequiresTaxId() {
        Customer_Onboarding__c rec = new Customer_Onboarding__c(Name = 'No source', Company_Name__c = 'No source');
        Database.SaveResult result = Database.insert(rec, false);
        System.assert(!result.isSuccess(), 'A blank Source__c must not bypass the Tax Id rule.');
    }

    @IsTest
    static void blankCompanyNameThrows() {
        Boolean failed = false;
        try {
            OnboardingService.createFromWebForm('  ', 'owner@example.com', 'Starter', 'TAX-123');
        } catch (OnboardingService.OnboardingException e) {
            failed = true;
        }
        System.assert(failed, 'A blank company name must be rejected.');
    }
}
