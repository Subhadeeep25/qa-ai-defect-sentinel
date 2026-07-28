# AI Investigation Engine Specification

## Objective

Build an enterprise-grade AI Investigation Engine.

This module is NOT responsible for determining whether a test passes or fails.

Playwright determines pass/fail.

The AI Investigation Engine activates ONLY AFTER a failure.

------------------------------------------------------------

Execution Flow

Playwright Test

↓

Assertion Failure

↓

Pause Failure Processing

↓

Capture Evidence

↓

Normalize Evidence

↓

AI Investigation

↓

Failure Classification

↓

Generate Investigation Report

↓

Generate Defect (if applicable)

↓

Continue Remaining Tests

------------------------------------------------------------

Evidence Collector

Collect all available execution evidence.

Browser

OS

URL

Viewport

Test Name

Execution Time

Expected Result

Actual Result

Screenshot

Video

Trace

DOM Snapshot

HTML Snapshot

Console Logs

Network Requests

Failed Locator

Stack Trace

Page Source

Environment

Application Version

Build Number

------------------------------------------------------------

AI Analysis

Do NOT use if/else statements.

Do NOT classify failures using keyword matching.

Instead build a structured prompt using all collected evidence.

The AI should determine

Failure Category

Confidence

Root Cause

Business Impact

Recommendation

Supporting Evidence

Next Investigation

Suggested Fix

Suggested Owner

Severity

Priority

------------------------------------------------------------

Possible Categories

Product Bug

UI Bug

Backend Bug

API Bug

Database Bug

Security Issue

Performance Issue

Automation Script Issue

Locator Issue

Timing Issue

Environment Issue

Configuration Issue

Network Issue

Test Data Issue

Third Party Integration

Browser Compatibility

Unknown

------------------------------------------------------------

The AI should explain WHY it selected the category.

Never simply output

Product Bug

It must provide reasoning.

------------------------------------------------------------

Investigation Report

Generate Markdown.

Use the following template.

==================================================

INVESTIGATION REPORT

==================================================

Execution ID

Timestamp

Test Case

Requirement ID

Build

Environment

Browser

OS

URL

Execution Duration

==================================================

FAILURE SUMMARY

==================================================

Describe exactly what failed.

Do NOT repeat the assertion message.

Explain the failure in business language.

==================================================

EXPECTED BEHAVIOR

==================================================

==================================================

ACTUAL BEHAVIOR

==================================================

==================================================

INITIAL OBSERVATIONS

==================================================

List observations from

DOM

Console

Network

UI

Application State

==================================================

EVIDENCE

==================================================

Screenshot

Trace

Video

Console

Network

DOM Snapshot

Stack Trace

==================================================

AI ROOT CAUSE ANALYSIS

==================================================

Category

Confidence

Reasoning

Why this category was selected.

List every supporting observation.

==================================================

BUSINESS IMPACT

==================================================

Explain

Customer Impact

Business Risk

Regression Risk

Release Risk

==================================================

RECOMMENDED INVESTIGATION

==================================================

Explain exactly what developers should inspect.

Example

Inspect updateCart()

Verify total calculation

Check coupon logic

Review arithmetic operation

==================================================

POSSIBLE FIX

==================================================

==================================================

SUGGESTED OWNER

==================================================

Frontend Team

Backend Team

QA

DevOps

Database Team

==================================================

SEVERITY

==================================================

Critical

High

Medium

Low

==================================================

PRIORITY

==================================================

P1

P2

P3

P4

==================================================

AI CONFIDENCE

==================================================

95%

==================================================

Generate Defect?

==================================================

If

Category == Product Bug

AND

Confidence > Configured Threshold

Return

Generate Defect = TRUE

Otherwise

Generate Defect = FALSE

------------------------------------------------------------

The Investigation Engine must be completely modular.

It must expose

investigateFailure(evidence)

and return

{
category,

confidence,

reasoning,

businessImpact,

recommendation,

severity,

priority,

owner,

generateDefect

}

The report generator must only consume this JSON.

It must never contain business logic.
