"""
Content repository for IPRA intervention plans.

PLAN_CONTENT maps (dimension_id, level) -> action dict with keys:
  supervisor : list[str]  - actions for the direct supervisor
  manager    : list[str]  - actions for the area manager
  system     : list[str]  - systemic / organizational actions
  kpis       : list[str]  - key performance indicators to track
"""

PLAN_CONTENT = {
    ("D4", "critical"): {
        "supervisor": [
            "Implement the Stop Work Authority (SWA) protocol in all field operations, ensuring every worker understands their right and obligation to stop unsafe work without fear of reprisal.",
            "Hold daily 5-minute safety huddles explicitly covering Stop Work scenarios, using real examples from the work area to reinforce the culture.",
            "Publicly recognize at least 2 preventive work stoppages per week during team briefings to strengthen positive safety behavior.",
        ],
        "manager": [
            "Conduct weekly field visits to validate that the supervisor is actively exercising Stop Work authority and providing backing to workers who interrupt unsafe tasks.",
            "Provide visible organizational support every time a work stoppage occurs — be present, acknowledge the decision, and communicate upward to reinforce the norm.",
        ],
        "system": [
            "Create an anonymous reporting channel for unsafe work that was NOT stopped, to detect gaps in Stop Work culture and address them systemically.",
            "Implement a 'Stop Work Champion' recognition badge awarded quarterly to supervisors with the best SWA compliance and reporting metrics.",
        ],
        "kpis": [
            "Number of Stop Work events reported per month",
            "Average response time from work stoppage to hazard resolution (hours)",
            "% of workers who can correctly describe the SWA procedure (quarterly survey)",
        ],
    },
    ("D1", "critical"): {
        "supervisor": [
            "Conduct a critical controls inspection at the start of every shift using the standardized digital checklist before authorizing any work to begin.",
            "Document all substandard conditions found in the digital system on the same day they are identified, including photo evidence and an assigned corrective owner.",
            "Do not authorize the start of any task without completing the full critical controls verification — zero exceptions regardless of operational pressure.",
        ],
        "manager": [
            "Audit 30% of the supervisor's inspection records monthly, providing written feedback within 48 hours and escalating recurring gaps to the HSE team.",
            "Allocate sufficient budget and resources for immediate correction of critical findings, removing cost as a barrier to safety compliance.",
        ],
        "system": [
            "Digitize the critical controls checklist with electronic signature, geolocation, and timestamping to ensure full traceability and prevent backdating.",
            "Establish a consequence matrix for omission of critical controls, applied consistently across all hierarchical levels without exceptions.",
        ],
        "kpis": [
            "% of shifts with completed critical controls checklist (target: 100%)",
            "Number of critical conditions corrected within 24 hours of identification",
            "Average closure time for critical findings (days)",
        ],
    },
}
