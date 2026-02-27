from playwright.sync_api import sync_playwright, expect

def test_app_load(page):
    # Check if the app loads by looking for the "Stream" component elements or button
    page.goto("http://localhost:3001")

    # Wait for the "Create Today's Note" button, which indicates app loaded
    # If the app crashes with "Invalid Hook Call", this will timeout or fail
    button = page.get_by_role("button", name="Create Today's Note")
    expect(button).to_be_visible(timeout=5000)

    page.screenshot(path="verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_app_load(page)
            print("App loaded successfully")
        except Exception as e:
            print(f"App load failed: {e}")
            page.screenshot(path="verification_fail.png")
        finally:
            browser.close()
