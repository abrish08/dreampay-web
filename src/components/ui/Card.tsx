import { cx } from "@/lib/cx";
import s from "./Card.module.css";

type Props = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  flush?: boolean; // no padding: tables go edge to edge
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "title">;

export function Card({ title, description, actions, footer, flush, className, children, ...rest }: Props) {
  return (
    <section className={cx(s.card, className)} {...rest}>
      {(title || actions) && (
        <header className={s.head}>
          <div>
            {title && <h2 className={s.title}>{title}</h2>}
            {description && <p className={s.desc}>{description}</p>}
          </div>
          {actions && <div className="cluster">{actions}</div>}
        </header>
      )}
      {children !== undefined && <div className={cx(s.body, flush && s.flush)}>{children}</div>}
      {footer && <footer className={s.foot}>{footer}</footer>}
    </section>
  );
}
