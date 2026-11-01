import TheDeckTemplate from "@/components/deck-template/TheDeckTemplate";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `${brand.client} x ${brand.name}`,
  robots: { index: false, follow: false },
};

export default function DeckTemplatePage() {
  return <TheDeckTemplate />;
}
