package pages;


import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CartPage extends BasePage {

    private By plusBtn = By.cssSelector(".btn-plus");
    private By minusBtn = By.cssSelector(".btn-minus");
    private By checkoutBtn = By.id("checkout");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public void increaseQuantity() {
        click(plusBtn);
    }

    public void decreaseQuantity() {
        click(minusBtn);
    }

    public void proceedToCheckout() {
        click(checkoutBtn);
    }
}
