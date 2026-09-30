"""Evidence Collector module for AI Failure Investigation Sentinel."""

import datetime
import os
import platform
import re
from typing import Any, Dict, List, Optional


class EvidenceCollector:
    """Collects and normalizes test failure evidence for the AI Sentinel."""

    def __init__(self, page: Any = None, test_info: Any = None):
        self.page = page
        self.test_info = test_info
        self.console_logs: List[str] = []
        self.network_requests: List[Dict[str, Any]] = []
        self.start_time: float = 0.0

    def initialize(self) -> None:
        self.start_time = datetime.datetime.now(datetime.timezone.utc).timestamp()
        self.console_logs = []
        self.network_requests = []

        if self.page:
            try:
                # Playwright Python event listeners if page is provided
                self.page.on(
                    "console",
                    lambda msg: self.console_logs.append(f"[{msg.type}] {msg.text}"),
                )
                self.page.on(
                    "requestfailed",
                    lambda req: self.network_requests.append({
                        "url": req.url,
                        "method": req.method,
                        "status": 0,
                        "failure": getattr(req.failure, "error_text", "Failed")
                        if req.failure
                        else "Failed",
                    }),
                )
                self.page.on(
                    "response",
                    lambda res: self.network_requests.append({
                        "url": res.url,
                        "method": res.request.method,
                        "status": res.status,
                    }),
                )
            except Exception:
                pass

    def capture_evidence(self, error: Any = None) -> Dict[str, Any]:
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        execution_id = f"EXEC-{int(datetime.datetime.now().timestamp() * 1000)}"

        test_title = "Unnamed Test"
        if self.test_info:
            test_title = getattr(self.test_info, "title", None) or getattr(self.test_info, "name", "Unnamed Test")

        tc_match = re.search(r"TC(\d+)|REQ-(\d+)", test_title, re.IGNORECASE)
        requirement_id = tc_match.group(0).upper() if tc_match else "N/A"

        current_url = "unknown"
        screenshot_path = "N/A"
        dom_snapshot = ""

        if self.page:
            try:
                current_url = self.page.url
            except Exception:
                pass

        # Parse assertion details from error
        err_message = str(error) if error else "Assertion / Runtime error"
        err_message = re.sub(r"\x1B\[[0-9;]*[a-zA-Z]", "", err_message)

        expected_result = "Specified test criteria to pass"
        actual_result = err_message

        expected_match = re.search(r"Expected:\s*([^\n]+)", err_message, re.IGNORECASE)
        received_match = re.search(r"Received:\s*([^\n]+)", err_message, re.IGNORECASE)
        if expected_match:
            expected_result = expected_match.group(1).strip()
        if received_match:
            actual_result = f"Received: {received_match.group(1).strip()}"

        failed_locator = "N/A"
        locator_match = re.search(r"locator\('([^']+)'\)", err_message, re.IGNORECASE) or re.search(
            r'selector "([^"]+)"', err_message, re.IGNORECASE
        )
        if locator_match:
            failed_locator = locator_match.group(1)

        os_info = f"{platform.system()} {platform.release()} ({platform.machine()})"

        return {
            "executionId": execution_id,
            "timestamp": timestamp,
            "testName": test_title,
            "requirementId": requirement_id,
            "browser": "chromium",
            "os": os_info,
            "url": current_url,
            "viewport": "1280x720",
            "executionDuration": "N/A",
            "expectedResult": expected_result,
            "actualResult": actual_result,
            "screenshot": screenshot_path,
            "video": "N/A",
            "trace": "N/A",
            "domSnapshot": dom_snapshot[:10000] if dom_snapshot else "N/A",
            "htmlSnapshot": dom_snapshot[:10000] if dom_snapshot else "N/A",
            "consoleLogs": self.console_logs,
            "networkRequests": self.network_requests,
            "failedLocator": failed_locator,
            "stackTrace": getattr(error, "stack", "") or str(error) if error else "N/A",
            "pageSource": "N/A",
            "environment": os.getenv("NODE_ENV") or os.getenv("ENVIRONMENT") or "development",
            "applicationVersion": os.getenv("APP_VERSION", "1.0.0"),
            "buildNumber": os.getenv("BUILD_NUMBER", "BUILD-2026.1"),
        }

    def captureEvidence(self, error: Any = None) -> Dict[str, Any]:
        """CamelCase alias for compatibility."""
        return self.capture_evidence(error)
