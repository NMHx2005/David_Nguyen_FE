# 📸 TÍNH NĂNG CHAT GỬI ẢNH VÀ VIDEO CALL - CHI TIẾT TỪNG FUNCTION

## 📖 MỤC LỤC

1. [Tính năng Chat Gửi Ảnh](#1-tính-năng-chat-gửi-ảnh)
2. [Tính năng Video Call](#2-tính-năng-video-call)
3. [Flow Diagrams](#3-flow-diagrams)
4. [Troubleshooting](#4-troubleshooting)

---

# 1. TÍNH NĂNG CHAT GỬI ẢNH

## 📊 Tổng Quan

**Files liên quan:**
```
Frontend:
├── image-upload.component.ts        # UI component cho upload
├── upload.service.ts                # Service xử lý upload
├── message.service.ts               # Service gửi message
└── chat.component.ts                # Component chat chính

Backend:
├── upload.middleware.ts             # Middleware xử lý file
├── upload.routes.ts                 # API routes
└── message.controller.ts            # Controller gửi message
```

**Tech Stack:**
- Frontend: Angular, RxJS
- Backend: Express, Multer, Sharp
- File Storage: Local filesystem (uploads/)

---

## 🔧 CHI TIẾT TỪNG FUNCTION

### FRONTEND - ImageUploadComponent

**File:** `Frontend_system/chat-system-frontend/src/app/components/shared/Common/image-upload.component.ts`

---

#### **Function 1: onFileSelected(event: Event)**

**Mục đích:** Xử lý khi user chọn file

**Code:**
```typescript
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) return;

  if (this.multiple) {
    this.handleMultipleFiles(Array.from(files));
  } else {
    this.handleSingleFile(files[0]);
  }
}
```

**Chi tiết từng dòng:**

| Dòng | Code | Làm gì | Giải thích |
|------|------|--------|------------|
| 1 | `const input = event.target as HTMLInputElement` | Type casting | Convert event.target về HTMLInputElement để access .files property |
| 2 | `const files = input.files` | Lấy files | FileList object chứa file(s) user chọn |
| 3 | `if (!files \|\| files.length === 0) return` | Validation | Nếu không có file → exit function |
| 4 | `if (this.multiple)` | Check mode | Multiple files hay single file? |
| 5 | `this.handleMultipleFiles(Array.from(files))` | Multiple mode | Convert FileList → Array rồi xử lý nhiều files |
| 6 | `this.handleSingleFile(files[0])` | Single mode | Xử lý 1 file duy nhất |

**Flow Diagram:**
```
User clicks "Upload Image" button
  ↓
File picker opens
  ↓
User selects image(s)
  ↓
onFileSelected() triggered
  ↓
  ├─> multiple = true?  → handleMultipleFiles()
  └─> multiple = false? → handleSingleFile()
```

---

#### **Function 2: handleSingleFile(file: File)**

**Mục đích:** Xử lý 1 file được chọn

**Code:**
```typescript
private handleSingleFile(file: File): void {
  if (!this.validateFile(file)) return;

  this.previewUrl = URL.createObjectURL(file);
  this.imageSelected.emit(file);
}
```

**Chi tiết từng dòng:**

| Dòng | Code | Làm gì | Technical Detail |
|------|------|--------|------------------|
| 1 | `if (!this.validateFile(file))` | Validate file | Check type & size |
| 2 | `return` | Exit nếu invalid | Stop processing |
| 3 | `URL.createObjectURL(file)` | Tạo preview URL | Tạo blob:// URL để preview image |
| 4 | `this.previewUrl = ...` | Store URL | Assign to component property |
| 5 | `this.imageSelected.emit(file)` | Emit event | Gửi File object cho parent component |

**createObjectURL() là gì?**
```javascript
Input: File object (binary data)
  ↓
URL.createObjectURL(file)
  ↓
Output: "blob:http://localhost:4200/abc-123-def-456"
  ↓
Usage: <img [src]="previewUrl">
  ↓
Browser hiển thị image từ memory (không cần upload server!)
```

**Memory Management:**
```javascript
// Create URL
this.previewUrl = URL.createObjectURL(file);
// Memory allocated ✅

// MUST revoke when done!
URL.revokeObjectURL(this.previewUrl);
// Memory freed ✅

// If not revoked → Memory leak! ❌
```

---

#### **Function 3: validateFile(file: File)**

**Mục đích:** Validate file type và size

**Code:**
```typescript
private validateFile(file: File): boolean {
  // Check file type
  if (!this.allowedTypes.includes(file.type)) {
    this.snackBar.open(
      `File type ${file.type} is not allowed`, 
      'Close', 
      { duration: 3000 }
    );
    return false;
  }

  // Check file size
  if (file.size > this.maxSize) {
    this.snackBar.open(
      `File size must be less than ${this.maxSize / (1024 * 1024)}MB`, 
      'Close', 
      { duration: 3000 }
    );
    return false;
  }

  return true;
}
```

**Chi tiết validation:**

**Step 1: Check File Type**
```javascript
file.type = "image/jpeg"
allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

Check: allowedTypes.includes(file.type)
  ↓
Result: true ✅ → Continue
```

**Step 2: Check File Size**
```javascript
file.size = 3145728 (bytes)  // 3MB
maxSize = 5242880 (bytes)    // 5MB default

Check: file.size > maxSize
  ↓
3145728 > 5242880 = false
  ↓
Result: Valid ✅ → Continue
```

**Error Cases:**
```javascript
// Case 1: Wrong type
file.type = "application/pdf"
  ↓
allowedTypes.includes("application/pdf") = false
  ↓
Show snackbar: "File type application/pdf is not allowed"
  ↓
return false ❌

// Case 2: Too large
file.size = 10485760 (10MB)
maxSize = 5242880 (5MB)
  ↓
10485760 > 5242880 = true
  ↓
Show snackbar: "File size must be less than 5MB"
  ↓
return false ❌
```

**Allowed Types:**
```
✅ image/jpeg  → .jpg, .jpeg
✅ image/png   → .png
✅ image/gif   → .gif
✅ image/webp  → .webp
❌ image/svg+xml (not allowed - security)
❌ image/bmp (not allowed - large size)
```

---

#### **Function 4: removeImage()**

**Mục đích:** Xóa image preview và reset input

**Code:**
```typescript
removeImage(): void {
  if (this.previewUrl) {
    URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
}
```

**Chi tiết từng bước:**

| Step | Code | Purpose | Memory Impact |
|------|------|---------|---------------|
| 1 | `if (this.previewUrl)` | Check exists | Avoid null error |
| 2 | `URL.revokeObjectURL(this.previewUrl)` | Free memory | Release blob URL từ memory |
| 3 | `this.previewUrl = null` | Clear reference | Set property to null |
| 4 | `this.fileInput.nativeElement.value = ''` | Reset input | Clear file input value để có thể chọn lại same file |

**Memory Leak Prevention:**
```
Without revoke:
  createObjectURL() → Blob URL created
  Image removed from UI
  Blob URL still in memory ❌
  Multiple uploads → Memory increases
  Eventually → Browser crash! ❌

With revoke:
  createObjectURL() → Blob URL created
  Image removed from UI
  revokeObjectURL() → Memory freed ✅
  Clean! No memory leaks! ✅
```

**Reset Input Value:**
```html
<input type="file" value="">
```

**Why reset?**
```
User selects: photo1.jpg
  ↓
Remove image
  ↓
User tries to select photo1.jpg AGAIN
  ↓
Without reset: onChange NOT triggered (same file)
With reset: onChange triggered ✅
```

---

### FRONTEND - UploadService

**File:** `Frontend_system/chat-system-frontend/src/app/services/upload.service.ts`

---

#### **Function 5: uploadImage(file: File, channelId?: string)**

**Mục đích:** Upload image to server

**Code:**
```typescript
uploadImage(file: File, channelId?: string): Observable<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);
  if (channelId) {
    formData.append('channelId', channelId);
  }

  return this.http.post<ImageUploadResponse>(
    `${this.API_URL}/image`, 
    formData, 
    {
      headers: {
        'Authorization': this.authService.getToken() 
          ? `Bearer ${this.authService.getToken()}` 
          : ''
      }
    }
  );
}
```

**Chi tiết từng dòng:**

| Dòng | Code | Làm gì | Technical Detail |
|------|------|--------|------------------|
| 1 | `const formData = new FormData()` | Create FormData | Container cho multipart/form-data |
| 2 | `formData.append('image', file)` | Append file | Add File object with key 'image' |
| 3 | `if (channelId)` | Optional param | Check if channelId provided |
| 4 | `formData.append('channelId', channelId)` | Add metadata | Backend có thể link image với channel |
| 5-9 | `this.http.post(...)` | HTTP POST | Send FormData to backend |
| 10-12 | `headers: { Authorization: ... }` | Auth header | JWT token cho authentication |

**FormData Explained:**
```javascript
// FormData creates multipart/form-data request

const formData = new FormData();
formData.append('image', file);
formData.append('channelId', 'channel-123');

// HTTP Request:
POST /api/upload/image
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

[BINARY DATA OF IMAGE]
------WebKitFormBoundary
Content-Disposition: form-data; name="channelId"

channel-123
------WebKitFormBoundary--
```

**Observable Pattern:**
```typescript
// Call uploadImage()
this.uploadService.uploadImage(file, channelId)
  .subscribe({
    next: (response) => {
      // Success!
      console.log('Image uploaded:', response.data.imageUrl);
    },
    error: (error) => {
      // Failed!
      console.error('Upload failed:', error);
    }
  });
```

---

#### **Function 6: uploadImageWithProgress(file: File, channelId?: string)**

**Mục đích:** Upload với progress tracking

**Code:**
```typescript
uploadImageWithProgress(
  file: File, 
  channelId?: string
): Observable<{ progress?: UploadProgress; response?: ImageUploadResponse }> {
  
  const formData = new FormData();
  formData.append('image', file);
  if (channelId) {
    formData.append('channelId', channelId);
  }

  return this.http.post<ImageUploadResponse>(
    `${this.API_URL}/image`, 
    formData, 
    {
      headers: {
        'Authorization': this.authService.getToken() 
          ? `Bearer ${this.authService.getToken()}` 
          : ''
      },
      reportProgress: true,
      observe: 'events'
    }
  ).pipe(
    map((event: HttpEvent<ImageUploadResponse>) => {
      if (event.type === HttpEventType.UploadProgress) {
        const progress = event.total 
          ? Math.round((100 * event.loaded) / event.total) 
          : 0;
        return { progress: { loaded: event.loaded, total: event.total || 0, percentage: progress } };
      } else if (event.type === HttpEventType.Response) {
        return { response: event.body || undefined };
      }
      return {};
    })
  );
}
```

**Chi tiết HTTP Events:**

**HttpEventType explained:**
```typescript
enum HttpEventType {
  Sent = 0,              // Request được gửi
  UploadProgress = 1,    // Upload đang progress
  ResponseHeader = 2,    // Nhận được response headers
  DownloadProgress = 3,  // Download đang progress
  Response = 4,          // Nhận được full response
  User = 5              // Custom event
}
```

**Progress Tracking:**
```javascript
Upload 5MB image:

Event 1: UploadProgress
  loaded: 524288 (512KB)
  total: 5242880 (5MB)
  percentage: 10%
    ↓ emit progress

Event 2: UploadProgress
  loaded: 1048576 (1MB)
  total: 5242880 (5MB)
  percentage: 20%
    ↓ emit progress

... (continues)

Event 10: UploadProgress
  loaded: 5242880 (5MB)
  total: 5242880 (5MB)
  percentage: 100%
    ↓ emit progress

Event 11: Response
  body: { success: true, data: { imageUrl: "..." } }
    ↓ emit response
```

**UI Update:**
```typescript
this.uploadService.uploadImageWithProgress(file, channelId)
  .subscribe({
    next: (result) => {
      if (result.progress) {
        // Update progress bar
        this.uploadProgress = result.progress.percentage;
      }
      if (result.response) {
        // Upload complete!
        this.imageUrl = result.response.data.imageUrl;
      }
    }
  });
```

**Progress Bar UI:**
```
Uploading... 45%
████████████░░░░░░░░░░░░░░
```

---

#### **Function 7: validateFile(file: File)**

**Đã giải thích chi tiết ở trên** (Function 3)

**Bổ sung:**

**File Properties:**
```javascript
File object properties:
{
  name: "vacation-photo.jpg",
  size: 3145728,              // 3MB in bytes
  type: "image/jpeg",         // MIME type
  lastModified: 1696723200000, // Timestamp
  webkitRelativePath: ""      // For folder uploads
}
```

**Validation Logic:**
```javascript
Validate Type:
  ✅ image/jpeg → PASS
  ✅ image/png  → PASS
  ❌ video/mp4  → FAIL

Validate Size:
  file.size = 3MB
  maxSize = 5MB
  ✅ 3MB < 5MB → PASS

  file.size = 8MB
  maxSize = 5MB
  ❌ 8MB > 5MB → FAIL
```

---

### FRONTEND - MessageService

**File:** `Frontend_system/chat-system-frontend/src/app/services/message.service.ts`

---

#### **Function 8: sendImageMessage(channelId, imageUrl, fileName, fileSize)**

**Mục đích:** Tạo message type 'image' sau khi upload xong

**Code:**
```typescript
sendImageMessage(
  channelId: string, 
  imageUrl: string, 
  fileName?: string, 
  fileSize?: number
): Observable<MessageResponse> {
  
  return this.createMessage({
    channelId,
    text: '',              // Empty text for image messages
    type: 'image',         // Message type
    imageUrl,              // URL returned from upload
    fileName,              // Original filename
    fileSize               // File size in bytes
  });
}
```

**Chi tiết parameters:**

| Parameter | Type | Required | Example | Purpose |
|-----------|------|----------|---------|---------|
| `channelId` | string | ✅ Yes | "channel-123" | Channel để gửi message |
| `imageUrl` | string | ✅ Yes | "/uploads/images/photo-123.jpg" | URL từ upload API |
| `fileName` | string | ❌ No | "vacation.jpg" | Original filename |
| `fileSize` | number | ❌ No | 3145728 | Size in bytes (for display) |

**createMessage() Internal:**
```typescript
private createMessage(data: any): Observable<MessageResponse> {
  return this.http.post<MessageResponse>(
    `${this.API_URL}`,  // POST /api/messages
    {
      channelId: data.channelId,
      text: data.text || '',
      type: data.type || 'text',
      imageUrl: data.imageUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      userId: this.currentUser.id,
      username: this.currentUser.username
    },
    {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
}
```

**API Request:**
```json
POST /api/messages
Headers: {
  "Authorization": "Bearer eyJhbGc...",
  "Content-Type": "application/json"
}
Body: {
  "channelId": "channel-123",
  "text": "",
  "type": "image",
  "imageUrl": "/uploads/images/photo-1696723200-abc123.jpg",
  "fileName": "vacation.jpg",
  "fileSize": 3145728,
  "userId": "user-456",
  "username": "john_doe"
}
```

---

### BACKEND - Upload Middleware

**File:** `Backend_system/src/middleware/upload.middleware.ts`

---

#### **Function 9: uploadImage (Multer Config)**

**Mục đích:** Configure Multer cho image uploads

**Code:**
```typescript
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB limit
    files: 3                     // Max 3 images
  },
  fileFilter: imageFilter
});
```

**Chi tiết config:**

**Storage Configuration:**
```typescript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;

    if (file.fieldname === 'avatar') {
      uploadPath = avatarsDir;     // uploads/avatars/
    } else if (file.fieldname === 'image') {
      uploadPath = imagesDir;      // uploads/images/
    } else {
      uploadPath = filesDir;       // uploads/files/
    }

    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});
```

**Filename Generation:**
```javascript
Original file: "vacation-photo.jpg"
  ↓
Extract name: "vacation-photo"
Extract ext: ".jpg"
  ↓
Generate suffix: Date.now() = 1696723200
                 Random = 123456789
  ↓
uniqueSuffix = "1696723200-123456789"
  ↓
Final filename: "vacation-photo-1696723200-123456789.jpg"
  ↓
Full path: "uploads/images/vacation-photo-1696723200-123456789.jpg"
```

**Why unique filenames?**
```
Problem: 2 users upload "photo.jpg"
  User A: photo.jpg → Saved
  User B: photo.jpg → OVERWRITES User A's file! ❌

Solution: Unique filenames
  User A: photo-1696723200-123.jpg ✅
  User B: photo-1696723201-456.jpg ✅
  Both files safe!
```

---

#### **Function 10: imageFilter()**

**Mục đích:** Filter chỉ cho phép image files

**Code:**
```typescript
const imageFilter = (
  req: any, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);   // Accept file
  } else {
    cb(new Error('Only image files are allowed!'));  // Reject file
  }
};
```

**Chi tiết:**

**Multer File Object:**
```typescript
file = {
  fieldname: 'image',
  originalname: 'vacation.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 3145728,
  destination: 'uploads/images/',
  filename: 'vacation-1696723200-123.jpg',
  path: 'uploads/images/vacation-1696723200-123.jpg'
}
```

**MIME Type Check:**
```javascript
Accepted:
  'image/jpeg'.startsWith('image/') = true ✅
  'image/png'.startsWith('image/') = true ✅
  'image/gif'.startsWith('image/') = true ✅

Rejected:
  'video/mp4'.startsWith('image/') = false ❌
  'application/pdf'.startsWith('image/') = false ❌
  'text/plain'.startsWith('image/') = false ❌
```

**Callback Pattern:**
```typescript
cb(null, true)   // Accept: error=null, accept=true
cb(error, false) // Reject: error=Error object, accept=false
```

---

### BACKEND - Upload Route

**File:** `Backend_system/src/routes/upload.routes.ts`

---

#### **Route: POST /api/upload/image**

**Code:**
```typescript
router.post('/image', uploadImage.single('image'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const fileUrl = getFileUrl(req, req.file.path);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
}, handleUploadError);
```

**Chi tiết Flow:**

**Step 1: Multer Middleware**
```
Request arrives: POST /api/upload/image
  ↓
Multer middleware: uploadImage.single('image')
  ↓
Process FormData:
  1. Extract file from field 'image'
  2. Validate with imageFilter()
  3. Check file size (< 5MB)
  4. Save to disk: uploads/images/
  5. Add req.file object
  ↓
Continue to route handler
```

**Step 2: Validate File Exists**
```typescript
if (!req.file) {
  // File không được upload (validation failed hoặc missing)
  return 400 Bad Request
}
```

**Step 3: Generate File URL**
```typescript
const fileUrl = getFileUrl(req, req.file.path);

function getFileUrl(req, filePath) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  // "http://localhost:3000"
  
  const relativePath = filePath.replace(/\\/g, '/').replace(/.*\/uploads\//, '/uploads/');
  // "uploads/images/photo-123.jpg" → "/uploads/images/photo-123.jpg"
  
  return `${baseUrl}${relativePath}`;
  // "http://localhost:3000/uploads/images/photo-123.jpg"
}
```

**Step 4: Return Response**
```json
Status: 200 OK
Body: {
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "http://localhost:3000/uploads/images/vacation-1696723200-123.jpg",
    "filename": "vacation-1696723200-123.jpg",
    "originalName": "vacation.jpg",
    "size": 3145728,
    "mimeType": "image/jpeg"
  }
}
```

---

## 📸 COMPLETE IMAGE UPLOAD FLOW

### Full Journey: User chọn ảnh → Hiển thị trong chat

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Interaction (Frontend)                         │
└─────────────────────────────────────────────────────────────┘
User trong chat interface
  ↓
Click image icon button 📷
  ↓
file-input.click() triggered
  ↓
File picker dialog opens
  ↓
User selects: "vacation.jpg" (3MB)

┌─────────────────────────────────────────────────────────────┐
│ STEP 2: File Validation (Frontend)                          │
└─────────────────────────────────────────────────────────────┘
onFileSelected() triggered
  ↓
validateFile(file)
  ├─> Check type: "image/jpeg" ✅
  └─> Check size: 3MB < 5MB ✅
  ↓
Validation PASSED

┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Preview Generation (Frontend)                       │
└─────────────────────────────────────────────────────────────┘
URL.createObjectURL(file)
  ↓
Returns: "blob:http://localhost:4200/abc-123-def"
  ↓
this.previewUrl = blob URL
  ↓
Template updates: <img [src]="previewUrl">
  ↓
User sees preview thumbnail

┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Upload to Server (Frontend → Backend)               │
└─────────────────────────────────────────────────────────────┘
uploadService.uploadImageWithProgress(file, channelId)
  ↓
Create FormData:
  - Append file
  - Append channelId metadata
  ↓
HTTP POST /api/upload/image
  Headers: { Authorization: "Bearer token..." }
  Body: multipart/form-data with file
  ↓
Track progress: 0% → 25% → 50% → 75% → 100%
  ↓
Progress bar updates in real-time

┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Server Processing (Backend)                         │
└─────────────────────────────────────────────────────────────┘
Express receives request
  ↓
Multer middleware: uploadImage.single('image')
  ↓
Extract file from multipart data
  ↓
Validate:
  ├─> Type: image/* ✅
  ├─> Size: < 5MB ✅
  └─> File exists ✅
  ↓
Save to disk:
  Path: uploads/images/vacation-1696723200-123.jpg
  ↓
Add req.file object:
  {
    filename: "vacation-1696723200-123.jpg",
    path: "uploads/images/vacation-1696723200-123.jpg",
    size: 3145728,
    mimetype: "image/jpeg"
  }
  ↓
Continue to route handler

┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Generate Response (Backend)                         │
└─────────────────────────────────────────────────────────────┘
getFileUrl(req, req.file.path)
  ↓
Returns: "http://localhost:3000/uploads/images/vacation-1696723200-123.jpg"
  ↓
Build response object:
  {
    success: true,
    data: {
      imageUrl: "http://localhost:3000/uploads/images/...",
      filename: "vacation-1696723200-123.jpg",
      originalName: "vacation.jpg",
      size: 3145728,
      mimeType: "image/jpeg"
    }
  }
  ↓
Send response: 200 OK

┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Create Message (Frontend)                           │
└─────────────────────────────────────────────────────────────┘
Upload complete! Response received
  ↓
Extract imageUrl from response
  ↓
messageService.sendImageMessage(
  channelId,
  imageUrl,
  fileName,
  fileSize
)
  ↓
HTTP POST /api/messages
  Body: {
    "channelId": "channel-123",
    "text": "",
    "type": "image",
    "imageUrl": "http://localhost:3000/uploads/images/...",
    "fileName": "vacation.jpg",
    "fileSize": 3145728
  }

┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Save Message (Backend)                              │
└─────────────────────────────────────────────────────────────┘
POST /api/messages received
  ↓
messageController.createMessage()
  ↓
MongoDB insert:
  {
    _id: ObjectId("..."),
    channelId: ObjectId("channel-123"),
    userId: ObjectId("user-456"),
    username: "john_doe",
    text: "",
    type: "image",
    imageUrl: "/uploads/images/vacation-1696723200-123.jpg",
    fileName: "vacation.jpg",
    fileSize: 3145728,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  ↓
Return message object

┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Broadcast via Socket.io (Backend)                   │
└─────────────────────────────────────────────────────────────┘
Message saved successfully
  ↓
Socket.io emit to channel:
  io.to(channelId).emit('message:new', messageData)
  ↓
All users in channel receive event

┌─────────────────────────────────────────────────────────────┐
│ STEP 10: Display in Chat (Frontend)                         │
└─────────────────────────────────────────────────────────────┘
SocketService receives 'message:new' event
  ↓
chatComponent.messages.push(newMessage)
  ↓
Template updates:
  <div class="message-item image-message">
    <div class="message-header">
      <span class="username">john_doe</span>
      <span class="timestamp">10:30 AM</span>
    </div>
    <img [src]="message.imageUrl" 
         alt="vacation.jpg" 
         class="message-image"
         (click)="openImageModal(message.imageUrl)">
    <div class="image-info">
      <span>📷 vacation.jpg</span>
      <span>3.0 MB</span>
    </div>
  </div>
  ↓
User sees image in chat! ✅
```

---

## 🎬 COMPLETE FLOW DIAGRAM

```
USER ACTION                    FRONTEND                         BACKEND                        DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Click 📷               →    fileInput.click()
                               ↓
2. Select image          →    onFileSelected(event)
                               ↓
3. File picked           →    validateFile(file)
                               ├─> Type check ✅
                               └─> Size check ✅
                               ↓
4. Preview shown         →    URL.createObjectURL()
                               ↓
                               previewUrl displayed
                               ↓
5. Click Send            →    uploadService.uploadImage()
                               ↓
                               FormData created
                               ↓
                               HTTP POST request
                               ↓
                               Progress: 0%...100%     →     Express server
                                                              ↓
                                                         Multer middleware
                                                              ↓
                                                         Extract file
                                                              ↓
                                                         Save to disk
                                                              ↓
                                                         Return file URL
                               ↓
6. Upload complete       ←    Response received
                               ↓
                               imageUrl = response.data.imageUrl
                               ↓
7. Send message          →    sendImageMessage()
                               ↓
                               HTTP POST /api/messages   →   Message controller
                                                              ↓
                                                         Create message       →  MongoDB
                                                              ↓                     ↓
                                                         Socket.io broadcast  Insert doc
                               ↓
8. Receive broadcast     ←    socket.on('message:new')
                               ↓
                               messages.push(newMessage)
                               ↓
9. Display image         →    Template renders
                               ↓
                               <img [src]="imageUrl">
                               ↓
10. Image visible! ✅
```

---

# 2. TÍNH NĂNG VIDEO CALL

## 📊 Tổng Quan

**Files liên quan:**
```
Frontend:
├── video-call.component.ts          # Main video call UI
├── video-call-button.component.ts   # Call button
├── peerjs.service.ts                # PeerJS wrapper
├── webrtc.service.ts                # WebRTC low-level
└── socket.service.ts                # Signaling

Backend:
├── socket.server.ts                 # Socket.io handlers
├── video-call.controller.ts         # Call management
└── peerjs-server.js                 # PeerJS signaling server
```

**Tech Stack:**
- WebRTC: Peer-to-peer video/audio
- PeerJS: WebRTC wrapper (simplified API)
- Socket.io: Signaling channel
- STUN Servers: NAT traversal

---

## 🔧 CHI TIẾT TỪNG FUNCTION

### FRONTEND - PeerJSService

**File:** `Frontend_system/chat-system-frontend/src/app/services/peerjs.service.ts`

---

#### **Function 11: initializePeer()**

**Mục đích:** Khởi tạo PeerJS connection

**Code:**
```typescript
private initializePeer(): void {
  try {
    if (this.peer) {
      console.log('🔍 PeerJS - Already initialized, skipping');
      return;
    }

    // Generate unique peer ID
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    const userId = currentUser.id || 'anonymous';
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const peerId = `${userId}_${Date.now()}_${randomSuffix}`;

    console.log('🔍 PeerJS - Initializing with peer ID:', peerId);

    this.peer = new Peer(peerId, {
      host: 'localhost',
      port: 9000,
      path: '/peerjs',
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      }
    });

    // Setup event handlers
    this.peer.on('open', (id) => {
      console.log('🔍 PeerJS - Connected with ID:', id);
      this.updateConnectionState();
    });

    this.peer.on('call', (call: any) => {
      console.log('🔍 PeerJS - Incoming call from:', call.peer);
      this.answerIncomingCall(call);
    });

    this.peer.on('error', (error) => {
      console.error('🔍 PeerJS - Error:', error);
    });

  } catch (error) {
    console.error('🔍 PeerJS - Initialization failed:', error);
  }
}
```

**Chi tiết từng bước:**

**Step 1: Check Already Initialized**
```typescript
if (this.peer) {
  return;  // Already exists, skip
}
```

**Why check?**
```
Problem: Initialize twice
  ↓
2 PeerJS connections
  ↓
Conflicts, memory leaks! ❌

Solution: Singleton pattern
  ↓
Check if exists
  ↓
Only create if null ✅
```

**Step 2: Generate Unique Peer ID**
```typescript
const userId = "user-456"
const randomSuffix = Math.random().toString(36).substring(2, 8)
  // "ab3x9z"
const timestamp = Date.now()
  // 1696723200123

peerId = `${userId}_${timestamp}_${randomSuffix}`
  // "user-456_1696723200123_ab3x9z"
```

**Why unique ID?**
```
User A: "user-456_1696723200123_ab3x9z"
User B: "user-789_1696723200124_cd5m2n"

Different IDs:
  ✅ No conflicts
  ✅ Can connect to each other
  ✅ Multiple sessions (same user, different tabs)
```

**Step 3: Create Peer Object**
```typescript
this.peer = new Peer(peerId, { options })
```

**PeerJS Options:**

| Option | Value | Purpose |
|--------|-------|---------|
| `host` | `localhost` | PeerJS server address |
| `port` | `9000` | PeerJS server port |
| `path` | `/peerjs` | Server endpoint path |
| `debug` | `0` | Debug level (0=none, 3=all) |
| `config.iceServers` | STUN servers | NAT traversal servers |

**ICE Servers (STUN):**
```
What is STUN?
  Session Traversal Utilities for NAT
  
Purpose:
  Help peers find each other's public IP addresses
  
Example:
  User A behind router:
    Private IP: 192.168.1.100
    Public IP: ?
    ↓
  Connect to STUN server
    ↓
  STUN returns: "Your public IP is 203.45.67.89"
    ↓
  User A can now tell User B: "Connect to me at 203.45.67.89"
```

**Step 4: Setup Event Handlers**

**Event: 'open'**
```typescript
this.peer.on('open', (id) => {
  console.log('Connected with ID:', id);
});
```
- Fired when: Connection to PeerJS server established
- Parameter `id`: Confirmed peer ID
- Action: Update UI to show "Ready for calls"

**Event: 'call'**
```typescript
this.peer.on('call', (call) => {
  console.log('Incoming call from:', call.peer);
  this.answerIncomingCall(call);
});
```
- Fired when: Another peer calls you
- Parameter `call`: MediaConnection object
- Action: Answer the call automatically

**Event: 'error'**
```typescript
this.peer.on('error', (error) => {
  console.error('PeerJS Error:', error);
});
```
- Fired when: Connection errors
- Common errors:
  - `peer-unavailable`: Peer not online
  - `server-error`: Can't connect to PeerJS server
  - `network`: Network issues

---

#### **Function 12: startCall(peerId: string)**

**Mục đích:** Bắt đầu video call với user khác

**Code:**
```typescript
async startCall(peerId: string): Promise<boolean> {
  try {
    if (!this.isPeerJSAvailable()) {
      console.error('🔍 PeerJS - PeerJS not available');
      return false;
    }

    // Get user media (camera + microphone)
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    // Make the call
    const call = (this.peer as any).call(peerId, this.localStream);

    if (!call) {
      console.error('🔍 PeerJS - Failed to create call');
      return false;
    }

    this.currentCall = call;

    // Handle remote stream
    call.on('stream', (remoteStream: MediaStream) => {
      console.log('🔍 PeerJS - Received remote stream');
      this.callEventSubject.next({
        type: 'call_answered',
        data: { remoteStream, call }
      });
    });

    // Handle call end
    call.on('close', () => {
      console.log('🔍 PeerJS - Call ended');
      this.endCall();
    });

    // Handle errors
    call.on('error', (error: any) => {
      console.error('🔍 PeerJS - Call error:', error);
      this.endCall();
    });

    return true;

  } catch (error) {
    console.error('🔍 PeerJS - Failed to start call:', error);
    return false;
  }
}
```

**Chi tiết từng bước:**

**Step 1: Check PeerJS Available**
```typescript
if (!this.isPeerJSAvailable()) {
  return false;
}

isPeerJSAvailable(): boolean {
  return this.isPeerJSEnabled && this.peer !== null;
}
```

**Step 2: Get User Media**
```typescript
this.localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
```

**getUserMedia() explained:**
```
Browser API for camera/microphone access

Request:
  video: true  → Access camera
  audio: true  → Access microphone
  ↓
Browser shows permission prompt:
  ┌─────────────────────────────────────┐
  │ Allow "Chat System" to use:         │
  │ • Your camera                       │
  │ • Your microphone                   │
  │                                     │
  │ [Block]  [Allow]                    │
  └─────────────────────────────────────┘
  ↓
User clicks "Allow"
  ↓
Returns: MediaStream object
  {
    id: "stream-abc123",
    active: true,
    getTracks(): [VideoTrack, AudioTrack],
    getVideoTracks(): [VideoTrack],
    getAudioTracks(): [AudioTrack]
  }
  ↓
this.localStream = MediaStream
  ↓
Can display in <video> element:
  <video [srcObject]="localStream" autoplay></video>
```

**Advanced Constraints:**
```typescript
// Basic
getUserMedia({ video: true, audio: true })

// Advanced
getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: "user"  // Front camera
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
})
```

**Step 3: Call Peer**
```typescript
const call = this.peer.call(peerId, this.localStream);
```

**What happens:**
```
User A calls User B:

User A (you):
  peer.call("user-B-id", localStream)
    ↓
  Send call request via PeerJS server
    ↓
  Package: {
    from: "user-A-id",
    to: "user-B-id",
    offer: { SDP },
    stream: localStream
  }

User B (receiver):
  peer.on('call', (call) => {
    // Receives call object
    call.answer(theirLocalStream);
  })
    ↓
  Send answer back via PeerJS server
    ↓
  Package: {
    from: "user-B-id",
    to: "user-A-id",
    answer: { SDP },
    stream: theirLocalStream
  }

Connection established!
  ↓
User A sees: User B's video
User B sees: User A's video
```

**SDP (Session Description Protocol):**
```
Offer SDP:
  v=0
  o=- 123456789 2 IN IP4 127.0.0.1
  s=-
  t=0 0
  a=group:BUNDLE 0 1
  m=video 9 UDP/TLS/RTP/SAVPF 96
  a=rtpmap:96 VP8/90000
  m=audio 9 UDP/TLS/RTP/SAVPF 111
  a=rtpmap:111 opus/48000/2

Contains:
  - Media capabilities (video codecs, audio codecs)
  - Network info
  - Encryption keys
```

**Step 4: Handle Remote Stream**
```typescript
call.on('stream', (remoteStream: MediaStream) => {
  this.callEventSubject.next({
    type: 'call_answered',
    data: { remoteStream, call }
  });
});
```

**Event Flow:**
```
Call answered by remote peer
  ↓
WebRTC connection established
  ↓
Remote peer's stream arrives
  ↓
'stream' event fired
  ↓
Emit to callEvents$ observable
  ↓
VideoCallComponent subscribes:
  this.peerService.callEvents$.subscribe(event => {
    if (event.type === 'call_answered') {
      this.remoteStream = event.data.remoteStream;
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    }
  });
  ↓
Remote video displays in UI! ✅
```

---

#### **Function 13: answerIncomingCall(call)**

**Mục đích:** Trả lời cuộc gọi đến

**Code:**
```typescript
private async answerIncomingCall(call: any): Promise<void> {
  try {
    // Get local media stream
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
    }

    // Answer the call with local stream
    call.answer(this.localStream);

    // Handle remote stream
    call.on('stream', (remoteStream: MediaStream) => {
      console.log('🔍 PeerJS - Received remote stream');
      this.callEventSubject.next({
        type: 'call_answered',
        data: { remoteStream, call }
      });
    });

    // Handle call close
    call.on('close', () => {
      this.endCall();
    });

  } catch (error) {
    console.error('🔍 PeerJS - Failed to answer call:', error);
  }
}
```

**Chi tiết Flow:**

```
User B receives call from User A
  ↓
peer.on('call', (call) => {
  answerIncomingCall(call);
})
  ↓
Step 1: Get local media
  if (!localStream) {
    localStream = await getUserMedia();
  }
  ↓
Step 2: Answer với local stream
  call.answer(localStream)
  ↓
  Sends to User A:
    - Answer SDP
    - Local stream tracks
  ↓
Step 3: Wait for remote stream
  call.on('stream', (remoteStream) => {
    // User A's video/audio arrives
    this.remoteStream = remoteStream;
  })
  ↓
Connection complete!
  User A sees: User B's video
  User B sees: User A's video
```

**call.answer() explained:**
```javascript
// Caller side (User A)
const call = peer.call("user-B-id", localStream);
  ↓ Sends: Offer

// Receiver side (User B)
peer.on('call', (call) => {
  call.answer(localStream);
  ↓ Sends: Answer
});

// Offer-Answer Exchange:
User A → [Offer] → PeerJS Server → User B
User B → [Answer] → PeerJS Server → User A
  ↓
WebRTC connection established!
```

---

#### **Function 14: endCall()**

**Mục đích:** Kết thúc cuộc gọi và cleanup

**Code:**
```typescript
endCall(): void {
  console.log('🔍 PeerJS - Ending call');

  // Stop local stream tracks
  if (this.localStream) {
    this.localStream.getTracks().forEach(track => {
      track.stop();
    });
    this.localStream = null;
  }

  // Close current call
  if (this.currentCall) {
    this.currentCall.close();
    this.currentCall = null;
  }

  // Emit call ended event
  this.callEventSubject.next({
    type: 'call_ended',
    data: null
  });
}
```

**Chi tiết Cleanup:**

**Step 1: Stop Media Tracks**
```typescript
this.localStream.getTracks()
  ↓
Returns: [VideoTrack, AudioTrack]
  ↓
forEach(track => track.stop())
  ↓
VideoTrack.stop()
  └─> Camera LED turns OFF 📷❌
  ↓
AudioTrack.stop()
  └─> Microphone muted 🎤❌
  ↓
Devices released! User can use in other apps
```

**MediaStreamTrack.stop():**
```
Before stop():
  track.readyState = "live"
  Camera: ON 📷✅
  Microphone: ON 🎤✅

After stop():
  track.readyState = "ended"
  Camera: OFF 📷❌
  Microphone: OFF 🎤❌
  
Devices freed for other apps! ✅
```

**Step 2: Close PeerJS Call**
```typescript
this.currentCall.close()
```

**What happens:**
```
call.close()
  ↓
Send close signal to remote peer
  ↓
Close RTCPeerConnection
  ↓
Stop receiving remote stream
  ↓
Cleanup WebRTC resources
```

**Step 3: Emit Event**
```typescript
this.callEventSubject.next({
  type: 'call_ended',
  data: null
});
```

**Subscribers receive:**
```
videoCallComponent.ngOnInit():
  this.peerService.callEvents$.subscribe(event => {
    if (event.type === 'call_ended') {
      this.showCallInterface = false;
      this.remoteStream = null;
      this.showNotification('Call ended');
    }
  });
```

---

#### **Function 15: toggleAudio()** 

**Mục đích:** Bật/tắt microphone

**Code:**
```typescript
toggleAudio(): void {
  if (this.localStream) {
    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    
    this.isAudioEnabled = !this.isAudioEnabled;
    console.log('🔍 PeerJS - Audio toggled:', this.isAudioEnabled);
  }
}
```

**Chi tiết:**

**MediaStreamTrack Properties:**
```typescript
AudioTrack {
  kind: "audio",
  label: "Microphone (Built-in)",
  enabled: true,          // ← Toggle this!
  muted: false,
  readyState: "live"
}
```

**Toggle Logic:**
```javascript
Initial state:
  track.enabled = true   // Mic ON 🎤✅
  User hears: Your voice

Click mute button:
  track.enabled = !track.enabled
  ↓
  track.enabled = false  // Mic OFF 🎤❌
  User hears: Silence

Click unmute button:
  track.enabled = !track.enabled
  ↓
  track.enabled = true   // Mic ON 🎤✅
  User hears: Your voice again
```

**Difference: enabled vs stop():**
```
track.enabled = false:
  ✅ Temporary mute
  ✅ Can unmute: enabled = true
  ✅ Device still in use
  ✅ Reversible

track.stop():
  ❌ Permanent stop
  ❌ Cannot restart
  ❌ Device released
  ❌ Not reversible (need getUserMedia again)
```

**UI Update:**
```html
<button (click)="toggleAudio()">
  <mat-icon>{{ isAudioEnabled ? 'mic' : 'mic_off' }}</mat-icon>
</button>
```

---

#### **Function 16: toggleVideo()**

**Mục đích:** Bật/tắt camera

**Code:**
```typescript
toggleVideo(): void {
  if (this.localStream) {
    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    
    this.isVideoEnabled = !this.isVideoEnabled;
    console.log('🔍 PeerJS - Video toggled:', this.isVideoEnabled);
  }
}
```

**Similar to toggleAudio():**

```javascript
Initial: Camera ON 📷✅
  ↓
Click "Turn off camera"
  ↓
track.enabled = false
  ↓
Remote user sees: Black screen (your video stopped)
  ↓
Click "Turn on camera"
  ↓
track.enabled = true
  ↓
Remote user sees: Your video again! ✅
```

**Local Video Preview:**
```html
<video #localVideo 
       [srcObject]="localStream" 
       [style.opacity]="isVideoEnabled ? 1 : 0"
       muted 
       autoplay>
</video>
```

**CSS Trick:**
```css
/* When camera off, show placeholder */
.video-placeholder {
  display: block;
  opacity: 1;
}

video.camera-off {
  opacity: 0;  /* Hide video */
}
```

---

### BACKEND - Socket Server

**File:** `Backend_system/src/sockets/socket.server.ts`

---

#### **Function 17: handleVideoCallInitiate()**

**Mục đích:** Xử lý request bắt đầu call

**Code:**
```typescript
private async handleVideoCallInitiate(
  socket: AuthenticatedSocket, 
  data: { recipientId: string; channelId: string }
): Promise<void> {
  
  try {
    const { recipientId, channelId } = data;
    
    // Create video call record in database
    const callData = {
      callerId: socket.userId,
      recipientId: recipientId,
      channelId: channelId,
      status: 'ringing',
      startTime: new Date()
    };
    
    const call = await videoCallService.initiateCall(callData);
    
    // Notify recipient via Socket.io
    const recipientSocketId = this.getUserSocketId(recipientId);
    if (recipientSocketId) {
      this.io.to(recipientSocketId).emit('video_call_incoming', {
        callId: call._id,
        callerId: socket.userId,
        callerName: socket.username,
        channelId: channelId
      });
    }
    
    // Confirm to caller
    socket.emit('video_call_initiated', {
      callId: call._id,
      status: 'ringing'
    });
    
    console.log(`Video call initiated: ${socket.username} → ${recipientId}`);
    
  } catch (error) {
    console.error('Error initiating video call:', error);
    socket.emit('video_call_error', {
      message: 'Failed to initiate call'
    });
  }
}
```

**Chi tiết Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ User A clicks "Call" button                                  │
└─────────────────────────────────────────────────────────────┘
  ↓
Frontend emits socket event:
  socket.emit('video_call_initiate', {
    recipientId: "user-B-id",
    channelId: "channel-123"
  })
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend receives event
  ↓
handleVideoCallInitiate(socket, data)
  ↓
Step 1: Extract data
  {
    recipientId: "user-B-id",
    channelId: "channel-123"
  }
  ↓
Step 2: Create call record in MongoDB
  {
    _id: "call-789",
    callerId: "user-A-id",
    recipientId: "user-B-id",
    channelId: "channel-123",
    status: "ringing",
    startTime: "2025-10-08T10:30:00.000Z"
  }
  ↓
Step 3: Find recipient's socket
  getUserSocketId("user-B-id")
    ↓
  Returns: "socket-xyz789"
  ↓
Step 4: Notify recipient
  io.to("socket-xyz789").emit('video_call_incoming', {
    callId: "call-789",
    callerId: "user-A-id",
    callerName: "User A"
  })
  ↓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User B's frontend receives event
  ↓
Show incoming call UI:
  ┌─────────────────────────────────────┐
  │ 📞 Incoming Call                    │
  │ From: User A                        │
  │                                     │
  │ [Reject]  [Answer]                  │
  └─────────────────────────────────────┘
```

---

#### **Function 18: handleVideoCallAccept()**

**Mục đích:** Xử lý khi user accept call

**Code:**
```typescript
private async handleVideoCallAccept(
  socket: AuthenticatedSocket,
  data: { callId: string }
): Promise<void> {
  
  try {
    const { callId } = data;
    
    // Update call status in database
    await videoCallService.acceptCall(callId);
    
    // Get call details
    const call = await videoCallService.getCallById(callId);
    
    // Notify caller that call was accepted
    const callerSocketId = this.getUserSocketId(call.callerId);
    if (callerSocketId) {
      this.io.to(callerSocketId).emit('video_call_accepted', {
        callId: callId,
        acceptedBy: socket.userId
      });
    }
    
    // Confirm to recipient
    socket.emit('video_call_joined', {
      callId: callId
    });
    
    console.log(`Video call accepted: ${socket.username} accepted call ${callId}`);
    
  } catch (error) {
    console.error('Error accepting video call:', error);
    socket.emit('video_call_error', {
      message: 'Failed to accept call'
    });
  }
}
```

**Chi tiết Flow:**

```
User B clicks "Answer" button
  ↓
Frontend emits:
  socket.emit('video_call_accept', {
    callId: "call-789"
  })
  ↓
Backend receives:
  handleVideoCallAccept()
    ↓
  Step 1: Update MongoDB
    {
      _id: "call-789",
      status: "ringing" → "active",
      acceptedAt: new Date()
    }
    ↓
  Step 2: Notify caller (User A)
    io.to(callerSocketId).emit('video_call_accepted', {
      callId: "call-789",
      acceptedBy: "user-B-id"
    })
    ↓
User A's frontend receives:
  socket.on('video_call_accepted', (data) => {
    this.callStatus = 'active';
    this.startPeerConnection(); // Start WebRTC
  })
  ↓
WebRTC connection begins!
```

---

#### **Function 19: handleVideoCallOffer()** (WebRTC Signaling)

**Mục đích:** Forward WebRTC offer từ caller to recipient

**Code:**
```typescript
private handleVideoCallOffer(
  socket: AuthenticatedSocket,
  data: CallOffer
): void {
  
  const { to, offer, callId } = data;
  
  console.log(`Video call offer: ${socket.username} → ${to}`);
  
  const recipientSocketId = this.getUserSocketId(to);
  if (recipientSocketId) {
    this.io.to(recipientSocketId).emit('video_call_offer', {
      from: socket.userId,
      offer: offer,
      callId: callId
    });
  }
}
```

**WebRTC Signaling Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ User A (Caller)                                              │
└─────────────────────────────────────────────────────────────┘
  ↓
Create RTCPeerConnection
  ↓
peerConnection.createOffer()
  ↓
Returns: SDP Offer
  {
    type: "offer",
    sdp: "v=0\r\no=- ... m=video ..."
  }
  ↓
Send via Socket.io:
  socket.emit('video_call_offer', {
    to: "user-B-id",
    offer: { type: "offer", sdp: "..." },
    callId: "call-789"
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend: handleVideoCallOffer()
  ↓
Forward to User B:
  io.to(userBSocketId).emit('video_call_offer', {
    from: "user-A-id",
    offer: { type: "offer", sdp: "..." }
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────┐
│ User B (Recipient)                                           │
└─────────────────────────────────────────────────────────────┘
  ↓
Receives: socket.on('video_call_offer', (data) => {})
  ↓
Create RTCPeerConnection
  ↓
peerConnection.setRemoteDescription(data.offer)
  ↓
peerConnection.createAnswer()
  ↓
Returns: SDP Answer
  ↓
Send back via Socket.io:
  socket.emit('video_call_answer', {
    to: "user-A-id",
    answer: { type: "answer", sdp: "..." }
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend: handleVideoCallAnswer()
  ↓
Forward to User A:
  io.to(userASocketId).emit('video_call_answer', {
    from: "user-B-id",
    answer: { type: "answer", sdp: "..." }
  })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User A receives answer
  ↓
peerConnection.setRemoteDescription(answer)
  ↓
Connection established! 🎉
```

**SDP Exchange:**
```
Offer (User A → User B):
  "I can send video with VP8 codec at 720p, audio with Opus codec"

Answer (User B → User A):
  "I accept! I can receive VP8 video and Opus audio"

Result:
  Both agree on codecs, resolution, etc.
  ↓
  Start streaming! ✅
```

---

#### **Function 20: handleVideoCallIceCandidate()**

**Mục đích:** Forward ICE candidates cho NAT traversal

**Code:**
```typescript
private handleVideoCallIceCandidate(
  socket: AuthenticatedSocket,
  data: IceCandidate
): void {
  
  const { to, candidate, callId } = data;
  
  console.log(`ICE candidate: ${socket.username} → ${to}`);
  
  const recipientSocketId = this.getUserSocketId(to);
  if (recipientSocketId) {
    this.io.to(recipientSocketId).emit('video_call_ice_candidate', {
      from: socket.userId,
      candidate: candidate,
      callId: callId
    });
  }
}
```

**ICE Candidates explained:**

**What is ICE?**
```
ICE = Interactive Connectivity Establishment

Purpose:
  Find best path to connect peers through firewalls/NATs

Process:
  1. Gather candidates (possible connection paths)
  2. Exchange candidates with remote peer
  3. Test all candidates
  4. Select best working candidate
```

**Candidate Types:**
```
Host Candidate:
  type: "host"
  address: "192.168.1.100"  (local IP)
  port: 54321
  ↓ Direct connection (same network)

Server Reflexive Candidate:
  type: "srflx"
  address: "203.45.67.89"   (public IP from STUN)
  port: 12345
  ↓ Connection via STUN server

Relay Candidate:
  type: "relay"
  address: "relay.server.com"
  port: 3478
  ↓ Connection via TURN relay server (last resort)
```

**ICE Exchange Flow:**
```
User A:
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('video_call_ice_candidate', {
        to: "user-B-id",
        candidate: event.candidate
      });
    }
  };
  ↓ Discovers: 5 candidates
  ↓ Sends all 5 to User B via signaling

User B:
  socket.on('video_call_ice_candidate', (data) => {
    peerConnection.addIceCandidate(data.candidate);
  });
  ↓ Receives: 5 candidates from User A
  ↓ Tests each one
  ↓ Selects best: Host candidate (fastest)
  ↓
Connection established via best path! ✅
```

---

## 🎬 COMPLETE VIDEO CALL FLOW

```
USER A (CALLER)                    BACKEND                    USER B (RECIPIENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Click "Call" button
   ↓
2. getUserMedia()
   ↓ Camera/Mic ON 📷🎤
   ↓
3. Initialize PeerJS
   peerId: "userA_123_abc"
   ↓
4. Emit socket event:
   'video_call_initiate'
   { recipientId: "userB" }
                              →  handleVideoCallInitiate()
                                 ↓
                                 MongoDB: Create call record
                                 ↓
                                 Forward to User B socket
                                                           →  5. Receive event:
                                                              'video_call_incoming'
                                                              ↓
                                                           6. Show incoming call UI
                                                              ┌──────────────────┐
                                                              │ 📞 User A calling│
                                                              │ [Reject][Answer] │
                                                              └──────────────────┘
                                                              ↓
                                                           7. Click "Answer"
                                                              ↓
                                                           8. getUserMedia()
                                                              ↓ Camera/Mic ON
                                                              ↓
                                                           9. Emit socket:
                                                              'video_call_accept'
                              ←  handleVideoCallAccept()
                                 ↓
                                 MongoDB: Update status
                                 ↓
                                 Forward to User A
10. Receive: 'video_call_accepted'  ←
    ↓
11. Start PeerJS call:
    peer.call("userB_456_xyz", localStream)
    ↓
    (Offer SDP)
                              →  PeerJS Server
                                 ↓
                                 Route to User B
                                                           →  12. Receive call:
                                                              peer.on('call', (call) => {
                                                                call.answer(localStream)
                                                              })
                                                              ↓
                                                              (Answer SDP)
                              ←  PeerJS Server
                                 ↓
13. Receive answer       ←    Route to User A
    ↓
14. ICE candidates exchange:
    ┌─> emit ICE        →     Forward           →           addIceCandidate() ─┐
    │                                                                            │
    └─ addIceCandidate() ←    Forward           ←           emit ICE          ─┘
    ↓
15. Connection established!
    ┌────────────────────────────────────────────────────────────────────┐
    │ P2P (Peer-to-Peer) connection                                      │
    ├────────────────────────────────────────────────────────────────────┤
    │ User A ←→ Direct stream ←→ User B                                 │
    │ (NO server in between! Just signaling for setup)                   │
    └────────────────────────────────────────────────────────────────────┘
    ↓
16. Both see each other:
    User A sees: User B's video/audio
    User B sees: User A's video/audio
    ↓
✅ Video call active!
```

---

## 🎥 VIDEO CALL COMPONENTS

### Component Hierarchy

```
VideoCallComponent (Main UI)
  ├── localVideo: HTMLVideoElement      # Your camera
  ├── remoteVideo: HTMLVideoElement     # Other person's camera
  │
  ├── Controls:
  │   ├── toggleAudio() → Mute/Unmute mic
  │   ├── toggleVideo() → Camera on/off
  │   ├── shareScreen() → Screen sharing
  │   └── endCall() → Hang up
  │
  └── Uses Services:
      ├── PeerJSService → P2P connection
      ├── SocketService → Signaling
      └── WebRTCService → Low-level WebRTC
```

---

## 3. FLOW DIAGRAMS

### Complete Image Upload Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  USER    │ →   │ FRONTEND │ →   │ BACKEND  │ →   │   DISK   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │ 1. Select      │                 │                │
     │    image       │                 │                │
     ├───────────────>│                 │                │
     │                │ 2. Validate     │                │
     │                │    (type,size)  │                │
     │                │                 │                │
     │ 3. Preview     │                 │                │
     │    shown       │                 │                │
     │<───────────────│                 │                │
     │                │                 │                │
     │ 4. Click Send  │                 │                │
     ├───────────────>│                 │                │
     │                │ 5. FormData     │                │
     │                │    POST /upload │                │
     │                ├────────────────>│                │
     │                │                 │ 6. Multer      │
     │                │                 │    process     │
     │                │                 │                │
     │                │                 │ 7. Save file   │
     │                │                 ├───────────────>│
     │                │                 │                │
     │                │ 8. Return URL   │                │
     │                │<────────────────│                │
     │                │                 │                │
     │                │ 9. POST /messages                │
     │                │    (with imageUrl)               │
     │                ├────────────────>│                │
     │                │                 │ 10. MongoDB    │
     │                │                 │     save       │
     │                │                 │                │
     │                │                 │ 11. Socket.io  │
     │                │                 │     broadcast  │
     │                │<────────────────│                │
     │                │                 │                │
     │ 12. Image      │                 │                │
     │     displayed  │                 │                │
     │<───────────────│                 │                │
     │                │                 │                │
```

### Complete Video Call Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  USER A  │     │ FRONTEND │     │  BACKEND │     │  USER B  │
│ (CALLER) │     │ SERVICES │     │  SOCKET  │     │(RECEIVER)│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                 │                │
     │ 1. Click Call  │                 │                │
     ├───────────────>│                 │                │
     │                │ 2. getUserMedia │                │
     │                │    📷🎤 ON      │                │
     │                │                 │                │
     │                │ 3. Initiate     │                │
     │                ├────────────────>│                │
     │                │                 │ 4. Notify B    │
     │                │                 ├───────────────>│
     │                │                 │                │
     │                │                 │ 5. Show        │
     │                │                 │    incoming UI │
     │                │                 │                │
     │                │                 │ 6. Click Answer│
     │                │                 │<───────────────│
     │                │                 │                │
     │                │ 7. Call         │                │
     │                │    accepted     │                │
     │                │<────────────────│                │
     │                │                 │                │
     │                │ 8. peer.call()  │                │
     │                │    (Offer SDP)  │                │
     │                │─ ─ ─ ─ ─ ─ ─ ─>│                │
     │                │     PeerJS      │                │
     │                │     Server      │                │
     │                │<─ ─ ─ ─ ─ ─ ─ ─│                │
     │                │                 │                │
     │                │                 │ 9. call.answer()│
     │                │                 │   (Answer SDP) │
     │                │                 │                │
     │                │ 10. ICE candidates exchange      │
     │                │<════════════════>│<══════════════>│
     │                │                 │                │
     │                │ 11. P2P Connection Established   │
     │                │<─────────────────────────────────>│
     │                │     (Direct stream, no server)   │
     │                │                 │                │
     │ 12. Video call │                 │                │
     │     active! 📹 │                 │           📹   │
     │<───────────────│                 │                │
     │                │                 │                │
```

---

## 4. TROUBLESHOOTING

### Common Issues

#### Issue 1: Image Upload Fails

**Symptoms:**
```
Error: "File type not allowed"
Error: "File too large"
Error: "Upload failed"
```

**Solutions:**
```typescript
// Check 1: File type
console.log(file.type);  // Must be image/*

// Check 2: File size
console.log(file.size);  // Must be < 5MB (5242880 bytes)

// Check 3: Backend running
// Port 3000 must be active

// Check 4: Multer config
// Check upload.middleware.ts settings
```

---

#### Issue 2: Video Call Won't Connect

**Symptoms:**
```
- "PeerJS not available"
- Call starts but no video/audio
- Connection drops immediately
```

**Solutions:**
```bash
# Check 1: PeerJS server running
npm run peerjs  # Must be on port 9000

# Check 2: Camera/microphone permissions
# Browser should show permission prompt

# Check 3: HTTPS requirement
# WebRTC requires HTTPS (or localhost)

# Check 4: Firewall
# Check if ports 9000, 3000 are open
```

---

## 🎯 TÓM TẮT

### Image Upload Functions

| Function | File | Purpose |
|----------|------|---------|
| `onFileSelected()` | image-upload.component.ts | Handle file selection |
| `validateFile()` | image-upload.component.ts | Validate type & size |
| `handleSingleFile()` | image-upload.component.ts | Process 1 file |
| `uploadImage()` | upload.service.ts | Upload to server |
| `uploadImageWithProgress()` | upload.service.ts | Upload with progress |
| `sendImageMessage()` | message.service.ts | Create image message |
| `imageFilter()` | upload.middleware.ts | Server-side validation |
| `POST /api/upload/image` | upload.routes.ts | Upload endpoint |

### Video Call Functions

| Function | File | Purpose |
|----------|------|---------|
| `initializePeer()` | peerjs.service.ts | Initialize PeerJS |
| `startCall()` | peerjs.service.ts | Initiate call |
| `answerIncomingCall()` | peerjs.service.ts | Answer call |
| `endCall()` | peerjs.service.ts | Hang up |
| `toggleAudio()` | peerjs.service.ts | Mute/unmute |
| `toggleVideo()` | peerjs.service.ts | Camera on/off |
| `handleVideoCallInitiate()` | socket.server.ts | Handle call request |
| `handleVideoCallAccept()` | socket.server.ts | Handle answer |
| `handleVideoCallOffer()` | socket.server.ts | Forward SDP offer |
| `handleVideoCallAnswer()` | socket.server.ts | Forward SDP answer |
| `handleVideoCallIceCandidate()` | socket.server.ts | Forward ICE candidates |

---

**Last Updated:** October 8, 2025  
**Author:** David Nguyen  
**Status:** Complete Documentation ✅
