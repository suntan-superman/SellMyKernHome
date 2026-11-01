# Adam partnership demonstration — manual Property Intelligence scenario

**Status:** Prepared locally with synthetic property-only information. No PI account, API, deep link, export, or authentication capability is assumed.

## Demonstration objective

Show how a qualified SMKH property scenario could move from seller intake to a property-evaluation discussion without transferring seller identity or implying that an automatic PI integration exists.

The private page is `/demo/property-intelligence`. It is available only when the private staging shell is enabled and authenticated.

## Synthetic property packet

| Field | Demonstration value |
|---|---|
| Scenario address | 1000 Example Avenue, Bakersfield, CA 93301 |
| Property type | Synthetic single-family home |
| Configuration | 3 bedrooms, 2 bathrooms, 1,450 square feet |
| Condition | Illustrative deferred maintenance; no inspection performed |
| Illustrative reference value | $320,000 |
| Illustrative repairs | $55,000 |
| Illustrative holding and closing costs | $25,000 |
| Illustrative contingency | $10,000 |

The address and all figures are invented training inputs. They are not sourced live and must never be represented as a comparable-sale analysis, appraisal, offer, or real transaction.

## Prohibited fields

Do not copy or display:

- Seller name, email, telephone number, consent choices, or free-text seller comments.
- Production or staging lead UUID/reference.
- Internal operator notes or assignment.
- Access instructions, legal documents, mortgage information, or account data.
- Live comparable data unless PI legitimately supplies it and the presenter accurately labels its source/date.

## Exact demonstration path

1. Authenticate to the private SMKH staging shell.
2. Open **Property Intelligence → Open the PI scenario**.
3. Explain that only the property facts shown on the page are eligible for handoff.
4. Open the separately approved PI environment in another authenticated tab. The PI URL remains a prerequisite.
5. Manually enter the synthetic address and property characteristics.
6. If PI supports comparable selection, repair scenarios, holding costs, margins, or simulation, use only demonstrably supported features.
7. Label every output as synthetic/illustrative and identify the input assumptions.
8. Demonstrate sensitivity by changing one assumption at a time; do not describe any result as an offer or expected outcome.
9. Return to the SMKH private shell. Do not save seller PII or claim that records synchronized automatically.

## Fallback when PI is unavailable

Present the property packet and explain the intended handoff boundary. Do not fabricate screenshots, API results, comparable sales, Monte Carlo output, or an authenticated connection. Record PI availability as a failed prerequisite rather than a product failure.

## Required disclaimer

> Training scenario only. These values are invented assumptions, not an appraisal, market analysis, offer, investment recommendation, or representation of a real property or transaction.

## Prerequisites for a future integration

- Exact PI product/environment and owner.
- Supported authentication method and session-sharing policy.
- API or deep-link documentation, if any.
- Field-level data-sharing approval and retention rules.
- Server-to-server credential storage and rotation plan.
- Failure handling and a manual fallback.
- Proof that no seller PII enters logs, URLs, analytics, or exports.

Until those are confirmed, manual synthetic entry is the approved Stage 1 approach.
