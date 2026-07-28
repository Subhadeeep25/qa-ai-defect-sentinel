export class ResponseParser {
  static parseResponse(rawText, threshold = 85) {
    if (!rawText) {
      throw new Error('AI response was empty or undefined.');
    }

    let jsonString = rawText.trim();

    // Strip markdown code fences if present (```json ... ```)
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      // Attempt regex extract if response contains surrounding prose
      const match = jsonString.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (innerErr) {
          throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw text: ${rawText}`);
        }
      } else {
        throw new Error(`Failed to parse AI JSON response: ${err.message}. Raw text: ${rawText}`);
      }
    }

    const categories = [
      'Product Bug', 'UI Bug', 'Backend Bug', 'API Bug', 'Database Bug',
      'Security Issue', 'Performance Issue', 'Automation Script Issue',
      'Locator Issue', 'Timing Issue', 'Environment Issue', 'Configuration Issue',
      'Network Issue', 'Test Data Issue', 'Third Party Integration',
      'Browser Compatibility', 'Unknown'
    ];

    const validCategory = categories.includes(parsed.category) ? parsed.category : 'Unknown';
    const confidence = typeof parsed.confidence === 'number' ? Math.min(Math.max(parsed.confidence, 0), 100) : 50;
    
    const configuredThreshold = parseInt(process.env.AI_CONFIDENCE_THRESHOLD || String(threshold), 10);

    // According to AI_INVESTIGATION_SPEC:
    // Generate Defect = TRUE if Category is Product Bug (or application bug type) AND Confidence >= Threshold
    const isProductBug = validCategory === 'Product Bug' || validCategory.endsWith('Bug');
    const generateDefect = isProductBug && (confidence >= configuredThreshold);

    return {
      category: validCategory,
      confidence,
      failureSummary: parsed.failureSummary || 'Failure occurred during test execution.',
      reasoning: parsed.reasoning || 'Semantic reasoning not specified.',
      supportingEvidence: Array.isArray(parsed.supportingEvidence) ? parsed.supportingEvidence : [],
      businessImpact: {
        customerImpact: parsed.businessImpact?.customerImpact || 'Impact on end-user capabilities requires evaluation.',
        businessRisk: parsed.businessImpact?.businessRisk || 'Potential risk to operational workflow.',
        regressionRisk: parsed.businessImpact?.regressionRisk || 'Low to moderate risk of regression.',
        releaseRisk: parsed.businessImpact?.releaseRisk || 'Review before deployment.',
      },
      recommendation: parsed.recommendation || 'Inspect application source code and test logic.',
      nextInvestigation: parsed.nextInvestigation || 'Verify system logs and component state.',
      suggestedFix: parsed.suggestedFix || 'Review code logic for recent changes.',
      suggestedOwner: parsed.suggestedOwner || (isProductBug ? 'Frontend Team' : 'QA'),
      severity: parsed.severity || (confidence >= 85 ? 'High' : 'Medium'),
      priority: parsed.priority || (confidence >= 85 ? 'P1' : 'P2'),
      generateDefect,
    };
  }
}
