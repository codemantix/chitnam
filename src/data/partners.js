/**
 * Partner institutions, grouped by region as on the old site's partners
 * page (chitnampenguinslink.com.ng/partners/, three logo collages from
 * January 2022). Added at the client's request on 18 Nov 2026.
 *
 * Names are transcribed from the logos so they are readable by search
 * engines and screen readers. When a partnership changes, update both the
 * list and the collage image (or replace the collages with single logos).
 */
export const partnerGroups = [
  {
    id: "australia-new-zealand",
    region: "Australia and New Zealand",
    image: {
      src: "/images/partners/partners-australia-new-zealand.png",
      width: 1920,
      height: 1080,
    },
    institutions: [
      { name: "Curtin University", country: "Australia" },
      { name: "University of South Australia", country: "Australia" },
      { name: "University of Canterbury", country: "New Zealand" },
      { name: "University of Canberra", country: "Australia" },
      { name: "The University of Adelaide", country: "Australia" },
      { name: "La Trobe University", country: "Australia" },
      { name: "The University of Newcastle", country: "Australia" },
      { name: "Edith Cowan University", country: "Australia" },
      { name: "Griffith University", country: "Australia" },
      { name: "Western Sydney University", country: "Australia" },
      { name: "Deakin University", country: "Australia" },
      { name: "Murdoch University", country: "Australia" },
    ],
  },
  {
    id: "uk-europe",
    region: "United Kingdom and Europe",
    image: {
      src: "/images/partners/partners-uk-europe.png",
      width: 1920,
      height: 1080,
    },
    institutions: [
      { name: "University of Portsmouth", country: "United Kingdom" },
      { name: "Robert Gordon University, Aberdeen", country: "United Kingdom" },
      { name: "University of Hertfordshire", country: "United Kingdom" },
      { name: "Swansea University", country: "United Kingdom" },
      { name: "Birmingham City University", country: "United Kingdom" },
      { name: "Brunel University London", country: "United Kingdom" },
      { name: "The University of Northampton", country: "United Kingdom" },
      { name: "Anglia Ruskin University", country: "United Kingdom" },
      { name: "University of Plymouth", country: "United Kingdom" },
      { name: "University of Leicester", country: "United Kingdom" },
      { name: "Lancaster University", country: "United Kingdom" },
      { name: "Keele University", country: "United Kingdom" },
      { name: "University of Twente", country: "Netherlands" },
      { name: "The Hague University of Applied Sciences", country: "Netherlands" },
    ],
  },
  {
    id: "usa-canada",
    region: "United States and Canada",
    image: {
      src: "/images/partners/partners-usa-canada.png",
      width: 1920,
      height: 1080,
    },
    institutions: [
      { name: "UMass Boston", country: "United States" },
      { name: "Richard Bland College of William & Mary", country: "United States" },
      { name: "Queens College", country: "United States" },
      // Renamed Toronto Metropolitan University in 2022; the logo is the old one.
      { name: "Ryerson University (now Toronto Metropolitan University)", country: "Canada" },
      { name: "Simon Fraser University", country: "Canada" },
      { name: "University of Manitoba", country: "Canada" },
      { name: "Wilfrid Laurier International College", country: "Canada" },
    ],
  },
];

/** Flat list of every institution, e.g. for counts. */
export const partners = partnerGroups.flatMap((group) => group.institutions);

/** Alt text for a collage: the institutions it shows, in order. */
export const collageAlt = (group) =>
  `Logos of partner institutions in ${group.region}: ${group.institutions.map((i) => i.name).join(", ")}`;
