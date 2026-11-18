import { formatAddress, siteConfig } from "@/config/site";

/**
 * Legal page content.
 *
 * DRAFT — both texts need review by the client (and ideally a Nigerian
 * lawyer) before launch. The privacy policy describes how the enquiry forms
 * built in Phase 4 handle data; update it if that changes.
 *
 * Sections are { heading, paragraphs?, list? }.
 */

export const LEGAL_LAST_UPDATED = "2026-11-18";

export const disclaimerSections = [
  {
    heading: "Beware of fraudulent messages",
    paragraphs: [
      `We are aware of messages that falsely claim to come from ${siteConfig.legalName}, or from third parties acting for us, about educational events, fairs and similar programmes.`,
      "We do not appoint third parties or outside agencies to organise events on our behalf. If you receive an invitation or request for payment that mentions us and you are unsure whether it is genuine, do not respond or pay. Contact us directly using the details on this website and we will confirm.",
      `Our official email address is ${siteConfig.contact.email}.`,
    ],
  },
  {
    heading: "No guarantee of admission or visa outcomes",
    paragraphs: [
      "We provide guidance and support with course selection, university applications, student visa applications and preparation for study abroad. Decisions on admission are made solely by universities and colleges, and decisions on visas are made solely by the relevant immigration authorities. We cannot and do not guarantee any outcome.",
    ],
  },
  {
    heading: "General information only",
    paragraphs: [
      "The information on this website is general and is provided in good faith. Entry requirements, fees, visa rules and other details change, and may differ for your circumstances. Always confirm current requirements with the institution or the official government source before acting on them.",
    ],
  },
  {
    heading: "Links to other websites",
    paragraphs: [
      "This website links to official and third-party websites for your convenience. We are not responsible for their content, availability or privacy practices.",
    ],
  },
];

export const privacySections = [
  {
    heading: "Who we are",
    paragraphs: [
      `${siteConfig.legalName} ("we", "us") is an education placement agency at ${formatAddress()}. We are responsible for the personal data you share with us through this website. We handle it in line with the Nigeria Data Protection Act 2023.`,
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["When you send an enquiry through this website, we collect:"],
    list: [
      "Your full name, email address and phone number",
      "Your preferred study destination, intended level of study and field of interest",
      "Anything else you choose to tell us in your message",
      "The date and time of your enquiry and your consent to this policy",
    ],
  },
  {
    heading: "What we don't collect through the website",
    paragraphs: [
      "Our enquiry forms do not ask for passports, academic certificates, bank statements or other documents. Please don't include them in your message. If we need documents later, we will agree a secure way for you to share them.",
    ],
  },
  {
    heading: "How we use your information",
    list: [
      "To reply to your enquiry and arrange a consultation",
      "To give you advice about courses, applications and visas if you ask us to",
      "To keep a record of our communication with you",
    ],
    paragraphs: [
      "We will not sell your information, and we will not send you marketing messages unless you ask to receive them.",
    ],
  },
  {
    heading: "Legal basis",
    paragraphs: [
      "We process your information with your consent, which you give when you submit an enquiry, and where necessary to take steps you have asked for before entering into an agreement with us.",
    ],
  },
  {
    heading: "Who can see it",
    paragraphs: [
      "Only authorised Chitnam staff can view enquiries. Our website and its database are hosted by service providers who process data on our behalf under contract and with appropriate security measures. If you become a client, we share only the information needed with the universities and authorities involved in your application, with your agreement.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep enquiry records only as long as we need them to respond to you and to manage any service you go on to use. If you don't become a client, we delete your enquiry within 24 months of our last contact with you.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can ask to see the personal data we hold about you, ask us to correct or delete it, or withdraw your consent at any time. You also have the right to complain to the Nigeria Data Protection Commission.",
      `To make a request, email ${siteConfig.contact.email}.`,
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "This website does not use advertising or tracking cookies. If we add analytics in future, we will update this policy and ask for your consent where required.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. The date at the top shows when it last changed.",
    ],
  },
];
