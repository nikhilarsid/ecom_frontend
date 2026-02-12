package tests;

import base.BaseTest;
import org.junit.jupiter.api.Test;
import pages.*;

public class UserFlowTest extends BaseTest {

    @Test
    void userEndToEndFlow() throws InterruptedException {
        // 1. Login First
        LoginPage login = new LoginPage(driver);
        login.open();
        login.login("bobbys@gmail.com", "UserPass456!");

        // 2. Search and Select
        HomePage home = new HomePage(driver);
        home.searchProduct("iPhone");
        home.openFirstProduct();

        // 3. Repetitive Add to Cart (5 times, 5s intervals)
        IndividualProductDetailsPage product = new IndividualProductDetailsPage(driver);
        product.waitForLoad();
        product.pickMerchantOffer();

        for(int i = 0; i < 5; i++) {
            product.addToBag();
            Thread.sleep(5000); // 5-second interval between clicks
        }

        // 4. Navigation to Cart
        home.nav().goToCart();
        Thread.sleep(10000); // Wait 10 seconds

        CartPage cart = new CartPage(driver);
        cart.proceedToCheckout();

        // 5. Checkout and Orders
        CheckoutPage checkout = new CheckoutPage(driver);
        checkout.enterDetailsAndCheckout("123 Ethereal St", "Bengaluru", "560001");
        Thread.sleep(10000); // Wait 10 seconds

        home.nav().goToOrders();
    }
}