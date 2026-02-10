package pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
public class CheckoutPage extends BasePage {

    private By addressInput = By.id("address");
    private By cityInput = By.id("city");
    private By pincodeInput = By.id("pincode");
    private By placeOrderBtn = By.id("place-order");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    public void enterDetailsAndCheckout(String address, String city, String pincode) {
        type(addressInput, address);
        type(cityInput, city);
        type(pincodeInput, pincode);
        click(placeOrderBtn);
    }
}
