# 📚 E2E TESTING - HƯỚNG DẪN CHI TIẾT

## 📖 MỤC LỤC

1. [Tổng quan E2E Testing](#1-tổng-quan-e2e-testing)
2. [Chi tiết từng Test File](#2-chi-tiết-từng-test-file)
3. [Kết nối giữa các Tests](#3-kết-nối-giữa-các-tests)
4. [Test Flow & Dependencies](#4-test-flow--dependencies)
5. [Dữ liệu Test & Mocking](#5-dữ-liệu-test--mocking)

---

## 1. TỔNG QUAN E2E TESTING

### 🎯 E2E Testing là gì?

**End-to-End (E2E) Testing** là phương pháp test mô phỏng hành vi người dùng thực tế từ đầu đến cuối một quy trình.

**Ví dụ thực tế:**
```
User muốn gửi tin nhắn:
1. Mở browser → Truy cập website
2. Đăng nhập với username/password
3. Click vào group chat
4. Gõ tin nhắn
5. Click Send
6. Xem tin nhắn hiển thị trong chat

→ E2E test sẽ TỰ ĐỘNG thực hiện toàn bộ quy trình này!
```

### 📊 Cấu trúc E2E Tests trong dự án

```
cypress/e2e/
├── auth.cy.ts              # 7 tests - Authentication flows
├── chat.cy.ts              # 6 tests - Chat functionality  
├── video-call.cy.ts        # 4 tests - Video call features
├── admin.cy.ts             # 5 tests - Admin panel
├── advanced-chat.cy.ts     # 30+ tests - Advanced features
└── spec.cy.ts              # General specs

Tổng: 52+ E2E test scenarios
```

---

## 2. CHI TIẾT TỪNG TEST FILE

### 📝 2.1. AUTH.CY.TS - Authentication Tests (7 tests)

**MỤC ĐÍCH:** Test toàn bộ luồng đăng nhập, đăng ký, validation

#### **Test 1: Display Login Page**
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

**Chi tiết test:**
- ✅ **Test gì:** Kiểm tra trang login hiển thị đúng
- ✅ **Input:** User truy cập trang chủ `/`
- ✅ **Expected:** 
  - Redirect về `/login`
  - Form login hiển thị
  - Email input hiển thị
  - Password input hiển thị
  - Login button hiển thị
- ✅ **Kết nối:** Đây là test BASE, tất cả test khác cần login đều dựa vào page này

---

#### **Test 2: Navigate to Register**
```typescript
it('should navigate to register page', () => {
  cy.get('[data-cy="register-link"]').click();
  cy.url().should('include', '/register');
  cy.get('[data-cy="register-form"]').should('be.visible');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Link "Sign up" redirect đúng sang trang register
- ✅ **Input:** Click link "Sign up here"
- ✅ **Expected:**
  - URL chuyển sang `/register`
  - Form register hiển thị
- ✅ **Kết nối với Test 3:** Test này verify navigation, Test 3 sẽ test register functionality

---

#### **Test 3: Register New User Successfully** 🔗
```typescript
it('should register a new user successfully', () => {
  cy.visit('/register');

  // Mock register API
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

**Chi tiết test:**
- ✅ **Test gì:** Đăng ký user mới thành công
- ✅ **Input:**
  - Username: `e2etestuser`
  - Email: `e2etest@example.com`
  - Password: `password123`
  - Confirm Password: `password123`
- ✅ **Mock API:** 
  ```
  POST /api/auth/register
  Response: { success: true, data: { user, tokens } }
  ```
- ✅ **Expected:**
  - API được gọi với data đúng
  - Redirect về `/login`
  - Success message hiển thị
- ✅ **Kết nối với Test 4:** User vừa register → Test 4 sẽ login với user này

---

#### **Test 4: Login with Valid Credentials** 🔗
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

**Chi tiết test:**
- ✅ **Test gì:** Login với credentials hợp lệ
- ✅ **Input:**
  - Email: `e2etest@example.com` (từ Test 3)
  - Password: `password123`
- ✅ **Mock API:**
  ```
  POST /api/auth/login
  Response: { success: true, data: { user, tokens } }
  ```
- ✅ **Expected:**
  - Redirect về `/home`
  - User menu hiển thị (đã login)
- ✅ **Kết nối:**
  - ⬅️ Nhận credentials từ Test 3
  - ➡️ Login state này được dùng cho Test 5, 6, 7 và TẤT CẢ tests khác

---

#### **Test 5: Show Error for Invalid Credentials**
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

**Chi tiết test:**
- ✅ **Test gì:** Error handling khi login sai
- ✅ **Input:**
  - Email: `invalid@example.com`
  - Password: `wrongpassword`
- ✅ **Mock API:**
  ```
  POST /api/auth/login
  Response: { success: false, message: 'Invalid credentials' }
  ```
- ✅ **Expected:**
  - Error message hiển thị
  - Message text = "Invalid credentials"
- ✅ **Kết nối:** Independent test, không ảnh hưởng tests khác

---

#### **Test 6: Validate Required Fields**
```typescript
it('should validate required fields', () => {
  cy.get('[data-cy="email-input"]').should('have.attr', 'required');
  cy.get('[data-cy="password-input"]').should('have.attr', 'required');
  cy.get('[data-cy="login-button"]').should('be.disabled');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Form validation - required fields
- ✅ **Input:** Không nhập gì
- ✅ **Expected:**
  - Email input có attribute `required`
  - Password input có attribute `required`
  - Login button bị disable
- ✅ **Kết nối:** Independent, test UI validation

---

#### **Test 7: Validate Email Format**
```typescript
it('should enable login button with any valid username', () => {
  cy.get('[data-cy="email-input"]').type('testuser'); // Not email, but valid
  cy.get('[data-cy="password-input"]').type('password123');
  cy.get('[data-cy="login-button"]').should('not.be.disabled');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Username field chấp nhận bất kỳ text nào (không bắt buộc email format)
- ✅ **Input:**
  - Username: `testuser` (không phải email)
  - Password: `password123`
- ✅ **Expected:**
  - Button enabled (form valid)
- ✅ **Kết nối:** Test behavior sau khi fix validation

---

### 💬 2.2. CHAT.CY.TS - Chat Functionality (6 tests)

**MỤC ĐÍCH:** Test tính năng chat: groups, channels, messages

#### **Setup - beforeEach() hook**
```typescript
beforeEach(() => {
  // 1. Mock Socket.io
  cy.intercept('GET', '**/socket.io/**', { statusCode: 200, body: '0' });
  cy.intercept('POST', '**/socket.io/**', { statusCode: 200, body: 'ok' });
  
  // 2. Mock logout API
  cy.intercept('POST', '**/api/auth/logout*', { statusCode: 200, ... });
  
  // 3. Mock group requests API (prevent logout loop!)
  cy.intercept('GET', '**/api/group-requests*', { statusCode: 200, data: [] });
  
  // 4. LOGIN (sử dụng custom command)
  cy.login('e2etest@example.com', 'password123');
  
  // 5. Mock groups, channels, messages APIs
  cy.intercept('GET', '**/api/groups*', { statusCode: 200, data: [...] });
  cy.intercept('GET', '**/api/channels/group/*', { statusCode: 200, data: [...] });
  cy.intercept('GET', '**/api/messages/channel/*', { statusCode: 200, data: [] });
  
  // 6. Navigate to chat page
  cy.visit('/chat');
  cy.wait(2000);
});
```

**⚠️ QUAN TRỌNG:**
- Tất cả tests trong chat.cy.ts đều chạy `beforeEach()` trước
- User đã LOGIN sẵn
- Tất cả API đã được MOCK để prevent errors

**Kết nối với auth.cy.ts:**
```
auth.cy.ts (Test 4) 
  ↓ Tạo user và login
  ↓
cy.login() command
  ↓ Reuse login logic
  ↓
chat.cy.ts beforeEach()
  ↓ User đã authenticated
  ↓
Chat tests có thể chạy
```

---

#### **Test 1: Display Groups and Channels** 🔗
```typescript
it('should display groups and channels', () => {
  cy.get('[data-cy="groups-list"]', { timeout: 15000 }).should('exist');
  cy.get('[data-cy="group-item"]').should('have.length.greaterThan', 0);
  cy.get('[data-cy="group-item"]').first().should('contain', 'Test Group');
  
  cy.get('[data-cy="group-item"]').first().click();
  cy.get('[data-cy="message-input"]').should('be.visible');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Groups list hiển thị đúng
- ✅ **Input:** User đã login (từ beforeEach)
- ✅ **Mock data:**
  ```json
  {
    "success": true,
    "data": [{
      "_id": "test-group-id",
      "name": "Test Group",
      "members": ["test-user-id"]
    }]
  }
  ```
- ✅ **Expected:**
  - Groups list hiển thị
  - Có ít nhất 1 group
  - Group đầu tiên có text "Test Group"
  - Click group → Message input hiển thị
- ✅ **Kết nối với Test 2:** Test này verify UI, Test 2 sẽ test send message

---

#### **Test 2: Send Text Message** 🔗
```typescript
it('should send a text message', () => {
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);

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

  cy.get('[data-cy="message-input"]').as('messageInput');
  cy.get('@messageInput').type('Hello from E2E test!', { delay: 50 });
  cy.get('[data-cy="send-button"]').click();

  cy.wait('@sendMessage');
  cy.get('[data-cy="message-input"]').should('have.value', '');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Gửi tin nhắn text
- ✅ **Input:**
  - User click group (từ Test 1)
  - Type message: "Hello from E2E test!"
  - Click Send
- ✅ **Mock API:**
  ```
  POST /api/messages
  Response: { success: true, data: { message } }
  ```
- ✅ **Expected:**
  - API được gọi với text đúng
  - Input field được clear sau khi gửi
- ✅ **Kết nối:**
  - ⬅️ Dựa vào Test 1 (groups đã load)
  - ➡️ Message flow này được dùng cho Test 3, 4, 5

---

#### **Test 3: Show Typing Indicator**
```typescript
it('should show typing indicator', () => {
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);
  
  cy.get('[data-cy="message-input"]').as('messageInput');
  cy.get('@messageInput').type('typing...', { delay: 50 });
  cy.get('@messageInput').should('have.value', 'typing...');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Typing indicator (simplified version)
- ✅ **Input:** User gõ text
- ✅ **Expected:** Input value cập nhật real-time
- ✅ **Note:** Full typing indicator cần Socket.io events

---

#### **Test 4: Upload and Send Image**
```typescript
it('should upload and send an image', () => {
  cy.get('[data-cy="group-item"]').first().click();
  cy.wait(1000);

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

  cy.intercept('POST', '**/api/messages*', {
    statusCode: 200,
    body: {
      success: true,
      data: {
        _id: 'test-image-message-id',
        type: 'image',
        imageUrl: '/uploads/images/test-image.jpg',
        userId: 'test-user-id',
        username: 'e2etestuser',
        channelId: 'test-channel-id',
        createdAt: new Date().toISOString()
      }
    }
  }).as('sendImageMessage');

  cy.get('[data-cy="image-upload-button"]').should('exist');
  cy.get('[data-cy="file-input"]').should('exist');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Upload image functionality
- ✅ **Input:** Click upload button
- ✅ **Mock APIs:**
  ```
  1. POST /api/upload/image → Return imageUrl
  2. POST /api/messages → Send message với imageUrl
  ```
- ✅ **Expected:** UI elements tồn tại
- ✅ **Note:** Actual file upload cần file system access

---

#### **Test 5: Create New Group**
```typescript
it('should create a new group', () => {
  cy.get('[data-cy="create-group-button"]').should('exist');
  cy.get('[data-cy="create-group-button"]').click();
  
  cy.url().should('include', '/groups');
  cy.wait(1000);
  cy.get('body').should('contain', 'Groups');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Navigate to create group page
- ✅ **Input:** Click "Create Group" button
- ✅ **Expected:**
  - Redirect to `/groups`
  - Page content chứa "Groups"
- ✅ **Kết nối với admin.cy.ts:** Admin tests sẽ test full group creation

---

### 📹 2.3. VIDEO-CALL.CY.TS - Video Call Features (4 tests)

**MỤC ĐÍCH:** Test video call functionality

#### **Setup - beforeEach() hook**
```typescript
beforeEach(() => {
  // Similar to chat.cy.ts
  // + Mock video call APIs
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

#### **Test 1: Initiate Video Call**
```typescript
it('should initiate video call', () => {
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

**Chi tiết test:**
- ✅ **Test gì:** Video call button tồn tại
- ✅ **Mock:** `getUserMedia` API (WebRTC)
- ✅ **Expected:** Button component rendered
- ✅ **Note:** Full WebRTC testing rất phức tạp, test này chỉ verify UI

#### **Tests 2, 3, 4:** End Call, Toggle Microphone, Toggle Camera
- Tương tự Test 1
- Verify UI components exist
- Full WebRTC functionality cần complex mocking

---

### 👨‍💼 2.4. ADMIN.CY.TS - Admin Panel Tests (5 tests)

**MỤC ĐÍCH:** Test admin functionality với proper permissions

#### **Setup - beforeEach() hook**
```typescript
beforeEach(() => {
  // CRITICAL: Login với ADMIN account
  cy.login('superadmin', 'password123'); // ← Not regular user!
  
  // Mock admin APIs
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
});
```

**⚠️ KHÁC BIỆT:** 
- Chat tests: Login với `e2etest@example.com` (user role)
- Admin tests: Login với `superadmin` (super_admin role)

---

#### **Test 1: Display Admin Dashboard** 🔗
```typescript
it('should display admin dashboard', () => {
  setupValidUserSession(); // Set localStorage với admin user
  
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

**Chi tiết test:**
- ✅ **Test gì:** Admin dashboard load đúng với admin permissions
- ✅ **Input:** Admin user login và access `/admin`
- ✅ **Mock data:** Dashboard statistics
- ✅ **Expected:**
  - URL = `/admin`
  - Dashboard hiển thị
  - Stats cards hiển thị (total users, groups, etc)
- ✅ **Kết nối:** Base test cho admin features

---

#### **Test 2: Manage Users**
```typescript
it('should manage users', () => {
  setupValidUserSession();
  cy.visit('/login');
  cy.wait(1000);
  cy.visit('/admin');
  cy.wait(2000);
  
  cy.get('.mdc-tab').contains('User Activity').scrollIntoView().click();
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
  
  cy.get('[data-cy="user-row"]').should('contain', 'newuser');
});
```

**Chi tiết test:**
- ✅ **Test gì:** Admin tạo user mới
- ✅ **Input:**
  - Click "User Activity" tab
  - Click "Create User"
  - Fill form: username, email, password
  - Submit
- ✅ **Mock API:**
  ```
  POST /api/users
  Response: { success: true, data: { new user } }
  ```
- ✅ **Expected:**
  - Users table hiển thị
  - New user xuất hiện trong table
- ✅ **Kết nối:**
  - ⬅️ Dựa vào Test 1 (dashboard loaded)
  - ➡️ User mới này có thể dùng cho auth tests

---

#### **Tests 3, 4, 5:** Manage Groups, View Statistics, Handle Permissions
- Similar pattern
- Test CRUD operations
- Verify admin-only access
- Test Material UI tabs navigation

---

### 🚀 2.5. ADVANCED-CHAT.CY.TS - Advanced Features (30+ tests)

**MỤC ĐÍCH:** Comprehensive testing của TẤT CẢ features

**Cấu trúc:**
```typescript
describe('Advanced Chat System E2E Tests', () => {
  
  describe('User Authentication Flow', () => {
    it('should complete full registration and login flow', () => { ... });
    it('should handle login errors gracefully', () => { ... });
  });
  
  describe('Group Management', () => {
    it('should create and manage groups', () => { ... });
    it('should join and leave groups', () => { ... });
  });
  
  describe('Channel and Messaging', () => {
    it('should create channels and send messages', () => { ... });
    it('should handle file uploads', () => { ... });
    it('should handle message reactions', () => { ... });
  });
  
  describe('Real-time Features', () => {
    it('should show typing indicators', () => { ... });
    it('should show online/offline status', () => { ... });
  });
  
  describe('Video Call Integration', () => {
    it('should initiate video calls', () => { ... });
    it('should handle call controls', () => { ... });
  });
  
  describe('Admin Features', () => {
    it('should access admin dashboard', () => { ... });
    it('should manage users', () => { ... });
  });
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle network errors gracefully', () => { ... });
    it('should handle invalid URLs', () => { ... });
    it('should handle browser back/forward navigation', () => { ... });
  });
  
  describe('Performance and Accessibility', () => {
    it('should load pages quickly', () => { ... });
    it('should be keyboard accessible', () => { ... });
    it('should work with screen readers', () => { ... });
  });
});
```

**Đặc điểm:**
- ✅ Most comprehensive test file
- ✅ Covers ALL features
- ✅ Tests integration between features
- ✅ Tests edge cases và error handling
- ✅ Tests performance và accessibility

---

## 3. KẾT NỐI GIỮA CÁC TESTS

### 🔗 3.1. Dependency Chain

```
auth.cy.ts
  │
  ├─ Test 3: Register user
  │    └─> Creates: e2etest@example.com / password123
  │
  ├─ Test 4: Login user
  │    └─> Authenticates: e2etest@example.com
  │         │
  │         ├─> cy.login() custom command
  │         │    │
  │         │    ├─> chat.cy.ts (all tests)
  │         │    │    └─> Uses authenticated user
  │         │    │
  │         │    ├─> video-call.cy.ts (all tests)
  │         │    │    └─> Uses authenticated user
  │         │    │
  │         │    └─> advanced-chat.cy.ts (all tests)
  │                  └─> Uses authenticated user
  │
  └─ admin.cy.ts
       └─> Uses DIFFERENT user: superadmin
           └─> Has admin permissions
```

### 🔗 3.2. Custom Commands (Reusable)

#### **cy.login() - Core Authentication**
```typescript
// Defined in: cypress/support/commands.ts

Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    // 1. Create valid JWT token
    const token = createMockJWT(userId, roles);
    
    // 2. Mock login API
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, data: { user, tokens } }
    }).as('loginRequest');
    
    // 3. Visit login page
    cy.visit('/login');
    
    // 4. Fill form
    cy.get('[data-cy="email-input"]').type(username);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    
    // 5. Wait for login
    cy.wait('@loginRequest');
    cy.url().should('not.include', '/login');
    
    // 6. Verify localStorage
    cy.window().then((win) => {
      const authToken = win.localStorage.getItem('auth_token');
      const currentUser = win.localStorage.getItem('current_user');
      if (!authToken || !currentUser) {
        throw new Error('Login failed');
      }
    });
  });
});
```

**Sử dụng:**
```typescript
// Test file bất kỳ
beforeEach(() => {
  cy.login('e2etest@example.com', 'password123');
});
```

**Lợi ích:**
- ✅ Reuse login logic
- ✅ Session management tự động
- ✅ Không cần repeat code
- ✅ Easy to maintain

---

#### **cy.interceptAPI() - Mock API Helper**
```typescript
Cypress.Commands.add('interceptAPI', (method, url, response) => {
  cy.intercept(method, url, response).as(`${method}_${url.replace(/\//g, '_')}`);
});
```

**Sử dụng:**
```typescript
cy.interceptAPI('GET', '/api/groups', { success: true, data: [] });
cy.wait('@GET_api_groups');
```

---

### 🔗 3.3. Test Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Test Data Lifecycle                    │
└─────────────────────────────────────────────────────────┘

1. Register (auth.cy.ts - Test 3)
   ↓ Creates user: e2etest@example.com
   
2. Login (auth.cy.ts - Test 4)
   ↓ Stores in: localStorage.current_user
   
3. Session (cy.login command)
   ↓ Reuses: localStorage.current_user
   
4. Chat Tests (chat.cy.ts)
   ↓ Uses: current_user.id for messages
   
5. Video Call Tests (video-call.cy.ts)
   ↓ Uses: current_user.id for calls
   
6. Admin Tests (admin.cy.ts)
   ↓ Uses: DIFFERENT user (superadmin)
```

---

## 4. TEST FLOW & DEPENDENCIES

### 📊 4.1. Complete User Journey

```
START
  │
  ├─> 1. Visit website (auth.cy.ts - Test 1)
  │    └─> Verify: Login page loads
  │
  ├─> 2. Register account (auth.cy.ts - Test 3)
  │    ├─> Input: username, email, password
  │    ├─> API: POST /api/auth/register
  │    └─> Verify: Success message, redirect to login
  │
  ├─> 3. Login (auth.cy.ts - Test 4)
  │    ├─> Input: email, password
  │    ├─> API: POST /api/auth/login
  │    ├─> Store: localStorage.auth_token
  │    └─> Verify: Redirect to /home
  │
  ├─> 4. View groups (chat.cy.ts - Test 1)
  │    ├─> API: GET /api/groups
  │    └─> Verify: Groups list displayed
  │
  ├─> 5. Select group (chat.cy.ts - Test 1)
  │    ├─> Action: Click group item
  │    ├─> API: GET /api/channels/group/:id
  │    ├─> API: GET /api/messages/channel/:id
  │    └─> Verify: Chat interface loaded
  │
  ├─> 6. Send message (chat.cy.ts - Test 2)
  │    ├─> Input: "Hello!"
  │    ├─> Action: Click send
  │    ├─> API: POST /api/messages
  │    ├─> Socket: message:new event
  │    └─> Verify: Message displayed, input cleared
  │
  ├─> 7. Upload image (chat.cy.ts - Test 4)
  │    ├─> Action: Select file
  │    ├─> API: POST /api/upload/image
  │    ├─> API: POST /api/messages
  │    └─> Verify: Image message displayed
  │
  ├─> 8. Start video call (video-call.cy.ts - Test 1)
  │    ├─> Action: Click video call button
  │    ├─> API: POST /api/video-calls
  │    ├─> WebRTC: getUserMedia
  │    ├─> Socket: call:start event
  │    └─> Verify: Call interface displayed
  │
  └─> 9. Admin actions (admin.cy.ts - Tests 1-5)
       ├─> Login as admin
       ├─> Access: /admin
       ├─> API: GET /api/admin/dashboard
       ├─> View: Users, Groups, Stats
       └─> Verify: Admin permissions working
END
```

### 📊 4.2. Independent vs Dependent Tests

**Independent Tests (Có thể chạy riêng):**
```
✅ auth.cy.ts - Test 1: Display login page
✅ auth.cy.ts - Test 5: Show error for invalid credentials
✅ auth.cy.ts - Test 6: Validate required fields
✅ auth.cy.ts - Test 7: Validate email format
```

**Dependent Tests (Cần tests trước chạy thành công):**
```
⚠️ auth.cy.ts - Test 4: Login
   └─ Needs: User từ Test 3 (hoặc mock data)

⚠️ chat.cy.ts - ALL tests
   └─ Needs: Login từ cy.login() command

⚠️ chat.cy.ts - Test 2: Send message
   └─ Needs: Group selected (Test 1)

⚠️ video-call.cy.ts - ALL tests
   └─ Needs: Login + Group selected

⚠️ admin.cy.ts - Tests 2-5
   └─ Needs: Dashboard loaded (Test 1)
```

---

## 5. DỮ LIỆU TEST & MOCKING

### 🎭 5.1. Mock Strategy

**Tại sao Mock API?**
```
Without Mocking:
  Test → Real Backend → Real Database
  └─> Slow, unpredictable, can fail due to network

With Mocking:
  Test → Mock Response
  └─> Fast, predictable, isolated
```

**Ví dụ Mock:**
```typescript
// Mock login API
cy.intercept('POST', '/api/auth/login', {
  statusCode: 200,
  body: {
    success: true,
    data: {
      user: {
        _id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      },
      accessToken: 'mock-token-123',
      refreshToken: 'mock-refresh-456'
    }
  }
}).as('loginRequest');

// Sau đó có thể wait
cy.wait('@loginRequest');
```

---

### 🎭 5.2. Test Data

**Standard Test Users:**
```typescript
// Regular User
{
  username: 'e2etestuser',
  email: 'e2etest@example.com',
  password: 'password123',
  roles: ['user']
}

// Admin User
{
  username: 'superadmin',
  email: 'superadmin@chat-system.com',
  password: 'password123',
  roles: ['super_admin', 'group_admin', 'user']
}
```

**Standard Test Groups:**
```typescript
{
  _id: 'test-group-id',
  name: 'Test Group',
  description: 'A test group for E2E testing',
  members: ['test-user-id'],
  memberCount: 1,
  isPrivate: false
}
```

**Standard Test Messages:**
```typescript
{
  _id: 'test-message-id',
  text: 'Hello from E2E test!',
  userId: 'test-user-id',
  username: 'e2etestuser',
  channelId: 'test-channel-id',
  type: 'text',
  createdAt: new Date().toISOString()
}
```

---

## 📚 TÓM TẮT

### ✅ Các điểm chính:

1. **auth.cy.ts** = Foundation
   - Tạo user, login, validation
   - Cung cấp authenticated state cho tests khác

2. **chat.cy.ts** = Core Features
   - Groups, channels, messages
   - Dựa vào auth tests

3. **video-call.cy.ts** = Advanced Features
   - Video calls, WebRTC
   - Dựa vào chat tests

4. **admin.cy.ts** = Admin Features
   - Admin dashboard, user management
   - Sử dụng admin user riêng

5. **advanced-chat.cy.ts** = Comprehensive
   - Tất cả features combined
   - Edge cases, performance, accessibility

### 🔗 Kết nối:

```
auth → chat → video-call → advanced
  ↓
admin (parallel, independent)
```

### 🎯 Best Practices:

1. ✅ Use `cy.login()` custom command
2. ✅ Mock all API calls
3. ✅ Use `data-cy` attributes
4. ✅ Wait for API responses
5. ✅ Keep tests independent when possible
6. ✅ Document dependencies clearly

---

**Last Updated:** October 8, 2025  
**Version:** 1.0.0  
**Author:** David Nguyen
