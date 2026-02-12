package base;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;

import java.time.Duration;

public class BaseTest {

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeEach
    void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(20));

        driver.get("http://localhost:3001");

        waitForAppToBeReady();
    }

    protected void waitForAppToBeReady() {
        wait.until(driver ->
                ((JavascriptExecutor) driver)
                        .executeScript("return document.readyState")
                        .equals("complete")
        );

        // wait until React root is rendered
        wait.until(ExpectedConditions.presenceOfElementLocated(
                By.id("root")
        ));
    }

    protected void waitForApiIdle() {
        wait.until(driver -> (Boolean) ((JavascriptExecutor) driver)
                .executeScript("""
                    return window.fetch === undefined ||
                           window.__pendingRequests === 0;
                """));
    }

    protected void scrollPage() {
        ((JavascriptExecutor) driver)
                .executeScript("window.scrollBy(0, 600)");
        try { Thread.sleep(400); } catch (InterruptedException ignored) {}
    }

    protected void scrollThroughPagination() {
        for (int i = 0; i < 4; i++) {
            scrollPage();
        }
    }

    @AfterEach
    void tearDown() {
        if (driver != null) driver.quit();
    }
}
