import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import Field, { CheckboxField } from "@/components/forms/Field/Field";
import Alert from "@/components/ui/Alert/Alert";
import Button from "@/components/ui/Button/Button";
import { DESTINATION_OPTIONS, INTEREST_OPTIONS, STUDY_LEVEL_OPTIONS } from "@/constants/enquiry";
import { ROUTES } from "@/constants/routes";
import { useEnquiryForm } from "@/hooks/useEnquiryForm";
import { cn } from "@/utils/cn";
import styles from "./EnquiryForm.module.css";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  destination: "",
  studyLevel: "",
  fieldOfInterest: "",
  interest: "",
  message: "",
  consent: false,
  website: "", // honeypot — must stay empty
};

/**
 * Enquiry form used on Apply Now (full) and Contact (short).
 *
 * States: idle → submitting (button busy) → success (confirmation panel,
 * focus moved to it) or error (summary alert + inline field errors,
 * focus moved to the first invalid field).
 *
 * @param {object} props
 * @param {"apply"|"contact"} [props.variant="apply"]
 * @param {object} [props.defaults] Pre-selected values, e.g. { interest: "visa" }.
 */
export default function EnquiryForm({ variant = "apply", defaults = {} }) {
  const isApply = variant === "apply";
  const idPrefix = useId().replace(/:/g, "");
  const { values, errors, status, serverMessage, onChange, onSubmit, reset } = useEnquiryForm({
    source: variant,
    initialValues: { ...EMPTY, ...defaults },
    idPrefix,
  });
  const successRef = useRef(null);
  const id = (name) => `${idPrefix}-${name}`;

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className={cn(styles.success, "flex flex-col gap-4 p-6 md:p-8")} role="status">
        <p className={styles.successTitle}>Thank you, your enquiry has been sent.</p>
        <p className="text-ink-700">
          An adviser will get back to you by email or phone. If your question is urgent, please call us.
        </p>
        <Button variant="secondary" onClick={reset} className="self-start">
          Send another enquiry
        </Button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6" aria-describedby={id("required-note")}>
      <p id={id("required-note")} className="text-sm text-ink-600">
        Fields marked <span className="text-error-700">*</span> are required.
      </p>

      {status === "error" && serverMessage && <Alert tone="error" title={serverMessage} />}

      <div className="grid gap-6 md:grid-cols-2">
        <Field
          id={id("fullName")}
          name="fullName"
          label="Full name"
          autoComplete="name"
          required
          value={values.fullName}
          onChange={onChange}
          error={errors.fullName}
          className="md:col-span-2"
        />
        <Field
          id={id("email")}
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          inputMode="email"
          required
          value={values.email}
          onChange={onChange}
          error={errors.email}
        />
        <Field
          id={id("phone")}
          name="phone"
          type="tel"
          label="Phone number"
          autoComplete="tel"
          inputMode="tel"
          required={isApply}
          hint={isApply ? "Include WhatsApp if you prefer we message you there." : undefined}
          value={values.phone}
          onChange={onChange}
          error={errors.phone}
        />

        {isApply && (
          <>
            <Field
              as="select"
              id={id("destination")}
              name="destination"
              label="Preferred study destination"
              required
              options={DESTINATION_OPTIONS}
              value={values.destination}
              onChange={onChange}
              error={errors.destination}
            />
            <Field
              as="select"
              id={id("studyLevel")}
              name="studyLevel"
              label="Intended level of study"
              required
              options={STUDY_LEVEL_OPTIONS}
              value={values.studyLevel}
              onChange={onChange}
              error={errors.studyLevel}
            />
            <Field
              id={id("fieldOfInterest")}
              name="fieldOfInterest"
              label="Course or field of interest"
              placeholder="e.g. Nursing, Data science, MBA"
              required
              value={values.fieldOfInterest}
              onChange={onChange}
              error={errors.fieldOfInterest}
            />
          </>
        )}

        <Field
          as="select"
          id={id("interest")}
          name="interest"
          label="What do you need help with?"
          placeholderOption="Choose a service"
          options={INTEREST_OPTIONS}
          value={values.interest}
          onChange={onChange}
          error={errors.interest}
          className={isApply ? "" : "md:col-span-2"}
        />

        <Field
          as="textarea"
          id={id("message")}
          name="message"
          label={isApply ? "Additional information" : "Your message"}
          required={!isApply}
          hint={
            isApply
              ? "Your current qualifications, when you'd like to start, budget, or anything else that helps."
              : undefined
          }
          maxLength={2000}
          value={values.message}
          onChange={onChange}
          error={errors.message}
          className="md:col-span-2"
        />
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={id("website")}>Leave this field empty</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={onChange}
        />
      </div>

      <Alert tone="info">
        Please don’t include passport numbers, certificates or bank details. We’ll arrange a secure way to
        share documents if we need them.
      </Alert>

      <CheckboxField
        id={id("consent")}
        name="consent"
        required
        checked={values.consent}
        onChange={onChange}
        error={errors.consent}
        label={
          <>
            I agree that Chitnam Penguins Links may use these details to respond to my enquiry, as described in
            the{" "}
            <Link href={ROUTES.privacy} className="text-brand-700 underline">
              privacy policy
            </Link>
            . <span className="text-error-700" aria-hidden="true">*</span>
          </>
        }
      />

      <Button type="submit" size="lg" withArrow loading={submitting} className="self-start">
        {submitting ? "Sending…" : isApply ? "Send my enquiry" : "Send message"}
      </Button>
    </form>
  );
}
