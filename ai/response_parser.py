"""Response parser module for AI Failure Investigation Sentinel."""

import json
import os
import re
from typing import Any, Dict


class ResponseParser:
    CATEGORIES = [
        "Product Bug",
        "UI Bug",
        "Backend Bug",
        "API Bug",
        "Database Bug",
        "Security Issue",
        "Performance Issue",
        "Automation Script Issue",
        "Locator Issue",
        "Timing Issue",
        "Environment Issue",
        "Configuration Issue",
        "Network Issue",
        "Test Data Issue",
        "Third Party Integration",
        "Browser Compatibility",
        "Unknown",
    ]

    @classmethod
    def parse_response(cls, raw_text: str, threshold: int = 85) -> Dict[str, Any]:
        """Parses and validates raw AI response JSON, extracting structured diagnosis."""
        if not raw_text:
            raise ValueError("AI response was empty or undefined.")

        json_string = raw_text.strip()

        # Strip markdown code fences if present (```json ... ```)
        if json_string.startswith("```"):
            json_string = re.sub(r"^```(?:json)?\s*", "", json_string, flags=re.IGNORECASE)
            json_string = re.sub(r"\s*```$", "", json_string)
            json_string = json_string.strip()

        parsed: Dict[str, Any] = {}
        try:
            parsed = json.loads(json_string)
        except Exception as err:
            # Attempt regex extract if response contains surrounding prose
            match = re.search(r"\{[\s\S]*\}", json_string)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                except Exception as inner_err:
                    raise ValueError(
                        f"Failed to parse AI JSON response: {err}. Raw text: {raw_text}"
                    ) from inner_err
            else:
                raise ValueError(
                    f"Failed to parse AI JSON response: {err}. Raw text: {raw_text}"
                ) from err

        raw_category = parsed.get("category", "Unknown")
        valid_category = raw_category if raw_category in cls.CATEGORIES else "Unknown"

        raw_confidence = parsed.get("confidence", 50)
        try:
            confidence = int(raw_confidence)
            confidence = max(0, min(100, confidence))
        except (ValueError, TypeError):
            confidence = 50

        configured_threshold = int(
            os.getenv("AI_CONFIDENCE_THRESHOLD", str(threshold))
        )

        is_product_bug = valid_category == "Product Bug" or valid_category.endswith("Bug")
        generate_defect = is_product_bug and (confidence >= configured_threshold)

        biz_impact = parsed.get("businessImpact") or {}

        supporting_ev = parsed.get("supportingEvidence")
        if not isinstance(supporting_ev, list):
            supporting_ev = []

        return {
            "category": valid_category,
            "confidence": confidence,
            "failureSummary": parsed.get(
                "failureSummary", "Failure occurred during test execution."
            ),
            "reasoning": parsed.get(
                "reasoning", "Semantic reasoning not specified."
            ),
            "supportingEvidence": supporting_ev,
            "businessImpact": {
                "customerImpact": biz_impact.get(
                    "customerImpact",
                    "Impact on end-user capabilities requires evaluation.",
                ),
                "businessRisk": biz_impact.get(
                    "businessRisk", "Potential risk to operational workflow."
                ),
                "regressionRisk": biz_impact.get(
                    "regressionRisk", "Low to moderate risk of regression."
                ),
                "releaseRisk": biz_impact.get(
                    "releaseRisk", "Review before deployment."
                ),
            },
            "recommendation": parsed.get(
                "recommendation",
                "Inspect application source code and test logic.",
            ),
            "nextInvestigation": parsed.get(
                "nextInvestigation", "Verify system logs and component state."
            ),
            "suggestedFix": parsed.get(
                "suggestedFix", "Review code logic for recent changes."
            ),
            "suggestedOwner": parsed.get(
                "suggestedOwner", "Frontend Team" if is_product_bug else "QA"
            ),
            "severity": parsed.get(
                "severity", "High" if confidence >= 85 else "Medium"
            ),
            "priority": parsed.get(
                "priority", "P1" if confidence >= 85 else "P2"
            ),
            "generateDefect": generate_defect,
        }

    @classmethod
    def parseResponse(cls, raw_text: str, threshold: int = 85) -> Dict[str, Any]:
        """CamelCase alias for compatibility."""
        return cls.parse_response(raw_text, threshold)
