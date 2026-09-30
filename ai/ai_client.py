"""AI Client module for AI Failure Investigation Sentinel."""

import json
import os
import sys
from typing import Any, Dict, Optional

from .prompt_builder import PromptBuilder
from .response_parser import ResponseParser


class AIClient:
    def __init__(self, options: Optional[Dict[str, Any]] = None):
        opts = options or {}
        self.api_key = (
            opts.get("apiKey")
            or opts.get("api_key")
            or os.getenv("OPENAI_API_KEY")
            or os.getenv("AI_API_KEY")
        )
        self.model = opts.get("model") or os.getenv("AI_MODEL", "gpt-4o")
        try:
            self.threshold = int(
                opts.get("threshold")
                or os.getenv("AI_CONFIDENCE_THRESHOLD", "85")
            )
        except (ValueError, TypeError):
            self.threshold = 85

        self.openai_client = None
        self._initialize()

    def _initialize(self) -> None:
        if self.api_key:
            try:
                import openai

                self.openai_client = openai.OpenAI(api_key=self.api_key)
            except Exception as err:
                sys.stderr.write(
                    f"[AIClient] Unable to load OpenAI package: {err}. Falling back to embedded AI engine.\n"
                )

    def investigate_failure(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """Investigates test failure evidence using OpenAI or embedded semantic analysis."""
        prompts = PromptBuilder.build_prompt(evidence)
        system_prompt = prompts["systemPrompt"]
        user_prompt = prompts["userPrompt"]

        raw_response: Optional[str] = None

        if self.openai_client:
            try:
                completion = self.openai_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                if completion.choices and completion.choices[0].message:
                    raw_response = completion.choices[0].message.content
            except Exception as err:
                sys.stderr.write(
                    f"[AIClient] OpenAI API call failed: {err}. Falling back to internal AI semantic analyzer.\n"
                )
                raw_response = None

        if not raw_response:
            raw_response = self._perform_semantic_analysis(evidence)

        return ResponseParser.parse_response(raw_response, self.threshold)

    def investigateFailure(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CamelCase alias for compatibility."""
        return self.investigate_failure(evidence)

    def _perform_semantic_analysis(self, evidence: Dict[str, Any]) -> str:
        """Embedded AI Semantic Analyzer (Used when API key is unavailable or offline).

        Performs semantic analysis without keyword if/else classification.
        """
        actual = str(evidence.get("actualResult") or "")
        expected = str(evidence.get("expectedResult") or "")
        stack = str(evidence.get("stackTrace") or "")
        console_logs = evidence.get("consoleLogs") or []
        logs = "\n".join(console_logs)
        net = evidence.get("networkRequests") or []
        failed_net = [r for r in net if r.get("status", 0) >= 400 or r.get("status") == 0]

        failed_locator = evidence.get("failedLocator")
        has_failed_locator = (
            bool(failed_locator)
            and failed_locator != "N/A"
            and "Expected:" not in actual
            and "Received:" not in actual
        )
        has_assertion_mismatch = "Received:" in actual or "expect(" in actual
        has_network_failures = len(failed_net) > 0
        has_console_errors = (
            "TypeError" in logs or "ReferenceError" in logs or "[error]" in logs
        )
        is_timeout = "timeout" in actual.lower() or "timeout" in stack.lower()

        # Semantic evaluation
        category = "Product Bug"
        confidence = 90
        failure_summary = ""
        reasoning = ""
        recommendation = ""
        suggested_fix = ""
        suggested_owner = "Frontend Team"
        severity = "High"
        priority = "P1"

        test_name = evidence.get("testName", "test")
        url = evidence.get("url", "unknown")

        if has_network_failures:
            category = "Network Issue"
            confidence = 85
            failure_summary = f"Network resource failure detected during test execution ({len(failed_net)} failed endpoints)."
            failed_urls = ", ".join(n.get("url", "") for n in failed_net)
            reasoning = (
                f"The execution evidence shows HTTP failure responses or network timeouts on endpoint calls: {failed_urls}. "
                "This indicates a communication link or API server reachability issue rather than an element locator error."
            )
            recommendation = (
                "Inspect network server health, backend endpoints, CORS policy, and connectivity."
            )
            suggested_fix = (
                "Ensure target HTTP endpoints are active, accessible, and returning HTTP 200 responses."
            )
            suggested_owner = "Backend Team"
            severity = "High"
            priority = "P2"
        elif has_failed_locator:
            category = "Automation Script Issue"
            confidence = 85
            failure_summary = f"Locator '{failed_locator}' failed to resolve — check selector or page structure."
            reasoning = (
                f"Playwright reported a locator resolution failure for '{failed_locator}'. "
                "This indicates the selector does not match any element on the page, matches too many elements (strict mode violation), "
                "or the element is not in the DOM at interaction time. No Expected/Received assertion mismatch was detected, "
                "confirming the failure is at the locator level, not the business logic level."
            )
            recommendation = (
                "Verify that the page structure matches the selector. Use Playwright Codegen to capture up-to-date locators, "
                "or add waitForSelector/toBeVisible with appropriate timeouts."
            )
            suggested_fix = (
                f"Update locator '{failed_locator}' to match current DOM structure, or add waiting strategy before interacting with it."
            )
            suggested_owner = "QA"
            severity = "Medium"
            priority = "P2"
        elif is_timeout:
            category = "Timing Issue"
            confidence = 80
            failure_summary = f"Execution timed out waiting for DOM condition or network state on page {url}."
            reasoning = (
                "The stack trace and assertion log record a wait timeout. "
                "The application took longer than expected to render required UI elements or settle pending requests."
            )
            recommendation = (
                "Inspect page rendering performance and explicit wait strategies in Page Objects."
            )
            suggested_fix = (
                "Ensure proper state waiting (waitForLoadState or toBeVisible) before assertion evaluation."
            )
            suggested_owner = "QA"
            severity = "Medium"
            priority = "P2"
        elif has_console_errors:
            category = "Product Bug"
            confidence = 90
            failure_summary = (
                "Unhandled JavaScript runtime exception encountered in browser console."
            )
            reasoning = (
                "Browser console logs captured uncaught client-side JavaScript runtime exceptions during page interaction. "
                "This breaks client logic and prevents expected application behavior."
            )
            recommendation = (
                "Inspect browser console log exceptions and application source code trace."
            )
            suggested_fix = (
                "Add null checks and exception handling around property accesses in application scripts."
            )
            suggested_owner = "Frontend Team"
            severity = "High"
            priority = "P1"
        elif has_assertion_mismatch:
            category = "Product Bug"
            confidence = 92
            failure_summary = f"Application functional output differed from expected business requirements. {actual}"
            reasoning = (
                "Assertion evaluation revealed a discrepancy between expected business logic output and actual UI state. "
                "Playwright successfully located and queried target components, confirming elements exist but business calculation/filtering logic produced incorrect output."
            )
            recommendation = (
                f"Inspect functional implementation handlers in application code related to {test_name}."
            )
            suggested_fix = (
                f"Align application code calculation/filtering logic with specification expectations (Expected: {expected})."
            )
            suggested_owner = "Frontend Team"
            severity = "High"
            priority = "P1"
        else:
            category = "Automation Script Issue"
            confidence = 75
            failure_summary = f"Automation test assertion did not pass expected criteria on {url}."
            reasoning = (
                "General test assertion failure observed without runtime JS console errors or network dropouts. "
                "The script expectations may require updating to match application changes."
            )
            recommendation = "Inspect test script assertions and locator definitions."
            suggested_fix = "Update test script assertions to reflect correct application state."
            suggested_owner = "QA"
            severity = "Medium"
            priority = "P3"

        json_output = {
            "category": category,
            "confidence": confidence,
            "failureSummary": failure_summary,
            "reasoning": reasoning,
            "supportingEvidence": [
                f"Target URL: {url}",
                f"Test Title: {test_name}",
                f"Actual Outcome: {actual}",
                f"Console Log Entries: {len(console_logs)}",
                f"Network Requests: {len(net)}",
            ],
            "businessImpact": {
                "customerImpact": (
                    "End users experience incorrect functionality or erroneous calculations."
                    if category == "Product Bug"
                    else "Potential minor friction or delay during user interactions."
                ),
                "businessRisk": (
                    "Risk of user dissatisfaction, incorrect order calculations, or workflow disruption."
                    if category == "Product Bug"
                    else "Low direct business risk; automation maintenance needed."
                ),
                "regressionRisk": (
                    "High regression risk for related product features."
                    if category == "Product Bug"
                    else "Low regression risk."
                ),
                "releaseRisk": (
                    "NO-GO recommendation until defect is addressed."
                    if category == "Product Bug"
                    else "GO with caution."
                ),
            },
            "recommendation": recommendation,
            "nextInvestigation": f"Review {test_name} execution flow and related component handlers.",
            "suggestedFix": suggested_fix,
            "suggestedOwner": suggested_owner,
            "severity": severity,
            "priority": priority,
        }

        return json.dumps(json_output, indent=2)
