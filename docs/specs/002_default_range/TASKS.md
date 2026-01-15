# Tasks: Change Default Date Range to 5D

**Feature Spec:** FEAT-002  
**Created:** 2026-01-15  
**Author:** Technical Specialist Agent  
**Status:** Not Started  

---

## Overview

This task list covers the implementation of changing the default date range for all charts in FinanceViz from 1D to 5D. It includes updates to state management, UI, and ensures the new default is respected on initial load and reset. Testing and E2E coverage are included.

---

## Task Status Legend

- [ ] Not Started
- [x] Completed
- 🔄 In Progress
- ⏸️ Blocked
- ❌ Cancelled

---

## Tasks

### TASK-002-001: Update ChartContext Default Range

**Description:**
Change the default value for the date range in ChartContext from '1D' to '5D'.

**Implementation Steps:**
1. Locate the default state in ChartContext (likely in `src/frontend/src/context/ChartContext.tsx`).
2. Change the initial value for date range to '5D'.
3. Update any related types or constants if necessary.

**Acceptance Criteria:**
- [ ] ChartContext provides '5D' as the default range.
- [ ] No references to '1D' as the default remain.

**UI Acceptance Criteria (if applicable):**
- [ ] N/A

**Playwright E2E Test:**
| Test Name | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| E2E-001 | Default range is 5D | 1. Load app 2. Observe chart | Chart loads with 5D selected |

**Status:** [ ] Not Started

---

### TASK-002-002: Ensure Toolbar UI Highlights 5D on Load

**Description:**
Update the Toolbar (date range buttons) so that 5D is visually selected on initial load.

**Implementation Steps:**
1. Check Toolbar/TimeRangeButtons component for selected state logic.
2. Ensure it uses the value from ChartContext.
3. Confirm 5D is highlighted on first load.

**Acceptance Criteria:**
- [ ] 5D button is visually selected on app launch.

**UI Acceptance Criteria (if applicable):**
- [ ] 5D button has selected styling on load.

**Playwright E2E Test:**
| Test Name | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| E2E-002 | 5D button highlighted | 1. Load app | 5D button is styled as selected |

**Status:** [ ] Not Started

---

### TASK-002-003: Update Chart Reset Logic to Use 5D

**Description:**
Ensure that any chart reset or reload action sets the range to 5D.

**Implementation Steps:**
1. Identify chart reset logic (could be in ChartContext or Chart component).
2. Update logic to set range to '5D' on reset.
3. Test reset behavior.

**Acceptance Criteria:**
- [ ] Resetting the chart sets range to 5D.

**UI Acceptance Criteria (if applicable):**
- [ ] 5D button is selected after reset.

**Playwright E2E Test:**
| Test Name | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| E2E-003 | Reset sets 5D | 1. Change range 2. Reset chart | Range is 5D after reset |

**Status:** [ ] Not Started

---

### TASK-002-004: Handle Edge Case – No 5D Data

**Description:**
Ensure the app displays an appropriate empty state if 5D data is unavailable for a symbol.

**Implementation Steps:**
1. Simulate or mock a symbol with no 5D data.
2. Verify empty state UI is shown.
3. Add/adjust tests as needed.

**Acceptance Criteria:**
- [ ] App shows empty state if 5D data is missing.

**UI Acceptance Criteria (if applicable):**
- [ ] Empty state message is clear and styled.

**Playwright E2E Test:**
| Test Name | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| E2E-004 | No 5D data | 1. Load symbol with no 5D data | Empty state is shown |

**Status:** [ ] Not Started

---

### TASK-002-005: Unit and Integration Test Coverage

**Description:**
Add/Update unit and integration tests to cover the new default and related behaviors.

**Implementation Steps:**
1. Update or add tests for ChartContext default.
2. Test Toolbar/TimeRangeButtons for correct selection.
3. Test chart reset logic.

**Acceptance Criteria:**
- [ ] All new logic is covered by tests.
- [ ] Tests pass in CI.

**UI Acceptance Criteria (if applicable):**
- [ ] N/A

**Playwright E2E Test:**
| Test Name | Description | Steps | Expected Result |
|-----------|-------------|-------|-----------------|
| E2E-005 | All behaviors tested | 1. Run all tests | All pass |

**Status:** [ ] Not Started

---

## Notes

- Confirm with Product Owner if default should apply to all chart types.
- Consider future configurability for default range.
