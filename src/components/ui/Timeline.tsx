import s from "./Timeline.module.css";

export type TimelineItem = { id: string | number; title: React.ReactNode; meta?: React.ReactNode; body?: React.ReactNode };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className={s.timeline}>
      {items.map((it) => (
        <li key={it.id} className={s.item}>
          <span className={s.dot} aria-hidden="true" />
          <div className={s.title}>{it.title}</div>
          {it.meta && <div className={s.meta}>{it.meta}</div>}
          {it.body && <div className={s.body}>{it.body}</div>}
        </li>
      ))}
    </ol>
  );
}
