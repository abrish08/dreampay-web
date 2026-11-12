"use client";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import s from "./DataTable.module.css";

export type Column<T> = { key: string; header: React.ReactNode; cell: (row: T) => React.ReactNode; align?: "right"; className?: string };

type Props<T> = {
  columns: Column<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string; // rows open a detail page
  loading?: boolean;
  empty?: React.ReactNode;
  label: string; // for screen readers
};

export function DataTable<T>({ columns, rows, rowKey, rowHref, loading, empty, label }: Props<T>) {
  const router = useRouter();
  const showSkeleton = loading && (!rows || rows.length === 0);
  if (!showSkeleton && rows && rows.length === 0 && empty) return <>{empty}</>;
  return (
    <div className={s.wrap}>
      <table className={s.table} aria-label={label} aria-busy={loading || undefined}>
        <thead>
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={cx(c.align === "right" && s.right)}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {showSkeleton
            ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}>{columns.map((c) => <td key={c.key}><div className={s.skeleton} style={{ width: `${50 + ((i * 17 + c.key.length * 7) % 40)}%` }} /></td>)}</tr>
              ))
            : rows?.map((row) => {
                const href = rowHref?.(row);
                return (
                  <tr key={rowKey(row)} className={cx(href && s.clickable)} tabIndex={href ? 0 : undefined}
                    onClick={href ? (e) => { if (!(e.target as HTMLElement).closest("a,button")) router.push(href); } : undefined}
                    onKeyDown={href ? (e) => { if (e.key === "Enter") router.push(href); } : undefined}>
                    {columns.map((c) => <td key={c.key} className={cx(c.align === "right" && s.right, c.className)}>{c.cell(row)}</td>)}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
