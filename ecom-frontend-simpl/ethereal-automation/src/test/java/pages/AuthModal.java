package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AuthModal extends BasePage {
    
    // 1. More descriptive Locators
    private final By modalContainer = By.xpath("//h2[text()='Welcome Back']/parent::div");
    private final By closeButton = By.cssSelector("button.absolute.top-4.right-4");
    private final By signInBtn = By.xpath("//button[contains(., 'Sign In')]");
    private final By createAccountBtn = By.xpath("//button[contains(., 'Create Account')]");
    private final By modalOverlay = By.xpath("//div[contains(@class, 'ModalOverlay')]"); // If styled-components class is accessible

    public AuthModal(WebDriver driver) {
        super(driver);
    }

    // 2. Action Methods
    public void clickSignIn() {
        click(signInBtn);
    }

    public void clickCreateAccount() {
        click(createAccountBtn);
    }

    public void closeModal() {
        click(closeButton);
    }

    public void clickOutsideModal() {
        // Clicks the overlay to test if the modal closes
        click(modalOverlay);
    }

    // 3. Validation Methods (The "Is" checks)
    public boolean isModalDisplayed() {
        try {
            return isDisplayed(modalContainer);
        } catch (Exception e) {
            return false;
        }
    }

    public String getHeaderText() {
        return getText(By.tagName("h2"));
    }
}