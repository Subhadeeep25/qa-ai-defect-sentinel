"""Prompt builder module for AI Failure Investigation Sentinel."""

from typing import Any, Dict, List


class PromptBuilder:
    CATEGORIES: List[str] = [
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

    OWNERS: List[str] = [
        "Frontend Team",
        "Backend Team",
        "QA",
        "DevOps",
        "Database Team",
    ]

    SEVERITIES: List[str] = ["Critical", "High", "Medium", "Low"]
    PRIORITIES: List[str] = ["P1", "P2", "P3", "P4"]

    @classmethod
    def build_prompt(cls, evidence: Dict[str, Any]) -> Dict[str, str]:
        """Builds system and user prompts from evidence dictionary."""
        categories_str = ", ".join(cls.CATEGORIES)
        owners_str = ", ".join(cls.OWNERS)
        severities_str = ", ".join(cls.SEVERITIES)
        priorities_str = ", ".join(cls.PRIORITIES)

        system_prompt = f"""You are a Principal Software Quality Architect and AI Root Cause Investigation Engine.
Your task is to analyze test failure evidence collected from automated Playwright test execution and produce a thorough, professional investigation analysis.

CRITICAL INSTRUCTIONS:
- You must perform semantic analysis on the provided evidence.
- Select EXACTLY ONE category from the following allowed categories:
  {categories_str}
- You MUST provide clear, logical reasoning explaining WHY the category was selected.
- Output MUST be strictly valid JSON without any surrounding conversational text or markdown codeblock wrappers.

REQUIRED JSON RESPONSE SCHEMA:
{{
  "category": "<Must be one of the allowed categories>",
  "confidence": <integer between 0 and 100>,
  "failureSummary": "<Clear business-language summary of what failed without merely repeating assertion string>",
  "reasoning": "<In-depth technical and architectural explanation of why this category was selected>",
  "supportingEvidence": [
    "<Specific observation 1 from DOM/Console/Network/StackTrace>",
    "<Specific observation 2>",
    "<Specific observation 3>"
  ],
  "businessImpact": {{
    "customerImpact": "<Impact on end users>",
    "businessRisk": "<Revenue/operational/brand risk>",
    "regressionRisk": "<Likelihood of side effects>",
    "releaseRisk": "<Impact on current deployment/release GO/NO-GO decision>"
  }},
  "recommendation": "<Step-by-step developer inspection guide (e.g. Inspect updateCart(), verify total calculation)>",
  "nextInvestigation": "<Next debugging steps for engineering>",
  "suggestedFix": "<Concrete code or config fix>",
  "suggestedOwner": "<Must be one of: {owners_str}>",
  "severity": "<Must be one of: {severities_str}>",
  "priority": "<Must be one of: {priorities_str}>"
}}"""

        console_logs = evidence.get("consoleLogs") or []
        console_logs_str = (
            "\n".join(console_logs[:15])
            if console_logs
            else "No console logs captured."
        )

        network_requests = evidence.get("networkRequests") or []
        network_req_formatted = []
        for r in network_requests[:15]:
            method = r.get("method", "GET")
            url = r.get("url", "")
            status = r.get("status", 0)
            failure = f" ({r.get('failure')})" if r.get("failure") else ""
            network_req_formatted.append(
                f"[{method}] {url} - Status: {status}{failure}"
            )
        network_requests_str = (
            "\n".join(network_req_formatted)
            if network_req_formatted
            else "No network requests captured."
        )

        dom_snapshot = (evidence.get("domSnapshot") or "")[:3000] or "No DOM snapshot captured."

        user_prompt = f"""EXAMINE THE FOLLOWING AUTOMATED TEST FAILURE EVIDENCE:

==================================================
TEST CONTEXT
==================================================
Execution ID: {evidence.get('executionId', 'N/A')}
Timestamp: {evidence.get('timestamp', 'N/A')}
Test Case: {evidence.get('testName', 'N/A')}
Requirement ID: {evidence.get('requirementId', 'N/A')}
Environment: {evidence.get('environment', 'N/A')}
Build Number: {evidence.get('buildNumber', 'N/A')}
Application Version: {evidence.get('applicationVersion', 'N/A')}
Browser: {evidence.get('browser', 'N/A')}
OS: {evidence.get('os', 'N/A')}
URL: {evidence.get('url', 'N/A')}
Execution Duration: {evidence.get('executionDuration', 'N/A')}

==================================================
ASSERTION & ERROR DETAILS
==================================================
Expected Result: {evidence.get('expectedResult', 'N/A')}
Actual Result: {evidence.get('actualResult', 'N/A')}
Failed Locator: {evidence.get('failedLocator', 'N/A')}

Stack Trace:
{evidence.get('stackTrace', 'N/A')}

==================================================
CONSOLE LOGS ({len(console_logs)} entries)
==================================================
{console_logs_str}

==================================================
NETWORK REQUESTS ({len(network_requests)} entries)
==================================================
{network_requests_str}

==================================================
DOM / HTML SNAPSHOT (Excerpt)
==================================================
{dom_snapshot}

Provide your complete analysis strictly as JSON matching the schema outlined above."""

        return {"systemPrompt": system_prompt, "userPrompt": user_prompt}

    @classmethod
    def buildPrompt(cls, evidence: Dict[str, Any]) -> Dict[str, str]:
        """CamelCase alias for compatibility."""
        return cls.build_prompt(evidence)
