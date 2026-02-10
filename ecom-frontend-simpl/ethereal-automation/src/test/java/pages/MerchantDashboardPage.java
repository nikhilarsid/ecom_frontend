package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class MerchantDashboardPage extends BasePage {

    // Selectors using placeholders from MerchantDashboard.tsx
    private By nameInput = By.cssSelector("input[placeholder*='iPhone']");
    private By brandInput = By.cssSelector("input[placeholder*='Apple']");
    private By priceInput = By.cssSelector("input[placeholder='Price']");
    private By submitBtn = By.xpath("//button[contains(text(), 'Add Product')]");

    private By addUspBtn = By.xpath("//button[contains(text(), '+ Add USP')]");
    private By addSpecBtn = By.xpath("//button[contains(text(), '+ Add Spec')]");

    public MerchantDashboardPage(WebDriver driver) {
        super(driver);
    }

    public void fillNewProductForm(String name, String brand, int price) {
        type(nameInput, name);
        type(brandInput, brand);
        type(priceInput, String.valueOf(price));
    }

    public void addUSP(String usp) {
        click(addUspBtn);
        // Types into the last added USP field
        type(By.xpath("(//input[@placeholder='e.g. 24-hour battery life']) [last()]"), usp);
    }

    public void addSpec(String key, String value) {
        click(addSpecBtn);
        // Types into the last added Spec key and value fields
        type(By.xpath("(//input[@placeholder='e.g. Screen Size']) [last()]"), key);
        type(By.xpath("(//input[@placeholder='e.g. 6.7 inches']) [last()]"), value);
    }

    public void submitProduct() {
        click(submitBtn);
    }

    public void waitForLoad() {
        waitForVisible(nameInput);
    }
}