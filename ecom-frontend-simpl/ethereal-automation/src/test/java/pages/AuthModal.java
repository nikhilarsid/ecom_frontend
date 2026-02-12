package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class AuthModal extends BasePage {
    private By signInBtn = By.xpath("//button[contains(., 'Sign In')]");

    public AuthModal(WebDriver driver) {
        super(driver);
    }

    public void waitForVisible() {
        waitForVisible(signInBtn);
    }

    public void clickSignIn() {
        click(signInBtn);
    }
}