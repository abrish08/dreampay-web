import { Icon, type IconName } from "./Icon";
import s from "./EmptyState.module.css";

export function EmptyState({ icon = "inbox", title, description, action }: { icon?: IconName; title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className={s.empty}>
      <div className={s.icon}><Icon name={icon} size={20} /></div>
      <div className={s.title}>{title}</div>
      {description && <p className={s.desc}>{description}</p>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}
