import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import s from "./Alert.module.css";

type Tone = "info" | "success" | "warning" | "danger";
const icons: Record<Tone, IconName> = { info: "info", success: "success", warning: "alert", danger: "alert" };

export function Alert({ tone = "info", title, action, children, className }: {
  tone?: Tone; title?: React.ReactNode; action?: React.ReactNode; children?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cx(s.alert, s[tone], className)} role={tone === "danger" ? "alert" : "status"}>
      <Icon name={icons[tone]} size={18} />
      <div className={s.body}>
        {title && <div className={s.title}>{title}</div>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className={s.action}>{action}</div>}
    </div>
  );
}

/** Shows an error message when there is one. */
export function ErrorText({ error }: { error?: string }) {
  return error ? <Alert tone="danger">{error}</Alert> : null;
}
