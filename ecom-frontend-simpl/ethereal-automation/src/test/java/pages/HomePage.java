package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class HomePage extends BasePage {

    // Updated: Uses placeholder because id="search-input" does not exist in your React code
    private By searchInput = By.cssSelector("input[placeholder='Search']");

    // Updated: Targets the product Link component in Home.tsx
    private By firstProduct = By.cssSelector("a.group");

    private NavComponent nav;

    public HomePage(WebDriver driver) {
        super(driver);
        nav = new NavComponent(driver);
    }

    public void searchProduct(String productName) {
        type(searchInput, productName);
        // Note: Your React code filters as the user types
    }

    public void openFirstProduct() {
        click(firstProduct);
    }

    public NavComponent nav() {
        return nav;
    }
}