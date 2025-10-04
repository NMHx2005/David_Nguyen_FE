# Testing Guide

## Overview
This document provides a comprehensive guide for testing the Chat System Frontend application.

## Test Types

### 1. Unit Tests
Unit tests test individual components, services, and functions in isolation.

**Location**: `src/app/**/*.spec.ts`

**Run Tests**:
```bash
# Run all unit tests
npm run test

# Run tests in CI mode (headless)
npm run test:ci

# Run tests with coverage
npm run test:coverage
```

**Coverage**: Tests should aim for at least 80% code coverage.

### 2. Component Tests
Component tests test Angular components with their dependencies.

**Examples**:
- `ImageUploadComponent` - Tests file upload functionality
- `VideoCallComponent` - Tests video call interface
- `RealtimeChatComponent` - Tests chat functionality

**Key Test Areas**:
- Component initialization
- User interactions
- Input/output handling
- Template rendering
- Service integration

### 3. Service Tests
Service tests test Angular services and their methods.

**Examples**:
- `SocketService` - Tests WebSocket functionality
- `VideoCallService` - Tests video call management
- `UploadService` - Tests file upload functionality

**Key Test Areas**:
- Method functionality
- Observable streams
- Error handling
- State management

### 4. E2E Tests
End-to-end tests test the complete user workflow.

**Location**: `e2e/src/**/*.e2e-spec.ts`

**Run Tests**:
```bash
# Run E2E tests
npm run e2e

# Run E2E tests in CI mode
npm run e2e:ci
```

**Key Test Areas**:
- User authentication flow
- Chat functionality
- File upload
- Video calls
- Navigation

## Test Structure

### Unit Test Structure
```typescript
describe('ComponentName', () => {
  let component: ComponentName;
  let fixture: ComponentFixture<ComponentName>;

  beforeEach(() => {
    // Setup
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### Service Test Structure
```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceName);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform action', () => {
    // Test implementation
  });
});
```

## Mocking

### Service Mocking
```typescript
const mockService = jasmine.createSpyObj('ServiceName', ['method1', 'method2']);
```

### HTTP Mocking
```typescript
const httpMock = TestBed.inject(HttpTestingController);
```

### Socket Mocking
```typescript
const mockSocket = jasmine.createSpyObj('Socket', ['emit', 'on', 'disconnect']);
```

## Test Data

### Mock Data
- User data: `mockUsers`
- Message data: `mockMessages`
- File data: `mockFiles`

### Test Fixtures
- Component fixtures
- Service fixtures
- HTTP fixtures

## Best Practices

### 1. Test Naming
- Use descriptive test names
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### 2. Test Organization
- One test file per component/service
- Group tests by functionality
- Use `beforeEach` for common setup

### 3. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify side effects

### 4. Mocking
- Mock external dependencies
- Use spies for method calls
- Verify mock interactions

### 5. Async Testing
- Use `async`/`await` for promises
- Use `fakeAsync`/`tick` for timers
- Use `flush` for observables

## Running Tests

### Development
```bash
# Run tests in watch mode
npm run test

# Run specific test file
ng test --include="**/socket.service.spec.ts"
```

### CI/CD
```bash
# Run tests in CI mode
npm run test:ci

# Run tests with coverage
npm run test:coverage
```

### E2E Testing
```bash
# Run E2E tests
npm run e2e

# Run E2E tests in CI mode
npm run e2e:ci
```

## Coverage Reports

### Viewing Coverage
After running `npm run test:coverage`, open `coverage/index.html` in your browser.

### Coverage Targets
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Debugging Tests

### Debug Mode
```bash
# Run tests in debug mode
ng test --watch --source-map
```

### Browser Debugging
- Use `browser.pause()` in E2E tests
- Use `debugger` in unit tests
- Use browser dev tools

## Common Issues

### 1. Async Issues
- Use `fakeAsync` for timers
- Use `flush` for observables
- Use `async`/`await` for promises

### 2. Mock Issues
- Ensure mocks are properly configured
- Verify mock method calls
- Reset mocks between tests

### 3. Component Issues
- Ensure proper imports
- Mock dependencies
- Use `detectChanges()` for template updates

## Continuous Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci

- name: Run E2E Tests
  run: npm run e2e:ci
```

### Test Reports
- Unit test results
- Coverage reports
- E2E test results
- Performance metrics

## Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Protractor Documentation](https://www.protractortest.org/)
- [Karma Documentation](https://karma-runner.github.io/)
