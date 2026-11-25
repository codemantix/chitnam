import Icon from "@/components/ui/Icon/Icon";
import { useBusiness } from "@/hooks/useBusiness";
import { formatAddress, mapsUrl, socialLinksFrom, whatsappUrl } from "@/utils/settings";
import { cn } from "@/utils/cn";
import styles from "./ContactDetails.module.css";

function Row({ label, icon, children }) {
  return (
    // The icon sits inside <dt> (a <dl> row may only hold dt/dd) and is
    // positioned in the left gutter by CSS.
    <div className={cn(styles.row, "flex flex-col gap-1.5 py-5 pr-5 sm:pr-6")}>
      <dt className={styles.label}>
        <span className={styles.icon} aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
        {label}
      </dt>
      <dd className="flex min-w-0 flex-col gap-1.5 text-ink-900">{children}</dd>
    </div>
  );
}

/**
 * Office address, phone, email and social links. Office hours and WhatsApp
 * appear automatically once they are set in config/site.js.
 */
export default function ContactDetails() {
  const business = useBusiness();
  const contact = business;
  const socialLinks = socialLinksFrom(business.social);

  return (
    <dl className={styles.list}>
      <Row label="Visit" icon="pin">
        <address className="not-italic">{formatAddress(business.address)}</address>
        <a href={mapsUrl(business.address)} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Open in Google Maps<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </Row>

      <Row label="Call" icon="phone">
        {contact.phones.map((phone) => (
          <a key={phone.tel} href={`tel:${phone.tel}`} className={styles.big}>
            {phone.display}
            {phone.label && <span className="text-sm font-normal text-ink-600"> ({phone.label})</span>}
          </a>
        ))}
      </Row>

      {contact.whatsapp && (
        <Row label="WhatsApp" icon="phone">
          <a
            href={whatsappUrl(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.big}
          >
            Message us on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </Row>
      )}

      <Row label="Email" icon="mail">
        <a href={`mailto:${contact.email}`} className={styles.big}>
          {/* Lets narrow screens wrap after the @ instead of mid-domain. */}
          {contact.email.split("@")[0]}@<wbr />
          {contact.email.split("@")[1]}
        </a>
      </Row>

      {contact.officeHours && (
        <Row label="Office hours" icon="calendar">
          <p>{contact.officeHours}</p>
        </Row>
      )}

      {socialLinks.length > 0 && (
        <Row label="Follow us" icon="globe">
          <ul className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <li key={link.key}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={styles.social}>
                  <Icon name={link.key} size={16} />
                  {link.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </Row>
      )}
    </dl>
  );
}
