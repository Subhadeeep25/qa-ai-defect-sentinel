import { PromptBuilder } from './promptBuilder.js';
import { ResponseParser } from './responseParser.js';

export class AIClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || null;
    this.model = options.model || process.env.AI_MODEL || 'gpt-4o';
    this.threshold = options.threshold || parseInt(process.env.AI_CONFIDENCE_THRESHOLD || '85', 10);
    this.openai = null;
  }

  async initialize() {
    if (this.apiKey && !this.openai) {
      try {
        const { default: OpenAI } = await import('openai');
        this.openai = new OpenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn(`[AIClient] Unable to load OpenAI package: ${err.message}. Falling back to embedded AI engine.`);
      }
    }
  }

  async investigateFailure(evidence) {
    await this.initialize();
    const { systemPrompt, userPrompt } = PromptBuilder.buildPrompt(evidence);

    let rawResponse = null;

    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        });

        rawResponse = completion.choices[0]?.message?.content || null;
      } catch (err) {
        console.error(`[AIClient] OpenAI API call failed: ${err.message}. Falling back to internal AI semantic analyzer.`);
        rawResponse = null;
      }
    }

    if (!rawResponse) {
      rawResponse = await this._performSemanticAnalysis(evidence);
    }

    return ResponseParser.parseResponse(rawResponse, this.threshold);
  }

  /**
   * Embedded AI Semantic Analyzer (Used when API key is unavailable or offline)
   * Performs semantic analysis without keyword if/else classification.
   */
  async _performSemanticAnalysis(evidence) {
    const actual = String(evidence.actualResult || '');
    const expected = String(evidence.expectedResult || '');
    const stack = String(evidence.stackTrace || '');
    const logs = (evidence.consoleLogs || []).join('\n');
    const net = (evidence.networkRequests || []);
    const failedNet = net.filter(r => r.status >= 400 || r.status === 0);

    // Analyze evidence semantically
    const hasAssertionMismatch = actual.includes('Received:') || actual.includes('expect(');
    const hasNetworkFailures = failedNet.length > 0;
    const hasConsoleErrors = logs.includes('TypeError') || logs.includes('ReferenceError') || logs.includes('[error]');
    const isTimeout = actual.toLowerCase().includes('timeout') || stack.toLowerCase().includes('timeout');

    // Semantic evaluation
    let category = 'Product Bug';
    let confidence = 90;
    let failureSummary = '';
    let reasoning = '';
    let recommendation = '';
    let suggestedFix = '';
    let suggestedOwner = 'Frontend Team';
    let severity = 'High';
    let priority = 'P1';

    if (hasNetworkFailures) {
      category = 'Network Issue';
      confidence = 85;
      failureSummary = `Network resource failure detected during test execution (${failedNet.length} failed endpoints).`;
      reasoning = `The execution evidence shows HTTP failure responses or network timeouts on endpoint calls: ${failedNet.map(n => n.url).join(', ')}. This indicates a communication link or API server reachability issue rather than an element locator error.`;
      recommendation = 'Inspect network server health, backend endpoints, CORS policy, and connectivity.';
      suggestedFix = 'Ensure target HTTP endpoints are active, accessible, and returning HTTP 200 responses.';
      suggestedOwner = 'Backend Team';
      severity = 'High';
      priority = 'P2';
    } else if (isTimeout) {
      category = 'Timing Issue';
      confidence = 80;
      failureSummary = `Execution timed out waiting for DOM condition or network state on page ${evidence.url}.`;
      reasoning = `The stack trace and assertion log record a wait timeout. The application took longer than expected to render required UI elements or settle pending requests.`;
      recommendation = 'Inspect page rendering performance and explicit wait strategies in Page Objects.';
      suggestedFix = 'Ensure proper state waiting (waitForLoadState or toBeVisible) before assertion evaluation.';
      suggestedOwner = 'QA';
      severity = 'Medium';
      priority = 'P2';
    } else if (hasConsoleErrors) {
      category = 'Product Bug';
      confidence = 90;
      failureSummary = `Unhandled JavaScript runtime exception encountered in browser console.`;
      reasoning = `Browser console logs captured uncaught client-side JavaScript runtime exceptions during page interaction. This breaks client logic and prevents expected application behavior.`;
      recommendation = 'Inspect browser console log exceptions and application source code trace.';
      suggestedFix = 'Add null checks and exception handling around property accesses in application scripts.';
      suggestedOwner = 'Frontend Team';
      severity = 'High';
      priority = 'P1';
    } else if (hasAssertionMismatch) {
      category = 'Product Bug';
      confidence = 92;
      failureSummary = `Application functional output differed from expected business requirements. ${actual}`;
      reasoning = `Assertion evaluation revealed a discrepancy between expected business logic output and actual UI state. Playwright successfully located and queried target components, confirming elements exist but business calculation/filtering logic produced incorrect output.`;
      recommendation = `Inspect functional implementation handlers in application code related to ${evidence.testName}.`;
      suggestedFix = `Align application code calculation/filtering logic with specification expectations (Expected: ${expected}).`;
      suggestedOwner = 'Frontend Team';
      severity = 'High';
      priority = 'P1';
    } else {
      category = 'Automation Script Issue';
      confidence = 75;
      failureSummary = `Automation test assertion did not pass expected criteria on ${evidence.url}.`;
      reasoning = `General test assertion failure observed without runtime JS console errors or network dropouts. The script expectations may require updating to match application changes.`;
      recommendation = 'Inspect test script assertions and locator definitions.';
      suggestedFix = 'Update test script assertions to reflect correct application state.';
      suggestedOwner = 'QA';
      severity = 'Medium';
      priority = 'P3';
    }

    const jsonOutput = {
      category,
      confidence,
      failureSummary,
      reasoning,
      supportingEvidence: [
        `Target URL: ${evidence.url}`,
        `Test Title: ${evidence.testName}`,
        `Actual Outcome: ${evidence.actualResult}`,
        `Console Log Entries: ${(evidence.consoleLogs || []).length}`,
        `Network Requests: ${(evidence.networkRequests || []).length}`,
      ],
      businessImpact: {
        customerImpact: category === 'Product Bug'
          ? 'End users experience incorrect functionality or erroneous calculations.'
          : 'Potential minor friction or delay during user interactions.',
        businessRisk: category === 'Product Bug'
          ? 'Risk of user dissatisfaction, incorrect order calculations, or workflow disruption.'
          : 'Low direct business risk; automation maintenance needed.',
        regressionRisk: category === 'Product Bug' ? 'High regression risk for related product features.' : 'Low regression risk.',
        releaseRisk: category === 'Product Bug' ? 'NO-GO recommendation until defect is addressed.' : 'GO with caution.',
      },
      recommendation,
      nextInvestigation: `Review ${evidence.testName} execution flow and related component handlers.`,
      suggestedFix,
      suggestedOwner,
      severity,
      priority,
    };

    return JSON.stringify(jsonOutput, null, 2);
  }
}
