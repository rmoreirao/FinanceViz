# Tasks: Chart Resize Fix

**Feature Spec:** FEAT-002
**Created:** 2026-01-20
**Status:** Not Started

---

## Overview

This task list covers the refactoring of the `ChartCanvas` component to prevent the chart from disappearing during window resizing. The goal is to separate the chart initialization logic from the resizing logic to ensure performance and visual stability.

---

## Tasks

### TASK-002-001: Refactor ChartCanvas for Efficient Resizing

**Description:** Refactor the `ChartCanvas.tsx` component to decouple chart instance creation from dimension updates. Currently, the chart is destroyed and recreated when `width` or `height` changes. This task will implement a dedicated `useEffect` for resizing using the `chart.applyOptions` or `chart.resize` method.

**Status:** Completed

**Implementation Steps:**
1. Open `src/frontend/src/components/Chart/ChartCanvas.tsx`.
2. Locate the main `useEffect` responsible for `createChart`.
3. Remove `width` and `height` from the dependency array of the initialization effect.
4. Create a new `useEffect` hook that depends on `[width, height]`.
5. In the new hook, access the existing `chartRef.current` and call `chart.applyOptions({ width, height })`.
6. Ensure that the chart is not destroyed/recreated unless the component unmounts.

**Acceptance Criteria:**
- [x] The chart instance is initialized only once on mount (or when critical theme props change).
- [x] Changing the browser window size updates the chart dimensions immediately.
- [x] The chart content (candles, indicators) remains visible during resizing.
- [x] No blank screen or complete chart reload occurs when dragging the window border.

**UI Acceptance Criteria (if applicable):**
- [x] The chart canvas fills the available container space exactly without overflow.

**Playwright E2E Test:**
| Status | Test Name | Description | Steps | Expected Result |
|--------|-----------|-------------|-------|-----------------|
|  [x]   | E2E-001 | Resize Stability Test | 1. Set Desktop, verify <br> 2. Set Tablet, verify <br> 3. Set Mobile, verify | Chart visible at all sizes, dimensions update |
|  [x]   | E2E-002 | Rapid Resize Stress | 1. Rapidly change viewport 4 times <br> 2. Wait for settle | Chart remains visible and sized correctly |
|  [x]   | E2E-003 | Theme Toggle Resize | 1. Toggle Theme <br> 2. Resize window | Chart adjusts correctly after re-render |
|  [x]   | E2E-004 | Data Source Resize | 1. Ensure Data Loaded <br> 2. Resize | Chart remains visible |

**Documentation to be Updated:**
- [ ] None required for this internal refactor.

---

## Notes

- Ensure `useChartResize` hook is correctly providing integer values for width/height, as Lightweight Charts expects valid numbers.
- `chart.applyOptions` is generally preferred or `chart.resize` depending on the version of `lightweight-charts`.
