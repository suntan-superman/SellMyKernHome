import SellerLandingPage from "@/components/SellerLandingPage";
import { getSellerPage } from "@/content/seller-pages";
import { buildPageMetadata } from "@/lib/site";

const page = getSellerPage("sell-house-oildale");

export const metadata = buildPageMetadata({ title: page.metaTitle, description: page.description, path: "/sell-house-oildale", indexable: page.approvedForIndexing });

export default function Page() { return <SellerLandingPage page={page} />; }
