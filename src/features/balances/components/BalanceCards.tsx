import { Stat, StatGrid } from "@/components/ui";
import { money } from "@/lib/format";
import type { Balance } from "../api";

export function BalanceCards({ balance, currency, loading }: { balance?: Balance; currency: string; loading?: boolean }) {
  return (
    <StatGrid>
      <Stat label={`Available (${currency})`} value={money(balance?.available, currency)} hint="Can be paid out now" loading={loading} />
      <Stat label="Rolling reserve" value={money(balance?.reserved, currency)} hint="Released on schedule" loading={loading} />
      <Stat label="Held for disputes" value={money(balance?.dispute_hold, currency)} loading={loading} />
      <Stat label="Payouts on the way" value={money(balance?.pending_payouts, currency)} loading={loading} />
    </StatGrid>
  );
}
