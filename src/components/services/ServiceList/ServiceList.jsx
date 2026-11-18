import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import CheckList from "@/components/ui/CheckList/CheckList";
import Icon from "@/components/ui/Icon/Icon";
import Section from "@/components/ui/Section/Section";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";
import styles from "./ServiceList.module.css";

/**
 * Services overview as alternating photo/text rows, as on the original
 * Services page (with photographs instead of illustrations).
 *
 * @param {object} props
 * @param {{ slug: string, title: string, summary: string, intro: string[],
 *   includes: string[], icon: string, image: { src: string, alt: string } }[]} props.services
 */
export default function ServiceList({ services }) {
  return (
    <Section labelledBy="service-list-heading" containerClassName="flex flex-col gap-20 md:gap-24">
      <h2 id="service-list-heading" className="sr-only">
        Our services
      </h2>
      {services.map((service, index) => {
        const flipped = index % 2 === 1;
        return (
          <article key={service.slug} className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div className={cn(styles.media, flipped && "lg:order-2")}>
              <Image src={service.image.src} alt={service.image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className={styles.img} />
              <span className={styles.badge} aria-hidden="true">
                <Icon name={service.icon} size={28} strokeWidth={1.5} />
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <p className={styles.number}>Service {String(index + 1).padStart(2, "0")}</p>
              <h3 className={styles.title}>{service.title}</h3>
              <p className="text-lg leading-relaxed text-ink-700">{service.intro[0]}</p>
              <CheckList items={service.includes.slice(0, 4)} />
              <Button href={ROUTES.service(service.slug)} withArrow className="mt-2 self-start">
                More about {service.shortTitle.toLowerCase()}
              </Button>
            </div>
          </article>
        );
      })}
    </Section>
  );
}
