import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { EvidenceCollector } from './evidenceCollector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class FailureHandler {
  constructor(page, testInfo, evidenceCollector = null) {
    this.page = page;
    this.testInfo = testInfo;
    this.evidenceCollector = evidenceCollector;
    this.threshold = parseInt(process.env.AI_CONFIDENCE_THRESHOLD || '85', 10);
  }

  async handleFailure(error) {
    console.log(`[FailureHandler] Failure detected in test: "${this.testInfo.title}"`);
    console.log(`[FailureHandler] Error details: ${error.message}`);

    // 1. Capture Evidence
    let evidence;
    if (this.evidenceCollector && typeof this.evidenceCollector.captureEvidence === 'function') {
      evidence = await this.evidenceCollector.captureEvidence(error);
    } else {
      const collector = new EvidenceCollector(this.page, this.testInfo);
      await collector.initialize();
      evidence = await collector.captureEvidence(error);
    }

    // 2. Trigger Python AI Sentinel Engine
    console.log(`[FailureHandler] Triggering Python AI Investigation Sentinel...`);
    let analysis = null;

    try {
      const rootDir = path.resolve(__dirname, '..');
      const pyProcess = spawnSync('python', ['-m', 'ai', `--threshold=${this.threshold}`], {
        input: JSON.stringify(evidence),
        encoding: 'utf-8',
        cwd: rootDir,
        maxBuffer: 10 * 1024 * 1024,
      });

      if (pyProcess.status === 0 && pyProcess.stdout) {
        const pyResult = JSON.parse(pyProcess.stdout.trim());
        if (pyResult.analysis) {
          analysis = pyResult.analysis;
          console.log(`[FailureHandler] Python AI Category: ${analysis.category} | Confidence: ${analysis.confidence}% | Severity: ${analysis.severity}`);
          if (pyResult.investigationReport) {
            console.log(`[FailureHandler] Investigation report generated: ${pyResult.investigationReport}`);
          }
          if (pyResult.defectReport) {
            console.log(`[FailureHandler] Defect report generated: ${pyResult.defectReport}`);
          }
          return { analysis, evidence };
        }
      } else {
        const errMsg = pyProcess.stderr || pyProcess.error?.message || 'Unknown Python process failure';
        console.error(`[FailureHandler] Python AI engine error: ${errMsg}`);
      }
    } catch (pyErr) {
      console.error(`[FailureHandler] Python invocation error: ${pyErr.message}`);
    }

    return { analysis, evidence };
  }
}