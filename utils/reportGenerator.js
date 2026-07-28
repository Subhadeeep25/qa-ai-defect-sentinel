import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ExecutionReportGenerator {
  generateReport(results, failureCategories, topFailingModules, topRootCauses, defectsCreated, investigationsGenerated) {
    const passRate = results.total > 0
      ? ((results.passed / results.total) * 100).toFixed(2) + '%'
      : '0%';
    const executionTime = results.endTime - results.startTime;

    const report = {
      totalTests: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      executionTime,
      passRate,
      failureCategories,
      topFailingModules,
      topRootCauses,
      defectsCreated,
      investigationsGenerated,
      releaseRecommendation: results.failed === 0 ? 'GO' : 'NO-GO',
      generatedAt: new Date().toISOString(),
    };

    this.saveReport(report);
    return report;
  }

  saveReport(report) {
    const reportsDir = path.resolve(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const mdContent = `# Execution Report

**Generated:** ${report.generatedAt}

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | ${report.totalTests} |
| Passed | ${report.passed} |
| Failed | ${report.failed} |
| Skipped | ${report.skipped} |
| Pass Rate | ${report.passRate} |
| Execution Time | ${report.executionTime}ms |
| Defects Created | ${report.defectsCreated} |
| Investigations | ${report.investigationsGenerated} |
| Release Decision | **${report.releaseRecommendation}** |

## Failure Categories
${Object.entries(report.failureCategories).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Top Failing Modules
${report.topFailingModules.map(m => `- ${m}`).join('\n')}

## Top Root Causes
${report.topRootCauses.map(c => `- ${c}`).join('\n')}
`;

    const timestamp = Date.now();
    fs.writeFileSync(
      path.join(reportsDir, `execution-report-${timestamp}.json`),
      JSON.stringify(report, null, 2),
      'utf-8'
    );
    fs.writeFileSync(
      path.join(reportsDir, `execution-report-${timestamp}.md`),
      mdContent,
      'utf-8'
    );

    console.log(`[Report] Execution report saved to reports/`);
    return report;
  }
}