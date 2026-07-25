# Security Specification - Ocula

## 1. Data Invariants
- A User profile can only be created by the authenticated user it belongs to.
- User metadata (role, units) should mostly be managed by admins or via restricted update paths.
- Scans, Notifications, Campaigns, and Tickets belong to a specific User and can only be accessed/created by that owner or an admin.
- Document IDs must follow a strict alphanumeric format to prevent poisoning.

## 2. The "Dirty Dozen" Payloads
1. **Identity Theft**: Creating a document in `users/other_uid` while authenticated as `user_uid`.
2. **Role Escalation**: Updating own role from `analyst` to `admin`.
3. **Ghost Field Injection**: Adding `isVerified: true` to a user profile to bypass backend checks.
4. **Denial of Wallet**: Sending 1MB strings as `businessName` in a scan.
5. **Orphaned Writes**: Creating a scan for a user that doesn't exist in the system.
6. **Query Scraping**: Authenticated user listing `/users` without admin privileges.
7. **Resource Exhaustion**: Creating 10,000 notifications in a loop.
8. **ID Poisoning**: Using `../scans/secret` as a document ID.
9. **Timestamp Spoofing**: Setting `createdAt` to a year in the future.
10. **Membership Bypass**: Accessing another user's campaigns by knowing the campaign ID.
11. **Update Gap**: Modifying `userId` of a scan after creation to "move" it to another account.
12. **PII Leak**: Non-admin user retrieving another user's email via a collection list.

## 3. The Test Runner (Plan)
We will verify:
- `allow list` on `/users` requires `isAdmin()`.
- `isOwner()` correctly identifies the user.
- `isValidEntity` helpers block oversized strings and unknown fields.
- `affectedKeys().hasOnly()` blocks unauthorized field updates.
