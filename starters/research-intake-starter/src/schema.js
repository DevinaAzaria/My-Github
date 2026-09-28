const fields = [
  {
    name: "participant_name",
    label: "Participant name / code",
    type: "text",
    required: true,
    max: 120
  },
  {
    name: "context",
    label: "Context",
    type: "textarea",
    required: true,
    max: 2500
  },
  {
    name: "goal",
    label: "Goal / research purpose",
    type: "textarea",
    required: true,
    max: 2500
  },
  {
    name: "observation",
    label: "Concrete observation",
    type: "textarea",
    required: true,
    max: 3500
  },
  {
    name: "evidence",
    label: "Existing evidence / artifact",
    type: "textarea",
    required: false,
    max: 4000
  },
  {
    name: "constraints",
    label: "Constraints",
    type: "textarea",
    required: false,
    max: 2500
  }
];

function clean(value, max = 4000) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function validate(input) {
  const data = {};
  const errors = [];

  for (const field of fields) {
    const value = clean(input[field.name], field.max);
    data[field.name] = value;
    if (field.required && !value) {
      errors.push(field.label + " is required.");
    }
  }

  const consent =
    input.consent === true ||
    input.consent === "true" ||
    input.consent === "yes";

  if (!consent) errors.push("Consent is required.");
  data.consent = consent;

  return { ok: errors.length === 0, data, errors };
}

function toResponseRow({ recordId, submittedAt, data }) {
  return [
    recordId,
    submittedAt,
    data.participant_name,
    data.context,
    data.goal,
    data.observation,
    data.evidence,
    data.constraints,
    data.consent ? "Confirmed" : ""
  ];
}

module.exports = { fields, validate, toResponseRow };
