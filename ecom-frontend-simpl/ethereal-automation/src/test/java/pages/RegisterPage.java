package pages;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
public class RegisterPage extends BasePage {

    private By nameInput = By.id("name");
    private By emailInput = By.id("email");
    private By passwordInput = By.id("password");
    private By customerRadio = By.id("customer-radio");
    private By registerBtn = By.id("register-btn");

    public RegisterPage(WebDriver driver) {
        super(driver);
    }

    public void registerCustomer(String name, String email, String password) {
        type(nameInput, name);
        type(emailInput, email);
        type(passwordInput, password);
        click(customerRadio);
        click(registerBtn);
    }
}
