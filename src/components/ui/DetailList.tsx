import { Fragment } from "react";
import s from "./DetailList.module.css";

/** Label / value rows. Items that are false or null are skipped. */
export function DetailList({ items }: { items: (readonly [React.ReactNode, React.ReactNode] | false | "" | 0 | null | undefined)[] }) {
  return (
    <dl className={s.list}>
      {items.filter((x): x is readonly [React.ReactNode, React.ReactNode] => !!x).map(([k, v], i) => (
        <Fragment key={i}><dt>{k}</dt><dd>{v}</dd></Fragment>
      ))}
    </dl>
  );
}
