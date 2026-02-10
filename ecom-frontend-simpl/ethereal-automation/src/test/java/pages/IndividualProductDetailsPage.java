package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class IndividualProductDetailsPage extends BasePage {
    private By pickOfferBtn = By.xpath("//button[contains(text(), 'Pick This')]");
    private By quantityPlusBtn = By.cssSelector("button:has(svg.lucide-plus)");
    private By addToBagBtn = By.xpath("//button[contains(text(), 'Add to Bag')]");

    public IndividualProductDetailsPage(WebDriver driver) {
        super(driver);
    }

    public void waitForLoad() {
        waitForVisible(addToBagBtn);
    }

    public void pickMerchantOffer() {
        click(pickOfferBtn);
    }

    public void increaseQuantity(int times) {
        for (int i = 0; i < times - 1; i++) {
            click(quantityPlusBtn);
        }
    }

    public void addToBag() {
        click(addToBagBtn);
    }
}