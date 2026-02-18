package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.WebElement;

public class NavComponent extends BasePage {

    // Locators based on your Styled Components
    private final By logo = By.xpath("//a[contains(text(),'ETHEREAL')]");
    private final By shopLink = By.linkText("SHOP");
    private final By ordersLink = By.linkText("MY ORDERS");
    private final By cartIcon = By.cssSelector("nav svg.lucide-shopping-bag");    private final By cartCount = By.cssSelector(".count");
    private final By userGreet = By.xpath("//span[contains(@class, 'UserGreet')]");
    
    // Logout Logic Locators
    private final By logoutBtn = By.cssSelector("button svg.lucide-log-out");
    private final By confirmLogoutBtn = By.xpath("//span[text()='CONFIRM?']");
    private final By cancelLogoutBtn = By.xpath("//button[text()='CANCEL']");

    private final By dashboard = By.xpath("//nav//a[@href='/merchant/dashboard']");
    private final By inventory = By.xpath("//nav//a[@href='/merchant/manage']");
    private final By confirmBtn = By.cssSelector("button.swal2-confirm");


    private final By toastOverlay = By.cssSelector("[data-sonner-toast]");
    public NavComponent(WebDriver driver) {
        super(driver);
    }


    public void clickCart() {
        click(cartIcon);
    }

    public void logout() {
        click(logoutBtn);     
        click(confirmBtn); 
    }

    public void clickDashboard(){
        // ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("window.scrollTo(0, 0);");
        waitForInvisibility(toastOverlay);
        click(dashboard);
    }

    public void clickInventory(){

        waitForInvisibility(toastOverlay);
        
        click(inventory);

        WebElement inventoryLink = wait.until(ExpectedConditions.presenceOfElementLocated(inventory));

    // 4. Specifically scroll the link into view (Optional but safe)
    ((org.openqa.selenium.JavascriptExecutor) driver)
        .executeScript("arguments[0].scrollIntoView(true);", inventoryLink);
    }

    public boolean isLoggedIn() {
        return isDisplayed(logoutBtn);
    }
}