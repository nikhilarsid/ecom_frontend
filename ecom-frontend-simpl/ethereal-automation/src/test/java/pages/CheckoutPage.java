package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CheckoutPage extends BasePage {

    private final By firstNameInput = By.xpath("//input[@placeholder='First Name']");
    private final By lastNameInput = By.xpath("//input[@placeholder='Last Name']");
    private final By addressInput = By.xpath("//input[@placeholder='Address']");
    private final By cityInput = By.xpath("//input[@placeholder='City']");
    private final By postalCodeInput = By.xpath("//input[@placeholder='Postal Code']");
    
    private final By codOption = By.xpath("//button[contains(., 'COD')]");
    private final By upiOption = By.xpath("//button[contains(., 'UPI')]");
    private final By upiIdInput = By.xpath("//input[@placeholder='UPI ID']");    
    private final By completePurchaseBtn = By.xpath("//button[contains(., 'Complete Purchase')]");
    private final By errorText = By.cssSelector("span[class*='ErrorText']");
    private final By orderTotal = By.xpath("//div[contains(@class, 'OrderSummary')]//span[last()]");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    public void fillShippingDetails(String first, String last, String addr) {
        type(firstNameInput, first);
        type(lastNameInput, last);
        type(addressInput, addr);
        // type(cityInput, city);
        // type(postalCodeInput, zip);
    }

    public void selectPaymentMethod(String method) {
        if (method.equalsIgnoreCase("UPI")) {
            click(upiOption);
        } else {
            click(codOption);
        }
    }

    public void enterUpiId(String id) {
        type(upiIdInput, id);
    }

    public void clickCompletePurchase() {
        click(completePurchaseBtn);
    }

    public String getFirstErrorMessage() {
        return getText(errorText);
    }
}