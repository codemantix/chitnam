import { useCallback, useEffect, useRef, useState } from "react";
import { hasErrors, validateEnquiry } from "@/utils/validation";

/** Maps validation keys to element ids so we can focus the first problem. */
const FIELD_ORDER = ["fullName", "email", "phone", "destination", "studyLevel", "fieldOfInterest", "message", "consent"];

/**
 * State and submission for the enquiry forms.
 *
 * @param {object} options
 * @param {"apply"|"contact"} options.source
 * @param {object} options.initialValues
 * @param {string} options.idPrefix Prefix used for field ids, to focus errors.
 */
export function useEnquiryForm({ source, initialValues, idPrefix, requirePhone = false }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverMessage, setServerMessage] = useState("");
  const startedAt = useRef(0);
  const submittedOnce = useRef(false);

  // Recorded on mount: the API treats near-instant submissions as bots.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const focusFirstError = useCallback(
    (fieldErrors) => {
      const first = FIELD_ORDER.find((key) => fieldErrors[key]);
      if (first) document.getElementById(`${idPrefix}-${first}`)?.focus();
    },
    [idPrefix]
  );

  const onChange = (event) => {
    const { name, type, checked, value } = event.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(next);
    // After the first submit attempt, re-validate as the user corrects fields.
    if (submittedOnce.current) setErrors(validateEnquiry(next, source, { requirePhone }).errors);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (status === "submitting") return;
    submittedOnce.current = true;
    setServerMessage("");

    const { errors: clientErrors } = validateEnquiry(values, source, { requirePhone });
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      setStatus("error");
      setServerMessage("Please correct the highlighted fields.");
      focusFirstError(clientErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const response = await fetch("/api/enquiries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source, startedAt: startedAt.current }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        setStatus("success");
        return;
      }
      if (result.errors) {
        setErrors(result.errors);
        focusFirstError(result.errors);
      }
      setStatus("error");
      setServerMessage(result.message || "Something went wrong. Please try again.");
    } catch {
      setStatus("error");
      setServerMessage("We couldn't reach the server. Check your connection and try again.");
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
    setServerMessage("");
    submittedOnce.current = false;
    startedAt.current = Date.now();
  };

  return { values, errors, status, serverMessage, onChange, onSubmit, reset };
}
