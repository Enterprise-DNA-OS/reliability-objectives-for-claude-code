# Reliability policy and record checks

Sources checked 2 November 2026. The command checks records against stated business policies and prompts privacy reviews. It is not legal certification, an uptime guarantee or a replacement for an applicable contract.

| Rule | Implemented check | Basis |
|---|---|---|
| REL-01 | Service has an accountable owner and a written error-budget policy | [Google SRE example error-budget policy](https://sre.google/workbook/error-budget-policy/) |
| REL-02 | The owner-specified review date has not passed | Same example's named reviewers and revisit date; our review timing is business policy |
| NZ-IPP9 | A record-handling purpose and next retention review exist and are current | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) |

An error budget allows some failures within a measurement window. The native calculation uses total events times one minus the target. It subtracts actual bad events from this allowance. Missing days and zero traffic do not establish good service. The example project's proceed check also requires no overdue action; that is our chosen policy, not a legal rule or an exact reproduction of Google's policy.

Names, actors and decision notes can be personal information. NZ Principle 9 limits retention to what a lawful purpose requires. Our review date is a reminder to make that decision; it is not a statutory retention period. Nothing is deleted automatically, including audit records.

For Australian entities subject to the APPs, [OAIC APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) addresses reasonable security and destruction or de-identification when information is no longer needed, subject to its exceptions. Determine applicability and any legal holds before disposing of records. The NZ-IPP9 reminder can support that review but is not an Australian compliance assessment.

[NZ Principle 5](https://www.privacy.org.nz/privacy-principles/5/) addresses reasonable safeguards. Files stay local and ignored, and public database roles get no business-table access. These defaults do not prove your deployment is secure. Configure operator permissions, backups and access reviews as described in operations.md. Avoid customer payloads, addresses, emails and secrets in measurement labels or decision notes.
