package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class LoginPage extends BasePage {
    private By emailInput = By.cssSelector("input[placeholder='Email Address']");
    private By passwordInput = By.cssSelector("input[placeholder='Password']");
    private By loginBtn = By.xpath("//button[contains(text(), 'Login')]");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void open() {
        driver.get("http://localhost:3001/login");
    }

    public void waitForLoad() {
        waitForVisible(emailInput);
    }

    public void login(String email, String password) {
        type(emailInput, email);
        type(passwordInput, password);
        click(loginBtn);
    }
}