import Link from "next/link";
import { Icon } from "./Icon";
import s from "./PageHeader.module.css";

export function PageHeader({ title, description, actions, back, badge }: {
  title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string }; badge?: React.ReactNode;
}) {
  return (
    <div className={s.header}>
      <div>
        {back && <Link href={back.href} className={s.back}><Icon name="back" size={15} />{back.label}</Link>}
        <div className={s.title}><h1>{title}</h1>{badge}</div>
        {description && <p className={s.desc}>{description}</p>}
      </div>
      {actions && <div className="cluster">{actions}</div>}
    </div>
  );
}
