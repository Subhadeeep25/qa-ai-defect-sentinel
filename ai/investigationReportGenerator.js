import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class InvestigationReportGenerator {
  /**
   * Generates Investigation Report Markdown strictly from structured AI analysis JSON and evidence context.
   * Does NOT contain business classification logic.
   */
  static generateReport(analysis, evidence) {
    const invDir = path.resolve(__dirname, '../defects/investigations');
    if (!fs.existsSync(invDir)) {
      fs.mkdirSync(invDir, { recursive: true });
    }

    const tcMatch = (evidence.testName || '').match(/TC(\d+)/i);
    const tcNumber = tcMatch ? `TC${tcMatch[1]}` : 'TC000';
    const now = new Date();
    const datetimeStr = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
    const reportFilename = `INV-${tcNumber}-${datetimeStr}.md`;
    const reportPath = path.join(invDir, reportFilename);

    const consoleCount = (evidence.consoleLogs || []).length;
    const networkCount = (evidence.networkRequests || []).length;
    const generateDefectText = analysis.generateDefect ? 'TRUE' : 'FALSE';

    const content = `==================================================
INVESTIGATION REPORT
==================================================
Execution ID: ${evidence.executionId || 'N/A'}
Timestamp: ${evidence.timestamp || new Date().toISOString()}
Test Case: ${evidence.testName || 'N/A'}
Requirement ID: ${evidence.requirementId || 'N/A'}
Build: ${evidence.buildNumber || 'N/A'}
Environment: ${evidence.environment || 'N/A'}
Browser: ${evidence.browser || 'N/A'}
OS: ${evidence.os || 'N/A'}
URL: ${evidence.url || 'N/A'}
Execution Duration: ${evidence.executionDuration || 'N/A'}

==================================================
FAILURE SUMMARY
==================================================
${analysis.failureSummary}

==================================================
EXPECTED BEHAVIOR
==================================================
${evidence.expectedResult || 'Specified test criteria to pass'}

==================================================
ACTUAL BEHAVIOR
==================================================
${evidence.actualResult || 'Assertion failure during test execution'}

==================================================
INITIAL OBSERVATIONS
==================================================
DOM: ${evidence.domSnapshot ? `${evidence.domSnapshot.length} characters captured` : 'N/A'}
Console: ${consoleCount} log entries recorded
Network: ${networkCount} requests logged
UI: URL ${evidence.url} rendering state evaluated
Application State: Active session on ${evidence.browser}

==================================================
EVIDENCE
==================================================
Screenshot: ${evidence.screenshot || 'N/A'}
Trace: ${evidence.trace || 'N/A'}
Video: ${evidence.video || 'N/A'}
Console: ${consoleCount} entries
Network: ${networkCount} entries
DOM Snapshot: ${evidence.domSnapshot ? 'Captured' : 'N/A'}
Stack Trace:
${evidence.stackTrace || 'N/A'}

==================================================
AI ROOT CAUSE ANALYSIS
==================================================
Category: ${analysis.category}
Confidence: ${analysis.confidence}%
Reasoning:
${analysis.reasoning}

Supporting Evidence:
${(analysis.supportingEvidence || []).map(s => `- ${s}`).join('\n') || '- Evidence collected from test execution context'}

==================================================
BUSINESS IMPACT
==================================================
Customer Impact: ${analysis.businessImpact?.customerImpact || 'N/A'}
Business Risk: ${analysis.businessImpact?.businessRisk || 'N/A'}
Regression Risk: ${analysis.businessImpact?.regressionRisk || 'N/A'}
Release Risk: ${analysis.businessImpact?.releaseRisk || 'N/A'}

==================================================
RECOMMENDED INVESTIGATION
==================================================
${analysis.recommendation}

==================================================
POSSIBLE FIX
==================================================
${analysis.suggestedFix}

==================================================
SUGGESTED OWNER
==================================================
${analysis.suggestedOwner}

==================================================
SEVERITY
==================================================
${analysis.severity}

==================================================
PRIORITY
==================================================
${analysis.priority}

==================================================
AI CONFIDENCE
==================================================
${analysis.confidence}%

==================================================
Generate Defect?
==================================================
${generateDefectText}
`;

    fs.writeFileSync(reportPath, content, 'utf-8');
    console.log(`[Investigation Report Generator] Report created: ${reportPath}`);
    return reportPath;
  }
}
