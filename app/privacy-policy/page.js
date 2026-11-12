import Link from "next/link";
import PageHero from "@/components/PageHero";
import PhoneLink from "@/components/PhoneLink";
import { BUSINESS_PHONE_DISPLAY, OPERATOR_NAME, buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "Privacy Policy", description: "How information submitted through Sell My Kern Home is collected, used, protected, and shared.", path: "/privacy-policy", indexable: false });

export default function PrivacyPage() {
  return <main id="main-content">
    <PageHero eyebrow="PRIVACY" title="Privacy Policy" intro="Last updated November 10, 2026. This policy describes the information handled through the SellMyKernHome.com website and telephone inquiry experiences." breadcrumbs={[{ label: "Privacy Policy" }]} />
    <section className="prose-section"><div className="prose-narrow">
      <h2>Operator and service role</h2>
      <p>{OPERATOR_NAME} owns and operates SellMyKernHome.com as a technology and homeowner lead-generation service. Workside Software and Sell My Kern Home are not a real estate broker, agent, brokerage, property buyer, representative, negotiator, or professional adviser.</p>

      <h2>Information collected through the website</h2>
      <p>The inquiry form may collect identifiers and contact information such as your name, email address and telephone number; property information such as address, type, approximate condition and occupancy; your timing and comments; communication, sharing and marketing choices; and submission metadata such as time, landing page, referrer and campaign parameters.</p>
      <p>Technical safeguards may process a submission identifier, a one-way rate-limit value derived from network information, anti-spam tokens, and security logs. Do not submit Social Security numbers, banking or card details, credentials, access codes, government identification, mortgage documents, or other sensitive records.</p>

      <h2>How website inquiry information is used</h2>
      <p>Information is used to provide, review and respond to your property inquiry; maintain authorized follow-up, consent and audit records; honor privacy and contact preferences; prevent abuse and duplicate submissions; protect the service; and understand aggregate site performance when analytics consent is granted.</p>
      <p>Website inquiry details are stored for authorized administrators to review and follow up using the contact method you choose. Public testimonials, if any, are published only after an authorized administrator marks them as published.</p>
      <p>If you separately authorize sharing, an identified approved independent wholesaler or investor may receive the contact and property information needed to evaluate whether it wishes to contact you. Such a company may pay Workside Software a flat fee per contact regardless of whether you speak with it, sign a contract, sell, or close. Workside does not receive a portion of your sale proceeds, and its fee does not depend on the price you receive.</p>
      <p>External partner delivery is currently disabled. Submission alone does not authorize sharing. Delivery requires an affirmative sharing choice, an identified approved recipient, an active delivery workflow, and no active do-not-sell-or-share suppression.</p>

      <h2>Authorized access and service providers</h2>
      <p>Access to inquiry records is limited to authenticated, authorized Sell My Kern Home administrators. Workside uses providers for website hosting, database storage and authentication, abuse prevention, and, when enabled, administrative notification delivery. Current providers may include Netlify, Supabase, Cloudflare Turnstile, and Resend. Google Analytics is used only after analytics consent is granted.</p>
      <p>Service providers process information only for their configured service functions. Separately approved wholesalers or investors would be independent recipients acting for their own purposes, not employees or agents of Workside. Workside does not control or guarantee their conduct, offers, contracts or ability to close.</p>

      <h2>Telephone inquiries</h2>
      <p>The public telephone number uses 24/7 AI-assisted answering. The assistant should identify itself as an AI assistant and is limited to collecting relevant contact and property information for authorized internal review. It should not provide real-estate, legal, tax, financial, lending, or valuation advice.</p>
      <p>The AI service transcribes a call in real time so it can respond and prepare an internal inquiry summary. The opening greeting discloses that processing. Twilio audio recording is not enabled for this line, and raw caller and assistant transcripts are not retained under the current SMKH configuration. Structured inquiry details and an internal summary may be retained. If you do not want to use the transcribed AI service, end the call and use the website form.</p>
      <p>A telephone inquiry is not externally shared without an appropriate, separately recorded telephone consent path. A website checkbox choice is not assumed to apply to a caller.</p>

      <h2>Analytics choices</h2>
      <p>Analytics remains disabled unless you choose to allow it. You can reject analytics or withdraw a previous choice from the site's privacy control. Names, email addresses, telephone numbers, property addresses, free-text comments, and Admin data are not intentionally included in analytics events.</p>

      <h2>Contact and marketing choices</h2>
      <p>Contact about a requested inquiry may use the method you select. Optional external-sharing consent and optional automated-marketing consent are separate, unchecked choices. Neither is required to submit a first-party inquiry or a condition of any purchase. Marketing permission does not authorize external sharing, and sharing permission does not authorize automated marketing.</p>
      <p>You may ask Workside to stop contacting you by stating “Do not contact” in a reply or at the beginning of a telephone conversation. The request should be recorded for operational follow-up.</p>

      <h2>Privacy requests</h2>
      <p>Depending on applicable California law and verification requirements, California residents may have rights to know or access certain personal information, request correction or deletion, limit certain uses, opt out of sale or sharing, and receive non-discriminatory treatment for exercising a privacy right. Workside does not represent here that every statutory right applies in every circumstance, but it will evaluate and honor verified requests where required.</p>
      <p>Use <Link href="/privacy-choices">Do Not Sell or Share My Personal Information</Link> to record a future-transfer suppression. The request also updates matching first-party lead consent records when they can be located. It does not automatically retrieve information already disclosed to an independent party; if prior disclosure occurred, Workside must evaluate and handle any required recipient notice or follow-up.</p>
      <p>For access, correction or deletion questions, use the <Link href="/contact">contact route</Link> and begin the comments with “Privacy request,” or call <PhoneLink location="privacy_policy" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}>{BUSINESS_PHONE_DISPLAY}</PhoneLink>. Provide only the minimum information needed to locate the inquiry. Do not send identity documents through the seller form. Workside may need to verify that a requester is authorized.</p>

      <h2>Retention and deletion criteria</h2>
      <p>Records are retained only while reasonably needed to respond to and document an inquiry, maintain security and audit integrity, prevent abuse or duplicate submissions, honor contact preferences, and meet applicable operational or legal obligations. When information is no longer needed under those criteria, it should be deleted or de-identified through an approved process. Specific retention periods remain pending owner and legal approval and are not promised by this policy.</p>

      <h2>Questions and policy changes</h2>
      <p>Use the privacy-request routes above for questions about this policy or to withdraw a prior sharing or marketing choice. If collection, sharing, telephone processing, recipient identity, or legal requirements materially change, this policy and the notice presented at collection must be reviewed and versioned before the new use begins.</p>
    </div></section>
  </main>;
}
