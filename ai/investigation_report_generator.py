"""Investigation report generator module for AI Failure Investigation Sentinel."""

import datetime
from pathlib import Path
import re
import sys
from typing import Any, Dict


class InvestigationReportGenerator:
    """Generates Investigation Report Markdown strictly from structured AI analysis JSON and evidence context.

    Does NOT contain business classification logic.
    """

    @classmethod
    def generate_report(cls, analysis: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        # Resolve root/defects/investigations directory
        base_dir = Path(__file__).resolve().parent.parent
        inv_dir = base_dir / "defects" / "investigations"
        inv_dir.mkdir(parents=True, exist_ok=True)

        test_name = evidence.get("testName", "")
        tc_match = re.search(r"TC(\d+)", test_name, re.IGNORECASE)
        tc_number = f"TC{tc_match.group(1)}" if tc_match else "TC000"

        now = datetime.datetime.now(datetime.timezone.utc)
        datetime_str = now.strftime("%Y%m%d_%H%M%S")
        report_filename = f"INV-{tc_number}-{datetime_str}.md"
        report_path = inv_dir / report_filename

        console_count = len(evidence.get("consoleLogs") or [])
        network_count = len(evidence.get("networkRequests") or [])
        generate_defect_text = "TRUE" if analysis.get("generateDefect") else "FALSE"

        supporting_evidence_lines = "\n".join(
            f"- {s}" for s in (analysis.get("supportingEvidence") or [])
        ) or "- Evidence collected from test execution context"

        biz_impact = analysis.get("businessImpact") or {}

        dom_snapshot = evidence.get("domSnapshot")
        dom_text = (
            f"{len(dom_snapshot)} characters captured"
            if dom_snapshot and dom_snapshot != "N/A"
            else "N/A"
        )
        dom_status = "Captured" if dom_snapshot and dom_snapshot != "N/A" else "N/A"

        content = f"""==================================================
INVESTIGATION REPORT
==================================================
Execution ID: {evidence.get('executionId', 'N/A')}
Timestamp: {evidence.get('timestamp') or datetime.datetime.now().isoformat()}
Test Case: {evidence.get('testName', 'N/A')}
Requirement ID: {evidence.get('requirementId', 'N/A')}
Build: {evidence.get('buildNumber', 'N/A')}
Environment: {evidence.get('environment', 'N/A')}
Browser: {evidence.get('browser', 'N/A')}
OS: {evidence.get('os', 'N/A')}
URL: {evidence.get('url', 'N/A')}
Execution Duration: {evidence.get('executionDuration', 'N/A')}

==================================================
FAILURE SUMMARY
==================================================
{analysis.get('failureSummary', 'N/A')}

==================================================
EXPECTED BEHAVIOR
==================================================
{evidence.get('expectedResult', 'Specified test criteria to pass')}

==================================================
ACTUAL BEHAVIOR
==================================================
{evidence.get('actualResult', 'Assertion failure during test execution')}

==================================================
INITIAL OBSERVATIONS
==================================================
DOM: {dom_text}
Console: {console_count} log entries recorded
Network: {network_count} requests logged
UI: URL {evidence.get('url', 'N/A')} rendering state evaluated
Application State: Active session on {evidence.get('browser', 'N/A')}

==================================================
EVIDENCE
==================================================
Screenshot: {evidence.get('screenshot', 'N/A')}
Trace: {evidence.get('trace', 'N/A')}
Video: {evidence.get('video', 'N/A')}
Console: {console_count} entries
Network: {network_count} entries
DOM Snapshot: {dom_status}
Stack Trace:
{evidence.get('stackTrace', 'N/A')}

==================================================
AI ROOT CAUSE ANALYSIS
==================================================
Category: {analysis.get('category', 'Unknown')}
Confidence: {analysis.get('confidence', 0)}%
Reasoning:
{analysis.get('reasoning', 'N/A')}

Supporting Evidence:
{supporting_evidence_lines}

==================================================
BUSINESS IMPACT
==================================================
Customer Impact: {biz_impact.get('customerImpact', 'N/A')}
Business Risk: {biz_impact.get('businessRisk', 'N/A')}
Regression Risk: {biz_impact.get('regressionRisk', 'N/A')}
Release Risk: {biz_impact.get('releaseRisk', 'N/A')}

==================================================
RECOMMENDED INVESTIGATION
==================================================
{analysis.get('recommendation', 'N/A')}

==================================================
POSSIBLE FIX
==================================================
{analysis.get('suggestedFix', 'N/A')}

==================================================
SUGGESTED OWNER
==================================================
{analysis.get('suggestedOwner', 'N/A')}

==================================================
SEVERITY
==================================================
{analysis.get('severity', 'N/A')}

==================================================
PRIORITY
==================================================
{analysis.get('priority', 'N/A')}

==================================================
AI CONFIDENCE
==================================================
{analysis.get('confidence', 0)}%

==================================================
Generate Defect?
==================================================
{generate_defect_text}
"""

        with open(report_path, "w", encoding="utf-8") as f:
            f.write(content)

        sys.stderr.write(f"[Investigation Report Generator] Report created: {report_path}\n")
        return str(report_path)

    @classmethod
    def generateReport(cls, analysis: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        """CamelCase alias for compatibility."""
        return cls.generate_report(analysis, evidence)
