package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class MerchantHomePage extends BasePage {

    private final By dashboardLink = By.xpath("//nav//a[@href='/merchant/dashboard']");
    private final By manageProductsLink = By.xpath("//nav//a[@href='/merchant/manage']");  
    private By logoutBtn = By.id("logout");

    // Updated: Selector for the "Add New Product" button in MerchantHome.tsx
    private By addProductBtn = By.xpath("//button[contains(., 'Add New Product')]");

    // Updated: Targets the revenue value within the StatCard
    private By revenueValue = By.xpath("//div[span[text()='Total Revenue']]/h2");

    // Updated: Targets the orders count within the StatCard
    private By ordersValue = By.xpath("//div[span[text()='Total Orders']]/h2");

    public MerchantHomePage(WebDriver driver) {
        super(driver);
    }

    public void goToDashboard() {
        click(dashboardLink);
    }

    public void goToManageProducts() {
        click(manageProductsLink);
    }

    public void logout() {
        click(logoutBtn);
    }

    public void clickAddProduct() {
        click(addProductBtn);
    }

    public boolean revenueVisible() {
        try {
            waitForVisible(revenueValue);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean ordersVisible() {
        try {
            waitForVisible(ordersValue);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}