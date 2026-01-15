# Feature: Change Default Date Range to 5D

**Spec ID:** FEAT-002  
**Created:** 2026-01-15  
**Author:** Product Owner Agent  
**Status:** Draft  
**Priority:** P1  

---

## 1. Overview

### 1.1 Problem Statement
Currently, the FinanceViz application defaults to a 1D (1 Day) date range when loading charts. Users often need a broader view and prefer to see 5D (5 Days) as the initial range for better context.

### 1.2 Proposed Solution
Update the application so that the default date range for all charts is set to 5D instead of 1D. This should apply on initial load and when resetting the chart.

### 1.3 User Story
As a user, I want the chart to default to a 5D range so that I immediately see a broader context of price movements when I open FinanceViz.

---

## 2. Functional Requirements

### 2.1 Core Requirements

| ID     | Requirement                                              | Priority | Notes                |
|--------|----------------------------------------------------------|----------|----------------------|
| FR-001 | The default date range for charts is set to 5D           | P0       | Applies on load      |
| FR-002 | Resetting the chart also sets the range to 5D            | P1       |                      |

### 2.2 User Interface Requirements

| ID     | UI Element         | Behavior                                 | Location         |
|--------|--------------------|------------------------------------------|------------------|
| UI-001 | Date Range Buttons | 5D is selected by default on app launch  | Chart Toolbar    |

---

## 3. Non-Functional Requirements

- **Performance:** No negative impact on chart load time.
- **Accessibility:** Date range selection remains keyboard accessible.
- **Responsiveness:** Default selection works on all device sizes.

---

## 4. Acceptance Criteria

### 4.1 Functional Acceptance

- [ ] AC-001: On first load, the chart displays 5D data by default.
- [ ] AC-002: When resetting the chart, the range reverts to 5D.

### 4.2 UI/UX Acceptance

- [ ] AC-UI-001: The 5D button is visually highlighted as selected on load.

### 4.3 Edge Cases

| ID     | Scenario                        | Expected Behavior                |
|--------|----------------------------------|----------------------------------|
| EC-001 | User previously selected 1D      | 5D is still default on reload    |
| EC-002 | No data for 5D available        | Show appropriate empty state     |

---

## 5. Out of Scope

- Changing other default chart settings
- Persisting user-selected range across sessions

---

## 6. Dependencies

- None

---

## 7. Open Questions

- [ ] Should the default apply to all chart types (candlestick, line, etc.)?
- [ ] Should the default be configurable in settings in the future?
