# 📜 NPM SCRIPTS - GIẢI THÍCH CHI TIẾT TỪNG DÒNG

## 📖 MỤC LỤC

1. [Backend Scripts](#backend-scripts---26-scripts)
2. [Frontend Scripts](#frontend-scripts---22-scripts)
3. [Script Combinations](#script-combinations)
4. [Use Cases & Examples](#use-cases--examples)

---

## 🔧 BACKEND SCRIPTS - 26 Scripts

**File:** `Backend_system/package.json`  
**Location:** Lines 6-32

---

### 🏗️ BUILD & START SCRIPTS

#### **1. `"build": "tsc"`**

**Mục đích:** Compile TypeScript thành JavaScript

**Chi tiết:**
```bash
npm run build
```

**Bước thực thi:**
```
1. Chạy command: tsc (TypeScript Compiler)
   ↓
2. Đọc config từ: tsconfig.json
   ↓
3. Compile tất cả .ts files trong src/
   ↓
4. Output JavaScript files vào: dist/
   ↓
5. Tạo .d.ts declaration files
   ↓
6. Tạo source maps (.js.map)
```

**Input → Output:**
```
src/
├── server.ts           → dist/server.js
├── app.ts             → dist/app.js
├── models/
│   └── user.model.ts  → dist/models/user.model.js
└── controllers/
    └── auth.ts        → dist/controllers/auth.js
```

**Khi nào dùng:**
- ✅ Trước khi deploy production
- ✅ Sau khi thay đổi TypeScript code
- ✅ Để verify code không có lỗi compile

**Note:** 
- Chạy `prebuild` tự động trước khi build
- Production-ready code trong `dist/`

---

#### **2. `"start": "node dist/server.js"`**

**Mục đích:** Chạy production server (compiled JavaScript)

**Chi tiết:**
```bash
npm start
```

**Bước thực thi:**
```
1. Node.js chạy file: dist/server.js
   ↓
2. Load compiled JavaScript code
   ↓
3. Connect to MongoDB
   ↓
4. Initialize Express app
   ↓
5. Setup Socket.io
   ↓
6. Start listening on port 3000
   ↓
7. Server ready: http://localhost:3000
```

**Requirements:**
- ⚠️ Phải chạy `npm run build` trước
- ⚠️ File `dist/server.js` phải tồn tại
- ⚠️ MongoDB phải đang chạy
- ⚠️ File `.env` phải có đủ config

**Khi nào dùng:**
- ✅ Production environment
- ✅ Staging server
- ✅ Testing production build locally

**So sánh:**
```
npm run dev   → Chạy TypeScript directly (development)
npm start     → Chạy compiled JavaScript (production)
```

---

#### **3. `"dev": "nodemon src/server.ts"`**

**Mục đích:** Development server với hot reload

**Chi tiết:**
```bash
npm run dev
```

**Bước thực thi:**
```
1. Nodemon starts watching: src/**/*.ts
   ↓
2. Chạy: ts-node src/server.ts
   ↓
3. Server starts on port 3000
   ↓
4. Watch for file changes
   ↓
5. Khi file thay đổi:
   - Kill current process
   - Restart server automatically
   ↓
6. Developer sees: "Server restarted"
```

**Nodemon Config (implicit):**
```javascript
{
  watch: ['src'],        // Watch src folder
  ext: 'ts,js,json',    // Watch .ts, .js, .json files
  ignore: ['src/**/*.spec.ts', 'node_modules'],
  exec: 'ts-node src/server.ts'
}
```

**Workflow:**
```
Developer workflow:
1. npm run dev
   ↓ Server starts
2. Edit file: src/controllers/user.controller.ts
   ↓ Save file (Ctrl+S)
3. Nodemon detects change
   ↓ Restart server automatically
4. Test changes immediately in browser/Postman
   ↓ No manual restart needed! ✅
```

**Console Output:**
```
[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): src/**/*
[nodemon] watching extensions: ts
[nodemon] starting `ts-node src/server.ts`
Server is running on port 3000
MongoDB connected successfully
[nodemon] restarting due to changes...
[nodemon] starting `ts-node src/server.ts`
Server is running on port 3000
```

**Khi nào dùng:**
- ✅ Development (hàng ngày)
- ✅ Debugging
- ✅ Testing features locally

---

#### **4. `"dev:watch": "nodemon --watch src --ext ts --exec ts-node src/server.ts"`**

**Mục đích:** Development với explicit watch config

**Chi tiết:**
```bash
npm run dev:watch
```

**Flags giải thích:**

| Flag | Ý nghĩa | Giá trị | Giải thích |
|------|---------|---------|------------|
| `--watch` | Folder để watch | `src` | Chỉ watch thư mục src |
| `--ext` | File extensions | `ts` | Chỉ watch .ts files |
| `--exec` | Command to execute | `ts-node src/server.ts` | Chạy TypeScript directly |

**So sánh với `dev`:**

| Script | Config | Use Case |
|--------|--------|----------|
| `dev` | Implicit (nodemon.json) | Standard development |
| `dev:watch` | Explicit (command flags) | Custom watch behavior |

**Khi nào dùng:**
- ✅ Khi cần watch specific folders
- ✅ Khi cần custom behavior
- ⚠️ Thường dùng `dev` là đủ

---

#### **5. `"peerjs": "node peerjs-server.js"`**

**Mục đích:** Chạy PeerJS server cho video calls

**Chi tiết:**
```bash
npm run peerjs
```

**PeerJS Server:**
```javascript
// File: peerjs-server.js
const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9000,
  path: '/myapp',
  allow_discovery: true
});

console.log('PeerJS Server running on port 9000');
```

**Bước thực thi:**
```
1. Node.js chạy: peerjs-server.js
   ↓
2. PeerServer starts on port 9000
   ↓
3. WebRTC signaling server ready
   ↓
4. Frontend có thể connect: 
   peer = new Peer('user-id', {
     host: 'localhost',
     port: 9000,
     path: '/myapp'
   });
```

**Port Usage:**
```
Port 3000: Express API Server
Port 9000: PeerJS WebRTC Server  ← This script
```

**Khi nào dùng:**
- ✅ Khi test video call features
- ✅ Development environment
- ✅ Cùng với `npm run dev`

---

#### **6. `"dev:all": "concurrently \"npm run dev\" \"npm run peerjs\""`**

**Mục đích:** Chạy ĐỒng thời Express server + PeerJS server

**Chi tiết:**
```bash
npm run dev:all
```

**Concurrently package:**
```
Chạy nhiều commands song song:
┌──────────────────────────────────────┐
│ Terminal 1: npm run dev              │
│ → Express server on port 3000        │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Terminal 2: npm run peerjs           │
│ → PeerJS server on port 9000         │
└──────────────────────────────────────┘

Both running in ONE terminal window!
```

**Console Output:**
```
[0] [nodemon] starting `ts-node src/server.ts`
[0] Server is running on port 3000
[1] PeerJS Server running on port 9000
[0] MongoDB connected successfully
```

**Color Coding:**
- `[0]` = Express server (màu xanh)
- `[1]` = PeerJS server (màu đỏ)

**Khi nào dùng:**
- ✅ **RECOMMENDED** cho full-stack development
- ✅ Khi test video calls
- ✅ Thay vì mở 2 terminals riêng

---

### 🧹 UTILITY SCRIPTS

#### **7. `"clean": "rimraf dist"`**

**Mục đích:** Xóa thư mục dist/

**Chi tiết:**
```bash
npm run clean
```

**Rimraf package:**
```
Similar to: rm -rf dist (Unix)
         or: rmdir /s /q dist (Windows)

But works cross-platform! ✅
```

**Bước thực thi:**
```
1. rimraf tìm folder: dist/
   ↓
2. Xóa recursively tất cả files và subfolders
   ↓
3. Xóa folder dist/ itself
   ↓
4. Result: dist/ không còn tồn tại
```

**Khi nào dùng:**
- ✅ Trước khi build mới (clean build)
- ✅ Khi có lỗi compiled files
- ✅ Để giải phóng disk space

**Auto-run:** 
- Script `prebuild` tự động chạy `clean` trước mỗi build

---

#### **8. `"prebuild": "npm run clean"`**

**Mục đích:** Pre-hook chạy tự động trước `build`

**Chi tiết:**
```bash
# Bạn chạy:
npm run build

# NPM tự động chạy:
npm run prebuild  (first)
  ↓ npm run clean
  ↓ Delete dist/
  ↓
npm run build     (then)
  ↓ tsc
  ↓ Compile fresh
```

**NPM Lifecycle Hooks:**
```
pre<script>  → Chạy TRƯỚC script
<script>     → Script chính
post<script> → Chạy SAU script

Example:
prebuild  → BEFORE build
build     → Main build script
postbuild → AFTER build (not defined in project)
```

**Tại sao cần:**
- ✅ Đảm bảo clean build
- ✅ Tránh compiled files cũ
- ✅ Prevent cache issues

---

#### **9. `"type-check": "tsc --noEmit"`**

**Mục đích:** Kiểm tra TypeScript errors KHÔNG compile

**Chi tiết:**
```bash
npm run type-check
```

**Flags:**

| Flag | Ý nghĩa | Kết quả |
|------|---------|---------|
| `--noEmit` | Don't output files | Chỉ check errors, không tạo files |

**Bước thực thi:**
```
1. TypeScript compiler checks all files
   ↓
2. Analyze types, interfaces, syntax
   ↓
3. Report errors if any
   ↓
4. DON'T create dist/ folder
   ↓
5. Exit with code 0 (success) or 1 (errors)
```

**Example Output (có lỗi):**
```
src/controllers/user.controller.ts:45:10
Error: Type 'string' is not assignable to type 'number'.

45   const age: number = "25";
           ~~~

Found 1 error.
```

**Example Output (không có lỗi):**
```
(No output - silent success)
Exit code: 0
```

**Khi nào dùng:**
- ✅ Trong CI/CD pipeline
- ✅ Trước khi commit code
- ✅ Quick check không cần compile
- ✅ Faster than full build

**So sánh:**
```
npm run type-check  → 5 seconds  (only check types)
npm run build       → 15 seconds (check + compile + output)
```

---

### 🧪 TESTING SCRIPTS

#### **10. `"test": "jest"`**

**Mục đích:** Chạy TẤT CẢ tests

**Chi tiết:**
```bash
npm test
# hoặc
npm run test
```

**Bước thực thi:**
```
1. Jest tìm tất cả test files:
   - **/*.test.ts
   - **/*.spec.ts
   - **/__tests__/**/*.ts
   ↓
2. Load jest.config.js
   ↓
3. Setup test environment
   ↓
4. Run tests in parallel (default)
   ↓
5. Collect results
   ↓
6. Display summary
```

**Jest Config (jest.config.js):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

**Output Example:**
```
PASS  src/__tests__/routes/auth.test.ts (5.234 s)
PASS  src/__tests__/routes/users.test.ts (4.891 s)
PASS  src/__tests__/routes/groups.test.ts (3.256 s)
PASS  src/__tests__/routes/channels.test.ts (6.123 s)
PASS  src/__tests__/routes/messages.test.ts (4.567 s)
PASS  src/__tests__/routes/admin.test.ts (5.789 s)
PASS  src/__tests__/routes/video-call.test.ts (3.456 s)
PASS  src/__tests__/routes/client.test.ts (4.234 s)

Test Suites: 8 passed, 8 total
Tests:       144 passed, 144 total
Snapshots:   0 total
Time:        10.234 s
Ran all test suites.
```

**Coverage Output:**
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   86.5  |   82.3   |   89.1  |   86.2  |
 controllers          |   92.1  |   87.5   |   95.3  |   91.8  |
  auth.controller.ts  |   95.2  |   90.1   |   97.5  |   94.9  |
  user.controller.ts  |   89.3  |   84.2   |   93.1  |   88.7  |
 services             |   88.7  |   85.1   |   90.4  |   88.3  |
  auth.service.ts     |   91.5  |   88.3   |   93.2  |   91.1  |
 routes               |   78.9  |   72.5   |   81.2  |   78.5  |
----------------------|---------|----------|---------|---------|
```

**Khi nào dùng:**
- ✅ Trước khi commit code
- ✅ Trong CI/CD pipeline
- ✅ Sau khi fix bugs
- ✅ Regular testing

---

#### **11. `"test:watch": "jest --watch"`**

**Mục đích:** Chạy tests và watch for changes

**Chi tiết:**
```bash
npm run test:watch
```

**Interactive Mode:**
```
Watch Usage
 › Press a to run all tests.
 › Press f to run only failed tests.
 › Press p to filter by a filename regex pattern.
 › Press t to filter by a test name regex pattern.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.
```

**Workflow:**
```
1. Developer chạy: npm run test:watch
   ↓
2. Jest runs all tests
   ↓
3. Display results
   ↓
4. Enter watch mode
   ↓
5. Developer edits: src/services/user.service.ts
   ↓
6. Jest detects change
   ↓
7. Re-run ONLY affected tests:
   - src/__tests__/services/user.service.test.ts
   ↓
8. Display updated results
   ↓
9. Continue watching...
```

**Smart Re-run:**
```
Edit file: src/services/user.service.ts
  ↓
Jest re-runs:
  ✅ user.service.test.ts (directly tests this file)
  ✅ user.controller.test.ts (imports this service)
  ❌ auth.test.ts (not affected)
  
Only runs affected tests! Fast! ⚡
```

**Khi nào dùng:**
- ✅ **RECOMMENDED** cho TDD (Test-Driven Development)
- ✅ Khi đang fix bugs
- ✅ Khi đang develop features mới
- ✅ Continuous feedback loop

---

#### **12. `"test:coverage": "jest --coverage"`**

**Mục đích:** Chạy tests VÀ generate coverage report

**Chi tiết:**
```bash
npm run test:coverage
```

**Flags:**

| Flag | Ý nghĩa | Kết quả |
|------|---------|---------|
| `--coverage` | Collect code coverage | Tạo coverage reports |

**Output Files:**
```
Backend_system/
└── coverage/
    ├── lcov-report/
    │   ├── index.html      ← Mở file này trong browser
    │   ├── base.css
    │   ├── block-navigation.js
    │   ├── prettify.css
    │   ├── prettify.js
    │   ├── sort-arrow-sprite.png
    │   └── sorter.js
    ├── lcov.info           ← Coverage data (raw)
    └── clover.xml          ← Coverage data (XML format)
```

**HTML Report:**
```
Open: coverage/lcov-report/index.html

Shows:
┌────────────────────────────────────────────────────────────┐
│ Code Coverage Report                                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ Overall Coverage: 86.5%                                     │
│                                                             │
│ ├─ Statements: 1234/1428 (86.4%)                          │
│ ├─ Branches:   456/554   (82.3%)                          │
│ ├─ Functions:  234/263   (89.0%)                          │
│ └─ Lines:      1198/1387 (86.4%)                          │
│                                                             │
├────────────────────────────────────────────────────────────┤
│ Files:                                                      │
│                                                             │
│ auth.controller.ts          95.2% █████████░               │
│ user.controller.ts          89.3% ████████░░               │
│ group.controller.ts         91.5% █████████░               │
│ message.controller.ts       88.7% ████████░░               │
│ channel.controller.ts       87.9% ████████░░               │
│                                                             │
│ Click file to see line-by-line coverage                   │
└────────────────────────────────────────────────────────────┘
```

**Line-by-line Coverage:**
```typescript
// Click auth.controller.ts in report:

export class AuthController {
  ✅ async login(req, res) {              // Line covered
  ✅   const { email, password } = req.body;
  ✅   if (!email || !password) {         // Condition covered
  ✅     return res.status(400).json(...);
  ✅   }
  ❌   if (email.includes('admin')) {    // Branch NOT covered
       // This line never executed in tests
       return res.status(403).json(...);
     }
  ✅   const user = await UserService.findByEmail(email);
  ✅   return res.json({ success: true, data: user });
  ✅ }
}

Legend:
✅ Green  = Covered (executed in tests)
❌ Red    = Not covered (never executed)
🟨 Yellow = Partially covered (some branches missing)
```

**Khi nào dùng:**
- ✅ Trước khi submit PR
- ✅ Để tìm code chưa được test
- ✅ Để track testing progress
- ✅ Trong CI/CD để enforce coverage threshold

---

#### **13. `"test:ci": "jest --ci --coverage --watchAll=false"`**

**Mục đích:** Chạy tests trong CI/CD environment

**Chi tiết:**
```bash
npm run test:ci
```

**Flags:**

| Flag | Ý nghĩa | CI/CD Impact |
|------|---------|--------------|
| `--ci` | Continuous Integration mode | Optimized for CI |
| `--coverage` | Generate coverage | Upload to codecov/coveralls |
| `--watchAll=false` | Don't watch files | Exit after completion |

**Bước thực thi:**
```
1. Jest runs in CI mode:
   - No interactive prompts
   - No color output (plain text)
   - Optimized for pipelines
   ↓
2. Run all tests once
   ↓
3. Collect coverage
   ↓
4. Exit with code:
   - 0 = All tests passed ✅
   - 1 = Some tests failed ❌
   ↓
5. CI/CD pipeline:
   - If exit code = 0 → Continue to deploy
   - If exit code = 1 → Stop pipeline, notify team
```

**GitHub Actions Example:**
```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci     ← This script
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

**Output (CI format):**
```
RUNS  src/__tests__/routes/auth.test.ts
PASS  src/__tests__/routes/auth.test.ts (5.234s)
RUNS  src/__tests__/routes/users.test.ts
PASS  src/__tests__/routes/users.test.ts (4.891s)
...
Test Suites: 8 passed, 8 total
Tests:       144 passed, 144 total
Time:        10.234s
Coverage:    86.5%
```

**Khi nào dùng:**
- ✅ **ONLY** trong CI/CD pipelines
- ❌ **KHÔNG** dùng locally (dùng `npm test` thay vì)

---

#### **14. `"test:routes": "jest --testPathPattern=\"**/routes/**/*.test.ts\""`**

**Mục đích:** Chỉ chạy route tests

**Chi tiết:**
```bash
npm run test:routes
```

**Flags:**

| Flag | Ý nghĩa | Pattern |
|------|---------|---------|
| `--testPathPattern` | Filter test files | `**/routes/**/*.test.ts` |

**Files matched:**
```
✅ src/__tests__/routes/auth.test.ts
✅ src/__tests__/routes/users.test.ts
✅ src/__tests__/routes/groups.test.ts
✅ src/__tests__/routes/channels.test.ts
✅ src/__tests__/routes/messages.test.ts
✅ src/__tests__/routes/admin.test.ts
✅ src/__tests__/routes/video-call.test.ts
✅ src/__tests__/routes/client.test.ts
✅ src/__tests__/routes/upload.test.ts

❌ src/__tests__/services/user.service.test.ts (not in routes/)
❌ src/__tests__/integration/workflow.test.ts (not in routes/)
```

**Khi nào dùng:**
- ✅ Khi chỉ sửa route handlers
- ✅ Để test API endpoints specifically
- ✅ Faster than running all tests

---

#### **15. `"test:services": "jest --testPathPattern=\"**/services/**/*.test.ts\""`**

**Mục đích:** Chỉ chạy service tests

**Chi tiết:**
```bash
npm run test:services
```

**Files matched:**
```
✅ src/__tests__/services/auth.service.test.ts
✅ src/__tests__/services/user.service.test.ts
✅ src/__tests__/services/group.service.test.ts
✅ src/__tests__/services/message.service.test.ts
✅ src/__tests__/services/video-call.service.test.ts

❌ src/__tests__/routes/auth.test.ts (not in services/)
```

**Khi nào dùng:**
- ✅ Khi chỉ sửa business logic
- ✅ Test service layer independently
- ✅ Unit testing focus

---

#### **16. `"test:unit": "jest --testPathPattern=\"**/__tests__/**/*.test.ts\""`**

**Mục đích:** Chạy tất cả tests trong `__tests__/` folder

**Chi tiết:**
```bash
npm run test:unit
```

**Pattern:** `**/__tests__/**/*.test.ts`

**Meaning:**
- `**` = Any depth of directories
- `/__tests__/` = Folder named `__tests__`
- `**` = Any subdirectories inside `__tests__`
- `/*.test.ts` = Files ending with `.test.ts`

**Files matched:**
```
✅ src/__tests__/routes/auth.test.ts
✅ src/__tests__/services/user.service.test.ts
✅ src/__tests__/api/video-call.api.test.ts
✅ src/__tests__/e2e/video-call.e2e.test.ts
✅ src/__tests__/sockets/socket.server.test.ts

All tests in __tests__/ folder
```

**Khi nào dùng:**
- ✅ Standard test run
- ✅ Same as `npm test` trong project này
- ✅ Explicit about test location

---

#### **17. `"test:integration": "jest --testPathPattern=\"**/integration/**/*.test.ts\""`**

**Mục đích:** Chỉ chạy integration tests

**Chi tiết:**
```bash
npm run test:integration
```

**Files matched:**
```
✅ src/__tests__/integration/workflow.test.ts
✅ src/__tests__/integration/full-flow.test.ts

Currently SKIPPED in project (not implemented yet)
```

**Integration Tests là gì:**
```
Unit Test:
  Test 1 function/component in isolation
  Example: UserService.findById()

Integration Test:
  Test multiple components working together
  Example: 
    1. POST /api/auth/register
    2. Verify user in database
    3. POST /api/auth/login
    4. Verify JWT token
    5. GET /api/users/me
    6. Verify user data returned
```

---

#### **18. `"test:debug": "jest --verbose --detectOpenHandles"`**

**Mục đích:** Debug tests với detailed output

**Chi tiết:**
```bash
npm run test:debug
```

**Flags:**

| Flag | Ý nghĩa | Output |
|------|---------|--------|
| `--verbose` | Detailed test output | Show each test case |
| `--detectOpenHandles` | Find async issues | Detect memory leaks |

**Verbose Output:**
```
RUNS  src/__tests__/routes/auth.test.ts

  Authentication Routes
    POST /api/auth/register
      ✓ should register user successfully (234ms)
      ✓ should return 400 for invalid email (45ms)
      ✓ should return 409 for duplicate email (67ms)
    POST /api/auth/login
      ✓ should login with valid credentials (123ms)
      ✓ should return 401 for invalid credentials (56ms)
    POST /api/auth/logout
      ✓ should logout successfully (34ms)

PASS  src/__tests__/routes/auth.test.ts (5.234s)
```

**DetectOpenHandles:**
```
Problem: Test finishes but process hangs
  ↓
Reason: Some async operation not closed
  - Database connection not closed
  - Socket connection not closed
  - Timer not cleared
  ↓
jest --detectOpenHandles
  ↓
Output:
  Jest has detected the following 1 open handle potentially keeping Jest from exiting:

  ●  TCPSERVERWRAP

      20 |   beforeAll(async () => {
      21 |     server = app.listen(3000);
    > 22 |   });
         |          ^

  Fix: Close server in afterAll()
```

**Khi nào dùng:**
- ✅ Khi tests hang/không complete
- ✅ Khi có memory leaks
- ✅ Debugging flaky tests

---

#### **19. `"test:report": "jest --coverage --coverageReporters=html"`**

**Mục đích:** Generate ONLY HTML coverage report

**Chi tiết:**
```bash
npm run test:report
```

**Flags:**

| Flag | Value | Result |
|------|-------|--------|
| `--coverageReporters` | `html` | Generate HTML report only |

**Default reporters:**
```
jest --coverage
  ↓ Generates:
  - text (console output)
  - lcov (coverage/lcov.info)
  - html (coverage/lcov-report/index.html)
  - clover (coverage/clover.xml)
```

**This script:**
```
jest --coverage --coverageReporters=html
  ↓ Generates:
  - html ONLY (coverage/lcov-report/index.html)
  
Faster! Less files! Focused on visual report!
```

**Khi nào dùng:**
- ✅ Khi chỉ cần xem HTML report
- ✅ Local development
- ✅ Quick coverage check

---

#### **20. `"test:validate": "node src/__tests__/test-runner.js validate"`**

**Mục đích:** Custom validation script

**Chi tiết:**
```bash
npm run test:validate
```

**Test Runner Script:**
```javascript
// File: src/__tests__/test-runner.js

const command = process.argv[2]; // 'validate'

if (command === 'validate') {
  // Custom validation logic
  console.log('Validating test suite...');
  
  // Check:
  // 1. All test files have describe blocks
  // 2. All tests have proper naming
  // 3. No .only() or .skip() in tests
  // 4. Mock data is properly structured
  
  process.exit(0);
}
```

**Khi nào dùng:**
- ✅ Để enforce test standards
- ✅ Pre-commit hook
- ✅ Code review automation

---

### 🌱 SEEDING SCRIPTS

#### **21. `"seed:fake": "ts-node src/__tests__/fixtures/fake-data/seed-database.ts"`**

**Mục đích:** Seed database với fake data cho testing

**Chi tiết:**
```bash
npm run seed:fake
```

**Bước thực thi:**
```
1. ts-node chạy: seed-database.ts
   ↓
2. Connect to MongoDB
   ↓
3. Clear existing test data
   ↓
4. Generate fake data:
   - 50+ users (với realistic data)
   - 20+ groups
   - 100+ channels
   - 1000+ messages
   - 200+ video calls
   ↓
5. Insert into database
   ↓
6. Display summary
```

**Fake Data Example:**
```typescript
// Generated users:
{
  username: 'john_doe',
  email: 'john.doe@example.com',
  password: bcrypt.hash('password123'),
  roles: ['user'],
  avatar: '/uploads/avatars/john.jpg',
  isActive: true,
  createdAt: faker.date.past()
}

// Generated groups:
{
  name: 'JavaScript Developers',
  description: 'Discuss JS, TypeScript, Node.js',
  category: 'technology',
  members: [user1.id, user2.id, user3.id],
  createdBy: user1.id,
  isActive: true
}

// Generated messages:
{
  text: 'Has anyone tried the new React 18 features?',
  userId: user1.id,
  username: 'john_doe',
  channelId: channel1.id,
  type: 'text',
  createdAt: faker.date.recent()
}
```

**Console Output:**
```
🌱 Seeding database with fake data...
✅ Generated 50 users
✅ Generated 20 groups
✅ Generated 100 channels
✅ Generated 1000 messages
✅ Generated 200 video calls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Database seeded successfully!
Total records: 1370
Time: 5.234s
```

**Khi nào dùng:**
- ✅ Development environment
- ✅ Manual testing
- ✅ Để có data để xem UI
- ✅ Demo purposes

---

#### **22. `"seed:test": "cross-env NODE_ENV=test ts-node src/__tests__/fixtures/fake-data/seed-database.ts"`**

**Mục đích:** Seed TEST database (not development database)

**Chi tiết:**
```bash
npm run seed:test
```

**Cross-env:**
```
cross-env NODE_ENV=test
  ↓
Sets environment variable BEFORE running command
  ↓
Works on Windows, Mac, Linux ✅

Without cross-env:
  Windows: set NODE_ENV=test && ts-node ...
  Mac/Linux: NODE_ENV=test ts-node ...
  ↑ Different syntax! ❌

With cross-env:
  All platforms: cross-env NODE_ENV=test ts-node ...
  ↑ Same syntax! ✅
```

**Environment Check:**
```typescript
// In seed-database.ts
const dbName = process.env.NODE_ENV === 'test' 
  ? 'chat-system-test'        // Test database
  : 'chat-system-development'; // Dev database

MongoDB URI: mongodb://localhost:27017/${dbName}
```

**Database Separation:**
```
Development:
  Database: chat-system-development
  Port: 27017
  Used by: npm run dev

Test:
  Database: chat-system-test
  Port: 27017
  Used by: npm test, npm run seed:test
```

**Khi nào dùng:**
- ✅ Khi chạy automated tests
- ✅ Để tránh overwrite dev data
- ✅ In CI/CD pipelines

---

#### **23. `"seed:sample": "ts-node src/scripts/seed-sample-data.ts"`**

**Mục đích:** Seed với sample data (predefined, not random)

**Chi tiết:**
```bash
npm run seed:sample
```

**Difference from seed:fake:**

| Feature | seed:fake | seed:sample |
|---------|-----------|-------------|
| Data | Random (faker.js) | Predefined |
| Users | 50+ random users | 5 specific users |
| Consistency | Different mỗi lần | Same mỗi lần |
| Use case | Testing, demo | Documentation, tutorials |

**Sample Data:**
```typescript
// Predefined users
const users = [
  {
    username: 'admin',
    email: 'admin@chatsystem.com',
    password: 'admin123',
    roles: ['super_admin']
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    roles: ['user']
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    roles: ['group_admin']
  }
];

// Predefined groups
const groups = [
  {
    name: 'General',
    description: 'General discussion',
    category: 'general'
  },
  {
    name: 'Development Team',
    description: 'Dev team chat',
    category: 'technology'
  }
];
```

**Khi nào dùng:**
- ✅ First-time setup
- ✅ Documentation screenshots
- ✅ Tutorial videos
- ✅ Consistent demo data

---

#### **24. `"seed:mongodb": "ts-node src/services/database.seeder.ts"`**

**Mục đích:** Main database seeder (comprehensive)

**Chi tiết:**
```bash
npm run seed:mongodb
```

**Database Seeder:**
```typescript
// File: src/services/database.seeder.ts

export class DatabaseSeeder {
  async seed() {
    console.log('🌱 Starting database seeding...');
    
    // 1. Check if data exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️  Database already has data. Skip seeding.');
      return;
    }
    
    // 2. Seed users
    await this.seedUsers();
    
    // 3. Seed groups
    await this.seedGroups();
    
    // 4. Seed channels
    await this.seedChannels();
    
    // 5. Seed messages
    await this.seedMessages();
    
    console.log('✅ Database seeded successfully!');
  }
}
```

**Idempotent Seeding:**
```
First run:
  Database empty
    ↓
  Seed all data
    ↓
  ✅ Success

Second run:
  Database has data
    ↓
  Skip seeding
    ↓
  ⚠️  Already seeded (no duplicate data)
```

**Khi nào dùng:**
- ✅ **RECOMMENDED** cho first-time setup
- ✅ After database reset
- ✅ Production-like data

---

#### **25. `"migrate:mongodb": "ts-node src/scripts/migrate-to-mongodb.ts"`**

**Mục đích:** Database migration script

**Chi tiết:**
```bash
npm run migrate:mongodb
```

**Migration Example:**
```typescript
// File: src/scripts/migrate-to-mongodb.ts

export async function migrate() {
  console.log('🔄 Starting migration...');
  
  // 1. Connect to old database
  const oldDb = await connectToOldDb();
  
  // 2. Connect to new MongoDB
  const newDb = await connectToMongoDB();
  
  // 3. Migrate users
  const users = await oldDb.collection('users').find().toArray();
  for (const user of users) {
    const migratedUser = {
      ...user,
      roles: user.role ? [user.role] : ['user'], // Transform
      createdAt: new Date(user.created_at)       // Transform
    };
    await newDb.collection('users').insertOne(migratedUser);
  }
  
  console.log(`✅ Migrated ${users.length} users`);
  
  // 4. Migrate groups, channels, messages...
  
  console.log('✅ Migration completed!');
}
```

**Use Cases:**
- ✅ Migrate từ SQL to MongoDB
- ✅ Schema changes
- ✅ Data transformations
- ✅ Database version upgrades

**Khi nào dùng:**
- ✅ One-time migration
- ✅ Database restructuring
- ⚠️ Backup data trước khi chạy!

---

## 🎨 FRONTEND SCRIPTS - 22 Scripts

**File:** `Frontend_system/chat-system-frontend/package.json`  
**Location:** Lines 4-27

---

### 🏗️ BUILD & SERVE SCRIPTS

#### **1. `"ng": "ng"`**

**Mục đích:** Alias cho Angular CLI

**Chi tiết:**
```bash
npm run ng <command>
# Example:
npm run ng serve
npm run ng build
npm run ng test
```

**Tương đương:**
```bash
npx ng serve
./node_modules/.bin/ng serve
```

**Khi nào dùng:**
- ✅ Khi cần chạy Angular CLI commands
- ✅ Alternative to `npx ng`
- ℹ️ Thường không dùng directly, dùng shortcuts khác

---

#### **2. `"start": "ng serve"`**

**Mục đích:** Start development server

**Chi tiết:**
```bash
npm start
# hoặc
npm run start
```

**ng serve process:**
```
1. Angular CLI reads: angular.json
   ↓
2. Load project config
   ↓
3. Webpack compiles TypeScript
   ↓
4. Bundle assets (CSS, images)
   ↓
5. Start dev server: http://localhost:4200
   ↓
6. Watch for file changes
   ↓
7. Hot Module Replacement (HMR) enabled
```

**File Watching:**
```
Developer edits: src/app/components/login.component.ts
  ↓
Webpack detects change
  ↓
Recompile ONLY changed module
  ↓
Hot reload in browser (no full refresh!)
  ↓
Developer sees changes immediately ✅
```

**Console Output:**
```
Initial Chunk Files   | Names         |  Raw Size
main.js               | main          |   2.5 MB | 
polyfills.js          | polyfills     | 339.1 kB | 
styles.css, styles.js | styles        | 225.3 kB | 

| Initial Total |   3.0 MB

Build at: 2025-10-08T10:30:45.123Z
√ Compiled successfully.

** Angular Live Development Server is listening on localhost:4200 **
```

**Features:**
- ✅ Auto-reload on save
- ✅ Source maps for debugging
- ✅ Fast incremental builds
- ✅ Live CSS injection

**Khi nào dùng:**
- ✅ **DAILY** development
- ✅ Testing features in browser
- ✅ UI development

---

#### **3. `"build": "ng build"`**

**Mục đích:** Build production-ready application

**Chi tiết:**
```bash
npm run build
```

**Build Process:**
```
1. Read: angular.json (production config)
   ↓
2. TypeScript compilation
   ↓
3. AOT (Ahead-of-Time) compilation
   ↓
4. Tree shaking (remove unused code)
   ↓
5. Minification
   ↓
6. Bundling
   ↓
7. Output to: dist/ folder
```

**Optimizations:**

| Feature | Development | Production |
|---------|------------|------------|
| AOT Compilation | ❌ No | ✅ Yes |
| Minification | ❌ No | ✅ Yes |
| Source Maps | ✅ Full | ⚠️ Hidden |
| Bundle Size | Large | Small (optimized) |
| Build Time | Fast | Slow |

**Output Structure:**
```
dist/chat-system-frontend/
├── index.html                    # Entry HTML
├── main.[hash].js               # Main bundle
├── polyfills.[hash].js          # Browser polyfills
├── runtime.[hash].js            # Webpack runtime
├── styles.[hash].css            # Compiled styles
├── assets/                      # Static assets
│   ├── images/
│   └── icons/
└── 3rdpartylicenses.txt        # License info
```

**File Sizes:**
```
Development build:
  main.js: 2.5 MB
  Total: 3.0 MB

Production build (after optimization):
  main.js: 450 KB (minified + gzipped)
  Total: 600 KB
  
83% smaller! 🎉
```

**Khi nào dùng:**
- ✅ Trước khi deploy
- ✅ Testing production build locally
- ✅ Performance testing

**Deploy workflow:**
```bash
npm run build
  ↓
cd dist/chat-system-frontend
  ↓
Upload to web server (Nginx, Apache, etc)
  ↓
Configure server to serve index.html
  ↓
App live! 🚀
```

---

#### **4. `"watch": "ng build --watch --configuration development"`**

**Mục đích:** Build và watch for changes (không serve)

**Chi tiết:**
```bash
npm run watch
```

**Flags:**

| Flag | Ý nghĩa | Result |
|------|---------|--------|
| `--watch` | Watch for changes | Auto-rebuild on save |
| `--configuration development` | Use dev config | No minification |

**Use Case:**
```
Scenario: Serving via separate web server

1. npm run watch
   ↓ Builds to dist/
   ↓ Watches for changes
   
2. Separate terminal: http-server dist/
   ↓ Serve static files
   
3. Edit component
   ↓ watch rebuilds
   ↓ http-server serves new files
   ↓ Browser refresh to see changes
```

**So sánh:**
```
npm start (ng serve):
  ✅ Build + Serve + HMR
  ✅ Auto browser refresh
  ❌ Requires port 4200

npm run watch:
  ✅ Build + Watch
  ❌ No server
  ❌ Manual browser refresh
  ✅ Can use custom server
```

**Khi nào dùng:**
- ⚠️ Rarely used
- ✅ Custom server setup
- ✅ Special deployment scenarios

---

### 🧪 TESTING SCRIPTS

#### **5. `"test": "ng test"`**

**Mục đích:** Chạy Karma/Jasmine unit tests

**Chi tiết:**
```bash
npm test
# hoặc
npm run test
```

**Test Stack:**
```
ng test
  ↓
Karma Test Runner
  ↓ Launches browser: Chrome
  ↓
Jasmine Test Framework
  ↓ Runs *.spec.ts files
  ↓
Test Results in browser & console
```

**Bước thực thi:**
```
1. Angular CLI reads: karma.conf.js
   ↓
2. Karma starts Chrome browser
   ↓
3. Load test files: **/*.spec.ts
   ↓
4. Run tests in browser context
   ↓
5. Display results:
   - Browser: Interactive UI
   - Console: Text summary
   ↓
6. Watch mode enabled (auto-rerun on changes)
```

**Browser Output:**
```
┌────────────────────────────────────────────────────────────┐
│ Karma v6.4.0 - Chrome 120.0.0 (Windows 10)                │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ LoginComponent                                          │
│   ✓ should create                                          │
│   ✓ should redirect if already authenticated               │
│   ✓ should show success message from registration          │
│                                                             │
│ ✅ AuthService                                             │
│   ✓ should login successfully                              │
│   ✓ should handle login errors                             │
│   ✓ should logout                                          │
│                                                             │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ Tests: 6 passed, 6 total                                   │
│ Time: 2.345s                                               │
└────────────────────────────────────────────────────────────┘
```

**Console Output:**
```
08 10 2025 10:30:45.123:INFO [karma-server]: Karma v6.4.0 server started
08 10 2025 10:30:45.234:INFO [launcher]: Launching browser Chrome
08 10 2025 10:30:47.456:INFO [Chrome]: Connected on socket

Chrome 120.0.0 (Windows 10): Executed 6 of 6 SUCCESS (2.345 secs / 2.123 secs)
TOTAL: 6 SUCCESS
```

**Khi nào dùng:**
- ✅ Development testing
- ✅ TDD workflow
- ✅ Debugging component issues

---

#### **6. `"test:ci": "ng test --watch=false --browsers=ChromeHeadless"`**

**Mục đích:** Chạy tests trong CI/CD (no GUI)

**Chi tiết:**
```bash
npm run test:ci
```

**Flags:**

| Flag | Value | Effect |
|------|-------|--------|
| `--watch=false` | Disable watch | Run once & exit |
| `--browsers=ChromeHeadless` | Headless Chrome | No GUI browser |

**ChromeHeadless:**
```
Chrome (normal):
  ✅ Opens browser window
  ✅ Can see tests running
  ❌ Requires display/GUI
  ❌ Slow

ChromeHeadless:
  ❌ No browser window
  ❌ Can't see tests visually
  ✅ Works in CI without display
  ✅ Faster
```

**CI/CD Workflow:**
```
GitHub Actions:
  runs-on: ubuntu-latest (no GUI)
    ↓
  npm run test:ci
    ↓
  ChromeHeadless launches (no window)
    ↓
  Tests run in background
    ↓
  Results logged to console
    ↓
  Exit code: 0 (pass) or 1 (fail)
    ↓
  CI pipeline: Continue or Stop
```

**Output (CI format):**
```
INFO [karma]: Karma v6.4.0 server started
INFO [launcher]: Launching browser ChromeHeadless
INFO [Chrome Headless]: Connected

Chrome Headless (Windows 10): Executed 45 of 45 SUCCESS (5.234 secs)
TOTAL: 45 SUCCESS
```

**Khi nào dùng:**
- ✅ **ONLY** trong CI/CD
- ✅ Automated testing pipelines
- ❌ **KHÔNG** dùng locally (dùng `npm test`)

---

#### **7. `"test:coverage": "ng test --code-coverage"`**

**Mục đích:** Unit tests + coverage report

**Chi tiết:**
```bash
npm run test:coverage
```

**Flags:**

| Flag | Effect |
|------|--------|
| `--code-coverage` | Instrument code & collect coverage |

**Output:**
```
Frontend_system/chat-system-frontend/
└── coverage/
    ├── index.html           ← Open this in browser
    ├── chat-system-frontend/
    │   ├── auth/
    │   │   └── login.component.ts.html
    │   ├── chat/
    │   │   └── chat.component.ts.html
    │   └── index.html
    └── lcov.info
```

**Coverage Report:**
```
┌────────────────────────────────────────────────────────────┐
│ Coverage Summary                                            │
├────────────────────────────────────────────────────────────┤
│ Statements   : 78.5% ( 1234/1572 )                         │
│ Branches     : 72.3% ( 456/631 )                           │
│ Functions    : 81.2% ( 234/288 )                           │
│ Lines        : 79.1% ( 1198/1514 )                         │
└────────────────────────────────────────────────────────────┘

Components Coverage:
├─ login.component.ts          95% ████████░
├─ register.component.ts       92% ████████░
├─ chat.component.ts           85% ████████░
├─ group-list.component.ts     78% ███████░░
└─ video-call.component.ts     45% ████░░░░░  ⚠️ Low!
```

**Khi nào dùng:**
- ✅ Check test coverage
- ✅ Find untested code
- ✅ Improve test quality

---

#### **8. `"test:watch": "ng test --watch"`**

**Mục đích:** Test với watch mode

**Chi tiết:**
```bash
npm run test:watch
```

**Watch Behavior:**
```
1. Run all tests initially
   ↓
2. Display results in browser
   ↓
3. Watch for file changes
   ↓
4. Developer edits: login.component.ts
   ↓
5. Karma detects change
   ↓
6. Re-run affected tests:
   - login.component.spec.ts ✅
   ↓
7. Update browser display
   ↓
8. Continue watching...
```

**Khi nào dùng:**
- ✅ TDD workflow
- ✅ During feature development
- ✅ Continuous testing

---

#### **9. `"test:unit": "ng test --include=\"**/*.spec.ts\""`**

**Mục đích:** Chạy tất cả unit tests

**Chi tiết:**
```bash
npm run test:unit
```

**Pattern:** `**/*.spec.ts`

**Files matched:**
```
✅ src/app/components/auth/login.component.spec.ts
✅ src/app/services/auth.service.spec.ts
✅ src/app/guards/role.guard.spec.ts
✅ src/app/pipes/date-format.pipe.spec.ts
✅ ANY file ending with .spec.ts
```

**Khi nào dùng:**
- ✅ Equivalent to `npm test`
- ✅ Explicit about test type

---

#### **10. `"test:components": "ng test --include=\"**/components/**/*.spec.ts\""`**

**Mục đích:** Chỉ test components

**Chi tiết:**
```bash
npm run test:components
```

**Pattern:** `**/components/**/*.spec.ts`

**Files matched:**
```
✅ src/app/components/auth/login.component.spec.ts
✅ src/app/components/auth/register.component.spec.ts
✅ src/app/components/chat/chat.component.spec.ts
✅ src/app/components/admin/dashboard.component.spec.ts

❌ src/app/services/auth.service.spec.ts (not in components/)
❌ src/app/guards/role.guard.spec.ts (not in components/)
```

**Test Count:**
```
All tests:        100+ tests
Components only:  60+ tests
Services:         25+ tests
Guards/Pipes:     15+ tests
```

**Khi nào dùng:**
- ✅ Khi chỉ sửa UI components
- ✅ Faster than full test suite
- ✅ Focus on component logic

---

#### **11. `"test:services": "ng test --include=\"**/services/**/*.spec.ts\""`**

**Mục đích:** Chỉ test services

**Chi tiết:**
```bash
npm run test:services
```

**Files matched:**
```
✅ src/app/services/auth.service.spec.ts
✅ src/app/services/api.service.spec.ts
✅ src/app/services/group.service.spec.ts
✅ src/app/services/message.service.spec.ts
✅ src/app/services/socket.service.spec.ts

❌ src/app/components/... (not services)
```

**Service Tests Example:**
```typescript
describe('AuthService', () => {
  it('should login successfully', () => {
    // Arrange
    const credentials = { email: 'test@example.com', password: 'pass' };
    const mockResponse = { success: true, data: { user, token } };
    
    // Act
    service.login(credentials.email, credentials.password);
    
    // Assert
    expect(httpMock.post).toHaveBeenCalledWith('/api/auth/login', credentials);
    expect(localStorage.getItem('auth_token')).toBe(mockResponse.data.token);
  });
});
```

**Khi nào dùng:**
- ✅ Khi chỉ sửa service logic
- ✅ Test business logic independently
- ✅ Faster than full suite

---

#### **12-16. Feature-specific Test Scripts**

**Pattern:** `ng test --include=\"**/<feature>/**/*.spec.ts\"`

**Scripts:**

| Script | Pattern | Files Tested |
|--------|---------|--------------|
| `test:auth` | `**/auth/**/*.spec.ts` | Authentication components & services |
| `test:chat` | `**/chat/**/*.spec.ts` | Chat components & services |
| `test:admin` | `**/admin/**/*.spec.ts` | Admin panel components |
| `test:client` | `**/client/**/*.spec.ts` | Client-side components |
| `test:shared` | `**/shared/**/*.spec.ts` | Shared components & utilities |

**Chi tiết:**

```bash
# Test only auth feature
npm run test:auth
  ↓ Matches:
  ├─ components/auth/login.component.spec.ts
  ├─ components/auth/register.component.spec.ts
  ├─ services/auth.service.spec.ts
  └─ guards/auth.guard.spec.ts

# Test only chat feature
npm run test:chat
  ↓ Matches:
  ├─ components/chat/chat.component.spec.ts
  ├─ components/chat/message-list.component.spec.ts
  ├─ services/message.service.spec.ts
  └─ services/socket.service.spec.ts
```

**Khi nào dùng:**
- ✅ Feature-focused development
- ✅ Debugging specific feature
- ✅ Faster than full suite
- ✅ Team collaboration (frontend team có thể chia test theo feature)

---

### 🔬 E2E TESTING SCRIPTS

#### **17. `"e2e": "cypress open"`**

**Mục đích:** Mở Cypress Test Runner (Interactive UI)

**Chi tiết:**
```bash
npm run e2e
```

**Bước thực thi:**
```
1. Cypress launcher opens
   ↓
2. Choose test type:
   ┌────────────────────────────────────┐
   │ Choose a testing type              │
   ├────────────────────────────────────┤
   │ [E2E Testing]  →  Test full app    │
   │ [Component Testing]  →  Test in    │
   │                        isolation   │
   └────────────────────────────────────┘
   ↓
3. Choose browser:
   ┌────────────────────────────────────┐
   │ Choose a browser                   │
   ├────────────────────────────────────┤
   │ [Chrome]                           │
   │ [Firefox]                          │
   │ [Edge]                             │
   │ [Electron]                         │
   └────────────────────────────────────┘
   ↓
4. Select test file:
   ┌────────────────────────────────────┐
   │ E2E specs                          │
   ├────────────────────────────────────┤
   │ □ auth.cy.ts (7 tests)            │
   │ □ chat.cy.ts (6 tests)            │
   │ □ video-call.cy.ts (4 tests)      │
   │ □ admin.cy.ts (5 tests)           │
   │ □ advanced-chat.cy.ts (30 tests)  │
   └────────────────────────────────────┘
   ↓
5. Browser launches with test UI
   ↓
6. Run tests interactively
```

**Interactive Features:**
```
Cypress Test Runner UI:
┌────────────────────────────────────────────────────────────┐
│ Cypress                                    auth.cy.ts       │
├────────────────────────────────────────────────────────────┤
│ Tests                    │ Browser Preview                  │
├─────────────────────────┼──────────────────────────────────┤
│ ▶ Authentication Flow   │ [Your App Running]               │
│   ✓ Display login page  │                                  │
│   ✓ Navigate to reg...  │ ┌──────────────────────────┐    │
│   ✓ Register user       │ │  Welcome Back            │    │
│ > ✓ Login valid creds   │ │  ──────────────────────  │ ◄──┤
│   ✓ Invalid creds       │ │  Email: test@example.com │    │
│   ✓ Required fields     │ │  Pass:  ••••••••••••••  │    │
│   ✓ Email format        │ │  [Sign In]               │    │
│                         │ └──────────────────────────┘    │
│ [Screenshot] [Video]    │                                  │
│ [Time Travel] [Debug]   │ Click any step to inspect       │
└─────────────────────────┴──────────────────────────────────┘
```

**Time Travel Debugging:**
```
Click on any test step:
  ✓ Login valid creds  ← Click this
    ↓
Browser shows app state AT THAT MOMENT:
  - DOM snapshot
  - Console logs
  - Network requests
  - Application state
    ↓
Can inspect, debug, understand what happened!
```

**Khi nào dùng:**
- ✅ **RECOMMENDED** cho development
- ✅ Debugging E2E tests
- ✅ Visual verification
- ✅ Writing new tests

---

#### **18. `"e2e:run": "cypress run"`**

**Mục đích:** Chạy E2E tests headless (no GUI)

**Chi tiết:**
```bash
npm run e2e:run
```

**Headless Mode:**
```
cypress open  →  Interactive GUI
cypress run   →  Headless CLI

Headless = No browser window visible
```

**Bước thực thi:**
```
1. Cypress starts Electron browser (hidden)
   ↓
2. Run ALL test files sequentially:
   - auth.cy.ts
   - chat.cy.ts
   - video-call.cy.ts
   - admin.cy.ts
   - advanced-chat.cy.ts
   ↓
3. Record videos (saved to cypress/videos/)
   ↓
4. Capture screenshots on failure
   ↓
5. Generate test report
   ↓
6. Exit with code: 0 (pass) or 1 (fail)
```

**Console Output:**
```
====================================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        15.3.0                                                                         │
  │ Browser:        Electron 120.0.0 (headless)                                                    │
  │ Node Version:   v18.17.0                                                                       │
  │ Specs:          5 found (auth.cy.ts, chat.cy.ts, video-call.cy.ts, admin.cy.ts, ...)        │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  auth.cy.ts                                                                    (1 of 5)


  Authentication Flow
    ✓ should display login page by default (523ms)
    ✓ should navigate to register page (234ms)
    ✓ should register a new user successfully (1123ms)
    ✓ should login with valid credentials (892ms)
    ✓ should show error for invalid credentials (445ms)
    ✓ should validate required fields (234ms)
    ✓ should enable login button with any valid username (312ms)


  7 passing (4s)


  (Results)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Tests:        7                                                                                │
  │ Passing:      7                                                                                │
  │ Failing:      0                                                                                │
  │ Pending:      0                                                                                │
  │ Skipped:      0                                                                                │
  │ Screenshots:  0                                                                                │
  │ Video:        true                                                                             │
  │ Duration:     4 seconds                                                                        │
  │ Spec Ran:     auth.cy.ts                                                                       │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


  (Video)

  -  Started compressing: Compressing to 32 CRF
  -  Finished compressing: 1 seconds                                      /path/to/auth.cy.ts.mp4


────────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                                    
  Running:  chat.cy.ts                                                                    (2 of 5)

  ... (continues for all files)

====================================================================================================

  (Run Finished)


       Spec                                              Tests  Passing  Failing  Pending  Skipped  
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔  auth.cy.ts                               00:04        7        7        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  chat.cy.ts                               00:05        6        6        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  video-call.cy.ts                         00:03        4        4        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  admin.cy.ts                              00:06        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔  advanced-chat.cy.ts                      00:12       30       30        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    ✔  All specs passed!                        00:30       52       52        -        -        -  
```

**Generated Files:**
```
cypress/
├── videos/
│   ├── auth.cy.ts.mp4             ← Video của mỗi test file
│   ├── chat.cy.ts.mp4
│   ├── video-call.cy.ts.mp4
│   ├── admin.cy.ts.mp4
│   └── advanced-chat.cy.ts.mp4
└── screenshots/                    ← Only if tests fail
    └── chat.cy.ts/
        └── should-send-message.png
```

**Khi nào dùng:**
- ✅ CI/CD pipelines
- ✅ Automated testing
- ✅ Regression testing
- ✅ Khi không cần interactive UI

---

#### **19. `"e2e:headless": "cypress run --headless"`**

**Mục đích:** Explicit headless mode

**Chi tiết:**
```bash
npm run e2e:headless
```

**Flags:**

| Flag | Effect |
|------|--------|
| `--headless` | Run without GUI |

**Note:**
- `cypress run` mặc định đã là headless
- Flag này là explicit/redundant
- Kết quả giống `e2e:run`

---

#### **20. `"e2e:ci": "cypress run --browser chrome --headless"`**

**Mục đích:** E2E tests cho CI/CD với Chrome headless

**Chi tiết:**
```bash
npm run e2e:ci
```

**Flags:**

| Flag | Value | Effect |
|------|-------|--------|
| `--browser` | `chrome` | Use Chrome instead of default Electron |
| `--headless` | - | No GUI |

**Browser Comparison:**

| Browser | Speed | Realistic | CI Friendly |
|---------|-------|-----------|-------------|
| Electron (default) | ⚡ Fast | ⚠️ Medium | ✅ Yes |
| Chrome Headless | ⚡ Fast | ✅ High | ✅ Yes |
| Chrome (GUI) | 🐌 Slow | ✅ High | ❌ No |
| Firefox Headless | ⚡ Fast | ✅ High | ✅ Yes |

**CI/CD Pipeline:**
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      # Start backend
      - run: npm run dev &
        working-directory: Backend_system
      
      # Start frontend
      - run: npm start &
        working-directory: Frontend_system/chat-system-frontend
      
      # Wait for servers to start
      - run: sleep 10
      
      # Run E2E tests
      - run: npm run e2e:ci              ← This script
        working-directory: Frontend_system/chat-system-frontend
      
      # Upload results
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

**Khi nào dùng:**
- ✅ **ONLY** trong CI/CD
- ✅ GitHub Actions, GitLab CI, Jenkins
- ✅ Automated deployment pipelines

---

### 🔍 LINTING SCRIPTS

#### **21. `"lint": "ng lint"`**

**Mục đích:** Check code quality & style issues

**Chi tiết:**
```bash
npm run lint
```

**ESLint checks:**
```
1. Read: .eslintrc.json
   ↓
2. Scan all TypeScript files
   ↓
3. Check for:
   - Syntax errors
   - Style violations
   - Best practice violations
   - Unused variables
   - Type errors
   ↓
4. Report issues
```

**Example Output:**
```
Linting "chat-system-frontend"...

/src/app/components/login.component.ts
  45:7   error    'user' is defined but never used           @typescript-eslint/no-unused-vars
  67:15  warning  Missing return type on function            @typescript-eslint/explicit-function-return-type
  89:3   error    Unexpected console statement               no-console

/src/app/services/auth.service.ts
  23:1   warning  File has too many lines (350). Maximum: 300  max-lines

✖ 4 problems (2 errors, 2 warnings)
  0 errors and 0 warnings potentially fixable with the `--fix` option.
```

**Error Levels:**

| Level | Symbol | Meaning | Action |
|-------|--------|---------|--------|
| Error | ❌ | Must fix | Blocks build |
| Warning | ⚠️ | Should fix | Doesn't block |
| Info | ℹ️ | Good to know | Optional |

**Khi nào dùng:**
- ✅ Trước khi commit
- ✅ Code review
- ✅ Maintain code quality
- ✅ In pre-commit hooks

---

#### **22. `"lint:fix": "ng lint --fix"`**

**Mục đích:** Auto-fix linting issues

**Chi tiết:**
```bash
npm run lint:fix
```

**Flags:**

| Flag | Effect |
|------|--------|
| `--fix` | Automatically fix issues |

**What can be auto-fixed:**
```
✅ Can fix automatically:
  - Spacing issues (2 spaces → 4 spaces)
  - Semicolons (missing → added)
  - Quotes (double → single)
  - Trailing commas
  - Import order
  - Line breaks

❌ Cannot fix automatically:
  - Logic errors
  - Unused variables (need manual removal)
  - Complex violations
  - Type errors
```

**Example:**
```typescript
// BEFORE lint:fix
import {Component} from '@angular/core';
import {Router} from '@angular/router'

@Component({
  selector: 'app-login',
  template: `<div>Login</div>`
})
export class LoginComponent{
  constructor(private router:Router){}
  
  login(){
    console.log("logging in")
  }
}

// AFTER lint:fix
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `<div>Login</div>`,
})
export class LoginComponent {
  constructor(private router: Router) {}

  login(): void {
    console.log('logging in');
  }
}
```

**Console Output:**
```
Linting "chat-system-frontend"...
  Fixed 15 issues automatically

/src/app/components/login.component.ts
  ✓ Fixed spacing issues (3)
  ✓ Added semicolons (2)
  ✓ Changed quotes (5)
  ✓ Fixed import spacing (2)
  ✓ Added return types (3)

All fixable problems fixed!
Some issues still need manual fixing.
```

**Khi nào dùng:**
- ✅ Before committing
- ✅ After merging branches
- ✅ Code cleanup
- ✅ Quick formatting

---

## 🔗 SCRIPT COMBINATIONS

### Typical Development Workflows

#### **Workflow 1: Starting Development**

```bash
# Terminal 1: Start backend
cd Backend_system
npm run dev:all        # Express + PeerJS servers
                       # Port 3000 + 9000

# Terminal 2: Start frontend
cd Frontend_system/chat-system-frontend
npm start              # Angular dev server
                       # Port 4200

# Terminal 3: Watch tests
cd Backend_system
npm run test:watch     # Backend tests

# Terminal 4: Optional - E2E tests
cd Frontend_system/chat-system-frontend
npm run e2e           # Cypress interactive
```

---

#### **Workflow 2: Before Committing Code**

```bash
# Step 1: Lint & fix
npm run lint:fix

# Step 2: Type check
cd Backend_system
npm run type-check

# Step 3: Run all tests
npm test

# Step 4: Check coverage
npm run test:coverage

# Step 5: Build to verify
npm run build

# Step 6: Commit if all pass
git add .
git commit -m "feat: Add new feature"
```

---

#### **Workflow 3: CI/CD Pipeline**

```bash
# Backend Pipeline
cd Backend_system
npm ci                 # Clean install
npm run type-check     # Check types
npm run test:ci        # Run tests
npm run build          # Build production

# Frontend Pipeline
cd Frontend_system/chat-system-frontend
npm ci                 # Clean install
npm run lint           # Check code quality
npm run test:ci        # Unit tests
npm run build          # Build production
npm run e2e:ci         # E2E tests

# If all pass → Deploy
```

---

#### **Workflow 4: Debugging Failed Tests**

```bash
# Step 1: Run specific test category
npm run test:routes    # Find which category fails

# Step 2: Run with debug flags
npm run test:debug     # Detailed output

# Step 3: Run single test file
npx jest src/__tests__/routes/auth.test.ts --verbose

# Step 4: Fix code

# Step 5: Watch mode for quick feedback
npm run test:watch     # Auto re-run on save
```

---

## 📚 USE CASES & EXAMPLES

### Use Case 1: New Developer Setup

```bash
# Day 1: Setup project

# 1. Clone repo
git clone <repo-url>

# 2. Install dependencies
cd Backend_system && npm install
cd ../Frontend_system/chat-system-frontend && npm install

# 3. Seed database
cd ../../Backend_system
npm run seed:mongodb   # Initial data

# 4. Start servers
npm run dev:all        # Backend + PeerJS

# 5. Start frontend (new terminal)
cd ../Frontend_system/chat-system-frontend
npm start

# 6. Open browser
# http://localhost:4200

# 7. Login with seeded user
# Username: admin
# Password: admin123

✅ Ready to develop!
```

---

### Use Case 2: Feature Development (TDD Approach)

```bash
# Feature: Add message reactions

# Terminal 1: Backend
cd Backend_system
npm run test:watch     # Watch backend tests
  ↓
# Write test: message.reactions.test.ts
# Test FAILS (feature not implemented)
  ↓
# Implement: message.service.ts addReaction()
# Test PASSES ✅
  ↓
npm run dev            # Start server to test manually

# Terminal 2: Frontend
cd Frontend_system/chat-system-frontend
npm test               # Watch unit tests
  ↓
# Write test: message.component.spec.ts
# Test FAILS
  ↓
# Implement: message.component.ts addReaction()
# Test PASSES ✅
  ↓
npm start              # Start dev server

# Terminal 3: E2E Tests
npm run e2e           # Test full flow
  ↓
# Write: cypress/e2e/message-reactions.cy.ts
# Test FAILS
  ↓
# Fix integration issues
# Test PASSES ✅

✅ Feature complete with tests!
```

---

### Use Case 3: Production Deployment

```bash
# Pre-deployment checklist

# Backend
cd Backend_system
npm run type-check     # ✅ No type errors
npm run test           # ✅ 144/144 tests pass
npm run test:coverage  # ✅ 86.5% coverage
npm run build          # ✅ Build successful
npm start              # ✅ Server starts OK

# Frontend
cd Frontend_system/chat-system-frontend
npm run lint           # ✅ No linting errors
npm run test:ci        # ✅ 100+ tests pass
npm run test:coverage  # ✅ 78% coverage
npm run build          # ✅ Build successful
npm run e2e:ci         # ✅ 52 E2E tests pass

# If all ✅ → Deploy to production!
```

---

### Use Case 4: Debugging Production Issue

```bash
# Issue: Users can't login in production

# Step 1: Reproduce locally
cd Frontend_system/chat-system-frontend
npm run build          # Build production bundle
npx http-server dist   # Serve production build

# Step 2: Check with production-like data
cd Backend_system
npm run seed:sample    # Use consistent data
npm start              # Production server

# Step 3: Run relevant E2E tests
cd Frontend_system/chat-system-frontend
npm run e2e:run -- --spec "cypress/e2e/auth.cy.ts"

# Step 4: If test fails → Fix
# If test passes → Check production logs

# Step 5: Verify fix
npm run e2e:ci         # Full E2E suite
```

---

## 🎯 QUICK REFERENCE

### Backend Commands

| Command | Use Case | Speed | Output |
|---------|----------|-------|--------|
| `npm run dev` | Daily development | ⚡ Fast | Terminal |
| `npm run dev:all` | With video calls | ⚡ Fast | Terminal |
| `npm test` | Run all tests | ⚡ Fast | Console |
| `npm run test:watch` | TDD workflow | ⚡ Fast | Interactive |
| `npm run test:coverage` | Check coverage | ⚠️ Medium | HTML + Console |
| `npm run build` | Production build | 🐌 Slow | dist/ folder |
| `npm start` | Run production | ⚡ Fast | Terminal |
| `npm run seed:mongodb` | Initial setup | ⚡ Fast | Database |

### Frontend Commands

| Command | Use Case | Speed | Output |
|---------|----------|-------|--------|
| `npm start` | Daily development | ⚡ Fast | Browser (4200) |
| `npm test` | Unit tests | ⚡ Fast | Browser + Console |
| `npm run test:coverage` | Check coverage | ⚠️ Medium | HTML + Browser |
| `npm run e2e` | Interactive E2E | ⚡ Fast | Cypress UI |
| `npm run e2e:run` | Automated E2E | 🐌 Slow | Videos + Screenshots |
| `npm run build` | Production build | 🐌 Slow | dist/ folder |
| `npm run lint:fix` | Fix code style | ⚡ Fast | Modified files |

---

## 🔧 ADVANCED TIPS

### Tip 1: Chain Scripts

```bash
# Run multiple commands
npm run lint && npm test && npm run build

# If any fails, stop execution
npm run type-check && npm run test:coverage && npm run build
```

### Tip 2: Custom Scripts

Add to package.json:
```json
{
  "scripts": {
    "dev:full": "concurrently \"npm run dev\" \"npm run test:watch\"",
    "test:quick": "jest --maxWorkers=50% --bail",
    "deploy": "npm run build && npm run test:ci && ./deploy.sh"
  }
}
```

### Tip 3: Script Arguments

```bash
# Pass additional flags
npm test -- --watch
npm run e2e:run -- --spec "cypress/e2e/auth.cy.ts"
npm run build -- --configuration=staging
```

---

**Last Updated:** October 8, 2025  
**Total Scripts:** 48 (26 backend + 22 frontend)  
**Author:** David Nguyen  
**Status:** Complete Documentation ✅
