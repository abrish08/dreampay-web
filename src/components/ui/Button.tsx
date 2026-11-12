import { cx } from "@/lib/cx";
import { Icon, type IconName } from "./Icon";
import s from "./Button.module.css";

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost";
type Common = { variant?: Variant; size?: "sm" | "md"; icon?: IconName; block?: boolean; iconOnly?: boolean };

const classes = ({ variant = "secondary", size = "md", block, iconOnly }: Common, extra?: string) =>
  cx(s.btn, variant !== "secondary" && s[variant], size === "sm" && s.sm, block && s.block, iconOnly && s.icon, extra);

type ButtonProps = React.ComponentPropsWithRef<"button"> & Common & { loading?: boolean };

/** Buttons default to type="button"; pass type="submit" for forms. */
export function Button({ variant, size, icon, block, iconOnly, loading, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, block, iconOnly }, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className={s.spinner} aria-hidden="true" /> : icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </button>
  );
}

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & Common;

/** A link that looks like a button (downloads, external pages). */
export function ButtonLink({ variant, size, icon, block, iconOnly, className, children, ...rest }: LinkProps) {
  return (
    <a className={classes({ variant, size, block, iconOnly }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
    </a>
  );
}
