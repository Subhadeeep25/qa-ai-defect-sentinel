# BuggyShop QA Practice & AI Automation Framework

An enterprise-grade JavaScript **Playwright Automation Framework** paired with an **AI Investigation Engine** testing a deliberately buggy e-commerce web application (**BuggyShop**).

---

## 📌 Project Overview

This project serves as a comprehensive QA automation practice and AI-assisted defect investigation environment. It consists of two main parts:

1. **BuggyShop Application** (`application/`): A single-page e-commerce website with product listings, real-time search filtering, cart management, and intentional application defects.
2. **AI Playwright Automation Framework** (`tests/`, `pages/`, `fixtures/`, `utils/`, `ai/`): A modular JavaScript test suite built on the **Page Object Model (POM)** pattern. It features an automated **AI Investigation Engine** that activates upon test failure to capture evidence, semantically classify failure root causes, and generate Markdown investigation reports and defect reports.

---

## 🛠️ Technology Stack

- **Core**: Node.js (ES Modules `"type": "module"`)
- **Automation**: Playwright (JavaScript)
- **Architecture**: Page Object Model (POM) + Fixture Injection
- **AI Investigation**: OpenAI API (`gpt-4o`) + Fallback AI Semantic Engine
- **Logging**: Winston Logger (`logs/`)
- **Reporting**: Playwright HTML, JSON, JUnit XML, and Markdown AI Reports (`defects/`)

---

## 🤖 Deep Dive: The `ai/` Folder (File-by-File Purpose)

The `ai/` folder houses the complete **AI Investigation Engine**. It operates without hardcoded keyword rules, utilizing structured prompts and semantic analysis to investigate test failures.

```
ai/
├── evidenceCollector.js
├── promptBuilder.js
├── aiClient.js
├── responseParser.js
├── investigationReportGenerator.js
├── defectGenerator.js
└── index.js
```

### 📄 `ai/evidenceCollector.js`
- **Purpose**: Gathers and normalizes execution evidence at the exact moment a test fails.
- **What it does**:
  - Monitors browser console output (`console.log`, `console.error`) and failed network HTTP requests during test execution.
  - On failure, captures full-page screenshot (`screenshots/`), DOM snapshot, stack trace, requirement ID (`TC002`), URL, browser name, OS, viewport size, execution duration, and expected vs. actual outcomes.
  - Sanitizes ANSI terminal color escape codes from stack traces and assertion messages.

### 📄 `ai/promptBuilder.js`
- **Purpose**: Synthesizes the collected evidence into structured LLM system and user prompts.
- **What it does**:
  - Outlines the 17 allowed failure categories (`Product Bug`, `UI Bug`, `Backend Bug`, `API Bug`, `Locator Issue`, `Timing Issue`, `Network Issue`, `Security Issue`, etc.).
  - Instructs the AI to evaluate root causes, business risks, developer recommendations, suggested fixes, severity (`Critical`, `High`, `Medium`, `Low`), and priority (`P1`-`P4`).
  - Enforces a strict JSON output schema constraint.

### 📄 `ai/aiClient.js`
- **Purpose**: Orchestrates AI analysis execution.
- **What it does**:
  - Exposes `investigateFailure(evidence)`.
  - Connects to the OpenAI API (`gpt-4o`) using `OPENAI_API_KEY` or `AI_API_KEY` when configured in `.env`.
  - Includes a built-in AI semantic reasoning engine for offline/local runs without an API key that evaluates assertion discrepancies, stack frames, HTTP status codes, and console logs.

### 📄 `ai/responseParser.js`
- **Purpose**: Parses, validates, and cleans the raw output returned by the AI.
- **What it does**:
  - Removes markdown codeblock wrappers (` ```json ... ``` `).
  - Validates JSON structure against mandatory fields and provides safe fallbacks.
  - Evaluates the defect creation criteria:
    `generateDefect = (isProductBug && confidence >= threshold)` (Default threshold = 85%).

### 📄 `ai/investigationReportGenerator.js`
- **Purpose**: Formats and saves the Markdown Investigation Report.
- **What it does**:
  - Consumes **only** the structured JSON output from `ResponseParser` and evidence context (contains zero business classification logic).
  - Saves the report to `defects/investigations/INV-{TC_NUMBER}-{DATETIME}.md` using the exact template defined in `AI_INVESTIGATION_SPEC.md`.

### 📄 `ai/defectGenerator.js`
- **Purpose**: Formats and saves formal Markdown Defect Reports.
- **What it does**:
  - Consumes structured AI JSON output when `generateDefect === true`.
  - Creates bug tracking documents in `defects/BUG-{UUID}.md` containing steps to reproduce, root cause hypothesis, business risk, recommended developer actions, and attachments.

### 📄 `ai/index.js`
- **Purpose**: ES Module barrel export file.
- **What it does**:
  - Re-exports all AI submodules (`EvidenceCollector`, `PromptBuilder`, `AIClient`, `ResponseParser`, `InvestigationReportGenerator`, `DefectGenerator`) for clean imports across the framework.

---

## 🔄 Failure Handling Workflow

1. **Test Failure**: Playwright assertion or runtime error occurs.
2. **Retry Guard Check**: The fixture teardown (`fixtures/index.js`) checks `isFinalAttempt = (testInfo.retry >= testInfo.retries)`.
   - If retries remain: Report generation is deferred.
   - On the **final attempt**: The AI Investigation Engine triggers.
3. **Evidence Collection**: Screenshot, DOM snapshot, stack trace, console logs, network logs, and metadata are gathered.
4. **AI Semantic Analysis**: Prompt built -> AI Client called -> Response parsed into JSON.
5. **Report Output**:
   - `defects/investigations/INV-TC002-20260727_135000.md` generated.
   - `defects/BUG-XXXXXX.md` generated if confirmed as a product bug.

---

## 📁 Directory Structure Overview

```
BuggyShop_QA_Practice/
├── ai/                          # AI Investigation Engine modules
│   ├── aiClient.js
│   ├── defectGenerator.js
│   ├── evidenceCollector.js
│   ├── index.js
│   ├── investigationReportGenerator.js
│   ├── promptBuilder.js
│   └── responseParser.js
├── application/                 # Web Application Under Test
│   ├── index.html
│   └── app.js                   # Contains intentional bugs
├── defects/                     # Output AI defect & investigation reports
│   └── investigations/
├── docs/                        # Specifications & Architecture docs
│   ├── AI_INVESTIGATION_SPEC.md
│   └── AI_INVESTIGATION_ARCHITECTURE.md
├── fixtures/                    # Playwright custom fixtures & auto-failure hook
│   └── index.js
├── logs/                        # Winston log outputs (combined.log, error.log)
├── pages/                       # Page Object Model classes
│   ├── BasePage.js
│   ├── HomePage.js
│   ├── CartComponent.js
│   └── SearchComponent.js
├── reports/                     # Playwright HTML, JSON, JUnit execution reports
├── screenshots/                 # Captured full-page failure screenshots
├── tests/                       # Playwright test specs
│   ├── accessibility.spec.js
│   ├── boundary.spec.js
│   ├── crossbrowser.spec.js
│   ├── functional.spec.js
│   ├── negative.spec.js
│   ├── performance.spec.js
│   ├── regression.spec.js
│   ├── sanity.spec.js
│   ├── security.spec.js
│   ├── smoke.spec.js
│   └── ui.spec.js
├── utils/                       # Loggers, execution report generators, failure handler
│   ├── evidenceCollector.js
│   ├── failureHandler.js
│   ├── logger.js
│   └── reportGenerator.js
├── .env                         # Environment configuration
├── package.json                 # Dependencies & test scripts
└── playwright.config.js         # Playwright test runner configuration
```

---

## 🐛 Intentional Application Bugs (Under Test)

The BuggyShop application contains several known intentional defects designed for QA practice:

1. **Wrong Cart Total**: `app.js` subtracts ₹100 from total (`total - 100`).
2. **Out-of-Stock Addition**: Products with `stock: 0` (e.g. Samsung S24) can still be added to cart.
3. **Case-Sensitive Search**: Search `includes()` does not convert strings to lowercase.
4. **Duplicate Cart Items**: Adding the same item twice creates duplicate line items instead of incrementing quantity.
5. **No Stock Reduction**: Stock counter does not decrease after item is added.

---

## 🚀 How to Run Tests

### Prerequisites
- Node.js (v18+ recommended)

### Installation
```bash
npm install
```

### Running Tests
```bash
# Run all tests
npx playwright test

# Run tests in headed browser mode
npm run test:headed

# Run specific test by tag
npx playwright test --grep @smoke
npx playwright test --grep @regression

# Run a specific test case (e.g. TC002)
npx playwright test -g "TC002"

# View Playwright HTML Report
npx playwright show-report reports/html-report
```

---

## ⚙️ Environment Configuration (`.env`)

```env
BASE_URL=http://localhost:5500
HEADLESS=true
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720
TIMEOUT=30000
RETRIES=2
WORKERS=4
AI_CONFIDENCE_THRESHOLD=85
OPENAI_API_KEY=
LOG_LEVEL=info
```
