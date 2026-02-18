package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CartPage extends BasePage {

    // --- Identifiers ---
    // Anchor for the Populated state (Your Cart)
    private final By populatedHeader = By.xpath("//h1[text()='Your Cart']");
    
    // Anchor for the Empty state (YOUR CART IS EMPTY)
    private final By emptyHeader = By.xpath("//h2[text()='YOUR CART IS EMPTY']");
    
    private final By cartItems = By.xpath("//div[contains(@class, 'CartItem')]");
    private final By checkoutBtn = By.xpath("//button[contains(., 'Checkout')]");
    private final By totalPrice = By.xpath("//h2[contains(@class, 'text-5xl')]");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    // --- State Checks ---

    // Use this to verify the page loaded with items
    public boolean isLoadedWithItems() {
        return isDisplayed(populatedHeader);
    }

    // Use this to verify the page loaded and is empty
    public boolean isLoadedEmpty() {
        return isDisplayed(emptyHeader);
    }

    // --- Actions ---

    public int getItemCount() {
        return driver.findElements(cartItems).size();
    }

    public String getTotalValue() {
        // We add a check here because the price doesn't exist in the 'Empty' state
        if (isLoadedWithItems()) {
            return getText(totalPrice);
        }
        return "$0.00";
    }

    public void clickCheckout() {
        click(checkoutBtn);
    }

    // --- Dynamic Actions ---

    public void increaseQuantity(String productName) {
        // Logic: Find the H3 with the name, go to parent, find the '+' button
        By plusBtn = By.xpath("//h3[text()='" + productName + "']/parent::div//button[@title='Increase quantity']");
        click(plusBtn);
    }

    public void removeItem(String productName) {
        // Logic: Find name, go to the top level of that specific item, find the trash icon
        By trashBtn = By.xpath("//h3[text()='" + productName + "']/ancestor::div[contains(@class, 'CartItem')]//button[./svg[contains(@class, 'lucide-trash2')]]");
        click(trashBtn);
    }
}