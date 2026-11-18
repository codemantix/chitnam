/**
 * Homepage copy that is shared or list-shaped.
 * Facts come from the existing website unless noted.
 */

import { ROUTES } from "@/constants/routes";

/**
 * Hero carousel slides. Each slide speaks to one reason people get in touch,
 * shows a matching photo and ends in its own call to action. Stock photo
 * sources are listed in docs/IMAGE_CREDITS.md. `?interest=` pre-selects the topic on
 * the Apply form (wired up in Phase 4).
 */
export const heroSlides = [
  {
    label: "Start here",
    image: {
      src: "/images/photos/team-consultation-desk.jpg",
      width: 1296,
      height: 864,
      alt: "Chitnam Penguins Links study abroad advisers working through student applications at a consultation table",
      position: "55% 45%",
    },
    headline: "Study abroad, with guidance at every step.",
    text: "We help Nigerian students choose the right course, apply to universities, prepare their student visa application and get ready to travel. We've done it since 2015.",
    primary: { label: "Start your enquiry", href: ROUTES.apply },
    secondary: { label: "Talk to an adviser", href: ROUTES.contact },
  },
  {
    label: "Admissions",
    image: {
      src: "/images/hero/admissions-student-applying-laptop.jpg",
      width: 1600,
      height: 1064,
      alt: "Student with braided hair completing a university application on a laptop",
      position: "60% 40%",
    },
    headline: "Your university application, prepared properly.",
    text: "We take your application through every stage with you: submission, assessment, offer and acceptance. Nothing is left to guesswork.",
    primary: { label: "Start your application", href: `${ROUTES.apply}?interest=admissions` },
    secondary: { label: "How admissions work", href: ROUTES.service("university-admissions") },
  },
  {
    label: "Student visas",
    image: {
      src: "/images/hero/student-visa-passport-stamps.jpg",
      width: 1600,
      height: 1067,
      alt: "Open passport with student visa and entry stamps, ready for study abroad travel",
      position: "50% 50%",
    },
    headline: "Student visa applications, without the guesswork.",
    text: "We guide you through the forms, documents and evidence your visa needs, and help with extensions and post-study work visas where they apply.",
    primary: { label: "Ask about your visa", href: `${ROUTES.apply}?interest=visa` },
    secondary: { label: "Student visa guidance", href: ROUTES.service("student-visa-guidance") },
  },
  {
    label: "Course choice",
    image: {
      src: "/images/hero/course-counselling-mentor-student.jpg",
      width: 1600,
      height: 900,
      alt: "Adviser guiding a student through course and university options during a counselling session",
      position: "55% 40%",
    },
    headline: "Not sure what to study? Start with a conversation.",
    text: "One-to-one counselling that matches your results, goals and budget to courses and universities that make sense for you.",
    primary: { label: "Request a consultation", href: `${ROUTES.apply}?interest=counselling` },
    secondary: { label: "Career counselling", href: ROUTES.service("career-counselling") },
  },
];

/** Steps follow the services the agency offers and the four admission
 *  stages named on the old Services page (application, assessment, offer,
 *  acceptance). */
export const processSteps = [
  {
    title: "First consultation",
    text: "We talk through your goals, your results so far, your budget and when you want to start.",
  },
  {
    title: "Course and university choice",
    text: "We shortlist courses and institutions that match your profile, and explain the entry requirements for each.",
  },
  {
    title: "Application and offer",
    text: "We prepare and submit your application, follow it through assessment, and help you understand the offer you receive.",
  },
  {
    title: "Acceptance and student visa",
    text: "Once you accept your offer, we guide you through the student visa application and the documents it needs.",
  },
  {
    title: "Pre-departure briefing",
    text: "Before you travel, we brief you on your new city, student accommodation, part-time work and the support available on campus.",
  },
];

/** Reasons drawn from facts on the old site: founded 2015, run by three
 *  partners with placement and recruitment experience, a "boutique" approach
 *  focused on each student, and services that cover the whole journey. */
export const reasons = [
  {
    title: "Working with students since 2015",
    text: "We have been helping students from Port Harcourt and beyond apply to study overseas for over a decade.",
  },
  {
    title: "Run by experienced partners",
    text: "The agency is owned and managed by three partners with long experience in education placement and student recruitment.",
  },
  {
    title: "Advice that fits you",
    text: "We are a small agency by choice. You get time with an adviser who knows your file, not a queue.",
  },
  {
    title: "One team for the whole journey",
    text: "Course choice, applications, visas and preparing to travel are handled by the same people, so nothing is lost between stages.",
  },
];

/** General homepage FAQs. Answers avoid promises the agency can't make. */
export const homeFaqs = [
  {
    question: "Where is your office?",
    answer:
      "Our office is at 29 Ohiamini Crescent, Rumuola Link Road, Rumuigbo, Port Harcourt, Rivers State. Call or email before you visit so an adviser can make time for you.",
  },
  {
    question: "Which countries can you help me study in?",
    answer:
      "We help students apply to study in the United States, the United Kingdom, Canada, Australia, Poland and Dubai (UAE). If you are considering another country, ask us. We will tell you honestly whether we can help.",
  },
  {
    question: "Can you guarantee admission or a student visa?",
    answer:
      "No, and you should be careful of anyone who does. Universities decide on admission and immigration authorities decide on visas. Our job is to help you make a complete, accurate and well-prepared application.",
  },
  {
    question: "When should I start planning?",
    answer:
      "Ideally nine to twelve months before you want to begin your course. Intake dates differ by country and university, and applications, offers and visas all take time.",
  },
  {
    question: "What documents will I need?",
    answer:
      "Usually an international passport, academic transcripts and certificates, English language test results, and evidence of funds for the visa stage. Requirements vary by course and country, so we will confirm the exact list for you. Please don't send documents through the website enquiry form; we will arrange a secure way to share them.",
  },
];

/**
 * Figures for the "Why choose us" band. Verified facts only: founding year,
 * number of services and number of owning partners are all on the original
 * site. (The old site's "99+ universities / 99% admission / 95% visa
 * success" figures were unverified and are deliberately not used.)
 */
export const facts = [
  { value: "2015", label: "Established in Port Harcourt", icon: "calendar" },
  { value: "4", label: "Core services, one team", icon: "layers" },
  { value: "3", label: "Experienced founding partners", icon: "handshake" },
];
