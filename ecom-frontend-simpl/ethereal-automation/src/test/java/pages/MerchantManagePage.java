package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class MerchantManagePage extends BasePage {

    private By addProductBtn = By.id("add-product");
    private By productNameInput = By.id("product-name");
    private By priceInput = By.id("price");
    private By stockInput = By.id("stock");
    private By saveBtn = By.id("save-product");

    public MerchantManagePage(WebDriver driver) {
        super(driver);
    }

    // New method to fix the compilation error
    public void open() {
        driver.get("http://localhost:3001/merchant/manage");
    }

    public void addProduct(String name, String price, String stock) {
        click(addProductBtn);
        type(productNameInput, name);
        type(priceInput, price);
        type(stockInput, stock);
        click(saveBtn);
    }

    public boolean productExists(String productName) {
        By productLoc = By.xpath("//h4[contains(text(), '" + productName + "')]");
        return isVisible(productLoc);
    }

    public boolean performanceVisible(String productName) {
        By perfLoc = By.xpath("//h4[contains(text(), '" + productName + "')]/ancestor::div[contains(@class, 'grid')]//div[contains(@class, 'flex-col')]");
        return isVisible(perfLoc);
    }
}