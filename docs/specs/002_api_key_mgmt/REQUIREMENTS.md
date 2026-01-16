# Feature: Alpha Vantage API Key Management

**Spec ID:** FEAT-002  
**Created:** 2026-01-16  
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement
The Alpha Vantage API key is currently hardcoded via environment variable only. Users cannot configure the API key without modifying environment files, and there's no way to validate whether a key is working.

### 1.2 Proposed Solution
Allow users to enter, save, update, and validate their Alpha Vantage API key through the UI, with persistence in localStorage and fallback to environment variables.

### 1.3 User Story
As a FinanceViz user, I want to configure my Alpha Vantage API key through the UI so that I can use real market data without modifying environment files.

---

## 2. Functional Requirements

### 2.1 Core Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | System shall check localStorage for API key on app load | P0 | Key: `alphavantage_api_key` |
| FR-002 | System shall fall back to environment variable if localStorage is empty | P0 | `VITE_ALPHA_VANTAGE_API_KEY` |
| FR-003 | User shall be able to enter API key via text input | P0 | |
| FR-004 | User shall be able to save API key to localStorage | P0 | |
| FR-005 | User shall be able to update existing API key | P0 | |
| FR-006 | User shall be able to test API key validity | P0 | Via sample API request |
| FR-007 | System shall display validation result (success/failure) | P0 | |
| FR-008 | API key input shall be masked with show/hide toggle | P1 | |
| FR-009 | System shall prompt for API key when switching to API data source if none configured | P0 | |

### 2.2 User Interface Requirements

| ID | UI Element | Behavior | Location |
|----|------------|----------|----------|
| UI-001 | API Key Settings button | Opens API key configuration modal | Toolbar |
| UI-002 | API Key input field | Masked text input for entering key | Modal |
| UI-003 | Show/Hide toggle | Toggles visibility of API key | Adjacent to input |
| UI-004 | "Test API Key" button | Triggers validation request | Modal |
| UI-005 | Validation status | Shows success/error after test | Modal |
| UI-006 | "Save" button | Saves API key to localStorage | Modal |

---

## 3. Non-Functional Requirements

- **Performance:** API key validation should complete within 5 seconds
- **Accessibility:** Form elements must have proper labels; modal must be keyboard navigable
- **Responsiveness:** Modal must work on mobile viewports

---

## 4. Acceptance Criteria

### 4.1 Functional Acceptance

- **AC-001:** When app loads with no API key in localStorage or env, and user selects API data source, a prompt to configure API key is displayed
- **AC-002:** When user enters a key and clicks "Save", it persists to localStorage
- **AC-003:** When user clicks "Test API Key" with a valid key, a success message is displayed
- **AC-004:** When user clicks "Test API Key" with an invalid key, an error message is displayed
- **AC-005:** When app loads with API key in localStorage, it is used for API requests
- **AC-006:** When app loads with no localStorage key but env variable is set, the env value is used

### 4.2 UI/UX Acceptance

- **AC-UI-001:** API key settings are accessible via a button in the toolbar
- **AC-UI-002:** Modal displays current key status (localStorage, env, or not configured)
- **AC-UI-003:** Validation feedback is shown inline within the modal
- **AC-UI-004:** Loading state is shown during API key validation
- **AC-UI-005:** Modal can be closed via X button, Escape key, or clicking outside
