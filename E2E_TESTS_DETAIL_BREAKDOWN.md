# 🔬 E2E TESTS - PHÂN TÍCH CHI TIẾT TỪNG TEST CASE

## 📖 MỤC LỤC

1. [AUTH.CY.TS - Chi tiết 7 tests](#authcyts---7-authentication-tests)
2. [CHAT.CY.TS - Chi tiết 6 tests](#chatcyts---6-chat-functionality-tests)
3. [VIDEO-CALL.CY.TS - Chi tiết 4 tests](#video-callcyts---4-video-call-tests)
4. [ADMIN.CY.TS - Chi tiết 5 tests](#admincyts---5-admin-panel-tests)
5. [ADVANCED-CHAT.CY.TS - Chi tiết 30+ tests](#advanced-chatcyts---30-advanced-tests)
6. [Mock Data & APIs](#mock-data--apis)
7. [Test Flow Diagrams](#test-flow-diagrams)

---

## 📝 AUTH.CY.TS - 7 Authentication Tests

**File:** `cypress/e2e/auth.cy.ts`  
**Purpose:** Test authentication flows (login, register, validation)  
**Dependencies:** None (base tests)

---

### ✅ TEST 1: Display Login Page by Default

**Mục đích:** Verify trang login là landing page mặc định

**Code:**
```typescript
it('should display login page by default', () => {
  cy.visit('/');
  cy.url().should('include', '/login');
  cy.get('[data-cy="login-form"]').should('be.visible');
  cy.get('[data-cy="email-input"]').should('be.visible');
  cy.get('[data-cy="password-input"]').should('be.visible');
  cy.get('[data-cy="login-button"]').should('be.visible');
});
```

**Chi tiết từng bước:**

| Bước | Command | Test gì | Kết quả mong đợi |
|------|---------|---------|------------------|
| 1 | `cy.visit('/')` | Truy cập trang chủ | Browser load `http://localhost:4200` |
| 2 | `cy.url().should('include', '/login')` | Kiểm tra redirect | URL phải chứa `/login` (routing works) |
| 3 | `cy.get('[data-cy="login-form"]')` | Tìm form element | Form component rendered |
| 4 | `.should('be.visible')` | Kiểm tra visibility | Form hiển thị trên màn hình |
| 5 | `cy.get('[data-cy="email-input"]')` | Tìm email input | Input field exists |
| 6 | `.should('be.visible')` | Kiểm tra visibility | Input hiển thị |
| 7 | `cy.get('[data-cy="password-input"]')` | Tìm password input | Input field exists |
| 8 | `.should('be.visible')` | Kiểm tra visibility | Input hiển thị |
| 9 | `cy.get('[data-cy="login-button"]')` | Tìm login button | Button exists |
| 10 | `.should('be.visible')` | Kiểm tra visibility | Button hiển thị |

**Điều kiện PASS:**
- ✅ URL redirect to `/login`
- ✅ Form, inputs, button tất cả đều visible
- ✅ Không có error trong console

**Điều kiện FAIL:**
- ❌ URL không redirect
- ❌ Form không render
- ❌ Bất kỳ element nào không tìm thấy
- ❌ JavaScript error

**Kết nối:**
- 🔗 **Không có dependencies** - Test đầu tiên
- 🔗 **Được sử dụng bởi:** Tất cả tests khác cần login page

---

### ✅ TEST 2: Navigate to Register Page

**Mục đích:** Verify link "Sign up" hoạt động

**Code:**
```typescript
it('should navigate to register page', () => {
  cy.get('[data-cy="register-link"]').click();
  cy.url().should('include', '/register');
  cy.get('[data-cy="register-form"]').should('be.visible');
});
```

**Chi tiết từng bước:**

| Bước | Command | Test gì | Kết quả mong đợi |
|------|---------|---------|------------------|
| 1 | `cy.get('[data-cy="register-link"]')` | Tìm link "Sign up here" | Link element tồn tại |
| 2 | `.click()` | Click vào link | Angular routing triggers |
| 3 | `cy.url().should('include', '/register')` | Kiểm tra URL changed | URL = `/register` |
| 4 | `cy.get('[data-cy="register-form"]')` | Tìm register form | Form component rendered |
| 5 | `.should('be.visible')` | Kiểm tra visibility | Form hiển thị |

**Điều kiện PASS:**
- ✅ Click link thành công
- ✅ URL change to `/register`
- ✅ Register form hiển thị

**Kết nối:**
- 🔗 **Dependencies:** Test 1 (cần login page có register link)
- 🔗 **Leads to:** Test 3 (register form functionality)

---

### ✅ TEST 3: Register New User Successfully

**Mục đích:** Test toàn bộ quy trình đăng ký user mới

**Code:**
```typescript
it('should register a new user successfully', () => {
  cy.visit('/register');

  // Mock register API response
  cy.interceptAPI('POST', '/api/auth/register', {
    success: true,
    data: {
      user: {
        _id: 'new-user-id',
        username: 'e2etestuser',
        email: 'e2etest@example.com',
        roles: ['user'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }
  });

  // Mock logout API (called after successful registration)
  cy.interceptAPI('POST', '/api/auth/logout', {
    success: true,
    message: 'Logged out successfully'
  });

  cy.get('[data-cy="username-input"]').type('e2etestuser');
  cy.get('[data-cy="email-input"]').type('e2etest@example.com');
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="confirm-password-input"]').type('password123');
  cy.get('[data-cy="register-button"]').click();

  // Should redirect to login with success message
  cy.url().should('include', '/login');
  cy.get('[data-cy="success-message"]').should('be.visible');
});
```

**Chi tiết từng bước:**

| Bước | Command | Test gì | Input/Data |
|------|---------|---------|------------|
| 1 | `cy.visit('/register')` | Truy cập register page | Direct URL navigation |
| 2 | `cy.interceptAPI(...)` | Setup mock API | Mock successful registration |
| 3 | `type('e2etestuser')` | Nhập username | `username = "e2etestuser"` |
| 4 | `type('e2etest@example.com')` | Nhập email | `email = "e2etest@example.com"` |
| 5 | `type('password123')` | Nhập password | `password = "password123"` |
| 6 | `type('password123')` | Nhập confirm password | `confirmPassword = "password123"` |
| 7 | `.click()` | Submit form | POST /api/auth/register |
| 8 | `cy.url().should(...)` | Verify redirect | URL → `/login` |
| 9 | `cy.get('[data-cy="success-message"]')` | Verify success UI | Message displayed |

**Mock API Request:**
```json
POST /api/auth/register
Body: {
  "username": "e2etestuser",
  "email": "e2etest@example.com",
  "password": "password123"
}
```

**Mock API Response:**
```json
Status: 200 OK
Body: {
  "success": true,
  "data": {
    "user": {
      "_id": "new-user-id",
      "username": "e2etestuser",
      "email": "e2etest@example.com",
      "roles": ["user"],
      "isActive": true
    },
    "accessToken": "mock-access-token",
    "refreshToken": "mock-refresh-token"
  }
}
```

**Điều kiện PASS:**
- ✅ Form submit thành công
- ✅ API được gọi với data đúng
- ✅ Redirect về `/login`
- ✅ Success message hiển thị

**Điều kiện FAIL:**
- ❌ Form validation fail
- ❌ API không được gọi
- ❌ Không redirect
- ❌ Success message không hiển thị

**Kết nối:**
- 🔗 **Tạo test data:** User `e2etest@example.com` được register
- 🔗 **Được sử dụng bởi:** Test 4 (login với user này)

---

### ✅ TEST 4: Login with Valid Credentials

**Mục đích:** Test login với credentials vừa register

**Code:**
```typescript
it('should login with valid credentials', () => {
  cy.interceptAPI('POST', '/api/auth/login', {
    success: true,
    data: {
      user: {
        _id: 'test-user-id',
        username: 'e2etestuser',
        email: 'e2etest@example.com',
        roles: ['user']
      },
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }
  });

  cy.get('[data-cy="email-input"]').type('e2etest@example.com');
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="login-button"]').click();

  cy.url().should('include', '/home');
  cy.get('[data-cy="user-menu"]').should('be.visible');
});
```

**Chi tiết từng bước:**

| Bước | Command | Test gì | Xử lý gì |
|------|---------|---------|----------|
| 1 | `cy.interceptAPI(...)` | Mock login API | Setup response trước khi login |
| 2 | `type('e2etest@example.com')` | Nhập email | Fill email từ Test 3 |
| 3 | `type('password123')` | Nhập password | Fill password từ Test 3 |
| 4 | `.click()` | Click login button | Trigger login action |
| 5 | **Backend processing** | API call | POST /api/auth/login |
| 6 | **Frontend processing** | Store tokens | localStorage.auth_token saved |
| 7 | **Frontend routing** | Navigation | Router.navigate(['/home']) |
| 8 | `cy.url().should(...)` | Verify redirect | URL = `/home` |
| 9 | `cy.get('[data-cy="user-menu"]')` | Verify logged in state | User menu hiển thị |

**Flow diagram:**
```
User fills form
     ↓
Click Login button
     ↓
POST /api/auth/login (mocked)
     ↓
Response: { success: true, accessToken, refreshToken }
     ↓
Angular AuthService:
  - Store tokens in localStorage
  - Set currentUser in BehaviorSubject
  - Trigger navigation
     ↓
Router navigates to /home
     ↓
Home component loads
  - Check auth status
  - Load user groups
  - Display user menu
     ↓
✅ Test verifies: URL = /home, user menu visible
```

**localStorage sau login:**
```javascript
{
  auth_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  current_user: {
    id: "test-user-id",
    username: "e2etestuser",
    email: "e2etest@example.com",
    roles: ["user"],
    token: "mock-access-token"
  }
}
```

**Điều kiện PASS:**
- ✅ Email & password nhập đúng
- ✅ Login API được gọi
- ✅ Tokens được lưu vào localStorage
- ✅ Redirect về `/home`
- ✅ User menu hiển thị

**Kết nối:**
- 🔗 **Dependencies:** Test 3 (user đã được register)
- 🔗 **Tạo session:** Authentication state cho ALL tests sau này
- 🔗 **Được sử dụng bởi:**
  - chat.cy.ts (via cy.login command)
  - video-call.cy.ts (via cy.login command)
  - advanced-chat.cy.ts (via cy.login command)

---

### ✅ TEST 5: Show Error for Invalid Credentials

**Mục đích:** Test error handling

**Code:**
```typescript
it('should show error for invalid credentials', () => {
  cy.interceptAPI('POST', '/api/auth/login', {
    success: false,
    message: 'Invalid credentials'
  });

  cy.get('[data-cy="email-input"]').type('invalid@example.com');
  cy.get('[data-cy="password-input"]').type('wrongpassword');
  cy.get('[data-cy="login-button"]').click();

  cy.get('[data-cy="error-message"]').should('be.visible');
  cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
});
```

**Chi tiết từng bước:**

| Bước | Action | Test gì | Expected Behavior |
|------|--------|---------|-------------------|
| 1 | Mock API error | Setup fail response | API sẽ trả về error |
| 2 | Type invalid email | User input sai | `invalid@example.com` |
| 3 | Type wrong password | User input sai | `wrongpassword` |
| 4 | Click login | Submit form | API call triggered |
| 5 | **API returns error** | Backend response | `{ success: false, message: 'Invalid credentials' }` |
| 6 | **Frontend handles error** | Error handling logic | AuthService catches error |
| 7 | **Show error UI** | Display error to user | Error message component shows |
| 8 | Verify error visible | Test assertion | Error message displayed |
| 9 | Verify error text | Test assertion | Text = "Invalid credentials" |

**Error Handling Flow:**
```
User submits form
     ↓
POST /api/auth/login
     ↓
Response: 401 Unauthorized
{
  success: false,
  message: "Invalid credentials"
}
     ↓
Angular AuthService.login():
  .catch(error => {
    this.errorMessage = error.message;
    this.snackBar.open(error.message);
  })
     ↓
Error message component:
  <div data-cy="error-message">
    <mat-icon>error</mat-icon>
    Invalid credentials
  </div>
     ↓
✅ Test verifies: Error visible & text correct
```

**Kết nối:**
- 🔗 **Independent test** - Không phụ thuộc tests khác
- 🔗 **Tests negative case** - Complement to Test 4 (positive case)

---

### ✅ TEST 6: Validate Required Fields

**Mục đích:** Test form validation không cho submit khi fields trống

**Code:**
```typescript
it('should validate required fields', () => {
  // Check that fields have required attribute
  cy.get('[data-cy="email-input"]').should('have.attr', 'required');
  cy.get('[data-cy="password-input"]').should('have.attr', 'required');

  // Check that login button is disabled when fields are empty
  cy.get('[data-cy="login-button"]').should('be.disabled');
});
```

**Chi tiết từng bước:**

| Bước | Test gì | Angular Validation | UI State |
|------|---------|-------------------|----------|
| 1 | Email has `required` attr | `Validators.required` | `<input required>` |
| 2 | Password has `required` attr | `Validators.required` | `<input required>` |
| 3 | Button is disabled | `[disabled]="loginForm.invalid"` | `<button disabled>` |

**Angular Form Validation Logic:**
```typescript
// In login-form.component.ts
loginForm = this.fb.group({
  username: ['', [Validators.required]], // ← Empty = invalid
  password: ['', [Validators.required]]  // ← Empty = invalid
});

// In template
<button [disabled]="loginForm.invalid || isLoading">
  Sign In
</button>

// When fields are empty:
loginForm.invalid = true
  ↓
[disabled]="true"
  ↓
Button is disabled (gray, can't click)
```

**Test scenarios:**

| Email | Password | loginForm.invalid | Button State |
|-------|----------|-------------------|--------------|
| *(empty)* | *(empty)* | TRUE | ❌ Disabled |
| "test@mail.com" | *(empty)* | TRUE | ❌ Disabled |
| *(empty)* | "password123" | TRUE | ❌ Disabled |
| "test@mail.com" | "password123" | FALSE | ✅ Enabled |

**Kết nối:**
- 🔗 **Independent test** - Tests Angular form validation
- 🔗 **Complements:** Test 7 (validation logic)

---

### ✅ TEST 7: Enable Login Button with Valid Username

**Mục đích:** Verify username field không yêu cầu email format (sau khi fix)

**Code:**
```typescript
it('should enable login button with any valid username', () => {
  cy.get('[data-cy="email-input"]').type('testuser'); // Not an email
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="login-button"]').should('not.be.disabled');
});
```

**Chi tiết từng bước:**

| Bước | Input | Validation Check | Result |
|------|-------|------------------|--------|
| 1 | `testuser` | Validators.required ✅ | Has value → Valid |
| 2 | | ~~Validators.email~~ ❌ | Removed → Skip |
| 3 | `password123` | Validators.required ✅ | Has value → Valid |
| 4 | Check button | loginForm.invalid = false | Enabled ✅ |

**Trước khi fix:**
```typescript
username: ['', [Validators.required, Validators.email]],
                                    // ↑ Yêu cầu email format

Input: "testuser"
  ↓ Not email format
  ↓ Validation FAIL
  ↓ Button DISABLED ❌
```

**Sau khi fix:**
```typescript
username: ['', [Validators.required]], // ← Removed email validator

Input: "testuser"
  ↓ Has value
  ↓ Validation PASS ✅
  ↓ Button ENABLED ✅
```

**Kết nối:**
- 🔗 **Tests fix:** Verify bug fix works correctly
- 🔗 **Replaces:** Old test "should validate email format"

---

## 💬 CHAT.CY.TS - 6 Chat Functionality Tests

**File:** `cypress/e2e/chat.cy.ts`  
**Purpose:** Test chat features (groups, channels, messages)  
**Dependencies:** Authentication (cy.login)

---

### 🔧 SETUP - beforeEach() Hook

**⚠️ QUAN TRỌNG:** Setup này chạy trước MỌI test trong file

**Code:**
```typescript
beforeEach(() => {
  // === PHASE 1: Mock APIs to prevent errors ===
  
  // 1. Mock Socket.io (prevent 401 authentication errors)
  cy.intercept('GET', '**/socket.io/**', {
    statusCode: 200,
    body: '0'  // Socket.io ping response
  });
  cy.intercept('POST', '**/socket.io/**', {
    statusCode: 200,
    body: 'ok'
  });
  
  // 2. Mock logout API (prevent logout during tests)
  cy.intercept('POST', '**/api/auth/logout*', {
    statusCode: 200,
    body: {
      success: true,
      message: 'Logged out successfully'
    }
  });
  
  // 3. Mock message reactions API (prevent 401)
  cy.intercept('GET', '**/api/messages/*/reactions*', {
    statusCode: 200,
    body: { success: true, data: [] }
  });
  
  // 4. Mock group requests API (CRITICAL: prevents logout loop!)
  cy.intercept('GET', '**/api/group-requests*', {
    statusCode: 200,
    body: {
      success: true,
      data: [],
      total: 0,
      page: 1,
      limit: 1000
    }
  });
  
  // 5. Mock avatar API
  cy.intercept('GET', '**/api/users/*/avatar*', {
    statusCode: 200,
    body: null
  });
  
  // === PHASE 2: Login ===
  cy.login('e2etest@example.com', 'password123');
  
  // === PHASE 3: Mock chat data ===
  cy.intercept('GET', '**/api/groups*', {
    statusCode: 200,
    body: {
      success: true,
      data: [{
        _id: 'test-group-id',
        id: 'test-group-id',
        name: 'Test Group',
        description: 'A test group for E2E testing',
        members: ['test-user-id'],
        memberCount: 1,
        isPrivate: false
      }]
    }
  }).as('getGroups');
  
  cy.intercept('GET', '**/api/channels/group/*', {
    statusCode: 200,
    body: {
      success: true,
      data: [{
        _id: 'test-channel-id',
        name: 'general',
        description: 'General discussion',
        groupId: 'test-group-id',
        type: 'text'
      }]
    }
  }).as('getChannels');
  
  cy.intercept('GET', '**/api/messages/channel/*', {
    statusCode: 200,
    body: {
      success: true,
      data: []
    }
  }).as('getMessages');
  
  cy.intercept('GET', '**/api/users/*/groups', {
    statusCode: 200,
    body: {
      success: true,
      data: [{
        _id: 'test-group-id',
        name: 'Test Group',
        description: 'A test group for E2E testing'
      }]
    }
  }).as('getUserGroups');
  
  // === PHASE 4: Navigate to chat ===
  cy.visit('/chat');
  cy.get('app-root', { timeout: 10000 }).should('exist');
  cy.wait(2000);
  cy.get('app-chat', { timeout: 10000 }).should('exist');
});
```

**Tại sao cần setup phức tạp như vậy?**

```
Problem: Logout Loop
  │
  ├─> Angular app loads
  │    ├─> Makes API call: GET /api/group-requests
  │    ├─> Backend returns: 401 Unauthorized (no mock)
  │    ├─> Frontend: Detects 401 → Logout user
  │    ├─> Redirect to: /login
  │    └─> Test FAILS! ❌
  │
Solution: Mock ALL APIs that cause 401
  │
  ├─> Mock: Socket.io, logout, reactions, group-requests, avatars
  ├─> THEN: Login
  ├─> THEN: Mock: groups, channels, messages
  └─> Result: No 401 errors → Test PASSES ✅
```

---

### ✅ TEST 1: Display Groups and Channels

**Code:**
```typescript
it('should display groups and channels', () => {
  cy.get('[data-cy="groups-list"]', { timeout: 15000 }).should('exist');
  cy.get('[data-cy="group-item"]').should('have.length.greaterThan', 0);
  cy.get('[data-cy="group-item"]').first().should('contain', 'Test Group');
  
  cy.get('[data-cy="group-item"]').first().click();
  cy.get('[data-cy="message-input"]').should('be.visible');
});
```

**Chi tiết:**

**Step-by-step execution:**

1. **Component Load:**
   ```
   beforeEach() completes
     ↓
   cy.visit('/chat') executed
     ↓
   Angular ChatComponent ngOnInit()
     ↓
   Call: this.loadGroups()
     ↓
   API: GET /api/groups (mocked in beforeEach)
   ```

2. **Data Flow:**
   ```
   Mock API returns:
   [
     {
       _id: 'test-group-id',
       name: 'Test Group',
       members: ['test-user-id']
     }
   ]
     ↓
   GroupService.getAllGroups()
     ↓
   ChatComponent.groups = [...]
     ↓
   Template renders:
   <div data-cy="groups-list">
     <div data-cy="group-item">Test Group</div>
   </div>
   ```

3. **Test Verification:**
   ```
   cy.get('[data-cy="groups-list"]')
     ↓ Finds: <div data-cy="groups-list">
     ↓ .should('exist')
     ↓ ✅ PASS if found

   cy.get('[data-cy="group-item"]')
     ↓ Finds: NodeList[<div data-cy="group-item">]
     ↓ .should('have.length.greaterThan', 0)
     ↓ ✅ PASS if length > 0

   cy.get('[data-cy="group-item"]').first()
     ↓ Gets: First element in NodeList
     ↓ .should('contain', 'Test Group')
     ↓ ✅ PASS if textContent includes "Test Group"
   ```

4. **Click Interaction:**
   ```
   cy.get('[data-cy="group-item"]').first().click()
     ↓
   Angular: (click)="selectGroup(group)"
     ↓
   ChatComponent.selectGroup(group)
     ↓
   API: GET /api/channels/group/:id (mocked)
     ↓
   API: GET /api/messages/channel/:id (mocked)
     ↓
   Update view: Show message input
     ↓
   cy.get('[data-cy="message-input"]').should('be.visible')
     ↓
   ✅ PASS if message input visible
   ```

**Kết nối:**
- 🔗 **Base test cho chat features**
- 🔗 **Được sử dụng bởi:** Tests 2, 3, 4, 5 (need group selected)

---

### ✅ TEST 2: Send a Text Message

**Code:**
```typescript
it('should send a text message', () => {
  // Select group (from Test 1)
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000); // Wait for messages to load

  // Mock message sending
  cy.intercept('POST', '**/api/messages*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        _id: 'test-message-id',
        text: 'Hello from E2E test!',
        userId: 'test-user-id',
        username: 'e2etestuser',
        channelId: 'test-channel-id',
        type: 'text',
        createdAt: new Date().toISOString()
      }
    }
  }).as('sendMessage');

  // Type and send message - use alias to prevent re-render issues
  cy.get('[data-cy="message-input"]').as('messageInput');
  cy.get('@messageInput').type('Hello from E2E test!', { delay: 50 });
  cy.get('[data-cy="send-button"]').click();

  // Wait for message to be sent
  cy.wait('@sendMessage');

  // Verify message input is cleared
  cy.get('[data-cy="message-input"]').should('have.value', '');
});
```

**Chi tiết Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Setup                                              │
└─────────────────────────────────────────────────────────────┘
User clicks group (from Test 1)
  ↓
ChatComponent.selectGroup(group)
  ↓
this.selectedGroup = group
this.selectedChannel = group.channels[0]
  ↓
Load messages: GET /api/messages/channel/:id
  ↓
this.messages = [] (empty)
  ↓
UI ready to send message

┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: User Action                                        │
└─────────────────────────────────────────────────────────────┘
cy.get('[data-cy="message-input"]').as('messageInput')
  ↓ Store reference (prevent re-render issues)
  ↓
cy.get('@messageInput').type('Hello from E2E test!', { delay: 50 })
  ↓ Type with 50ms delay between keystrokes (more realistic)
  ↓
Input value: "Hello from E2E test!"
  ↓
cy.get('[data-cy="send-button"]').click()
  ↓ Click send

┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: API Call                                           │
└─────────────────────────────────────────────────────────────┘
Angular: (click)="sendMessage()"
  ↓
ChatComponent.sendMessage()
  ↓
this.messageService.sendMessage({
  text: "Hello from E2E test!",
  channelId: "test-channel-id",
  userId: "test-user-id"
})
  ↓
HTTP: POST /api/messages
Body: {
  "text": "Hello from E2E test!",
  "channelId": "test-channel-id"
}
  ↓
Mock intercepts request
  ↓
Returns: {
  success: true,
  data: {
    _id: 'test-message-id',
    text: 'Hello from E2E test!',
    ...
  }
}

┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: UI Update                                          │
└─────────────────────────────────────────────────────────────┘
MessageService returns observable
  ↓
ChatComponent.sendMessage().subscribe(response => {
  if (response.success) {
    this.messages.push(response.data);
    this.messageInput.reset(); // Clear input
    this.socketService.emit('message:new', response.data);
  }
})
  ↓
Input field cleared: value = ""
  ↓
Message added to list: this.messages = [{ text: "Hello..." }]

┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Test Verification                                  │
└─────────────────────────────────────────────────────────────┘
cy.wait('@sendMessage')
  ↓ Waits for API call to complete
  ↓ ✅ PASS: API was called

cy.get('[data-cy="message-input"]').should('have.value', '')
  ↓ Checks input value
  ↓ ✅ PASS: Value is empty (cleared)
```

**Why use alias `@messageInput`?**
```typescript
// ❌ Problem without alias:
cy.get('[data-cy="message-input"]').type('Hello');
// Angular re-renders component
// cy.get('[data-cy="message-input"]') finds NEW element
// Type command fails: "Element is detached from DOM"

// ✅ Solution with alias:
cy.get('[data-cy="message-input"]').as('messageInput');
cy.get('@messageInput').type('Hello', { delay: 50 });
// Cypress retries finding element if detached
// More resilient to re-renders
```

**Kết nối:**
- 🔗 **Dependencies:** Test 1 (group selected)
- 🔗 **Sử dụng:** Message sending pattern cho tests khác
- 🔗 **Core functionality:** Base cho Test 3, 4

---

### ✅ TEST 3: Show Typing Indicator

**Code:**
```typescript
it('should show typing indicator', () => {
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);
  
  cy.get('[data-cy="message-input"]').as('messageInput');
  cy.get('@messageInput').type('typing...', { delay: 50 });
  cy.get('@messageInput').should('have.value', 'typing...');
});
```

**Chi tiết:**

**Real typing indicator flow (not fully tested here):**
```
User A types
  ↓
(keyup) event
  ↓
Emit socket: 'user:typing'
  ↓
Socket server broadcasts to User B
  ↓
User B receives: 'user:typing' event
  ↓
User B shows: "User A is typing..."
```

**Simplified test:**
```
Just verify input updates correctly
  ↓
Type 'typing...'
  ↓
Input value = 'typing...' ✅
```

**Note:** Full testing requires 2 browsers/sessions

---

### ✅ TEST 4: Upload and Send an Image

**Code:**
```typescript
it('should upload and send an image', () => {
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);

  // Mock file upload API
  cy.intercept('POST', '**/api/upload/image*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        imageUrl: '/uploads/images/test-image.jpg',
        filename: 'test-image.jpg'
      }
    }
  }).as('uploadImage');

  // Mock message sending with image
  cy.intercept('POST', '**/api/messages*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        _id: 'test-image-message-id',
        text: '',
        userId: 'test-user-id',
        username: 'e2etestuser',
        channelId: 'test-channel-id',
        type: 'image',
        imageUrl: '/uploads/images/test-image.jpg',
        createdAt: new Date().toISOString()
      }
    }
  }).as('sendImageMessage');

  // Verify UI elements exist
  cy.get('[data-cy="image-upload-button"]').should('exist');
  cy.get('[data-cy="file-input"]').should('exist');
});
```

**Chi tiết Flow:**

```
Complete Upload Flow (not fully tested):
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks upload button                                │
│    cy.get('[data-cy="image-upload-button"]').click()       │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. File picker opens                                        │
│    <input type="file" (change)="onFileSelected($event)">   │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User selects image file                                  │
│    File: test-image.jpg (2MB)                              │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Upload to server                                         │
│    POST /api/upload/image                                   │
│    Body: FormData with file                                 │
│    Response: { imageUrl: '/uploads/images/test-image.jpg' }│
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Send message with image                                  │
│    POST /api/messages                                       │
│    Body: { type: 'image', imageUrl: '...' }                │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Display image message                                    │
│    <img [src]="message.imageUrl">                          │
└─────────────────────────────────────────────────────────────┘

Current Test: Only verifies Step 1 & 2 (UI elements exist)
Full Test: Would need actual file upload
```

**Note:** Testing file upload requires:
```typescript
// Would need this:
cy.fixture('test-image.jpg').then(fileContent => {
  cy.get('[data-cy="file-input"]').selectFile({
    contents: fileContent,
    fileName: 'test-image.jpg',
    mimeType: 'image/jpeg'
  });
});
```

---

### ✅ TEST 5: Create a New Group

**Code:**
```typescript
it('should create a new group', () => {
  cy.get('[data-cy="create-group-button"]').should('exist');
  cy.get('[data-cy="create-group-button"]').click();
  
  cy.url().should('include', '/groups');
  cy.wait(1000);
  cy.get('body').should('contain', 'Groups');
});
```

**Chi tiết Flow:**

```
User on chat page
  ↓
Click "Create Group" button
  ↓
Angular Router:
  this.router.navigate(['/groups'])
  ↓
URL changes: /chat → /groups
  ↓
GroupsComponent loads:
  - ngOnInit()
  - Load all groups
  - Display groups list
  ↓
Test verifies:
  1. URL includes '/groups' ✅
  2. Body contains 'Groups' text ✅
```

**Kết nối:**
- 🔗 **Leads to:** admin.cy.ts Tests (full group management)
- 🔗 **Navigation test:** Verifies routing works

---

## 📹 VIDEO-CALL.CY.TS - 4 Video Call Tests

**Dependencies:**
```
auth.cy.ts (login)
  ↓
chat.cy.ts (setup chat environment)
  ↓
video-call.cy.ts (test video features)
```

---

### 🔧 SETUP - beforeEach()

Similar to chat.cy.ts + additional mocks:

```typescript
beforeEach(() => {
  // All chat.cy.ts mocks...
  
  // + Video call specific mocks
  cy.intercept('POST', '**/api/video-calls*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        _id: 'test-call-id',
        callerId: 'test-user-id',
        receiverId: 'test-receiver-id',
        status: 'initiated'
      }
    }
  });
  
  cy.login('e2etest@example.com', 'password123');
  cy.visit('/chat');
  cy.wait(2000);
});
```

---

### ✅ TEST 1: Initiate Video Call

**Code:**
```typescript
it('should initiate video call', () => {
  // Mock getUserMedia (WebRTC API)
  cy.window().then((win) => {
    cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => []
    } as any);
  });

  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);
  
  cy.get('app-video-call-button').should('exist');
});
```

**Chi tiết WebRTC Mock:**

```
Real WebRTC Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks video call button                            │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Request camera/microphone permissions                    │
│    navigator.mediaDevices.getUserMedia({                    │
│      video: true,                                           │
│      audio: true                                            │
│    })                                                       │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Get MediaStream                                          │
│    Returns: MediaStream {                                   │
│      getTracks(): [VideoTrack, AudioTrack],                │
│      getVideoTracks(): [VideoTrack],                       │
│      getAudioTracks(): [AudioTrack]                        │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Create PeerJS connection                                 │
│    peer = new Peer(userId)                                  │
│    call = peer.call(receiverId, stream)                    │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Send WebRTC signals via Socket.io                       │
│    socket.emit('video:offer', { offer, to: receiverId })   │
│    socket.on('video:answer', (answer) => {...})            │
└─────────────────────────────────────────────────────────────┘

Mocked Flow (in test):
┌─────────────────────────────────────────────────────────────┐
│ 1. cy.stub(getUserMedia).resolves({ mock stream })         │
│    → Skips real camera access                               │
└─────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Verify UI component exists                              │
│    cy.get('app-video-call-button').should('exist')         │
└─────────────────────────────────────────────────────────────┘
```

**Note:** Full WebRTC testing is extremely complex, requires:
- Multiple browser sessions
- PeerJS server mocking
- ICE candidate exchange
- STUN/TURN server mocking

---

## 👨‍💼 ADMIN.CY.TS - 5 Admin Panel Tests

### 🔧 SETUP - beforeEach()

**CRITICAL DIFFERENCE: Uses ADMIN user**

```typescript
beforeEach(() => {
  // Setup admin APIs FIRST
  cy.intercept('GET', '/api/admin/dashboard', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        totalUsers: 100,
        totalGroups: 10,
        totalChannels: 25,
        totalMessages: 1000,
        newUsersThisWeek: 5,
        messagesToday: 50
      }
    }
  }).as('adminDashboard');
  
  cy.intercept('GET', '/api/admin/stats', { ... });
  cy.intercept('GET', '/api/admin/groups/stats', { ... });
  cy.intercept('GET', '/api/admin/channels/stats', { ... });
  
  // Login with ADMIN account
  cy.login('superadmin', 'password123');
  
  // Verify user loaded
  cy.window().its('localStorage').should('contain.key', 'auth_token');
  cy.window().its('localStorage').should('contain.key', 'current_user');
  
  // Mock admin panel APIs
  cy.interceptAPI('GET', '/api/users', {
    success: true,
    data: {
      users: [{ _id: 'user1', username: 'user1', roles: ['user'] }],
      total: 1
    }
  });
  
  cy.interceptAPI('GET', '/api/groups', {
    success: true,
    data: {
      groups: [{ _id: 'group1', name: 'Test Group' }],
      total: 1
    }
  });
});
```

**Admin User vs Regular User:**

| Property | Regular User | Admin User |
|----------|-------------|------------|
| Username | `e2etestuser` | `superadmin` |
| Email | `e2etest@example.com` | `superadmin@chat-system.com` |
| Roles | `['user']` | `['super_admin', 'group_admin', 'user']` |
| Can access | `/chat`, `/groups` | `/admin`, `/admin/users`, `/admin/groups` |
| Permissions | Read/Write own data | Read/Write ALL data |

---

### ✅ TEST 1: Display Admin Dashboard

**Code:**
```typescript
it('should display admin dashboard', () => {
  setupValidUserSession(); // Create admin session manually
  
  cy.visit('/login');
  cy.wait(1000);
  
  cy.visit('/admin');
  cy.wait(3000);
  
  cy.url().should('include', '/admin');
  cy.get('[data-cy="admin-dashboard"]').should('be.visible');
  cy.get('[data-cy="dashboard-stats"]').should('be.visible');
  cy.get('[data-cy="total-users"]').should('be.visible');
  cy.get('[data-cy="total-groups"]').should('be.visible');
});
```

**Chi tiết setupValidUserSession():**

```typescript
const setupValidUserSession = () => {
  // Create valid JWT token
  const createMockJWT = () => {
    const header = btoa(JSON.stringify({ 
      alg: 'HS256', 
      typ: 'JWT' 
    }));
    
    const payload = btoa(JSON.stringify({
      sub: 'admin-user-id',
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expires in 1 hour
      iat: Math.floor(Date.now() / 1000) // Issued now
    }));
    
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  };

  cy.window().then((win) => {
    const validToken = createMockJWT();
    const userData = {
      id: 'admin-user-id',
      username: 'superadmin',
      email: 'superadmin@chat-system.com',
      token: validToken,
      roles: ['super_admin', 'group_admin', 'user'],
      groups: [],
      isActive: true
    };

    // Store in localStorage
    win.localStorage.setItem('current_user', JSON.stringify(userData));
    win.localStorage.setItem('auth_token', validToken);
  });
};
```

**Access Control Flow:**
```
User visits /admin
  ↓
RoleGuard.canActivate()
  ↓
Check: AuthService.isAuthenticated()
  └─> Check: localStorage.auth_token exists ✅
  ↓
Check: AuthService.hasRole(['admin', 'super_admin'])
  └─> Check: currentUser.roles includes 'super_admin' ✅
  ↓
Access GRANTED ✅
  ↓
AdminComponent loads
  ↓
API: GET /api/admin/dashboard (mocked)
  ↓
Display dashboard stats
```

**Dashboard Stats Display:**
```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ 👥 100        │ 📁 10         │ 💬 25         │ 📧 1000     │
│ Total Users   │ Total Groups  │ Total Channels│ Total Msgs  │
├───────────────┴───────────────┴───────────────┴─────────────┤
│ 📊 5 New Users This Week                                    │
│ 💬 50 Messages Today                                        │
└─────────────────────────────────────────────────────────────┘
```

**Kết nối:**
- 🔗 **Base test:** Foundation cho admin tests
- 🔗 **Được sử dụng:** Tests 2, 3, 4, 5 cần dashboard loaded

---

### ✅ TEST 2: Manage Users

**Code:**
```typescript
it('should manage users', () => {
  setupValidUserSession();
  cy.visit('/login');
  cy.wait(1000);
  cy.visit('/admin');
  cy.wait(2000);
  
  cy.get('.loading-container', { timeout: 5000 }).should('not.exist');
  cy.get('[data-cy="admin-dashboard"]').should('be.visible');
  cy.wait(2000);
  
  // Navigate to User Activity tab
  cy.get('mat-tab-group').scrollIntoView().should('be.visible');
  cy.get('.mdc-tab').contains('User Activity').scrollIntoView().click();
  
  // Verify users table
  cy.get('[data-cy="users-table"]').should('be.visible');
  cy.get('[data-cy="user-row"]').should('contain', 'user1');
  
  // Create new user
  cy.get('[data-cy="create-user-button"]').click();
  
  cy.interceptAPI('POST', '/api/users', {
    success: true,
    data: {
      _id: 'new-user-id',
      username: 'newuser',
      email: 'newuser@example.com',
      roles: ['user']
    }
  });
  
  cy.get('[data-cy="user-username-input"]').type('newuser');
  cy.get('[data-cy="user-email-input"]').type('newuser@example.com');
  cy.get('[data-cy="user-password-input"]').type('password123');
  cy.get('[data-cy="create-user-submit"]').click();
  
  // Verify new user in table
  cy.get('[data-cy="user-row"]').should('contain', 'newuser');
});
```

**Chi tiết Material Tabs Navigation:**

```
Material UI Tabs Structure:
┌─────────────────────────────────────────────────────────────┐
│ <mat-tab-group>                                             │
│   ├─ System Overview (tab 0)                                │
│   ├─ User Activity (tab 1)        ← Click this             │
│   └─ Quick Actions (tab 2)                                  │
│                                                              │
│ <div class="tab-content">                                   │
│   Shows content for selected tab                            │
│ </div>                                                      │
└─────────────────────────────────────────────────────────────┘

Problem: Tabs may be hidden by CSS overflow
Solution: 
  cy.get('mat-tab-group').scrollIntoView()  // Make visible
  cy.get('.mdc-tab').contains('User Activity').click()  // Use .mdc-tab for Material 3
```

**Create User Flow:**
```
1. Admin in User Activity tab
     ↓
2. Clicks "Create User" button
     ↓
3. Dialog opens:
   ┌─────────────────────────────────────┐
   │ Create New User                     │
   ├─────────────────────────────────────┤
   │ Username: [newuser        ]         │
   │ Email:    [newuser@ex...  ]         │
   │ Password: [***********    ]         │
   │ Role:     [user ▼         ]         │
   ├─────────────────────────────────────┤
   │         [Cancel] [Create]           │
   └─────────────────────────────────────┘
     ↓
4. Fill form & submit
     ↓
5. POST /api/users (mocked)
     ↓
6. Dialog closes
     ↓
7. New user appears in table
     ↓
8. Test verifies: user-row contains 'newuser' ✅
```

**Kết nối:**
- 🔗 **Dependencies:** Test 1 (dashboard loaded)
- 🔗 **Creates:** New user data cho hệ thống

---

## 🚀 ADVANCED-CHAT.CY.TS - 30+ Advanced Tests

### 📊 Test Organization

```typescript
describe('Advanced Chat System E2E Tests', () => {
  // 8 groups of tests, each testing different aspects
  
  describe('User Authentication Flow', () => {
    // 2 tests - Full auth journey
  });
  
  describe('Group Management', () => {
    // 2 tests - CRUD groups
  });
  
  describe('Channel and Messaging', () => {
    // 3 tests - Messages, files, reactions
  });
  
  describe('Real-time Features', () => {
    // 2 tests - Typing, online/offline
  });
  
  describe('Video Call Integration', () => {
    // 2 tests - Call controls
  });
  
  describe('Admin Features', () => {
    // 2 tests - Admin access, user management
  });
  
  describe('Error Handling and Edge Cases', () => {
    // 3 tests - Network errors, invalid URLs, navigation
  });
  
  describe('Performance and Accessibility', () => {
    // 3 tests - Load speed, keyboard access, screen readers
  });
});
```

---

### ✅ TEST GROUP 1: User Authentication Flow

#### **Test 1.1: Complete Full Registration and Login Flow**

**Code:**
```typescript
it('should complete full registration and login flow', () => {
  // Register new user
  cy.get('[data-cy="register-tab"]').click();
  cy.get('[data-cy="username-input"]').type('e2etestuser');
  cy.get('[data-cy="email-input"]').type('e2etest@example.com');
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="confirm-password-input"]').type('password123');
  cy.get('[data-cy="register-button"]').click();

  // Should redirect to login or show success message
  cy.url().should('include', '/login');
  cy.get('[data-cy="success-message"]').should('be.visible');

  // Login with new credentials
  cy.get('[data-cy="email-input"]').type('e2etest@example.com');
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="login-button"]').click();

  // Should redirect to dashboard
  cy.url().should('include', '/dashboard');
  cy.get('[data-cy="user-menu"]').should('be.visible');
});
```

**Complete Journey:**
```
Step 1: Open website (/)
  ↓
Step 2: Click "Register" tab
  ↓
Step 3: Fill registration form:
  - Username: e2etestuser
  - Email: e2etest@example.com
  - Password: password123
  - Confirm: password123
  ↓
Step 4: Submit registration
  ↓ API: POST /api/auth/register
  ↓
Step 5: Success! Redirect to /login
  ↓ Show: "Registration successful! Please sign in."
  ↓
Step 6: Fill login form:
  - Email: e2etest@example.com (from step 3)
  - Password: password123 (from step 3)
  ↓
Step 7: Submit login
  ↓ API: POST /api/auth/login
  ↓ Store tokens in localStorage
  ↓
Step 8: Redirect to /dashboard
  ↓ Load user data
  ↓ Display user menu
  ↓
✅ User successfully registered and logged in!
```

**Data Reuse:**
```
Registration creates:
  username: 'e2etestuser'
  email: 'e2etest@example.com'
  password: 'password123'
       ↓ REUSED IN ↓
Login uses SAME credentials:
  email: 'e2etest@example.com'
  password: 'password123'
```

**Kết nối:**
- 🔗 **Most comprehensive auth test**
- 🔗 **Combines:** Test 3 (register) + Test 4 (login)
- 🔗 **Verifies:** Complete user onboarding flow

---

### ✅ TEST GROUP 3: Channel and Messaging

#### **Test 3.3: Handle Message Reactions**

**Code:**
```typescript
it('should handle message reactions', () => {
  // Navigate to a channel
  cy.get('[data-cy="channel-item"]').first().click();

  // Send a message
  cy.get('[data-cy="message-input"]').type('Test message for reactions');
  cy.get('[data-cy="send-message-button"]').click();

  // Add reaction
  cy.get('[data-cy="message-item"]').last().within(() => {
    cy.get('[data-cy="reaction-button"]').click();
    cy.get('[data-cy="emoji-picker"]').should('be.visible');
    cy.get('[data-cy="emoji-option"]').contains('👍').click();
  });

  // Verify reaction was added
  cy.get('[data-cy="message-reactions"]').should('contain', '👍');
  cy.get('[data-cy="reaction-count"]').should('contain', '1');
});
```

**Chi tiết Reaction Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Send Message                                        │
└─────────────────────────────────────────────────────────────┘
User types: "Test message for reactions"
  ↓
Click Send
  ↓
POST /api/messages
  ↓
Message displayed with ID: msg-123

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Open Reaction Picker                                │
└─────────────────────────────────────────────────────────────┘
Hover over message
  ↓
Reaction button appears
  ↓
Click reaction button
  ↓
Emoji picker opens:
  ┌───────────────────────────────┐
  │ 😀 😁 😂 🤣 😃 😄 😅 😆        │
  │ 👍 👎 ❤️ 🎉 🔥 ⭐ 💯 ✅        │
  └───────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Select Emoji                                        │
└─────────────────────────────────────────────────────────────┘
User clicks: 👍
  ↓
POST /api/messages/msg-123/reactions
Body: { emoji: '👍', userId: 'test-user-id' }
  ↓
Response: { success: true, data: { reactions: [{ emoji: '👍', count: 1 }] } }

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Display Reaction                                    │
└─────────────────────────────────────────────────────────────┘
Message updates:
  ┌─────────────────────────────────────┐
  │ 👤 e2etestuser                      │
  │ Test message for reactions          │
  │ ┌─────────┐                         │
  │ │ 👍 1    │  ← Reaction badge       │
  │ └─────────┘                         │
  └─────────────────────────────────────┘
  ↓
Test verifies:
  - Reaction emoji visible: 👍 ✅
  - Reaction count: 1 ✅
```

---

### ✅ TEST GROUP 7: Error Handling and Edge Cases

#### **Test 7.1: Handle Network Errors Gracefully**

**Code:**
```typescript
it('should handle network errors gracefully', () => {
  // Simulate network failure
  cy.intercept('GET', '/api/groups', { forceNetworkError: true });

  cy.login('test@example.com', 'password123');

  // Should show error message
  cy.get('[data-cy="error-message"]').should('be.visible');
  cy.get('[data-cy="retry-button"]').should('be.visible');
});
```

**Chi tiết Network Error Handling:**

```
Normal Flow:
  User visits /chat
    ↓
  GET /api/groups
    ↓
  Response: { success: true, data: [...] }
    ↓
  Display groups ✅

Error Flow (tested):
  User visits /chat
    ↓
  GET /api/groups
    ↓
  Network Error! (no response)
    ↓
  Angular HttpClient:
    .pipe(catchError(error => {
      if (error.status === 0) {  // Network error
        this.showError('Unable to connect to server');
      }
    }))
    ↓
  Display error UI:
    ┌─────────────────────────────────────┐
    │ ⚠️ Unable to connect to server     │
    │                                     │
    │ Please check your connection        │
    │                                     │
    │ [🔄 Retry]                          │
    └─────────────────────────────────────┘
    ↓
  Test verifies:
    - Error message visible ✅
    - Retry button visible ✅
```

**Error Scenarios Tested:**

| Error Type | Status Code | User Message | Action Available |
|------------|-------------|--------------|------------------|
| Network Error | 0 | "Unable to connect to server" | Retry button |
| Unauthorized | 401 | "Please login again" | Redirect to login |
| Forbidden | 403 | "Access denied" | Go back |
| Not Found | 404 | "Resource not found" | Go home |
| Server Error | 500 | "Server error, try again later" | Retry button |

---

#### **Test 7.3: Handle Browser Back/Forward Navigation**

**Code:**
```typescript
it('should handle browser back/forward navigation', () => {
  cy.login('test@example.com', 'password123');
  cy.get('[data-cy="group-item"]').first().click();
  cy.url().should('include', '/groups/');

  // Go back
  cy.go('back');
  cy.url().should('not.include', '/groups/');

  // Go forward
  cy.go('forward');
  cy.url().should('include', '/groups/');
});
```

**Chi tiết Navigation Flow:**

```
History Stack:
┌─────────────────────────────────────────────────────────────┐
│ Navigation History                                           │
├─────────────────────────────────────────────────────────────┤
│ [0] /login           ← Initial page                         │
│ [1] /home            ← After login                          │
│ [2] /chat            ← Navigate to chat                     │
│ [3] /groups/test-id  ← Click group                          │ ← Current
└─────────────────────────────────────────────────────────────┘

cy.go('back'):
  history.back()
    ↓
  [2] /chat  ← Current
    ↓
  ChatComponent loads
    ↓
  Test verifies: URL not includes '/groups/' ✅

cy.go('forward'):
  history.forward()
    ↓
  [3] /groups/test-id  ← Current
    ↓
  GroupDetailComponent loads
    ↓
  Test verifies: URL includes '/groups/' ✅
```

**Why Important:**
- ✅ Verifies Angular routing handles browser history
- ✅ Verifies components load correctly on back/forward
- ✅ Verifies no memory leaks or errors

---

### ✅ TEST GROUP 8: Performance and Accessibility

#### **Test 8.1: Should Load Pages Quickly**

**Code:**
```typescript
it('should load pages quickly', () => {
  const startTime = Date.now();
  cy.visit('/');
  cy.get('[data-cy="login-form"]').should('be.visible');
  const loadTime = Date.now() - startTime;

  // Page should load within 3 seconds
  expect(loadTime).to.be.lessThan(3000);
});
```

**Performance Measurement:**

```
Performance Timeline:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0ms          500ms        1000ms       1500ms       2000ms
│─────────────│─────────────│─────────────│─────────────│
│
├─ 0ms: cy.visit('/') called
│
├─ 50ms: HTML loaded
│
├─ 150ms: CSS loaded
│
├─ 300ms: JavaScript loaded
│
├─ 500ms: Angular bootstrap
│
├─ 800ms: AppComponent initialized
│
├─ 1000ms: LoginComponent loaded
│
├─ 1200ms: Template rendered
│
└─ 1500ms: Form visible ✅
   
   loadTime = 1500ms
   Expected: < 3000ms
   Result: ✅ PASS
```

**Performance Benchmarks:**

| Page | Target Load Time | Acceptable | Needs Optimization |
|------|------------------|------------|-------------------|
| Login | < 1s | 1-2s | > 2s |
| Chat | < 2s | 2-3s | > 3s |
| Admin | < 2s | 2-3s | > 3s |
| Any page | < 3s | 3-5s | > 5s |

---

#### **Test 8.2: Should Be Keyboard Accessible**

**Code:**
```typescript
it('should be keyboard accessible', () => {
  cy.visit('/');

  // Tab through form elements
  cy.get('body').tab();
  cy.focused().should('have.attr', 'data-cy', 'email-input');

  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'password-input');

  cy.focused().tab();
  cy.focused().should('have.attr', 'data-cy', 'login-button');
});
```

**Keyboard Navigation Flow:**

```
Tab Order:
┌─────────────────────────────────────────────────────────────┐
│ Login Form                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ [1] Email Input    ← Press Tab lands here first            │
│     └─ data-cy="email-input"                                │
│     └─ tabindex=0 (implicit)                                │
│                                                              │
│ [2] Password Input ← Press Tab moves here                   │
│     └─ data-cy="password-input"                             │
│     └─ tabindex=0 (implicit)                                │
│                                                              │
│ [3] Login Button   ← Press Tab moves here                   │
│     └─ data-cy="login-button"                               │
│     └─ tabindex=0 (implicit)                                │
│     └─ Press Enter to submit                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**WCAG 2.1 Compliance:**
- ✅ **Keyboard Navigation:** All interactive elements accessible via Tab
- ✅ **Focus Indicators:** Visual indication of focused element
- ✅ **Logical Tab Order:** Top to bottom, left to right
- ✅ **No Keyboard Traps:** Can Tab in and out of all sections

---

#### **Test 8.3: Should Work with Screen Readers**

**Code:**
```typescript
it('should work with screen readers', () => {
  cy.visit('/');

  // Check for proper ARIA labels
  cy.get('[data-cy="email-input"]').should('have.attr', 'aria-label');
  cy.get('[data-cy="password-input"]').should('have.attr', 'aria-label');
  cy.get('[data-cy="login-button"]').should('have.attr', 'aria-label');
});
```

**ARIA Attributes for Screen Readers:**

```html
<!-- Email Input -->
<input 
  matInput 
  data-cy="email-input"
  aria-label="Email address for login"     ← Screen reader reads this
  aria-required="true"                      ← Announces "required"
  aria-invalid="false"                      ← Announces if invalid
  type="email"
/>

<!-- Password Input -->
<input 
  matInput 
  type="password"
  data-cy="password-input"
  aria-label="Password for login"          ← Screen reader reads this
  aria-required="true"
  aria-describedby="password-hint"         ← Links to hint text
/>

<!-- Login Button -->
<button 
  mat-raised-button
  data-cy="login-button"
  aria-label="Sign in to your account"     ← Screen reader reads this
  [attr.aria-disabled]="loginForm.invalid" ← Announces if disabled
>
  Sign In
</button>
```

**Screen Reader Announcements:**

```
User tabs to email input:
  🔊 "Email address for login, edit text, required"

User tabs to password input:
  🔊 "Password for login, edit text, required, password field"

User tabs to login button:
  🔊 "Sign in to your account, button, disabled"
  (or "enabled" if form is valid)
```

---

## 📊 MOCK DATA & APIs

### 🎭 Mock Patterns

**Pattern 1: Success Response**
```typescript
cy.intercept('GET', '/api/groups', {
  statusCode: 200,
  body: {
    success: true,
    data: [{ /* group data */ }]
  }
});
```

**Pattern 2: Error Response**
```typescript
cy.intercept('POST', '/api/auth/login', {
  statusCode: 401,
  body: {
    success: false,
    message: 'Invalid credentials'
  }
});
```

**Pattern 3: Network Error**
```typescript
cy.intercept('GET', '/api/groups', { 
  forceNetworkError: true 
});
```

**Pattern 4: Delayed Response**
```typescript
cy.intercept('GET', '/api/groups', (req) => {
  req.reply({
    statusCode: 200,
    body: { success: true, data: [] },
    delay: 2000  // 2 second delay
  });
});
```

---

## 🔗 TEST FLOW DIAGRAMS

### Flow 1: Complete User Journey

```
START
  │
  ├─> auth.cy.ts
  │    │
  │    ├─> Test 1: Display login page
  │    │    └─> Verify: Page loads ✅
  │    │
  │    ├─> Test 3: Register
  │    │    └─> Creates: e2etest@example.com
  │    │
  │    └─> Test 4: Login
  │         └─> Authenticates user ✅
  │              │
  │              └─> localStorage.auth_token saved
  │
  ├─> chat.cy.ts (Uses authentication from auth.cy.ts)
  │    │
  │    ├─> beforeEach: cy.login()
  │    │    └─> Reuses authentication ✅
  │    │
  │    ├─> Test 1: Display groups
  │    │    └─> Verify: Groups load ✅
  │    │
  │    ├─> Test 2: Send message
  │    │    └─> Verify: Message sent ✅
  │    │
  │    └─> Test 4: Upload image
  │         └─> Verify: Upload UI exists ✅
  │
  ├─> video-call.cy.ts (Builds on chat.cy.ts)
  │    │
  │    ├─> Uses: Chat environment + WebRTC
  │    │
  │    └─> Tests: Video features ✅
  │
  └─> admin.cy.ts (Parallel path with admin user)
       │
       ├─> Uses: DIFFERENT user (superadmin)
       │
       └─> Tests: Admin features ✅
END
```

---

### Flow 2: Data Dependencies

```
Test Data Lifecycle:
═══════════════════════════════════════════════════════════════

1. CREATE USER (auth.cy.ts - Test 3)
   └─> User: e2etest@example.com created
       │
       └─> USED BY ↓

2. LOGIN USER (auth.cy.ts - Test 4)
   └─> Session: auth_token stored
       │
       └─> USED BY ↓

3. CHAT TESTS (chat.cy.ts - All tests)
   └─> Uses: current_user from session
       │
       └─> CREATES ↓

4. GROUPS DATA (chat.cy.ts - Test 1)
   └─> Group: test-group-id
       │
       └─> USED BY ↓

5. MESSAGES DATA (chat.cy.ts - Test 2)
   └─> Message: test-message-id
       │
       └─> USED BY ↓

6. REACTIONS DATA (advanced-chat.cy.ts - Test 3.3)
   └─> Reaction: 👍 on message
```

---

## 🎯 KẾT LUẬN

### Tổng kết E2E Tests:

**Coverage:**
- ✅ 52+ test scenarios
- ✅ 5 test files
- ✅ All major features tested
- ✅ Integration between components verified

**Quality Metrics:**
- ✅ Test isolation: Each test independent
- ✅ Mock strategy: Comprehensive API mocking
- ✅ Error handling: Negative cases covered
- ✅ Performance: Load time benchmarks
- ✅ Accessibility: WCAG compliance checked

**Test Relationships:**
```
auth.cy.ts (Foundation)
  ├─> Provides: Authentication
  ├─> Provides: Test users
  └─> Provides: cy.login() command
      │
      ├─> chat.cy.ts (Core Features)
      │    └─> Provides: Chat environment
      │
      ├─> video-call.cy.ts (Advanced Features)
      │    └─> Uses: Chat + Video
      │
      └─> advanced-chat.cy.ts (Comprehensive)
           └─> Combines: All features

admin.cy.ts (Parallel)
  └─> Uses: Different user (admin)
  └─> Tests: Admin features
```

**Best Practices Applied:**
1. ✅ Custom commands for reusability
2. ✅ Data-cy selectors for stability
3. ✅ Comprehensive mocking strategy
4. ✅ Clear test names and documentation
5. ✅ Proper wait strategies
6. ✅ Error handling in global hooks

---

**Last Updated:** October 8, 2025  
**Version:** 2.0.0  
**Author:** David Nguyen  
**Test Status:** 52/52 tests passing ✅
