export class PromptBuilder {
  static buildPrompt(evidence) {
    const categories = [
      'Product Bug',
      'UI Bug',
      'Backend Bug',
      'API Bug',
      'Database Bug',
      'Security Issue',
      'Performance Issue',
      'Automation Script Issue',
      'Locator Issue',
      'Timing Issue',
      'Environment Issue',
      'Configuration Issue',
      'Network Issue',
      'Test Data Issue',
      'Third Party Integration',
      'Browser Compatibility',
      'Unknown'
    ];

    const owners = ['Frontend Team', 'Backend Team', 'QA', 'DevOps', 'Database Team'];
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const priorities = ['P1', 'P2', 'P3', 'P4'];

    const systemPrompt = `You are a Principal Software Quality Architect and AI Root Cause Investigation Engine.
Your task is to analyze test failure evidence collected from automated Playwright test execution and produce a thorough, professional investigation analysis.

CRITICAL INSTRUCTIONS:
- You must perform semantic analysis on the provided evidence.
- Select EXACTLY ONE category from the following allowed categories:
  ${categories.join(', ')}
- You MUST provide clear, logical reasoning explaining WHY the category was selected.
- Output MUST be strictly valid JSON without any surrounding conversational text or markdown codeblock wrappers.

REQUIRED JSON RESPONSE SCHEMA:
{
  "category": "<Must be one of the allowed categories>",
  "confidence": <integer between 0 and 100>,
  "failureSummary": "<Clear business-language summary of what failed without merely repeating assertion string>",
  "reasoning": "<In-depth technical and architectural explanation of why this category was selected>",
  "supportingEvidence": [
    "<Specific observation 1 from DOM/Console/Network/StackTrace>",
    "<Specific observation 2>",
    "<Specific observation 3>"
  ],
  "businessImpact": {
    "customerImpact": "<Impact on end users>",
    "businessRisk": "<Revenue/operational/brand risk>",
    "regressionRisk": "<Likelihood of side effects>",
    "releaseRisk": "<Impact on current deployment/release GO/NO-GO decision>"
  },
  "recommendation": "<Step-by-step developer inspection guide (e.g. Inspect updateCart(), verify total calculation)>",
  "nextInvestigation": "<Next debugging steps for engineering>",
  "suggestedFix": "<Concrete code or config fix>",
  "suggestedOwner": "<Must be one of: ${owners.join(', ')}>",
  "severity": "<Must be one of: ${severities.join(', ')}>",
  "priority": "<Must be one of: ${priorities.join(', ')}>"
}`;

    const userPrompt = `EXAMINE THE FOLLOWING AUTOMATED TEST FAILURE EVIDENCE:

==================================================
TEST CONTEXT
==================================================
Execution ID: ${evidence.executionId || 'N/A'}
Timestamp: ${evidence.timestamp || 'N/A'}
Test Case: ${evidence.testName || 'N/A'}
Requirement ID: ${evidence.requirementId || 'N/A'}
Environment: ${evidence.environment || 'N/A'}
Build Number: ${evidence.buildNumber || 'N/A'}
Application Version: ${evidence.applicationVersion || 'N/A'}
Browser: ${evidence.browser || 'N/A'}
OS: ${evidence.os || 'N/A'}
URL: ${evidence.url || 'N/A'}
Execution Duration: ${evidence.executionDuration || 'N/A'}

==================================================
ASSERTION & ERROR DETAILS
==================================================
Expected Result: ${evidence.expectedResult || 'N/A'}
Actual Result: ${evidence.actualResult || 'N/A'}
Failed Locator: ${evidence.failedLocator || 'N/A'}

Stack Trace:
${evidence.stackTrace || 'N/A'}

==================================================
CONSOLE LOGS (${(evidence.consoleLogs || []).length} entries)
==================================================
${(evidence.consoleLogs || []).slice(0, 15).join('\n') || 'No console logs captured.'}

==================================================
NETWORK REQUESTS (${(evidence.networkRequests || []).length} entries)
==================================================
${(evidence.networkRequests || []).slice(0, 15).map(r => `[${r.method}] ${r.url} - Status: ${r.status} ${r.failure ? `(${r.failure})` : ''}`).join('\n') || 'No network requests captured.'}

==================================================
DOM / HTML SNAPSHOT (Excerpt)
==================================================
${(evidence.domSnapshot || '').substring(0, 3000) || 'No DOM snapshot captured.'}

Provide your complete analysis strictly as JSON matching the schema outlined above.`;

    return { systemPrompt, userPrompt };
  }
}
