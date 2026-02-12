package pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
public class ProductDetailsPage extends BasePage {

    private By addToCartBtn = By.id("add-to-cart");
    private By quantityInput = By.id("quantity");
    private By errorMsg = By.id("quantity-error");

    public ProductDetailsPage(WebDriver driver) {
        super(driver);
    }

    public void addToCart() {
        click(addToCartBtn);
    }

    public void addQuantity(int qty) {
        type(quantityInput, String.valueOf(qty));
        click(addToCartBtn);
    }

    public boolean isQuantityErrorVisible() {
        return driver.findElements(errorMsg).size() > 0;
    }
}
