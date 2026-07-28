import { AIClient, InvestigationReportGenerator, DefectGenerator } from '../ai/index.js';

export class FailureHandler {
  constructor(page, testInfo, evidenceCollector = null) {
    this.page = page;
    this.testInfo = testInfo;
    this.evidenceCollector = evidenceCollector;
    this.aiClient = new AIClient({
      threshold: parseInt(process.env.AI_CONFIDENCE_THRESHOLD || '85', 10),
    });
  }

  async handleFailure(error) {
    console.log(`[FailureHandler] Failure detected in test: "${this.testInfo.title}"`);
    console.log(`[FailureHandler] Error details: ${error.message}`);

    // 1. Capture Evidence
    let evidence;
    if (this.evidenceCollector && typeof this.evidenceCollector.captureEvidence === 'function') {
      evidence = await this.evidenceCollector.captureEvidence(error);
    } else {
      const { EvidenceCollector } = await import('../ai/evidenceCollector.js');
      const collector = new EvidenceCollector(this.page, this.testInfo);
      await collector.initialize();
      evidence = await collector.captureEvidence(error);
    }

    // 2. AI Investigation Engine Analysis (No keyword if/else classification)
    console.log(`[FailureHandler] Triggering AI Investigation Engine...`);
    const analysis = await this.aiClient.investigateFailure(evidence);

    console.log(`[FailureHandler] AI Category: ${analysis.category} | Confidence: ${analysis.confidence}% | Severity: ${analysis.severity}`);

    // 3. Generate Investigation Report (Consumes structured JSON)
    const reportPath = InvestigationReportGenerator.generateReport(analysis, evidence);
    console.log(`[FailureHandler] Investigation report generated: ${reportPath}`);

    // 4. Generate Defect Report if applicable
    if (analysis.generateDefect) {
      const defectPath = DefectGenerator.generateDefect(analysis, evidence);
      console.log(`[FailureHandler] Defect report generated: ${defectPath}`);
    }

    return { analysis, evidence };
  }
}