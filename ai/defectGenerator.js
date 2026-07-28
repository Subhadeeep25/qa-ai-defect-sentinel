import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class DefectGenerator {
  /**
   * Generates a Markdown Defect Report when generateDefect is TRUE.
   * Consumes only structured AI analysis JSON and evidence context.
   */
  static generateDefect(analysis, evidence) {
    const defectsDir = path.resolve(__dirname, '../defects');
    if (!fs.existsSync(defectsDir)) {
      fs.mkdirSync(defectsDir, { recursive: true });
    }

    const defectId = `BUG-${uuidv4().substring(0, 8).toUpperCase()}`;
    const defectFilename = `${defectId}.md`;
    const defectPath = path.join(defectsDir, defectFilename);

    const moduleName = evidence.url.includes('search') ? 'Search' :
                       evidence.url.includes('cart') ? 'Cart' : 'Home Page';

    const content = `# ${defectId}: ${analysis.failureSummary}

**Date:** ${new Date().toISOString()}
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
    console.log(`[Defect Generator] Defect created: ${defectPath}`);
    return defectPath;
  }
}
