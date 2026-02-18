package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import java.util.List;
import org.openqa.selenium.support.ui.ExpectedConditions;


public class IndividualProductDetailsPage extends BasePage {

    // --- Quantity Locators ---
    private final By plusBtn = By.cssSelector("button svg.lucide-plus");
    private final By minusBtn = By.cssSelector("button svg.lucide-minus");
    private final By quantityValue = By.xpath("//div[contains(@class, 'bg-zinc-100')]//span[contains(@class, 'text-lg')]");
    
    // --- Merchant Locators ---
    private final By merchantCards = By.xpath("//div[contains(@class, 'rounded-3xl border-2')]");
    private final By addToBagBtn = By.xpath("//button[contains(., 'Add to Bag')]");

    // --- Review Locators ---
    private final By starRating = By.cssSelector("svg.lucide-star");
    // private final By reviewTextArea =  By.xpath("//input[@placeholder='Share your thoughts...']");
    // private final By submitReviewBtn = By.xpath("//button[text()='Submit Review']");
    private final By editReviewBtn = By.cssSelector("button[title='Edit your review']");
    private final By saveUpdateBtn = By.xpath("//button[text()='Save']");
    private final By deleteReviewBtn = By.cssSelector("button[title='Delete review']");
    private final By reviewForm = By.tagName("form");
    private final By reviewTextArea = By.cssSelector("form textarea"); 
    private final By submitReviewBtn = By.xpath("//button[contains(., 'Submit')]");
    private final By confirmBtn = By.cssSelector("button.swal2-confirm");
    public IndividualProductDetailsPage(WebDriver driver) {
        super(driver);
    }

    // --- Actions ---
    public void setQuantity(int target) {
        int current = Integer.parseInt(getText(quantityValue));
        while (current < target && current < 5) {
            click(plusBtn);
            current++;
        }
    }
    public void addToBag() {
    // 1. Wait for presence
    WebElement bagBtn = wait.until(ExpectedConditions.presenceOfElementLocated(addToBagBtn));

    // 2. Scroll it into view
    ((org.openqa.selenium.JavascriptExecutor) driver)
        .executeScript("arguments[0].scrollIntoView({block: 'center'});", bagBtn);

    // 3. Small pause for any animations/scrolls to finish
    try { Thread.sleep(500); } catch (InterruptedException e) { }

    try {
        // Try the standard click first
        click(addToBagBtn);
    } catch (org.openqa.selenium.ElementClickInterceptedException e) {
        // FALLBACK: Use JavaScript click if something is overlapping it
        System.out.println("Standard click intercepted by overlay, using JS click fallback.");
        ((org.openqa.selenium.JavascriptExecutor) driver)
            .executeScript("arguments[0].click();", bagBtn);
    }

    waitForLoadingToComplete();
}

    public void submitReview(int stars, String comment) {
    // 1. Wait for page data to load
    waitForLoadingToComplete();

    // 2. Identify the text area
    WebElement textArea = wait.until(ExpectedConditions.presenceOfElementLocated(reviewTextArea));

    // 3. Scroll to the element so it's visible to Selenium
    // 'behavior: smooth' can be slow, so we use 'scrollIntoView' via JS
    ((org.openqa.selenium.JavascriptExecutor) driver)
        .executeScript("arguments[0].scrollIntoView({block: 'center'});", textArea);

    // 4. Handle Stars (Form Specific)
    By formStars = By.cssSelector("form svg.lucide-star");
    List<WebElement> starsList = driver.findElements(formStars);
    if (stars > 0 && stars <= starsList.size()) {
        starsList.get(stars - 1).click();
    }

    // 5. Fill and Submit
    type(reviewTextArea, comment);
    click(submitReviewBtn);
}

    public void deleteMyReview() {
        // click); 
        click(deleteReviewBtn); 
        click(confirmBtn);
    }

    // public void confirmDelete(){
    //     click(confirmBtn);
    // }

}