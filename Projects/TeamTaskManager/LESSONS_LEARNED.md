# Team Task Manager - Lessons Learned

## 0. Unified Port Management & Dev Startup (NEW)
**Issue**: Frequent port conflicts, hardcoded values, and confusion between frontend/backend ports.
**Solution**:
- Use non-standard ports (43210 for backend, 43211 for frontend) to avoid conflicts.
- Store all port and URL configs in `.env` files for both frontend and backend.
- Reference these variables everywhere (no hardcoded ports/URLs in code).
- Added a single `npm run start:all` command (using `concurrently`) in the frontend to start both backend and frontend together for development.
- Ensured all documentation and code reference only the .env values for ports and URLs.

**Critical Fix**: Backend TypeScript compilation has multiple errors, so the unified start command uses `node server.js` directly instead of `npm run dev`. This allows the backend to start successfully while avoiding TypeScript compilation issues.

**Usage**: Always run `npm run start:all` from the `/frontend` directory, not from the project root.

**Prevention**:
- Always use environment variables for all service URLs and ports.
- Never hardcode port numbers or API URLs in code or scripts.
- Document the unified approach in onboarding and best practices.
- Use `node server.js` for backend development until TypeScript compilation issues are resolved.
- Always run the unified start command from the correct directory (frontend).

## Critical Issues Resolved

### 1. TypeScript Compilation Errors
**Issue**: Multiple TypeScript compilation errors preventing successful builds
**Root Cause**: Type mismatches and missing type definitions
**Solution**: 
- Added proper type definitions for all props and components
- Implemented proper TypeScript configuration
- Added type safety for all React components

### 2. React Hot Reload Module Resolution Errors
**Issue**: Hot reload failing with module resolution errors
**Root Cause**: Path resolution issues in development environment
**Solution**: 
- Configured proper module resolution in webpack/dev environment
- Ensured all imports use consistent path resolution
- Fixed development server configuration

### 3. Backend API Field Mismatch & Login Redirect Failure
**Issue**: After successful login, users received success message but were not redirected to dashboard
**Root Causes**:
- API URL mismatch in authService (localhost:3000 vs REACT_APP_API_URL)
- AuthContext using wrong login method with incompatible parameters
- Inconsistent storage methods between different auth functions
- ProtectedRoute checking for user fields that backend doesn't return
- Frontend User type expecting fields not provided by backend

**Solutions Applied**:
- Fixed API URL configuration to use environment variable consistently
- Updated AuthContext to use correct loginUser method
- Ensured consistent localStorage usage across all auth functions
- Modified ProtectedRoute to handle missing user fields gracefully
- Made User interface fields optional to match backend response

### 4. CORS Configuration Issue
**Issue**: Frontend unable to make API requests to backend due to CORS restrictions
**Root Cause**: Backend CORS configuration only allowed 'http://localhost:3000' but React dev server was running on different port or configuration
**Solution**: 
- Updated CORS configuration in backend to include proper origins
- Added 'http://localhost:3000' to allowed origins
- Ensured CORS headers are properly set for preflight requests

### 5. Route-Specific CORS Override Issue ⚠️ **CRITICAL**
**Issue**: Login API requests were being blocked by CORS even after main server CORS was configured correctly
**Root Cause**: The `authRoutes.js` file had its own CORS middleware that only allowed `http://localhost:3002`, overriding the main server's CORS configuration
**Solution**: 
- Updated route-specific CORS configuration in `authRoutes.js` to include multiple origins
- Added array of allowed origins: `['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002']`
- Ensured route-level CORS doesn't conflict with server-level CORS

**Files Modified**:
- `routes/authRoutes.js` - Updated CORS middleware to allow React dev server origin

## Best Practices Established

### TypeScript Error Prevention
- Always define proper interfaces for all data structures
- Use strict TypeScript configuration
- Implement proper type checking in development workflow

### Authentication System Architecture
- Maintain consistent storage methods across all auth functions
- Ensure frontend types align with backend response structure
- Implement graceful handling of missing optional fields
- Use environment variables for API configuration

### Development Environment Setup
- Verify CORS configuration matches development server settings
- Ensure all servers (frontend/backend) are running on expected ports
- Test API endpoints directly before implementing frontend integration

## Prevention Strategies

### Code Quality
- Implement pre-commit hooks for TypeScript checking
- Use consistent coding standards across the project
- Regular code reviews focusing on type safety

### Authentication Security
- Implement proper token storage and retrieval
- Ensure consistent authentication state management
- Test authentication flow end-to-end regularly

### Development Workflow
- Always test API endpoints independently before frontend integration
- Verify CORS configuration during initial setup
- Document all environment variables and their expected values
- Maintain alignment between frontend types and backend responses

## Current Status
- Frontend build compiles without errors ✅
- Development server running with Hot Reload enabled ✅
- Authentication flow working correctly ✅
- Login redirects to dashboard after successful authentication ✅
- CORS configuration properly set for development environment ✅ 

## Additional Lessons Learned (July 2025)

### 1. Prisma Audit Logger Timestamp Issue
- **Problem:** The audit logger was passing a `timestamp` field to the database, but the Prisma schema only supported `createdAt`.
- **Root Cause:** Old code or running server processes were still using the outdated `timestamp` field, causing Prisma validation errors.
- **Fix:** Removed all references to `timestamp` in audit log entries and used `createdAt` (auto-generated by Prisma). Always restart the backend server after making code changes to ensure updates are loaded.

### 2. Backend Server Restart Required
- **Problem:** Changes to backend code (like removing fields from audit logs) did not take effect until the server was restarted.
- **Lesson:** Always kill and restart the backend server after making code changes, especially when modifying database models or logging logic.

### 3. NPM Start Error (ENOENT)
- **Problem:** Running `npm start` in the project root failed with `ENOENT` because there was no `package.json` in that directory.
- **Lesson:** Always run `npm start` or related npm scripts from the correct subdirectory (e.g., `/frontend` or `/backend`) where the `package.json` exists.

### 4. Troubleshooting Steps
- Use `ps aux | grep "node server.js"` to check if the backend server is running.
- Use `pkill -f "node server.js"` to kill old server processes before restarting.
- Use `curl` to test API endpoints directly and verify backend responses.
- Use `grep` to search for problematic code patterns (e.g., `timestamp`, `new Date()`, etc.).

### 5. Communication & Debugging
- Document all errors, fixes, and troubleshooting steps in the project README for future reference.
- Don't forget to check for running processes and restart servers after code changes.

---
**Note:** This section was added after a particularly frustrating debugging session. Learn from these mistakes and save yourself time in the future! 