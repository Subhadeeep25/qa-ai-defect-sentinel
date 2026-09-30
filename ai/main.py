"""CLI and executable entry point for AI Failure Investigation Sentinel."""

import argparse
import json
import os
import sys
from typing import Any, Dict

from .ai_client import AIClient
from .defect_generator import DefectGenerator
from .investigation_report_generator import InvestigationReportGenerator


def run_investigation(
    evidence: Dict[str, Any],
    threshold: int = 85,
    model: str = "gpt-4o",
    generate_reports: bool = True,
) -> Dict[str, Any]:
    """Runs complete investigation workflow for provided evidence."""
    client = AIClient(options={"threshold": threshold, "model": model})
    analysis = client.investigate_failure(evidence)

    report_path = None
    defect_path = None

    if generate_reports:
        report_path = InvestigationReportGenerator.generate_report(analysis, evidence)
        if analysis.get("generateDefect"):
            defect_path = DefectGenerator.generate_defect(analysis, evidence)

    result = {
        "analysis": analysis,
        "investigationReport": report_path,
        "defectReport": defect_path,
    }
    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="BuggyShop AI Test Failure Investigation Sentinel (Python)"
    )
    parser.add_argument(
        "evidence_file",
        nargs="?",
        help="Path to JSON file containing test failure evidence. Reads stdin if omitted.",
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=int(os.getenv("AI_CONFIDENCE_THRESHOLD", "85")),
        help="Confidence threshold for defect generation (default: 85)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=os.getenv("AI_MODEL", "gpt-4o"),
        help="AI Model name (default: gpt-4o)",
    )
    parser.add_argument(
        "--no-reports",
        action="store_true",
        help="Disable automatic generation of Markdown investigation/defect reports.",
    )

    args = parser.parse_args()

    # Load evidence from file or stdin
    evidence_str = ""
    if args.evidence_file:
        with open(args.evidence_file, "r", encoding="utf-8") as f:
            evidence_str = f.read()
    else:
        if sys.stdin.isatty():
            parser.print_help()
            sys.exit(1)
        evidence_str = sys.stdin.read()

    if not evidence_str.strip():
        print(json.dumps({"error": "Empty evidence input."}))
        sys.exit(1)

    try:
        evidence = json.loads(evidence_str)
    except json.JSONDecodeError as err:
        print(json.dumps({"error": f"Invalid JSON evidence: {err}"}))
        sys.exit(1)

    try:
        result = run_investigation(
            evidence,
            threshold=args.threshold,
            model=args.model,
            generate_reports=not args.no_reports,
        )
        print(json.dumps(result, indent=2))
    except Exception as err:
        print(json.dumps({"error": f"Investigation failed: {err}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
