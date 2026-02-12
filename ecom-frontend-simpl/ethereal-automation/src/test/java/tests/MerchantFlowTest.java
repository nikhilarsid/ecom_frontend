package tests;

import base.BaseTest;
import org.junit.jupiter.api.Test;
import pages.*;

public class MerchantFlowTest extends BaseTest {

    @Test
    void merchantEndToEndFlow() throws InterruptedException {
        LoginPage login = new LoginPage(driver);
        login.open();
        // Updated with new credentials
        login.login("alllice@lkasncethereal.com", "StrongPass123!");

        MerchantHomePage home = new MerchantHomePage(driver);
        Thread.sleep(20000); // Wait 20 seconds on Home

        home.goToDashboard();
        Thread.sleep(20000); // Wait 20 seconds on Dashboard

        home.goToManageProducts();
        Thread.sleep(20000); // Wait 20 seconds on Inventory
    }
}