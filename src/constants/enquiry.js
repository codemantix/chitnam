/**
 * Options for the enquiry forms. Values are stored in the database;
 * labels are shown to users.
 *
 * Destinations: the countries on the agency's roll-up banner, confirmed by
 * the client on 18 Nov 2026. Stored values must stay stable once enquiries
 * use them; add new countries rather than renaming values.
 * Study levels follow the programmes on the agency's roll-up banner.
 */
export const DESTINATION_OPTIONS = [
  { value: "usa", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "poland", label: "Poland" },
  { value: "uae", label: "Dubai (UAE)" },
  { value: "other", label: "Another country (tell us below)" },
  { value: "not-sure", label: "Not sure yet" },
];

export const STUDY_LEVEL_OPTIONS = [
  { value: "foundation", label: "Foundation or pathway programme" },
  { value: "undergraduate", label: "Undergraduate (bachelor's degree)" },
  { value: "pg-cert-diploma", label: "Postgraduate certificate or diploma" },
  { value: "masters", label: "Master's degree" },
  { value: "phd", label: "PhD or doctorate" },
  { value: "not-sure", label: "Not sure yet" },
];

export const INTEREST_OPTIONS = [
  { value: "admissions", label: "University admissions" },
  { value: "visa", label: "Student visa guidance" },
  { value: "counselling", label: "Career and course counselling" },
  { value: "pre-departure", label: "Pre-departure briefing" },
  { value: "general", label: "General enquiry" },
];

export const ENQUIRY_STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

export const labelFor = (options, value) =>
  options.find((option) => option.value === value)?.label || value || "—";

/** Spam controls for the public form. */
export const ENQUIRY_LIMITS = {
  /** Submissions allowed per IP address per window. */
  maxPerWindow: 5,
  windowSeconds: 10 * 60,
  /** Forms submitted faster than this are almost certainly bots. */
  minFillMs: 3000,
};
