package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.util.List;

public class HomePage extends BasePage {

    // --- Locators ---
    private final By searchInput = By.xpath("//input[@placeholder='Search']");
    private final By suggestionItems = By.xpath("//button[contains(@class, 'hover:bg-gray-100')]");
    private final By productCards = By.xpath("//div[contains(@class, 'grid')]//a[contains(@class, 'group')]");    
    // The "Sentinel" for Infinite Scroll
    private final By sentinel = By.xpath("//div[contains(@class, 'h-1 w-full')]");

    public HomePage(WebDriver driver) {
        super(driver);
    }

    // --- Search Actions ---
    
    public void searchFor(String text) {
        type(searchInput, text);
        // Explicitly wait for the React debounce (300ms) + API response
        wait.until(ExpectedConditions.visibilityOfElementLocated(suggestionItems));
    }

    /**
     * The Robust Click: Uses Action Chains to physically move the mouse to the element.
     * This prevents the "click-outside" handler in your React code from closing the box.
     */
    public void selectFirstSuggestion() {
        WebElement firstSug = wait.until(ExpectedConditions.elementToBeClickable(suggestionItems));
        
        Actions actions = new Actions(driver);
        actions.moveToElement(firstSug)
               .click()
               .build()
               .perform();
               
        // Wait for navigation to Product Details
        // wait.until(ExpectedConditions.urlContains("/product/"));
    }

    /**
     * Fallback method: Clicks the first item in the main grid results.
     */
    public void selectFirstProductInGrid() {
        // 1. Wait for the 'Loading products...' spinner to disappear
        waitForLoadingToComplete();
        
        // 2. Wait for the actual product elements to be present in the DOM
        // This handles the small delay between the spinner hiding and React rendering the list
        wait.until(ExpectedConditions.presenceOfElementLocated(productCards));
        
        // 3. Collect the products
        List<WebElement> products = driver.findElements(productCards);
        
        if (!products.isEmpty()) {
            // Optional: Scroll the element into view if it's below the fold
            // ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", products.get(0));
            // Click the first product
            products.get(0).click();
        } else {
            throw new RuntimeException("No products found in the grid to click!");
        }
    }

    // --- Navigation & Filter Actions ---

    public void scrollToBottom() {
        ((JavascriptExecutor) driver).executeScript("window.scrollTo(0, document.body.scrollHeight)");
    }

    public void selectCategory(String categoryName) {
        // Targets the specific category pill
        By category = By.xpath("//button[text()='" + categoryName + "']");
        click(category);
        waitForLoadingToComplete(); // Wait for the grid to filter
    }
}