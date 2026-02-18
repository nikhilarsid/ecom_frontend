package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {

    // --- 1. Variables (Locators) ---
    // Using placeholder text as it's the most stable anchor in your React code
    private final By emailField = By.xpath("//input[@placeholder='Email Address']");
    private final By passwordField = By.xpath("//input[@placeholder='Password']");
    private final By loginButton = By.xpath("//button[contains(., 'Login')]");
    
    // UI Anchors for Verification
    private final By welcomeHeader = By.xpath("//h1[text()='Welcome Back']");
    private final By loadingSpinner = By.cssSelector("svg.animate-spin");
    private final By createAccountLink = By.linkText("Create Account");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        driver.get("http://localhost:3001/login");
    }

    // --- 2. Methods (Actions) ---


    public void login(String email, String password) {
        type(emailField, email);
        type(passwordField, password);
        click(loginButton);
    }


    public boolean isAt() {
        return isDisplayed(welcomeHeader);
    }


    public boolean isProcessing() {
        return isDisplayed(loadingSpinner);
    }

    public void clickCreateAccount() {
        click(createAccountLink);
    }
}