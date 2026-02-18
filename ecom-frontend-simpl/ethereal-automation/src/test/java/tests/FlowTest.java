package tests;

import base.BaseTest;
import org.junit.jupiter.api.Test;
import pages.*;

public class FlowTest extends BaseTest {

    @Test
    void userEndToEndFlow() throws InterruptedException {
        //User flow

        //Login
        LoginPage login = new LoginPage(driver);
        login.open();
        login.login("srihithapulapa1@gmail.com", "Siri@2005");
        
        //Go to home page and select a product
        HomePage home = new HomePage(driver);
        home.selectCategory("All");
        home.scrollToBottom();
        home.searchFor("ten");
        home.selectFirstSuggestion();   
        home.selectFirstProductInGrid();   

        // Thread.sleep(3000);  

        //individual products
        IndividualProductDetailsPage product = new IndividualProductDetailsPage(driver);
        product.submitReview(3,"Review written by Selenium");
        product.deleteMyReview();
        // product.confirmDelete();

        // Thread.sleep(2000);
        product.setQuantity(1);
        product.addToBag();
        // Thread.sleep(2000);
       
       //Go to cart 
       NavComponent nav = new NavComponent(driver);
       nav.clickCart();
    //    Thread.sleep(2000);

       CartPage cart = new CartPage(driver);
       cart.clickCheckout();
    //    Thread.sleep(2000);

        CheckoutPage co = new CheckoutPage(driver);
        co.fillShippingDetails("First","Last","Some Addr");
        co.selectPaymentMethod("DEFAULT");
        co.clickCompletePurchase();
        Thread.sleep(5000);

        nav.logout();
        Thread.sleep(2000);

        //Merchant flow

        //login
        login.open();
        login.login("srihitha@gmail.com", "Siri@2005");
        Thread.sleep(2000);

        //Go to Inventory
        nav.clickInventory();
        Thread.sleep(2000);
        nav.clickDashboard();
        Thread.sleep(2000);

        //add product
        MerchantDashboardPage mdp = new MerchantDashboardPage(driver);
        mdp.openForm();
        mdp.setCategory(1,"Electronics");
        mdp.setAttribute(1,"Colour","Red");
        mdp.fillBasicInfo("Iphone 21","Apple",1234.55,100);
        mdp.addUSP("Good prod");
        mdp.clickSave();
        Thread.sleep(3000);
        nav.logout();
        Thread.sleep(2000);
    }
}