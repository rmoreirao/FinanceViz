# Feature: Configurable Indicator Parameters

**Spec ID:** FEAT-003  
**Created:** 2026-01-21  
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement
Technical indicators in FinanceViz currently use fixed default parameters (e.g., SMA always uses 20-period, RSI always uses 14-period). Users cannot customize these parameters to match their trading strategies, limiting the application's usefulness for technical analysis.

### 1.2 Proposed Solution
Enable users to configure indicator parameters through the existing IndicatorConfig modal. When a user clicks the settings icon on an active indicator, a modal opens allowing them to adjust parameters (period, source, thresholds, etc.). Changes apply immediately to the chart, and parameter values display in both the chart legend and active indicators list.

### 1.3 User Story
As a technical analyst, I want to configure indicator parameters (such as period length and price source) so that I can customize my analysis to match my trading strategy.

---

## 2. Functional Requirements

### 2.1 Core Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-001 | Clicking the settings icon on an active indicator opens the configuration modal | P0 | Modal: IndicatorConfig.tsx |
| FR-002 | Configuration modal displays appropriate fields for each indicator type | P0 | Fields vary by indicator |
| FR-003 | Parameter values are validated against min/max constraints before saving | P0 | Prevent invalid configurations |
| FR-004 | Chart recalculates and updates immediately when parameters are saved | P0 | No page refresh required |
| FR-005 | Configured parameters persist in IndicatorContext state | P0 | Survives UI interactions |
| FR-006 | Color picker remains available for customizing indicator colors | P1 | Existing functionality |
| FR-007 | Reset to defaults option available in configuration modal | P2 | Convenience feature |

### 2.2 User Interface Requirements

| ID | UI Element | Behavior | Location |
|----|------------|----------|----------|
| UI-001 | Settings Icon | Opens IndicatorConfig modal on click | Active Indicators List item |
| UI-002 | Parameter Input Fields | Freeform numeric input with validation | IndicatorConfig modal |
| UI-003 | Source Dropdown | Select price source (close, open, high, low, hl2, hlc3, ohlc4) | IndicatorConfig modal (where applicable) |
| UI-004 | Chart Legend | Displays indicator type with key parameters (e.g., "SMA (50)") | Chart overlay area |
| UI-005 | Active Indicator Item | Shows parameter summary (e.g., "(20)") next to indicator name | Indicators sidebar |
| UI-006 | Validation Error | Inline error message when value is out of range | Below input field |
| UI-007 | Save Button | Applies changes and closes modal | IndicatorConfig modal footer |
| UI-008 | Cancel Button | Discards changes and closes modal | IndicatorConfig modal footer |

---

## 3. Parameter Specifications

### 3.1 Moving Averages (SMA, EMA, WMA, DEMA, TEMA)

| Parameter | Type | Min | Max | Default | Description |
|-----------|------|-----|-----|---------|-------------|
| Period | integer | 1 | 500 | SMA: 20, EMA: 12, others: 20 | Number of periods for calculation |
| Source | enum | - | - | close | Price source: close, open, high, low, hl2, hlc3, ohlc4 |

### 3.2 Bollinger Bands

| Parameter | Type | Min | Max | Default | Description |
|-----------|------|-----|-----|---------|-------------|
| Period | integer | 1 | 500 | 20 | Moving average period |
| Standard Deviation | float | 0.1 | 5.0 | 2.0 | Band width multiplier |
| Source | enum | - | - | close | Price source |

### 3.3 RSI (Relative Strength Index)

| Parameter | Type | Min | Max | Default | Description |
|-----------|------|-----|-----|---------|-------------|
| Period | integer | 1 | 100 | 14 | RSI calculation period |
| Overbought | integer | 50 | 100 | 70 | Overbought threshold line |
| Oversold | integer | 0 | 50 | 30 | Oversold threshold line |

### 3.4 MACD

| Parameter | Type | Min | Max | Default | Description |
|-----------|------|-----|-----|---------|-------------|
| Fast Period | integer | 1 | 100 | 12 | Fast EMA period |
| Slow Period | integer | 1 | 200 | 26 | Slow EMA period |
| Signal Period | integer | 1 | 100 | 9 | Signal line EMA period |

### 3.5 Stochastic

| Parameter | Type | Min | Max | Default | Description |
|-----------|------|-----|-----|---------|-------------|
| K Period | integer | 1 | 100 | 14 | %K calculation period |
| D Period | integer | 1 | 100 | 3 | %D smoothing period |
| Overbought | integer | 50 | 100 | 80 | Overbought threshold |
| Oversold | integer | 0 | 50 | 20 | Oversold threshold |

### 3.6 Other Period-Based Indicators

| Indicator | Parameter | Min | Max | Default |
|-----------|-----------|-----|-----|---------|
| ATR | Period | 1 | 100 | 14 |
| ADX | Period | 1 | 100 | 14 |
| CCI | Period | 1 | 100 | 20 |
| MFI | Period | 1 | 100 | 14 |
| ROC | Period | 1 | 100 | 12 |
| Momentum | Period | 1 | 100 | 10 |
| Williams %R | Period | 1 | 100 | 14 |
| Aroon | Period | 1 | 100 | 25 |

---

## 4. Non-Functional Requirements

- **Performance:** Parameter changes should trigger chart update within 100ms for typical data sets
- **Validation:** All inputs must be validated on blur and before save; invalid submissions are blocked
- **Accessibility:** Input fields must have proper labels and error messages announced to screen readers
- **Responsiveness:** Configuration modal must be usable on mobile devices (min-width: 320px)

---

## 5. Acceptance Criteria

### 5.1 Functional Acceptance

- **AC-001:** User can click the settings/gear icon on any active indicator to open the configuration modal
- **AC-002:** Configuration modal displays the correct fields for the selected indicator type
- **AC-003:** Input fields show current parameter values when modal opens
- **AC-004:** Entering a value outside min/max range displays a validation error
- **AC-005:** Clicking Save with valid values closes the modal and updates the chart immediately
- **AC-006:** Clicking Cancel closes the modal without applying changes
- **AC-007:** Chart legend displays indicator name with key parameter(s) (e.g., "SMA (50)", "BB (20, 2)")
- **AC-008:** Active indicators list shows parameter summary next to indicator name

### 5.2 UI/UX Acceptance

- **AC-UI-001:** Input fields use consistent styling with the rest of the application
- **AC-UI-002:** Validation errors appear inline below the relevant field
- **AC-UI-003:** Modal is centered and has a backdrop overlay
- **AC-UI-004:** Color picker functionality remains accessible in the modal

### 5.3 Edge Cases

- **AC-EDGE-001:** Removing and re-adding the same indicator type resets to default parameters
- **AC-EDGE-002:** Multiple indicators of the same type can have different parameter configurations
- **AC-EDGE-003:** Extremely large period values (e.g., 500) with limited data handles gracefully (shows partial or no data)

---

## 6. Technical Context

### 6.1 Existing Infrastructure

| Component | Location | Current State |
|-----------|----------|---------------|
| Parameter Types | `src/frontend/src/types/indicators.ts` | Defined (MovingAverageParams, BollingerBandsParams, etc.) |
| Calculation Functions | `src/frontend/src/components/Indicators/calculations/` | Accept optional params |
| Config Modal | `src/frontend/src/components/Indicators/IndicatorConfig.tsx` | Exists with field definitions |
| Indicator State | `src/frontend/src/context/IndicatorContext.tsx` | Stores params in indicator objects |
| Active List | `src/frontend/src/components/Indicators/ActiveIndicatorsList.tsx` | Shows parameter summaries |

### 6.2 Integration Points

1. **IndicatorConfig.tsx** → Renders parameter fields, handles validation, saves to context
2. **IndicatorContext.tsx** → Stores parameter values, triggers re-renders on change
3. **Calculation functions** → Receive params from context, compute indicator values
4. **Legend.tsx** → Reads params from context to display formatted indicator names
5. **ActiveIndicatorsList.tsx** → Reads params to show summary in sidebar

---

## 7. Open Questions

| ID | Question | Status | Resolution |
|----|----------|--------|------------|
| OQ-001 | Should parameter presets be offered (e.g., "Fast", "Standard", "Slow" for moving averages)? | Deferred | Out of scope for initial implementation |
| OQ-002 | Should we persist user's preferred parameters in localStorage? | Deferred | Consider for future enhancement |
