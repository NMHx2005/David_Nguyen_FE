import { browser, by, element, ElementFinder } from 'protractor';

describe('Chat System E2E Tests', () => {
    beforeEach(async () => {
        await browser.get('/');
    });

    describe('Authentication Flow', () => {
        it('should register a new user', async () => {
            // Navigate to register page
            await browser.get('/register');

            // Fill registration form
            await element(by.css('input[name="username"]')).sendKeys('e2etestuser');
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('input[name="confirmPassword"]')).sendKeys('password123');

            // Submit form
            await element(by.css('button[type="submit"]')).click();

            // Should redirect to login with success message
            await browser.wait(browser.ExpectedConditions.urlContains('/login'), 5000);
            expect(await element(by.css('.success-message')).isPresent()).toBe(true);
        });

        it('should login with valid credentials', async () => {
            // Navigate to login page
            await browser.get('/login');

            // Fill login form
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');

            // Submit form
            await element(by.css('button[type="submit"]')).click();

            // Should redirect to home page
            await browser.wait(browser.ExpectedConditions.urlContains('/home'), 5000);
            expect(await browser.getCurrentUrl()).toContain('/home');
        });

        it('should show error for invalid credentials', async () => {
            await browser.get('/login');

            await element(by.css('input[name="email"]')).sendKeys('invalid@example.com');
            await element(by.css('input[name="password"]')).sendKeys('wrongpassword');
            await element(by.css('button[type="submit"]')).click();

            // Should show error message
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.error-message'))), 5000);
            expect(await element(by.css('.error-message')).isPresent()).toBe(true);
        });
    });

    describe('Group Management Flow', () => {
        beforeEach(async () => {
            // Login first
            await browser.get('/login');
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('button[type="submit"]')).click();
            await browser.wait(browser.ExpectedConditions.urlContains('/home'), 5000);
        });

        it('should create a new group', async () => {
            // Navigate to groups page
            await browser.get('/groups');

            // Click create group button
            await element(by.css('button[data-testid="create-group-btn"]')).click();

            // Fill group form
            await element(by.css('input[name="name"]')).sendKeys('E2E Test Group');
            await element(by.css('textarea[name="description"]')).sendKeys('A group created during E2E testing');

            // Submit form
            await element(by.css('button[type="submit"]')).click();

            // Should see new group in list
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.cssContainingText('.group-name', 'E2E Test Group'))), 5000);
            expect(await element(by.cssContainingText('.group-name', 'E2E Test Group')).isPresent()).toBe(true);
        });

        it('should join an existing group', async () => {
            await browser.get('/groups');

            // Find and click join button for first group
            const joinButton = element(by.css('.group-item:first-child .join-btn'));
            await joinButton.click();

            // Should see success message
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.success-message'))), 5000);
            expect(await element(by.css('.success-message')).isPresent()).toBe(true);
        });
    });

    describe('Chat Flow', () => {
        beforeEach(async () => {
            // Login and join a group
            await browser.get('/login');
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('button[type="submit"]')).click();
            await browser.wait(browser.ExpectedConditions.urlContains('/home'), 5000);
        });

        it('should send a text message', async () => {
            // Navigate to chat
            await browser.get('/chat');

            // Select a group
            await element(by.css('.group-item:first-child')).click();

            // Select a channel
            await element(by.css('.channel-item:first-child')).click();

            // Type and send message
            const messageInput = element(by.css('input[data-testid="message-input"]'));
            await messageInput.sendKeys('Hello from E2E test!');
            await element(by.css('button[data-testid="send-btn"]')).click();

            // Should see message in chat
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.cssContainingText('.message-text', 'Hello from E2E test!'))), 5000);
            expect(await element(by.cssContainingText('.message-text', 'Hello from E2E test!')).isPresent()).toBe(true);
        });

        it('should upload and send an image', async () => {
            await browser.get('/chat');
            await element(by.css('.group-item:first-child')).click();
            await element(by.css('.channel-item:first-child')).click();

            // Click image upload button
            await element(by.css('button[data-testid="image-upload-btn"]')).click();

            // Upload file (this would need a test image file)
            const fileInput = element(by.css('input[type="file"]'));
            await fileInput.sendKeys('/path/to/test/image.jpg');

            // Should see image in chat
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.message-image'))), 5000);
            expect(await element(by.css('.message-image')).isPresent()).toBe(true);
        });

        it('should show typing indicator', async () => {
            await browser.get('/chat');
            await element(by.css('.group-item:first-child')).click();
            await element(by.css('.channel-item:first-child')).click();

            // Start typing
            const messageInput = element(by.css('input[data-testid="message-input"]'));
            await messageInput.sendKeys('typing...');

            // Should see typing indicator
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.typing-indicator'))), 2000);
            expect(await element(by.css('.typing-indicator')).isPresent()).toBe(true);
        });
    });

    describe('Admin Flow', () => {
        beforeEach(async () => {
            // Login as admin
            await browser.get('/login');
            await element(by.css('input[name="email"]')).sendKeys('admin@example.com');
            await element(by.css('input[name="password"]')).sendKeys('adminpassword');
            await element(by.css('button[type="submit"]')).click();
            await browser.wait(browser.ExpectedConditions.urlContains('/admin'), 5000);
        });

        it('should access admin dashboard', async () => {
            await browser.get('/admin');

            // Should see dashboard stats
            expect(await element(by.css('.dashboard-stats')).isPresent()).toBe(true);
            expect(await element(by.css('.total-users')).isPresent()).toBe(true);
            expect(await element(by.css('.total-groups')).isPresent()).toBe(true);
        });

        it('should manage users', async () => {
            await browser.get('/admin/users');

            // Should see users table
            expect(await element(by.css('.users-table')).isPresent()).toBe(true);

            // Should be able to create user
            await element(by.css('button[data-testid="create-user-btn"]')).click();

            await element(by.css('input[name="username"]')).sendKeys('admincreateduser');
            await element(by.css('input[name="email"]')).sendKeys('admincreated@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');

            await element(by.css('button[type="submit"]')).click();

            // Should see new user in table
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.cssContainingText('.user-username', 'admincreateduser'))), 5000);
            expect(await element(by.cssContainingText('.user-username', 'admincreateduser')).isPresent()).toBe(true);
        });

        it('should manage groups', async () => {
            await browser.get('/admin/groups');

            // Should see groups table
            expect(await element(by.css('.groups-table')).isPresent()).toBe(true);

            // Should be able to edit group
            await element(by.css('.group-item:first-child .edit-btn')).click();

            await element(by.css('input[name="name"]')).clear();
            await element(by.css('input[name="name"]')).sendKeys('Updated Group Name');

            await element(by.css('button[type="submit"]')).click();

            // Should see updated name
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.cssContainingText('.group-name', 'Updated Group Name'))), 5000);
            expect(await element(by.cssContainingText('.group-name', 'Updated Group Name')).isPresent()).toBe(true);
        });
    });

    describe('Video Call Flow', () => {
        beforeEach(async () => {
            // Login
            await browser.get('/login');
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('button[type="submit"]')).click();
            await browser.wait(browser.ExpectedConditions.urlContains('/home'), 5000);
        });

        it('should initiate video call', async () => {
            await browser.get('/chat');
            await element(by.css('.group-item:first-child')).click();
            await element(by.css('.channel-item:first-child')).click();

            // Click video call button
            await element(by.css('button[data-testid="video-call-btn"]')).click();

            // Should see video call interface
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.video-call-modal'))), 5000);
            expect(await element(by.css('.video-call-modal')).isPresent()).toBe(true);

            // Should see local video
            expect(await element(by.css('.local-video')).isPresent()).toBe(true);
        });

        it('should end video call', async () => {
            // Start video call first
            await browser.get('/chat');
            await element(by.css('.group-item:first-child')).click();
            await element(by.css('.channel-item:first-child')).click();
            await element(by.css('button[data-testid="video-call-btn"]')).click();

            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.video-call-modal'))), 5000);

            // End call
            await element(by.css('button[data-testid="end-call-btn"]')).click();

            // Should close video call interface
            await browser.wait(browser.ExpectedConditions.stalenessOf(element(by.css('.video-call-modal'))), 5000);
            expect(await element(by.css('.video-call-modal')).isPresent()).toBe(false);
        });
    });

    describe('Responsive Design', () => {
        it('should work on mobile viewport', async () => {
            await browser.manage().window().setSize(375, 667); // iPhone size
            await browser.get('/login');

            // Should see mobile layout
            expect(await element(by.css('.mobile-layout')).isPresent()).toBe(true);

            // Should be able to login
            await element(by.css('input[name="email"]')).sendKeys('e2etest@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('button[type="submit"]')).click();

            await browser.wait(browser.ExpectedConditions.urlContains('/home'), 5000);
            expect(await browser.getCurrentUrl()).toContain('/home');
        });

        it('should work on tablet viewport', async () => {
            await browser.manage().window().setSize(768, 1024); // iPad size
            await browser.get('/home');

            // Should see tablet layout
            expect(await element(by.css('.tablet-layout')).isPresent()).toBe(true);
    });
});

    describe('Error Handling', () => {
        it('should handle network errors gracefully', async () => {
            // Simulate network error by going offline
            await browser.executeScript('window.navigator.onLine = false;');

            await browser.get('/login');
            await element(by.css('input[name="email"]')).sendKeys('test@example.com');
            await element(by.css('input[name="password"]')).sendKeys('password123');
            await element(by.css('button[type="submit"]')).click();

            // Should show network error message
            await browser.wait(browser.ExpectedConditions.presenceOf(element(by.css('.network-error'))), 5000);
            expect(await element(by.css('.network-error')).isPresent()).toBe(true);

            // Restore network
            await browser.executeScript('window.navigator.onLine = true;');
        });

        it('should handle 404 errors', async () => {
            await browser.get('/nonexistent-page');

            // Should show 404 page
            expect(await element(by.css('.error-404')).isPresent()).toBe(true);
            expect(await element(by.cssContainingText('h1', 'Page Not Found')).isPresent()).toBe(true);
        });
    });
});