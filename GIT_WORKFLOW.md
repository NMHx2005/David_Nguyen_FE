# Frontend Git Workflow Configuration

## Frontend Git Setup

### Initialize Frontend Repository
```bash
cd "D:\Self learning\CODE WEB\CodeThue\David_Nguyen\Frontend_system\chat-system-frontend"
git init
```

### Frontend Git Configuration
```bash
# Set frontend-specific configuration
git config user.name "David Nguyen"
git config user.email "david.nguyen@example.com"
git config init.defaultBranch main

# Frontend-specific settings
git config core.autocrlf true
git config core.safecrlf true
git config merge.tool vscode
git config mergetool.keepBackup false
```

### Frontend Branch Strategy
```bash
# Main branches
main                    # Production-ready frontend code
develop                 # Integration branch for frontend features

# Frontend feature branches
feature/angular-services     # Angular services for API integration
feature/real-time-chat       # Real-time chat components
feature/video-calls-frontend # Video call frontend with PeerJS
feature/file-uploads-frontend # File upload components
feature/admin-frontend       # Admin dashboard frontend
feature/testing-frontend     # Frontend testing suite
feature/auth-components      # Authentication components
feature/chat-components      # Chat and messaging components
feature/admin-components     # Admin management components
feature/shared-components    # Shared UI components
feature/socket-integration   # Socket.io client integration
feature/responsive-design    # Responsive design implementation

# Frontend hotfix branches
hotfix/auth-ui-bug          # Authentication UI fixes
hotfix/socket-connection    # Socket connection fixes
hotfix/video-call-ui        # Video call UI fixes

# Frontend release branches
release/frontend-v1.0.0     # Frontend release preparation
```

### Frontend Commit Message Convention
```
<type>(<scope>): <description>

Frontend-specific types:
- feat: New frontend feature
- fix: Frontend bug fix
- refactor: Frontend code refactoring
- test: Frontend tests
- docs: Frontend documentation
- chore: Frontend maintenance
- perf: Frontend performance improvements
- ui: UI changes
- component: Component changes
- service: Service changes
- style: Styling changes
- responsive: Responsive design changes
- socket: Socket.io client changes
- api: API integration changes

Examples:
feat(auth): add login component with validation
fix(chat): resolve message display issues
ui(admin): improve admin dashboard layout
component(chat): add real-time message component
service(api): implement user service
socket(chat): add typing indicators
test(components): add unit tests for auth components
```

## Frontend Git Workflow Implementation

### 1. Frontend Repository Setup
```bash
# Navigate to frontend directory
cd "D:\Self learning\CODE WEB\CodeThue\David_Nguyen\Frontend_system\chat-system-frontend"

# Create frontend .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs/
*.log

# Coverage directory
coverage/
.nyc_output/

# Angular specific
.angular/
tmp/
out-tsc/

# Test files
*.spec.js.map
*.test.js.map

# TypeScript build info
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/
EOF

# Create initial frontend commit
git add .
git commit -m "feat(frontend): initial frontend setup with Phase 2 requirements

- Add Angular frontend with Material Design
- Add Socket.io client for real-time communication
- Add PeerJS client for video calls
- Add file upload components
- Add authentication components
- Add admin dashboard frontend
- Add comprehensive testing suite
- Add responsive design
- Add TypeScript configuration
- Add component architecture"
```

### 2. Frontend Feature Development Workflow
```bash
# Create feature branch
git checkout -b feature/angular-services

# Make changes and commit frequently
git add src/app/services/auth.service.ts
git commit -m "service(auth): implement authentication service

- Add login/register methods
- Add JWT token management
- Add user state management
- Add HTTP interceptors
- Add error handling"

git add src/app/services/socket.service.ts
git commit -m "service(socket): implement Socket.io client service

- Add Socket.io client integration
- Add message event handling
- Add typing indicators
- Add connection management
- Add error handling"

git add src/app/services/
git commit -m "service(api): implement API integration services

- Add UserService for user operations
- Add GroupService for group management
- Add ChannelService for channel operations
- Add MessageService for messaging
- Add AdminService for admin operations"

# Merge feature branch
git checkout develop
git merge feature/angular-services --no-ff -m "Merge feature/angular-services: Angular services complete"
git branch -d feature/angular-services
```

### 3. Frontend Frequent Commits Strategy
```bash
# Component Commits
git add src/app/components/auth/Login/
git commit -m "component(auth): implement login component

- Add login form with validation
- Add error handling and display
- Add navigation logic
- Add responsive design
- Add accessibility features"

git add src/app/components/auth/Register/
git commit -m "component(auth): implement registration component

- Add registration form with validation
- Add password confirmation
- Add error handling
- Add success feedback
- Add responsive design"

git add src/app/components/chat/RealtimeChat/
git commit -m "component(chat): implement real-time chat component

- Add Socket.io integration
- Add message display and sending
- Add typing indicators
- Add user presence tracking
- Add file upload integration"

git add src/app/components/chat/Chat/
git commit -m "component(chat): implement chat component

- Add message display
- Add message actions
- Add avatar display
- Add responsive layout
- Add accessibility features"

# Service Commits
git add src/app/services/user.service.ts
git commit -m "service(user): implement user management service

- Add user CRUD operations
- Add profile management
- Add user search
- Add error handling
- Add caching"

git add src/app/services/group.service.ts
git commit -m "service(group): implement group management service

- Add group CRUD operations
- Add member management
- Add group search
- Add error handling
- Add real-time updates"

git add src/app/services/channel.service.ts
git commit -m "service(channel): implement channel management service

- Add channel CRUD operations
- Add member management
- Add channel search
- Add error handling
- Add real-time updates"

# Socket Integration Commits
git add src/app/services/socket.service.ts
git commit -m "socket(integration): implement Socket.io client integration

- Add connection management
- Add message broadcasting
- Add typing indicators
- Add user presence
- Add error handling"

git add src/app/components/chat/RealtimeChat/
git commit -m "socket(chat): integrate Socket.io with chat component

- Add real-time message updates
- Add typing indicators
- Add user join/leave notifications
- Add connection status
- Add error handling"

# Video Call Commits
git add src/app/services/video-call.service.ts
git commit -m "service(video): implement video call service

- Add PeerJS client integration
- Add call management
- Add call history
- Add error handling
- Add call statistics"

git add src/app/components/video-call/
git commit -m "component(video): implement video call components

- Add VideoCallComponent with PeerJS
- Add VideoCallButtonComponent
- Add WebRTC peer connection
- Add call UI and controls
- Add responsive design"

# File Upload Commits
git add src/app/services/upload.service.ts
git commit -m "service(upload): implement file upload service

- Add file upload operations
- Add progress tracking
- Add error handling
- Add file validation
- Add file management"

git add src/app/components/shared/Common/image-upload.component.ts
git commit -m "component(upload): implement file upload component

- Add drag-and-drop functionality
- Add file validation
- Add progress tracking
- Add error handling
- Add file preview"

# Admin Dashboard Commits
git add src/app/components/admin/Dashboard/
git commit -m "component(admin): implement admin dashboard

- Add system statistics display
- Add real-time data updates
- Add responsive layout
- Add accessibility features
- Add error handling"

git add src/app/components/admin/ManageUsers/
git commit -m "component(admin): implement user management

- Add user list display
- Add user operations
- Add user search and filtering
- Add responsive design
- Add accessibility features"

git add src/app/components/admin/ManageGroups/
git commit -m "component(admin): implement group management

- Add group list display
- Add group operations
- Add member management
- Add responsive design
- Add accessibility features"

# Testing Commits
git add src/app/components/auth/Login/login.component.spec.ts
git commit -m "test(component): add login component tests

- Add unit tests for login component
- Add service mocking
- Add error handling tests
- Add navigation tests
- Add accessibility tests"

git add src/app/components/chat/RealtimeChat/realtime-chat.component.spec.ts
git commit -m "test(component): add real-time chat component tests

- Add unit tests for chat component
- Add socket service mocking
- Add message handling tests
- Add typing indicator tests
- Add error handling tests"

git add e2e/src/app.e2e-spec.ts
git commit -m "test(e2e): add end-to-end tests

- Add authentication flow tests
- Add chat functionality tests
- Add admin panel tests
- Add responsive design tests
- Add accessibility tests"

# Documentation Commits
git add README.md
git commit -m "docs(frontend): add frontend documentation

- Add project overview
- Add component documentation
- Add service documentation
- Add testing guide
- Add deployment guide"

git add ARCHITECTURE.md
git commit -m "docs(architecture): add frontend architecture documentation

- Add component architecture
- Add service architecture
- Add routing structure
- Add state management
- Add testing strategy"
```

### 4. Frontend Release Workflow
```bash
# Create frontend release branch
git checkout -b release/frontend-v1.0.0

# Update version
git add package.json
git commit -m "chore(version): bump frontend version to 1.0.0

- Update package.json version
- Update Angular dependencies
- Update scripts"

# Final testing and bug fixes
git add src/app/components/auth/Login/login.component.ts
git commit -m "fix(auth): resolve login component issues

- Fix form validation
- Fix error handling
- Fix navigation logic
- Fix responsive design"

# Merge to main
git checkout main
git merge release/frontend-v1.0.0 --no-ff -m "Release frontend v1.0.0: Phase 2 Frontend Complete"
git tag -a frontend-v1.0.0 -m "Frontend Release v1.0.0

Phase 2 Frontend Implementation Complete:
✅ Angular frontend with Material Design
✅ Socket.io client integration
✅ Video call frontend with PeerJS
✅ File upload components
✅ Admin dashboard frontend
✅ Comprehensive testing suite
✅ Responsive design
✅ Authentication components
✅ Real-time chat components
✅ Complete documentation"

# Clean up
git branch -d release/frontend-v1.0.0
git checkout develop
git merge main
```

## Frontend Git Hooks

### Frontend Pre-commit Hook
```bash
# Create frontend pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh

echo "🔍 Running frontend pre-commit checks..."

# Check if we're in frontend directory
if [ ! -f "package.json" ] || [ ! -d "src/app" ]; then
    echo "❌ Error: Not in frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Warning: node_modules not found. Run 'npm install' first."
else
    # Run Angular build check
    echo "🔧 Running Angular build check..."
    ng build --configuration development || {
        echo "❌ Angular build failed"
        exit 1
    }
    
    # Run linting
    echo "🧹 Running Angular linting..."
    ng lint || {
        echo "❌ Angular linting failed"
        exit 1
    }
    
    # Run tests
    echo "🧪 Running frontend tests..."
    ng test --watch=false --browsers=ChromeHeadless || {
        echo "❌ Frontend tests failed"
        exit 1
    }
fi

echo "✅ Frontend pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit
```

### Frontend Commit Message Hook
```bash
# Create frontend commit-msg hook
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/sh

# Frontend-specific commit message validation
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ui|component|service|responsive|socket|api)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid frontend commit message format!"
    echo ""
    echo "📝 Required format: <type>(<scope>): <description>"
    echo ""
    echo "🔧 Frontend-specific types:"
    echo "  feat       - New frontend feature"
    echo "  fix        - Frontend bug fix"
    echo "  ui         - UI changes"
    echo "  component   - Component changes"
    echo "  service     - Service changes"
    echo "  responsive  - Responsive design changes"
    echo "  socket      - Socket.io client changes"
    echo "  api         - API integration changes"
    echo "  test        - Frontend tests"
    echo "  docs        - Frontend documentation"
    echo ""
    echo "📋 Examples:"
    echo "  feat(auth): add login component with validation"
    echo "  fix(chat): resolve message display issues"
    echo "  ui(admin): improve admin dashboard layout"
    echo "  component(chat): add real-time message component"
    echo "  service(api): implement user service"
    echo ""
    echo "💡 Your message: $(cat "$1")"
    exit 1
fi

echo "✅ Frontend commit message format is valid!"
EOF

chmod +x .git/hooks/commit-msg
```

## Frontend Git Aliases

```bash
# Frontend-specific git aliases
git config alias.frontend-feature '!f() { git checkout -b feature/$1; }; f'
git config alias.frontend-hotfix '!f() { git checkout -b hotfix/$1; }; f'
git config alias.frontend-release '!f() { git checkout -b release/frontend-$1; }; f'
git config alias.frontend-test '!f() { ng test --watch=false && git add . && git commit -m "test: $1"; }; f'
git config alias.frontend-build '!f() { ng build && git add dist/ && git commit -m "build: $1"; }; f'
git config alias.frontend-component '!f() { git add src/app/components/ && git commit -m "component: $1"; }; f'
git config alias.frontend-service '!f() { git add src/app/services/ && git commit -m "service: $1"; }; f'
git config alias.frontend-ui '!f() { git add src/app/components/ src/app/styles/ && git commit -m "ui: $1"; }; f'
git config alias.frontend-socket '!f() { git add src/app/services/socket.service.ts && git commit -m "socket: $1"; }; f'
```

## Frontend Daily Workflow

### Morning Routine
```bash
cd "D:\Self learning\CODE WEB\CodeThue\David_Nguyen\Frontend_system\chat-system-frontend"
git checkout develop
git pull origin develop
git status
git log --oneline -5
```

### Development Session
```bash
# Create feature branch
git checkout -b feature/daily-frontend-feature

# Make changes and commit frequently
git add src/app/components/
git commit -m "component(feature): implement daily component feature

- Add new component functionality
- Add responsive design
- Add accessibility features
- Add error handling"

git add src/app/services/
git commit -m "service(feature): implement daily service feature

- Add API integration
- Add error handling
- Add caching
- Add real-time updates"

# Push to remote
git push origin feature/daily-frontend-feature
```

### End of Day
```bash
# Review changes
git diff develop..HEAD

# Merge to develop
git checkout develop
git merge feature/daily-frontend-feature --no-ff -m "Merge feature/daily-frontend-feature: Daily frontend feature complete"
git push origin develop

# Clean up
git branch -d feature/daily-frontend-feature
```
