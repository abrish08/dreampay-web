import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "./ThemeToggle";
import s from "./AuthLayout.module.css";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.page}>
      <aside className={s.aside}>
        <div className={s.brand}><span className={s.logo}>P</span>Paygate</div>
        <div className={s.pitch}>
          <h2>Accept payments across Ethiopia.</h2>
          <ul>
            <li><Icon name="check" size={18} />telebirr, CBE Birr, M-Pesa, cards and bank transfer</li>
            <li><Icon name="check" size={18} />ETB and USD, one API</li>
            <li><Icon name="check" size={18} />Payouts to your bank account</li>
          </ul>
        </div>
        <div className={s.small}>Protected by two-factor authentication.</div>
      </aside>
      <main className={s.main}>
        <div className={s.theme}><ThemeToggle /></div>
        <div className={s.card}>{children}</div>
      </main>
    </div>
  );
}
