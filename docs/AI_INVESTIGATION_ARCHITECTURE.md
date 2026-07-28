# AI Investigation Engine & Framework Architecture Documentation

## 1. Overview

The **BuggyShop AI Investigation Engine** is an enterprise-grade test failure analysis architecture integrated into Playwright test automation. 

### Core Philosophy:
1. **Playwright controls test execution**: Playwright determines whether a test passes or fails based on assertions and timeouts.
2. **AI activates AFTER failure**: The AI engine is triggered only when an assertion or runtime error occurs.
3. **Single Report per Failure**: Report generation is deferred until the **final retry attempt** (`retry === maxRetries`) to ensure exactly one investigation report and one defect report are created per failing test case.
4. **No Business Logic in Generators**: Generators are pure templates consuming structured JSON produced by the AI.

---

## 2. End-to-End Execution Flow

```
+-----------------------------------------------------------------------+
| 1. Playwright Test Assertion Failure                                  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 2. Fixture Teardown (_autoFailureHandler in fixtures/index.js)       |
|    - Checks: status !== 'passed' AND isFinalAttempt (retry >= retries)|
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 3. Evidence Collector (ai/evidenceCollector.js)                      |
|    - Captures: Browser, OS, URL, Viewport, Test Name, Duration,       |
|      Expected/Actual Results, Screenshots, Videos, Traces, DOM/HTML,  |
|      Console Logs, Network Requests, Stack Trace, Environment.        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 4. Prompt Builder (ai/promptBuilder.js)                              |
|    - Normalizes evidence into a structured system & user prompt.      |
|    - Enforces JSON output schema & allowed failure categories.        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 5. AI Client (ai/aiClient.js)                                         |
|    - Sends prompt to OpenAI API (gpt-4o) if API Key is configured.    |
|    - Falls back to internal semantic reasoning engine if offline.     |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 6. Response Parser (ai/responseParser.js)                            |
|    - Strips markdown code blocks and validates JSON structure.       |
|    - Evaluates: generateDefect = (isProductBug && confidence >= 85)   |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 7. Investigation Report Generator (ai/investigationReportGenerator.js)|
|    - Renders Markdown report matching AI_INVESTIGATION_SPEC template.  |
|    - Output: defects/investigations/INV-{TC_NUMBER}-{DATETIME}.md    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
| 8. Defect Generator (ai/defectGenerator.js)                          |
|    - If generateDefect === true:                                     |
|    - Output: defects/BUG-{UUID}.md                                   |
+-----------------------------------------------------------------------+
```

---

## 3. How the AI Investigation Engine Works

### Step A: Semantic Evidence Normalization
When a test fails, `EvidenceCollector` collects both runtime metrics (CPU, OS, Viewport, Browser) and execution artifacts (DOM snapshot, Network request log, Console error log, Stack trace, Failed locator).

### Step B: Structured Prompt Synthesis
`PromptBuilder` assembles the collected evidence into a clean prompt. It constrains the AI to select **exactly one** of the 17 standardized failure categories:

- `Product Bug`
- `UI Bug`
- `Backend Bug`
- `API Bug`
- `Database Bug`
- `Security Issue`
- `Performance Issue`
- `Automation Script Issue`
- `Locator Issue`
- `Timing Issue`
- `Environment Issue`
- `Configuration Issue`
- `Network Issue`
- `Test Data Issue`
- `Third Party Integration`
- `Browser Compatibility`
- `Unknown`

### Step C: AI Analysis & Response Parsing
The `AIClient` interacts with OpenAI (`gpt-4o`) or the embedded semantic reasoning engine. The AI evaluates:
1. **Assertion Discrepancies**: Expected vs. Actual output.
2. **Network State**: HTTP status codes (`4xx`/`5xx` or request failures).
3. **Browser Console**: Uncaught `TypeError`, `ReferenceError`, or runtime exceptions.
4. **DOM Structure**: Missing or hidden target elements.

The output is parsed by `ResponseParser` into a strict JSON payload:

```json
{
  "category": "Product Bug",
  "confidence": 92,
  "failureSummary": "Cart total miscalculation detected during item addition.",
  "reasoning": "Assertion evaluation revealed a discrepancy between expected business logic output and actual UI state...",
  "supportingEvidence": [
    "Target URL: http://localhost:5500/",
    "Actual Outcome: Received: 69900",
    "Network Requests: 14 recorded"
  ],
  "businessImpact": {
    "customerImpact": "End users experience incorrect financial calculations in checkout.",
    "businessRisk": "Revenue loss and customer distrust.",
    "regressionRisk": "High regression risk for related checkout features.",
    "releaseRisk": "NO-GO recommendation until defect is addressed."
  },
  "recommendation": "Inspect updateCart() in application source code.",
  "nextInvestigation": "Review arithmetic calculations in app.js.",
  "suggestedFix": "Remove the -100 subtraction in updateCart().",
  "suggestedOwner": "Frontend Team",
  "severity": "High",
  "priority": "P1",
  "generateDefect": true
}
```

### Step D: Report & Defect Creation
- **Investigation Report**: Always generated for every failure on the final attempt. Saved as `defects/investigations/INV-TC{NUM}-{TIMESTAMP}.md`.
- **Defect Report**: Generated only when `generateDefect === true` (i.e. `category` is a product/application bug AND `confidence >= threshold`). Saved as `defects/BUG-{UUID}.md`.

---

## 4. File-by-File Reference Directory

### 📁 AI Engine Modules (`ai/`)

| File Path | Description & Role |
|---|---|
| [ai/evidenceCollector.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/evidenceCollector.js) | Captures test context, DOM snapshot, console logs, failed network requests, screenshots, stack traces, requirement IDs, and environment info. |
| [ai/promptBuilder.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/promptBuilder.js) | Formats collected evidence into a structured system/user prompt for the AI LLM model with strict JSON schema instructions. |
| [ai/aiClient.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/aiClient.js) | Client module that invokes OpenAI API (`gpt-4o`) or executes internal semantic reasoning logic when running offline. |
| [ai/responseParser.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/responseParser.js) | Parses AI response text, cleans markdown wrappers, validates JSON structure, and determines if `generateDefect` criteria is met. |
| [ai/investigationReportGenerator.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/investigationReportGenerator.js) | Generates the Markdown investigation report following the exact specification format. Consumes only AI JSON output. |
| [ai/defectGenerator.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/defectGenerator.js) | Generates formal Markdown defect reports (`defects/BUG-{id}.md`) when a product bug is confirmed by the AI. |
| [ai/index.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/ai/index.js) | ES Module barrel export file for all AI submodules. |

---

### 📁 Test Suite & Utilities (`utils/`, `fixtures/`, `pages/`)

| File Path | Description & Role |
|---|---|
| [fixtures/index.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/fixtures/index.js) | Custom Playwright test fixture extending base test with Page Objects, EvidenceCollector, and the auto-failure handler hook on final retry attempt. |
| [utils/failureHandler.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/utils/failureHandler.js) | Main orchestrator calling `captureEvidence()`, `aiClient.investigateFailure()`, `InvestigationReportGenerator`, and `DefectGenerator`. |
| [utils/evidenceCollector.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/utils/evidenceCollector.js) | Re-exports `EvidenceCollector` for backward compatibility across utility imports. |
| [utils/logger.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/utils/logger.js) | Winston logger configured for console and file logging (`logs/combined.log` and `logs/error.log`). |
| [utils/reportGenerator.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/utils/reportGenerator.js) | Generates execution run summary markdown and JSON reports after suite completion. |
| [pages/BasePage.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/pages/BasePage.js) | Parent Page Object class providing common navigation, load state waiting, and text extraction methods. |
| [pages/HomePage.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/pages/HomePage.js) | Page Object representing BuggyShop homepage product grid, header, footer, and search actions. |
| [pages/CartComponent.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/pages/CartComponent.js) | Page Object representing the shopping cart section, item list, badge count, and total calculation. |
| [pages/SearchComponent.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/pages/SearchComponent.js) | Page Object representing the search input component. |

---

### 📁 Application Under Test & Configuration

| File Path | Description & Role |
|---|---|
| [application/index.html](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/application/index.html) | Main HTML interface of BuggyShop QA practice web application. |
| [application/app.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/application/app.js) | Frontend JavaScript logic containing intentional bugs (out-of-stock addition, -100 cart total error, case-sensitive search). |
| [playwright.config.js](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/playwright.config.js) | Main Playwright configuration file defining test directory, timeouts, retries, reporters, and local HTTP webServer setup. |
| [.env](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/.env) | Environment variables configuration file (`BASE_URL`, `RETRIES`, `AI_CONFIDENCE_THRESHOLD`, `OPENAI_API_KEY`). |
| [docs/AI_INVESTIGATION_SPEC.md](file:///c:/Users/SubhadeepMaji/Downloads/BuggyShop_QA_Practice/docs/AI_INVESTIGATION_SPEC.md) | Technical specification document detailing required engine features, failure categories, and report templates. |
