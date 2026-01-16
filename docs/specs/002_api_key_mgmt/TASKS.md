# Tasks: Alpha Vantage API Key Management

**Feature Spec:** FEAT-002  
**Created:** 2026-01-16  
**Status:** Completed

---

## Overview

This task list covers the implementation of API Key Management for Alpha Vantage. Users will be able to configure, validate, and persist their API key through the UI, with fallback to environment variables.

---

## Tasks

### TASK-002-001: Create API Key Context and Storage Utilities

**Description:** Create a React context to manage API key state across the application. Implement localStorage persistence with fallback to environment variables.

**Status:** Completed

**Implementation Steps:**
1. Create `src/frontend/src/context/ApiKeyContext.tsx`
2. Define state: `apiKey`, `apiKeySource` ('localStorage' | 'env' | 'none'), `isConfigured`
3. Implement `getApiKey()` with resolution order: localStorage → env → null
4. Implement `setApiKey(key: string)` to save to localStorage (`alphavantage_api_key`)
5. Implement `clearApiKey()` to remove from localStorage
6. Export `ApiKeyProvider` and `useApiKey` hook
7. Update `src/frontend/src/context/index.ts` exports

**Acceptance Criteria:**
- [x] Context provides `apiKey`, `apiKeySource`, and `isConfigured` values
- [x] `getApiKey()` checks localStorage first, then env variable
- [x] `setApiKey()` persists to localStorage under `alphavantage_api_key`
- [x] `clearApiKey()` removes key from localStorage
- [x] Context re-renders consumers when API key changes

**UI Acceptance Criteria:**
- [x] N/A (non-visual task)

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-001-A | API key persists in localStorage | 1. Set API key via UI 2. Reload page | Key loads from localStorage |
| [x] | E2E-001-B | API key clears from localStorage | 1. Set key 2. Clear key 3. Reload | Key is not present |

**Documentation to be Updated:**
- [x] `copilot-instructions.md` - Document ApiKeyContext

---

### TASK-002-002: Create API Key Validation Service

**Description:** Create a function to validate an API key by making a test request to Alpha Vantage. Handle success, invalid key, rate limit, and network errors.

**Status:** Completed

**Implementation Steps:**
1. Add `validateApiKey(apiKey: string)` function to `src/frontend/src/api/alphavantage.ts`
2. Use `GLOBAL_QUOTE` endpoint with symbol `IBM` for validation
3. Return `{ valid: boolean; error?: string }`
4. Handle cases: valid response, invalid key error, rate limit, network error
5. Add 5-second timeout
6. Ensure API key is not logged to console

**Acceptance Criteria:**
- [x] Returns `{ valid: true }` for valid API keys
- [x] Returns `{ valid: false, error: string }` for invalid keys
- [x] Handles rate limit responses with appropriate message
- [x] Handles network errors gracefully
- [x] Request times out after 5 seconds

**UI Acceptance Criteria:**
- [x] N/A (service layer task)

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-002-A | Valid key returns success | 1. Test with valid key | Validation succeeds |
| [x] | E2E-002-B | Invalid key returns error | 1. Test with invalid key | Error message displayed |

**Documentation to be Updated:**
- [x] Add JSDoc to validation function

---

### TASK-002-003: Create API Key Settings Modal Component

**Description:** Create a modal component for managing the API key with input field, show/hide toggle, test button, and save functionality.

**Status:** Completed

**Implementation Steps:**
1. Create `src/frontend/src/components/Settings/ApiKeyModal.tsx`
2. Create `src/frontend/src/components/Settings/index.ts` for exports
3. Use existing `Modal` component from `components/common`
4. Implement password input with show/hide toggle (eye icon)
5. Display current key source status (localStorage/env/not configured)
6. Add "Test API Key" button with loading spinner
7. Show inline validation result (green success / red error)
8. Add "Save" button to persist key
9. Wire up to `useApiKey` context

**Acceptance Criteria:**
- [x] Modal opens and closes correctly
- [x] Displays current API key source status
- [x] Input field accepts text and masks by default
- [x] Show/hide toggle reveals/masks API key
- [x] Test button triggers validation with loading state
- [x] Validation result displays inline
- [x] Save button persists key via context
- [x] Modal is keyboard accessible

**UI Acceptance Criteria:**
- [x] Modal is centered with backdrop overlay
- [x] Input has focus styling
- [x] Loading spinner visible during validation
- [x] Success message in green, error in red
- [x] Works on mobile viewports

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-003-A | Modal opens and shows status | 1. Click API key button 2. Observe modal | Modal displays with status |
| [x] | E2E-003-B | Enter and save API key | 1. Open modal 2. Enter key 3. Save | Key saved, source shows localStorage |
| [x] | E2E-003-C | Show/hide toggle works | 1. Enter key 2. Click toggle | Input type changes between password/text |
| [x] | E2E-003-D | Modal closes on Escape | 1. Open modal 2. Press Escape | Modal closes |
| [x] | E2E-003-E | Modal closes on overlay click | 1. Open modal 2. Click backdrop | Modal closes |

**Documentation to be Updated:**
- [x] Document Settings components in `copilot-instructions.md`

---

### TASK-002-004: Add API Key Button to Toolbar

**Description:** Add a button to the toolbar that opens the API Key Settings modal with a visual status indicator.

**Status:** Completed

**Implementation Steps:**
1. Create `src/frontend/src/components/Toolbar/ApiKeyButton.tsx`
2. Implement button with key/gear icon (SVG)
3. Add status indicator dot (green=configured, red=not configured)
4. Add tooltip showing current status
5. Manage modal open/close state
6. Render `ApiKeyModal` component
7. Update `src/frontend/src/components/Toolbar/index.ts` exports
8. Add to `Toolbar.tsx` in right-side controls section (desktop, tablet, mobile menu)

**Acceptance Criteria:**
- [x] Button visible in toolbar on all screen sizes
- [x] Status dot color reflects API key state
- [x] Clicking button opens modal
- [x] Button has hover and focus states
- [x] Accessible via keyboard

**UI Acceptance Criteria:**
- [x] Button matches existing toolbar styling
- [x] Status indicator is clearly visible
- [x] Tooltip appears on hover
- [x] Visible in mobile hamburger menu

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-004-A | Button visible in toolbar | 1. Load app | API key button visible |
| [x] | E2E-004-B | Button opens modal | 1. Click button | Modal opens |
| [x] | E2E-004-C | Status indicator red when no key | 1. Clear key 2. Observe | Red indicator shown |
| [x] | E2E-004-D | Status indicator green when key set | 1. Save key 2. Observe | Green indicator shown |
| [x] | E2E-004-E | Button in mobile menu | 1. Resize to mobile 2. Open menu | Button accessible |

**Documentation to be Updated:**
- [x] N/A

---

### TASK-002-005: Integrate API Key Context with Alpha Vantage Client

**Description:** Update the Alpha Vantage API client to use the API key from context instead of only environment variables.

**Status:** Completed

**Implementation Steps:**
1. Modify `getApiKey()` in `src/frontend/src/api/alphavantage.ts`
2. Create module-level variable to hold key getter function
3. Implement `setApiKeyResolver(getter: () => string | null)` for context to set
4. Update `ApiKeyContext` to call resolver on mount and key changes
5. Maintain backward compatibility with env variable fallback
6. Throw descriptive error when no key available

**Acceptance Criteria:**
- [x] API client uses key from context when set
- [x] Falls back to env variable when context not available
- [x] Changing key in UI immediately affects API calls
- [x] Clear error when no key is configured
- [x] Existing API functionality not broken

**UI Acceptance Criteria:**
- [x] N/A (integration task)

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-005-A | API uses saved key | 1. Set key in modal 2. Switch to API source 3. Load data | Data loads successfully |
| [x] | E2E-005-B | Updated key used immediately | 1. Set key A 2. Load data 3. Set key B 4. Load data | Second request uses key B |

**Documentation to be Updated:**
- [x] Update alphavantage.ts JSDoc comments

---

### TASK-002-006: Add API Key Prompt on Data Source Switch

**Description:** When switching to Alpha Vantage data source without a configured API key, automatically prompt the user to enter one.

**Status:** Completed

**Implementation Steps:**
1. Update `src/frontend/src/components/common/DataSourceToggle.tsx`
2. Import `useApiKey` context
3. Before switching to 'alphavantage', check if key is configured
4. If not configured, open API Key Modal instead of switching
5. After key is saved in modal, complete the switch
6. If modal closed without saving, stay on mock data
7. Add contextual message in modal explaining why it appeared

**Acceptance Criteria:**
- [x] Switching to API without key opens modal
- [x] After saving key, switch completes to API source
- [x] If modal dismissed, data source stays on mock
- [x] If key already configured, switch happens immediately
- [x] Modal shows contextual "API key required" message

**UI Acceptance Criteria:**
- [x] User understands why modal appeared
- [x] Flow is smooth and non-blocking
- [x] Toggle state is consistent with actual source

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-006-A | Prompt when switching without key | 1. Clear key 2. Toggle to API | Modal opens with prompt |
| [x] | E2E-006-B | Switch completes after save | 1. No key 2. Toggle 3. Enter and save | Data source is API |
| [x] | E2E-006-C | Switch reverts if dismissed | 1. No key 2. Toggle 3. Close modal | Data source stays Mock |
| [x] | E2E-006-D | No prompt when key exists | 1. Set key 2. Toggle | Switch happens directly |

**Documentation to be Updated:**
- [x] N/A

---

### TASK-002-007: Add API Key Provider to App

**Description:** Wrap the application with ApiKeyProvider to make API key context available throughout.

**Status:** Completed

**Implementation Steps:**
1. Import `ApiKeyProvider` in `src/frontend/src/App.tsx`
2. Wrap existing providers with `ApiKeyProvider`
3. Ensure proper provider nesting order
4. Verify no console errors or regressions

**Acceptance Criteria:**
- [x] ApiKeyProvider wraps the application
- [x] API key context accessible from all components
- [x] Existing functionality not broken
- [x] No console errors

**UI Acceptance Criteria:**
- [x] App loads without errors
- [x] All existing features work correctly

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
| [x] | E2E-007-A | App loads with context | 1. Load app | No errors, app functional |
| [x] | E2E-007-B | Existing features work | 1. Search symbol 2. Change chart type 3. Toggle theme | All features work |

**Documentation to be Updated:**
- [x] Update App.tsx component documentation

---

## Implementation Order

Execute tasks in this sequence to satisfy dependencies:

1. **TASK-002-001** - API Key Context (foundation)
2. **TASK-002-002** - Validation Service (foundation)
3. **TASK-002-007** - Add Provider to App (enable context)
4. **TASK-002-003** - API Key Modal (main UI)
5. **TASK-002-004** - Toolbar Button (access point)
6. **TASK-002-005** - Integrate with API Client (functionality)
7. **TASK-002-006** - Prompt on Data Source Switch (UX polish)

---

## Notes

- Existing `Modal` component supports escape key, overlay click, and focus trap
- Use lightweight `GLOBAL_QUOTE` endpoint for validation to minimize rate limit impact
- Consider debouncing test button to prevent double-clicks
- Ensure mobile responsiveness for modal and toolbar button
