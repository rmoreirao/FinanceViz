# Feature: Chart Resize Fix

**Spec ID:** FEAT-002  
**Created:** 2026-01-20  
**Status:** Implemented

---

## 1. Overview

### 1.1 Problem Statement
Currently, the chart component completely disappears or goes blank when the browser window is resized or moved. This requires the user to manually refresh the page or trigger a UI update to restore the chart. This degradation in user experience is caused by the chart instance being destroyed and recreated on every dimension change, rather than being resized.

### 1.2 Proposed Solution
Implement a proper resizing strategy for the Lightweight Charts instance. Instead of tearing down and re-initializing the chart on every `width` or `height` prop change, we will:
1.  Isolate the chart initialization logic to run only once (mount) or when the theme changes.
2.  Introduce a dedicated effect to handle dimension updates using `chart.resize(width, height)`.

### 1.3 User Story
As a user, I want the financial chart to fluidly resize and remain visible when I adjust my browser window, so that I don't lose my context or have to refresh the page.

---

## 2. Functional Requirements

### 2.1 Core Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | The chart must remain visible during and after window resizing. | P0 | Critical for usability. |
| FR-002 | The chart must adapt its dimensions to fill the container without scrollbars or overflow. | P1 | |
| FR-003 | The chart content (candles, indicators) must not be lost or reset during resize. | P1 | Viewport position should be maintained if possible. |
| FR-004 | The Legend and Tooltip information should restart or persist correctly after resize interactions. | P2 | |

### 2.2 User Interface Requirements

| ID | UI Element | Behavior | Location |
|----|------------|----------|----------|
| UI-001 | Chart Canvas | Resizes fluidly with the container. | Main Chart Area |

---

## 3. Non-Functional Requirements

- **Performance:** Resizing should be performant (avoid expensive re-renders or calculations).
- **Responsiveness:** The layout logic in `App.tsx` and `useChartResize` must work in sync with the chart's internal resize method.

---

## 4. Acceptance Criteria

### 4.1 Functional Acceptance

- AC-001: User can resize the browser window horizontally and vertically, and the chart adjusts immediately.
- AC-002: User can minimize and maximize the browser window without the chart breaking.
- AC-003: No "blank" screen state is observed during normal window manipulation.
- AC-004: Toggling sidebars or other UI elements that change the chart container size triggers a correct resize.

### 4.2 Code Implementation Acceptance

- AC-CODE-001: `ChartCanvas.tsx` has a `useEffect` for `resize` separate from initialization.
- AC-CODE-002: Chart initialization dependency array does not include `width` or `height`.
