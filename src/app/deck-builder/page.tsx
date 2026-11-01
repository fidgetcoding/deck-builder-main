import DualTemplate from "@/components/deck-builder/DualTemplate";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `${brand.client} x ${brand.name}`,
  robots: { index: false, follow: false },
};

export default function DeckBuilderPage() {
  return <DualTemplate />;
}
