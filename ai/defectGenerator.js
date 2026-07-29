import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DefectGenerator {
  /**
   * Generates a Markdown Defect Report when generateDefect is TRUE.
   * Deduplicates by hashing the failure signature (testName + failedLocator + actualResult).
   * The same failure across multiple runs produces the same BUG-<hash>.md, overwriting the previous file.
   */
  static generateDefect(analysis, evidence) {
    const defectsDir = path.resolve(__dirname, '../defects');
    if (!fs.existsSync(defectsDir)) {
      fs.mkdirSync(defectsDir, { recursive: true });
    }

    // Deterministic ID from failure signature
    const signature = [
      evidence.testName || '',
      evidence.failedLocator || '',
      evidence.actualResult || '',
      evidence.expectedResult || '',
    ].join('|');
    const hash = crypto.createHash('md5').update(signature).digest('hex').substring(0, 8).toUpperCase();
    const defectId = `BUG-${hash}`;
    const defectFilename = `${defectId}.md`;
    const defectPath = path.join(defectsDir, defectFilename);

    // Track recurrence count if file already exists
    let recurrenceCount = 1;
    let firstSeen = new Date().toISOString();
    if (fs.existsSync(defectPath)) {
      const existingContent = fs.readFileSync(defectPath, 'utf-8');
      const recurrenceMatch = existingContent.match(/\*\*Recurrence:\*\* (\d+)/);
      recurrenceCount = recurrenceMatch ? parseInt(recurrenceMatch[1], 10) + 1 : 2;
      const firstSeenMatch = existingContent.match(/\*\*First Seen:\*\* (.+)/);
      if (firstSeenMatch) firstSeen = firstSeenMatch[1].trim();
    }

    const moduleName = evidence.url.includes('search') ? 'Search' :
                       evidence.url.includes('cart') ? 'Cart' : 'Home Page';

    const content = `# ${defectId}: ${analysis.failureSummary}

**First Seen:** ${firstSeen}
**Last Seen:** ${new Date().toISOString()}
**Recurrence:** ${recurrenceCount}
**Module:** ${moduleName}
**Test Case:** ${evidence.testName}
**Requirement ID:** ${evidence.requirementId || 'N/A'}
**Browser:** ${evidence.browser}
**URL:** ${evidence.url}
**Severity:** ${analysis.severity}
**Priority:** ${analysis.priority}
**Confidence:** ${analysis.confidence}%
**Suggested Owner:** ${analysis.suggestedOwner}

## Summary
${analysis.failureSummary}

## Steps to Reproduce
1. Navigate to ${evidence.url}
2. Perform test sequence: ${evidence.testName}
3. Observe actual outcome: ${evidence.actualResult}

## Expected Result
${evidence.expectedResult}

## Actual Result
${evidence.actualResult}

## Root Cause Analysis (AI Classification)
**Category:** ${analysis.category}
**Reasoning:** ${analysis.reasoning}

## Supporting Evidence
${(analysis.supportingEvidence || []).map(s => `- ${s}`).join('\n') || '- Execution logs and screenshots captured'}

## Business Impact
- **Customer Impact:** ${analysis.businessImpact?.customerImpact || 'N/A'}
- **Business Risk:** ${analysis.businessImpact?.businessRisk || 'N/A'}
- **Regression Risk:** ${analysis.businessImpact?.regressionRisk || 'N/A'}
- **Release Risk:** ${analysis.businessImpact?.releaseRisk || 'N/A'}

## Recommended Fix
${analysis.suggestedFix}

## Recommended Developer Action
${analysis.recommendation}

## Attachments
${evidence.screenshot ? `- Screenshot: ${evidence.screenshot}` : ''}
${evidence.trace ? `- Trace: ${evidence.trace}` : ''}
${evidence.video ? `- Video: ${evidence.video}` : ''}
`;

    fs.writeFileSync(defectPath, content, 'utf-8');
    const action = recurrenceCount > 1 ? 'updated (recurrence tracked)' : 'created';
    console.log(`[Defect Generator] Defect ${action}: ${defectPath}`);
    return defectPath;
  }
}
