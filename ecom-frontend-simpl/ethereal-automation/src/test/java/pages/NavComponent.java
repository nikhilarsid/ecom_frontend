package pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
public class NavComponent extends BasePage {

    private By loginBtn = By.id("login-btn");
    private By logoutBtn = By.id("logout-btn");
    private By cartBtn = By.id("cart-btn");
    private By ordersBtn = By.id("orders-btn");

    public NavComponent(WebDriver driver) {
        super(driver);
    }

    public void clickLogin() {
        click(loginBtn);
    }

    public void logout() {
        click(logoutBtn);
    }

    public void goToCart() {
        click(cartBtn);
    }

    public void goToOrders() {
        click(ordersBtn);
    }
}
