package pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
public class OrdersPage extends BasePage {

    private By firstOrder = By.cssSelector(".order-item");
    private By orderItems = By.cssSelector(".order-product");

    public OrdersPage(WebDriver driver) {
        super(driver);
    }

    public void openLatestOrder() {
        click(firstOrder);
    }

    public void openOrderItems() {
        click(orderItems);
    }
}
