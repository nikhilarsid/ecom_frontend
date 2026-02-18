package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.util.List;

public class MerchantDashboardPage extends BasePage {

    // --- Locators ---
    private final By addNewProductBtn = By.xpath("//button[contains(., 'Add New Product')]");
    private final By productNameInput = By.xpath("//input[@placeholder='Product Name']");
    private final By brandInput = By.xpath("//input[@placeholder='Brand']");
    private final By descriptionInput = By.xpath("//textarea[@placeholder='Description']");
    private final By priceInput = By.xpath("//input[@placeholder='Price']");
    private final By quantityInput = By.xpath("//input[@placeholder='Quantity']");
    private final By imageUrlInput = By.xpath("//input[@placeholder='https://example.com/image.jpg']");
    private final By submitBtn = By.xpath("//button[text()='Add Product' or text()='Save Changes']");
    
    private final By addUspBtn = By.xpath("//button[contains(., 'Add USP')]");
    private final By uspInputs = By.xpath("//input[@placeholder='Unique Selling Point']");
    private final By categoryInputs = By.xpath("//input[@placeholder='Category Name']");
    private final By addCategoryBtn = By.xpath("//button[contains(., 'Add Category')]");
    private final By attrKeys = By.xpath("//input[@placeholder='Key (e.g. Material)']");
    private final By attrValues = By.xpath("//input[@placeholder='Value (e.g. Cotton)']");
    private final By addAttributeBtn = By.xpath("//button[contains(., 'Add Attribute')]");

    public MerchantDashboardPage(WebDriver driver) {
        super(driver);
    }

    private void scrollToElement(WebElement element) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
    }

    public void openForm() {
        click(addNewProductBtn);
    }

    public void setCategory(int index, String value) {
        List<WebElement> inputs = driver.findElements(categoryInputs);
        while (inputs.size() <= index) {
            WebElement btn = driver.findElement(addCategoryBtn);
            scrollToElement(btn);
            btn.click();
            inputs = driver.findElements(categoryInputs);
        }
        scrollToElement(inputs.get(index));
        inputs.get(index).clear();
        inputs.get(index).sendKeys(value);
    }

    public void setAttribute(int index, String key, String value) {
        List<WebElement> keys = driver.findElements(attrKeys);
        List<WebElement> values = driver.findElements(attrValues);

        while (keys.size() <= index) {
            WebElement btn = driver.findElement(addAttributeBtn);
            scrollToElement(btn);
            btn.click();
            keys = driver.findElements(attrKeys);
            values = driver.findElements(attrValues);
        }

        scrollToElement(keys.get(index));
        keys.get(index).clear();
        keys.get(index).sendKeys(key);
        
        values.get(index).clear();
        values.get(index).sendKeys(value);
    }

    public void fillBasicInfo(String name, String brand, double price, int qty) {
        type(productNameInput, name);
        type(brandInput, brand);
        // Requirement: Min 20 characters for description
        type(descriptionInput, "Premium quality minimalist design, perfect for everyday wear and professional settings.");
        type(priceInput, String.valueOf(price));
        type(quantityInput, String.valueOf(qty));
        // Using a professional product image URL
        type(imageUrlInput, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000");
    }

    public void addUSP(String text) {
        WebElement btn = driver.findElement(addUspBtn);
        scrollToElement(btn);
        btn.click();
        
        List<WebElement> inputs = driver.findElements(uspInputs);
        WebElement lastInput = inputs.get(inputs.size() - 1);
        scrollToElement(lastInput);
        lastInput.sendKeys(text);
    }

    public void clickSave() {
        WebElement btn = driver.findElement(submitBtn);
        scrollToElement(btn);
        click(submitBtn);
        waitForLoadingToComplete();
    }
}