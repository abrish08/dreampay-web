import s from "./Stat.module.css";

export function Stat({ label, value, hint, loading }: { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode; loading?: boolean }) {
  return (
    <div className={s.stat}>
      <div className={s.label}>{label}</div>
      {loading ? <div className={s.skeleton} /> : <div className={s.value}>{value}</div>}
      {hint && <div className={s.hint}>{hint}</div>}
    </div>
  );
}

export const StatGrid = ({ children }: { children: React.ReactNode }) => <div className={s.grid}>{children}</div>;
