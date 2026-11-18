/**
 * Services. Summaries and core facts come from the old Services page
 * (visa extensions and post-study work visas, the four admission stages,
 * the "boutique" counselling approach, and the pre-departure briefing topics).
 *
 * The expanded copy (audience, what we do, steps, FAQs) is written for the
 * rebuild and needs client approval — see docs/PROJECT_PLAN.md. FAQ answers
 * avoid fees, timelines and outcomes the agency hasn't confirmed.
 */
export const services = [
  {
    slug: "university-admissions",
    icon: "admissions",
    image: { src: "/images/hero/admissions-student-applying-laptop.jpg", width: 1600, height: 1064, alt: "Student completing a university application on a laptop" },
    title: "University admissions processing",
    shortTitle: "Admissions",
    summary:
      "We prepare and track your application through each stage, from submission and assessment to your offer letter and acceptance.",
    seoTitle: "University admissions processing for Nigerian students",
    seoDescription:
      "Help with university applications abroad from Port Harcourt: course shortlists, documents, submission, offers and acceptance for undergraduate and postgraduate study.",
    intro: [
      "A strong application is accurate, complete and sent to the right courses. We work through it with you so nothing is missed and every document says what it should.",
      "There are four stages to a university application: application, assessment, offer and acceptance. We guide you through each one, from the first form to the moment you accept your place.",
    ],
    audience: [
      "School leavers applying for foundation or undergraduate study",
      "Graduates applying for postgraduate certificates, diplomas, master's or PhD programmes",
      "Parents and sponsors who want to understand the process before committing",
      "Students who have started an application and want it checked",
    ],
    includes: [
      "Checking entry requirements for each course on your shortlist",
      "A document checklist tailored to each university",
      "Feedback on your personal statement or study plan",
      "Submitting your application and following it up",
      "Explaining conditional and unconditional offers",
      "Guidance on accepting your offer and the next steps",
    ],
    steps: [
      {
        title: "Application",
        text: "We confirm your course choices, gather your documents and submit a complete application to each university.",
      },
      {
        title: "Assessment",
        text: "The university reviews your application. We respond to any requests for more information on your behalf or with you.",
      },
      {
        title: "Offer",
        text: "When an offer arrives, we go through it with you, including any conditions you still need to meet.",
      },
      {
        title: "Acceptance",
        text: "We explain what accepting involves, including any deposit or documents the university asks for, so you can move on to your visa.",
      },
    ],
    faqs: [
      {
        question: "How long does it take to get an offer?",
        answer:
          "It depends on the university, the course and the time of year. Some respond within a few weeks, others take longer. We'll tell you what to expect for each institution on your shortlist.",
      },
      {
        question: "Can I apply to more than one university?",
        answer:
          "Yes, and it's usually sensible to. We'll help you build a balanced shortlist so you aren't relying on a single offer.",
      },
      {
        question: "What if my results don't meet the entry requirements?",
        answer:
          "There may still be a route in, such as a foundation or pathway programme that leads on to a degree. We'll talk you through the realistic options.",
      },
      {
        question: "Do I need IELTS?",
        answer:
          "Most universities ask for proof of English, often through a test such as IELTS, PTE or TOEFL. Some accept other evidence. We'll check the requirement for each course before you book a test.",
      },
    ],
  },
  {
    slug: "student-visa-guidance",
    icon: "visa",
    image: { src: "/images/hero/student-visa-passport-stamps.jpg", width: 1600, height: 1067, alt: "Open passport with visa and entry stamps" },
    title: "Student visa guidance",
    shortTitle: "Student visas",
    summary:
      "Support with your student visa application at every stage, plus help with extensions and post-study work visas where they apply.",
    seoTitle: "Student visa guidance in Port Harcourt",
    seoDescription:
      "Step-by-step help with student visa applications for Nigerian students: requirements, documents, financial evidence, extensions and post-study work visas.",
    intro: [
      "Every international student needs a valid student visa, and the visa stage is where many study plans stall. Careful preparation makes the difference.",
      "We help you understand exactly what your destination asks for, prepare your documents, and complete the application correctly. We can also help with visa extensions and renewals, and with post-study work visas where they apply.",
    ],
    audience: [
      "Students who have accepted an offer and are ready to apply for a visa",
      "Current students who need to extend or renew a visa",
      "Graduates looking at post-study work options",
      "Parents and sponsors who need to understand financial evidence",
    ],
    includes: [
      "Explaining the visa requirements for your destination",
      "A personalised document checklist",
      "Guidance on financial and sponsorship evidence",
      "Reviewing your application before you submit it",
      "Preparing you for biometrics, medicals or an interview where required",
      "Advice on extensions, renewals and post-study work visas",
    ],
    steps: [
      {
        title: "Check requirements",
        text: "We confirm which visa you need and what the immigration authority asks for in your case.",
      },
      {
        title: "Prepare documents",
        text: "We work through the checklist with you: passport, enrolment confirmation, finances, health cover and anything else required.",
      },
      {
        title: "Apply",
        text: "We review your completed application with you before it is submitted, and help you book any biometrics or medicals.",
      },
      {
        title: "Decision and next steps",
        text: "Once a decision arrives, we explain your visa conditions and move on to preparing for departure.",
      },
    ],
    faqs: [
      {
        question: "Can you guarantee my visa?",
        answer:
          "No. Visa decisions are made only by the immigration authority. What we do is help you submit a complete, accurate and honest application.",
      },
      {
        question: "When should I apply for my visa?",
        answer:
          "Usually after you have accepted your offer and received your enrolment confirmation from the university. Processing times vary, so apply as early as the rules allow. We'll check the current guidance with you.",
      },
      {
        question: "I've been refused a visa before. Can you help?",
        answer:
          "Yes. We'll go through the refusal reasons with you and advise whether and how to reapply. Previous refusals must always be declared on new applications.",
      },
      {
        question: "Can I work while I study?",
        answer:
          "Most student visas allow limited part-time work while your course is in session. The limits are set by each country and change from time to time, so we'll brief you on the current rules for your visa.",
      },
    ],
  },
  {
    slug: "career-counselling",
    icon: "counselling",
    image: { src: "/images/hero/course-counselling-mentor-student.jpg", width: 1600, height: 900, alt: "Adviser guiding a student through course options" },
    title: "Career and course counselling",
    shortTitle: "Counselling",
    summary:
      "One-to-one sessions to match your goals, grades and budget to courses and institutions that make sense for you.",
    seoTitle: "Career and course counselling for study abroad",
    seoDescription:
      "One-to-one course counselling in Port Harcourt. Find courses and universities abroad that fit your results, career goals and budget.",
    intro: [
      "Choosing a course can be overwhelming. There are thousands of options, and the right one depends on your results, your interests, your budget and where you want your career to go.",
      "As a small agency, we focus on each student individually. We take the time to talk through your goals and give you options that fit, rather than a generic list.",
    ],
    audience: [
      "School leavers who aren't sure what to study",
      "Graduates considering a change of field for postgraduate study",
      "Parents helping a son or daughter decide",
      "Working professionals planning further study",
    ],
    includes: [
      "A one-to-one conversation about your interests and goals",
      "A review of your academic results and any test scores",
      "A realistic look at budget, including tuition and living costs",
      "A shortlist of courses and institutions with reasons for each",
      "A timeline of what to do next and when",
    ],
    steps: [
      {
        title: "Talk",
        text: "We start with you: what you enjoy, what you're good at, and where you'd like to be in five years.",
      },
      {
        title: "Review",
        text: "We look at your results, English test scores if you have them, and the budget available.",
      },
      {
        title: "Shortlist",
        text: "We suggest courses and institutions that fit, and explain the entry requirements and costs for each.",
      },
      {
        title: "Plan",
        text: "You leave with a clear plan and timeline, ready to move on to applications when you are.",
      },
    ],
    faqs: [
      {
        question: "I have no idea what I want to study. Is that okay?",
        answer:
          "Yes. That's exactly what counselling is for. We'll ask the right questions and help you narrow things down.",
      },
      {
        question: "Can my parents or sponsor join the session?",
        answer:
          "Yes. Parents and sponsors are often part of the decision, and it helps when everyone hears the same information.",
      },
      {
        question: "Do I have to apply through you after counselling?",
        answer:
          "No. Counselling is useful on its own. If you decide to go ahead, we can help with the application too.",
      },
    ],
  },
  {
    slug: "pre-departure-support",
    icon: "plane",
    image: { src: "/images/banners/airport-gate-departure.jpg", width: 2000, height: 1334, alt: "Aircraft at an airport gate seen from the departure lounge" },
    title: "Pre-departure briefings",
    shortTitle: "Pre-departure",
    summary:
      "What to expect before you fly: your new city, student accommodation, part-time work rules and the services available to you.",
    seoTitle: "Pre-departure briefings for international students",
    seoDescription:
      "Get ready to study abroad: briefings on your new city, student accommodation, part-time work rules, health cover and support services before you travel.",
    intro: [
      "Getting your visa is a big moment, but there is still a lot to prepare before you travel. A good start in your first weeks makes the rest of your course easier.",
      "We give you the information you need before you arrive: your city, student accommodation, employment opportunities and the student services available to you.",
    ],
    audience: [
      "Students whose visa has been granted",
      "Students travelling abroad for the first time",
      "Parents who want to know their son or daughter is prepared",
    ],
    includes: [
      "A briefing on your city and campus",
      "Your accommodation options and how to secure them",
      "What to pack and which documents to carry",
      "Your visa conditions, including part-time work limits",
      "Health cover, banking and phone basics on arrival",
      "Where to find student support once you're there",
    ],
    steps: [
      {
        title: "Briefing",
        text: "Once your visa is granted, we arrange a briefing covering your city, campus and visa conditions.",
      },
      {
        title: "Accommodation",
        text: "We explain your options, such as university housing, shared rentals or homestay, and how to apply.",
      },
      {
        title: "Travel checklist",
        text: "We go through what to pack, which documents to carry in your hand luggage, and what happens at arrival.",
      },
      {
        title: "First weeks",
        text: "We cover orientation, enrolment, opening a bank account and finding part-time work within the rules.",
      },
    ],
    faqs: [
      {
        question: "When does the briefing happen?",
        answer:
          "After your visa is granted and before you travel, with enough time to act on what you learn.",
      },
      {
        question: "Will you book my accommodation?",
        answer:
          "We explain your options and how to apply, and help you weigh them up. You make the booking directly with the university or provider.",
      },
      {
        question: "Can my parents attend the briefing?",
        answer:
          "Yes, and we encourage it. Parents often have questions of their own about safety, money and contact.",
      },
    ],
  },
];

export const getServiceBySlug = (slug) =>
  services.find((service) => service.slug === slug) || null;
