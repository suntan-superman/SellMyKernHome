import Link from "next/link";
import PageHero from "@/components/PageHero";
import PhoneLink from "@/components/PhoneLink";
import { BUSINESS_PHONE_DISPLAY, OPERATOR_NAME, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "Privacy Policy", description: "How information submitted through Sell My Kern Home is collected, used, protected, and shared.", path: "/privacy-policy", indexable: false });

export default function PrivacyPage() {
  return <main id="main-content">
    <PageHero eyebrow="PRIVACY" title="Privacy Policy" intro="Last updated November 9, 2026. This policy describes the first-party information handled through the SellMyKernHome.com website inquiry experience." breadcrumbs={[{ label: "Privacy Policy" }]} />
    <section className="prose-section"><div className="prose-narrow">
      <h2>Operator and service role</h2>
      <p>{OPERATOR_NAME} owns and operates SellMyKernHome.com as a homeowner inquiry and lead-generation service. Workside Software and Sell My Kern Home are not a real estate brokerage or property buyer and do not represent buyers or sellers.</p>

      <h2>Information collected through the website</h2>
      <p>The inquiry form may collect your name, email address or telephone number, preferred contact method, property address, property type, approximate condition, occupancy, desired timing, comments, privacy acknowledgement, optional marketing choice, and submission metadata such as time, landing page, referrer, and campaign parameters.</p>
      <p>Technical safeguards may process a submission identifier, a one-way rate-limit value derived from network information, anti-spam tokens, and security logs. Do not submit Social Security numbers, banking or card details, credentials, access codes, government identification, mortgage documents, or other sensitive records.</p>

      <h2>How website inquiry information is used</h2>
      <p>Information is used to review and respond to your property inquiry, maintain an authorized internal follow-up and audit record, prevent abuse and duplicate submissions, protect the service, and understand aggregate site performance when analytics consent is granted.</p>
      <p>The current website workflow does not automatically share seller inquiries with independent real estate professionals or property buyers. It does not enable partner routing, referral compensation, SMS delivery, or automated, prerecorded, or artificial-voice marketing. A future sharing purpose would require a separately approved disclosure and consent process before activation.</p>

      <h2>Authorized access and service providers</h2>
      <p>Access to inquiry records is limited to authenticated, authorized Sell My Kern Home administrators. Workside uses providers for website hosting, database storage and authentication, abuse prevention, and, when enabled, administrative notification delivery. Current providers may include Netlify, Supabase, Cloudflare Turnstile, and Resend. Google Analytics is used only after analytics consent is granted.</p>
      <p>Service providers process information for their configured service functions. This policy does not authorize them to act as independent property buyers, brokers, or lead recipients.</p>

      <h2>Telephone inquiries</h2>
      <p>The public telephone number uses 24/7 AI-assisted answering. The assistant should identify itself as an AI assistant and is limited to collecting relevant contact and property information for authorized internal review. It should not provide real-estate, legal, tax, financial, lending, or valuation advice.</p>
      <p>Live recording and transcription settings have not been certified by this website release. This policy does not claim that those features are enabled. Rely on any disclosure provided at the beginning of a call, decline to continue if you are uncomfortable, or use the website inquiry form instead. Do not provide unnecessary sensitive information by telephone.</p>

      <h2>Analytics choices</h2>
      <p>Analytics remains disabled unless you choose to allow it. You can reject analytics or withdraw a previous choice from the site's privacy control. Names, email addresses, telephone numbers, property addresses, free-text comments, and Admin data are not intentionally included in analytics events.</p>

      <h2>Contact and marketing choices</h2>
      <p>Contact about a requested inquiry may use the method you select. Optional marketing consent is separate and is not required to submit an inquiry. The current checkbox does not authorize automated, prerecorded, or artificial-voice marketing or disclosure to outside parties.</p>
      <p>You may ask Workside to stop contacting you by stating “Do not contact” in a reply or at the beginning of a telephone conversation. The request should be recorded for operational follow-up.</p>

      <h2>Privacy requests</h2>
      <p>Workside has not represented that the California Consumer Privacy Act applies to this service. Where a right applies—or where Workside can reasonably honor a request—you may ask about access, correction, deletion, or contact preferences.</p>
      <p>Use the <Link href="/contact">existing contact route</Link> and begin the comments with “Privacy request,” or call <PhoneLink location="privacy_policy" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}>{BUSINESS_PHONE_DISPLAY}</PhoneLink> and state that you are making a privacy request. Provide only the minimum information needed to locate the relevant inquiry. Do not send identity documents through the seller form. Workside may need to verify that a requester is authorized before disclosing, correcting, or deleting information.</p>

      <h2>Retention and deletion criteria</h2>
      <p>Records are retained only while reasonably needed to respond to and document an inquiry, maintain security and audit integrity, prevent abuse or duplicate submissions, honor contact preferences, and meet applicable operational or legal obligations. When information is no longer needed under those criteria, it should be deleted or de-identified through an approved process. Specific retention periods remain pending owner and legal approval and are not promised by this policy.</p>

      <h2>Questions and policy changes</h2>
      <p>Use the privacy-request route above for questions about this policy. If collection, sharing, telephone processing, or legal requirements materially change, this policy and the notice presented at collection must be reviewed and versioned before the new use begins.</p>
    </div></section>
  </main>;
}
