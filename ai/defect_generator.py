"""Defect generator module for AI Failure Investigation Sentinel."""

import datetime
import hashlib
from pathlib import Path
import re
import sys
from typing import Any, Dict


class DefectGenerator:
    """Generates a Markdown Defect Report when generateDefect is TRUE.

    Deduplicates by hashing the failure signature (testName + failedLocator + actualResult).
    The same failure across multiple runs produces the same BUG-<hash>.md, updating recurrence count.
    """

    @classmethod
    def generate_defect(cls, analysis: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        base_dir = Path(__file__).resolve().parent.parent
        defects_dir = base_dir / "defects"
        defects_dir.mkdir(parents=True, exist_ok=True)

        # Deterministic ID from failure signature
        signature = "|".join([
            evidence.get("testName") or "",
            evidence.get("failedLocator") or "",
            evidence.get("actualResult") or "",
            evidence.get("expectedResult") or "",
        ])
        md5_hash = hashlib.md5(signature.encode("utf-8")).hexdigest()[:8].upper()
        defect_id = f"BUG-{md5_hash}"
        defect_filename = f"{defect_id}.md"
        defect_path = defects_dir / defect_filename

        # Track recurrence count if file already exists
        recurrence_count = 1
        first_seen = datetime.datetime.now(datetime.timezone.utc).isoformat()
        if defect_path.exists():
            try:
                with open(defect_path, "r", encoding="utf-8") as f:
                    existing_content = f.read()
                recurrence_match = re.search(r"\*\*Recurrence:\*\*\s*(\d+)", existing_content)
                if recurrence_match:
                    recurrence_count = int(recurrence_match.group(1)) + 1
                else:
                    recurrence_count = 2

                first_seen_match = re.search(r"\*\*First Seen:\*\*\s*(.+)", existing_content)
                if first_seen_match:
                    first_seen = first_seen_match.group(1).strip()
            except Exception:
                pass

        url = evidence.get("url", "")
        if "search" in url:
            module_name = "Search"
        elif "cart" in url:
            module_name = "Cart"
        else:
            module_name = "Home Page"

        supporting_evidence_lines = "\n".join(
            f"- {s}" for s in (analysis.get("supportingEvidence") or [])
        ) or "- Execution logs and screenshots captured"

        biz_impact = analysis.get("businessImpact") or {}

        attachments = []
        if evidence.get("screenshot") and evidence.get("screenshot") != "N/A":
            attachments.append(f"- Screenshot: {evidence.get('screenshot')}")
        if evidence.get("trace") and evidence.get("trace") != "N/A":
            attachments.append(f"- Trace: {evidence.get('trace')}")
        if evidence.get("video") and evidence.get("video") != "N/A":
            attachments.append(f"- Video: {evidence.get('video')}")
        attachments_str = "\n".join(attachments) if attachments else "- No additional attachments recorded"

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        content = f"""# {defect_id}: {analysis.get('failureSummary', 'N/A')}

**First Seen:** {first_seen}
**Last Seen:** {now_iso}
**Recurrence:** {recurrence_count}
**Module:** {module_name}
**Test Case:** {evidence.get('testName', 'N/A')}
**Requirement ID:** {evidence.get('requirementId', 'N/A')}
**Browser:** {evidence.get('browser', 'N/A')}
**URL:** {evidence.get('url', 'N/A')}
**Severity:** {analysis.get('severity', 'N/A')}
**Priority:** {analysis.get('priority', 'N/A')}
**Confidence:** {analysis.get('confidence', 0)}%
**Suggested Owner:** {analysis.get('suggestedOwner', 'N/A')}

## Summary
{analysis.get('failureSummary', 'N/A')}

## Steps to Reproduce
1. Navigate to {evidence.get('url', 'N/A')}
2. Perform test sequence: {evidence.get('testName', 'N/A')}
3. Observe actual outcome: {evidence.get('actualResult', 'N/A')}

## Expected Result
{evidence.get('expectedResult', 'N/A')}

## Actual Result
{evidence.get('actualResult', 'N/A')}

## Root Cause Analysis (AI Classification)
**Category:** {analysis.get('category', 'Unknown')}
**Reasoning:** {analysis.get('reasoning', 'N/A')}

## Supporting Evidence
{supporting_evidence_lines}

## Business Impact
- **Customer Impact:** {biz_impact.get('customerImpact', 'N/A')}
- **Business Risk:** {biz_impact.get('businessRisk', 'N/A')}
- **Regression Risk:** {biz_impact.get('regressionRisk', 'N/A')}
- **Release Risk:** {biz_impact.get('releaseRisk', 'N/A')}

## Recommended Fix
{analysis.get('suggestedFix', 'N/A')}

## Recommended Developer Action
{analysis.get('recommendation', 'N/A')}

## Attachments
{attachments_str}
"""

        with open(defect_path, "w", encoding="utf-8") as f:
            f.write(content)

        action = "updated (recurrence tracked)" if recurrence_count > 1 else "created"
        sys.stderr.write(f"[Defect Generator] Defect {action}: {defect_path}\n")
        return str(defect_path)

    @classmethod
    def generateDefect(cls, analysis: Dict[str, Any], evidence: Dict[str, Any]) -> str:
        """CamelCase alias for compatibility."""
        return cls.generate_defect(analysis, evidence)
