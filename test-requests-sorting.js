/**
 * Script để test việc sắp xếp Group Requests
 * Chạy trong Developer Console (F12)
 */

console.log('🧪 Testing Group Requests Sorting\n');

// Create test requests with different dates
const testRequests = [
    {
        "id": "1",
        "groupId": "1",
        "groupName": "Development Team",
        "userId": "4",
        "username": "john_doe",
        "requestType": "register_interest",
        "requestedAt": "2025-01-10T00:00:00.000Z", // Cũ nhất
        "status": "approved",
        "reviewedBy": "1",
        "reviewedAt": "2025-10-01T07:43:20.699Z"
    },
    {
        "id": "2",
        "groupId": "2",
        "groupName": "Design Team",
        "userId": "5",
        "username": "jane_smith",
        "requestType": "request_invite",
        "requestedAt": "2025-01-12T00:00:00.000Z",
        "status": "approved",
        "reviewedBy": "2",
        "reviewedAt": "2025-01-13T00:00:00.000Z"
    },
    {
        "id": "3",
        "groupId": "1",
        "groupName": "Development Team",
        "userId": "6",
        "username": "bob_wilson",
        "requestType": "register_interest",
        "requestedAt": "2025-01-14T00:00:00.000Z",
        "status": "rejected",
        "reviewedBy": "1",
        "reviewedAt": "2025-01-15T00:00:00.000Z"
    },
    {
        "id": "4",
        "groupId": "2",
        "groupName": "Marketing Department",
        "userId": "1",
        "username": "super",
        "requestType": "register_interest",
        "requestedAt": "2025-10-01T03:04:00.000Z", // Mới nhất
        "status": "pending"
    }
];

console.log('📝 Test 1: Setting up test data...');
console.log('Test requests (unsorted):');
testRequests.forEach((req, idx) => {
    const date = new Date(req.requestedAt);
    console.log(`  ${idx + 1}. ${req.username} - ${req.groupName} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()} [${req.status}]`);
});

// Save to localStorage
localStorage.setItem('groupInterestRequests', JSON.stringify(testRequests));
console.log('\n✅ Data saved to localStorage');

console.log('\n📝 Test 2: Expected sorting order (newest first):');
const sorted = [...testRequests].sort((a, b) => 
    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
);
sorted.forEach((req, idx) => {
    const date = new Date(req.requestedAt);
    console.log(`  ${idx + 1}. ${req.username} - ${req.groupName} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()} [${req.status}]`);
});

console.log('\n📝 Test 3: Expected order on table:');
console.log('  Row 1: super - Marketing Department (Oct 1, 2025, 03:04 AM) [Pending] ← Mới nhất');
console.log('  Row 2: bob_wilson - Development Team (Jan 14, 2025) [Rejected]');
console.log('  Row 3: jane_smith - Design Team (Jan 12, 2025) [Approved]');
console.log('  Row 4: john_doe - Development Team (Jan 10, 2025) [Approved] ← Cũ nhất');

console.log('\n📊 Summary:');
console.log(`  Total Requests: ${testRequests.length}`);
console.log(`  Newest: ${sorted[0].username} - ${new Date(sorted[0].requestedAt).toLocaleDateString()}`);
console.log(`  Oldest: ${sorted[sorted.length-1].username} - ${new Date(sorted[sorted.length-1].requestedAt).toLocaleDateString()}`);

console.log('\n✅ Test data ready!');
console.log('💡 Now reload the page and go to /admin/group-requests');
console.log('📋 The table should show requests sorted by date (newest at top)');
console.log('\n🔄 Reloading page...');

setTimeout(() => location.reload(), 2000);

