import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | iPulse AI',
  description: 'Read the iPulse AI Refund Policy. Learn about our billing terms, subscription cancellations, plan changes, and refund eligibility.',
  alternates: {
    canonical: 'https://ipulselabs.net/refund-policy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-mono uppercase text-sm tracking-widest">Legal</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Refund Policy</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 8, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">

          {/* Intro box */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <p className="m-0 text-sm">
              This Refund Policy is part of our{' '}
              <Link href="/terms-of-use" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
                Terms of Use
              </Link>{' '}
              and applies to all purchases made through iPulse AI (ipulselabs.net), processed via Paddle.com as our Merchant of Record. By completing a purchase, you confirm that you have read and agree to this Policy.
            </p>
          </div>

          {/* ── SECTION 1 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Digital Goods and Compute Costs — General No-Refund Policy</h2>
            <p>iPulse provides state-of-the-art, resource-intensive neural audio generation services. Unlike traditional software, every time you generate an audio clip, clone a voice, or process audio, our servers incur immediate, non-recoverable computational costs (GPU hours). Because the digital product is instantly delivered and the compute cost is irreversible, <strong>all sales and subscriptions are generally final and non-refundable.</strong></p>
            <p className="mt-3">This policy is consistent with industry standards for AI compute services and SaaS platforms offering immediate digital delivery. It does not affect any statutory rights you may have under applicable consumer protection law.</p>
          </section>

          {/* ── SECTION 2 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Consumed Credits and Active Usage</h2>
            <p>We do not issue refunds for accounts that have utilized their allocated credits. If you have generated audio, trained a voice model, used the Voice Changer, or actively used any paid feature of the Service during your current billing cycle, you are not eligible for a refund, whether full or prorated.</p>
            <p className="mt-3">Usage is determined by our internal server logs, which record all generation requests, API calls, and voice model operations. These logs constitute the authoritative record for refund eligibility assessments.</p>
          </section>

          {/* ── SECTION 3 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Subscription Cancellations</h2>
            <p>You have full control over your subscription. You may cancel at any time through your account Dashboard. The following terms apply:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Cancellations take effect at the end of the current paid billing period. Your access and remaining credits remain active until then.</li>
              <li>We do not offer prorated refunds for partial months or unused credits if you cancel early.</li>
              <li>After cancellation, your account reverts to the Free tier at the end of the billing period. Voice models and generated audio created under paid tiers remain accessible but subject to Free tier limits.</li>
            </ul>
          </section>

          {/* ── SECTION 4 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Monthly vs. Annual Subscriptions</h2>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Monthly Plans</h3>
            <p>Monthly subscriptions are billed on a recurring monthly cycle. No prorated refund is available for early cancellation within a monthly cycle. The cancellation takes effect at the end of the month already paid for.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. Annual Plans</h3>
            <p>Annual subscriptions are billed as a single upfront payment covering 12 months of service at a discounted rate.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>No prorated mid-term refunds:</strong> Once an annual plan has been active and used, we do not offer prorated refunds for the unused portion of the year.</li>
              <li><strong>Early cancellation:</strong> You may cancel your annual plan at any time to prevent auto-renewal at the end of the 12-month term. Cancellation does not entitle you to a refund of the lump-sum payment already made.</li>
              <li><strong>Exception — Unused Annual Plan:</strong> If you purchased an annual plan and have made zero usage (no credits consumed, no audio generated, no voice models created) within the first 7 days of purchase, you may request a full refund. Requests must be submitted via email within those 7 days.</li>
            </ul>
          </section>

          {/* ── SECTION 5 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Plan Changes (Upgrades and Downgrades)</h2>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Upgrades</h3>
            <p>When you upgrade to a higher plan mid-cycle, the upgrade takes effect immediately. You will be charged a prorated amount for the remainder of the current billing period. The prorated charge is calculated based on the price difference between your current and new plan, multiplied by the number of remaining days in the cycle. Prorated charges for upgrades are non-refundable.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. Downgrades</h3>
            <p>Downgrades take effect at the start of the next billing cycle. No credit or refund is issued for the difference in price between your current higher plan and the lower plan you are switching to, for the remainder of the current period. You retain access to your current plan&apos;s features until the cycle ends.</p>
          </section>

          {/* ── SECTION 6 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cooling-Off Period (EU and UK Users)</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-5">
              <p className="m-0 font-medium text-white">Notice for EU / UK Consumers</p>
              <p className="mt-2 mb-0 text-sm">
                Under EU Consumer Rights Directive 2011/83/EU and UK Consumer Contracts Regulations 2013, consumers ordinarily have a 14-day right of withdrawal. However, this right is explicitly waived when a digital service has begun being performed with your express consent before the 14-day period expires.
              </p>
            </div>
            <p className="mt-4">By completing checkout and using any feature of the Service (generating audio, making an API call, creating a voice model), you:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Expressly request the immediate commencement of the Service;</li>
              <li>Acknowledge that you will lose your right of withdrawal once generation begins;</li>
              <li>Confirm you have been informed of this consequence at the point of purchase (as displayed in the checkout confirmation).</li>
            </ul>
            <p className="mt-3">This consent is recorded by Paddle at the time of purchase and constitutes the written confirmation required under applicable consumer law. If you purchased a subscription and have made <strong>zero usage within 14 days</strong>, contact us at <strong>support@ipulse.ai</strong> — your right of withdrawal may still apply and we will assess your request in good faith.</p>
          </section>

          {/* ── SECTION 7 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Free Trials and Trial Abuse</h2>
            <p>If iPulse offers a free trial period for any plan, the following terms apply:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Free trials are available to <strong>new users only</strong>, limited to one trial per person, email address, payment method, and device.</li>
              <li>Creating multiple accounts to obtain repeated free trials (&quot;trial abuse&quot;) constitutes a violation of our Terms of Use and will result in permanent account termination across all associated accounts.</li>
              <li>You will not be charged during the trial period. Charges begin automatically at the end of the trial unless you cancel before it expires. Cancellation instructions are available in your Dashboard under &quot;Billing&quot;.</li>
              <li>No refund is available for charges incurred after a free trial ends due to failure to cancel, as a reminder email is sent prior to the trial expiration.</li>
            </ul>
          </section>

          {/* ── SECTION 8 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Exceptions and Discretionary Refunds</h2>
            <p>We believe in fairness. While our policy is strict due to compute costs, we may grant refunds at our sole discretion in the following exceptional circumstances:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Documented System Outages (SLA Breach):</strong> Major, verified technical failures on our end that prevented access to the Service for more than 24 consecutive hours within a billing cycle, as confirmed by our status page (status.ipulselabs.net). We will proactively issue service credits for verified outages exceeding this threshold.
              </li>
              <li>
                <strong>Billing Errors:</strong> Double charges, duplicate transactions, or accidental renewals caused by a verified system glitch on our or Paddle&apos;s side, provided no credits from the erroneously charged cycle have been consumed.
              </li>
              <li>
                <strong>Unauthorized Transaction:</strong> If you can demonstrate that a purchase was made on your account without your authorization and you have promptly secured your account (e.g., changed your password), we will investigate and may issue a refund for the unauthorized charge.
              </li>
              <li>
                <strong>Unused Annual Plan (first 7 days):</strong> As described in §4B, a full refund may be issued for annual plans with zero usage within 7 days of purchase.
              </li>
            </ul>
            <p className="mt-4">All refund requests must be submitted within <strong>14 days of the transaction date</strong>. We will review internal server logs, Paddle transaction records, and usage data to verify the claim. Decisions on discretionary refunds are final.</p>
          </section>

          {/* ── SECTION 9 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Violation of Terms and Account Bans</h2>
            <p>If your account is suspended or terminated due to a violation of our{' '}
              <Link href="/terms-of-use" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
                Terms of Use
              </Link>{' '}
              or Acceptable Use Policy (including but not limited to: unauthorized voice cloning, generating abusive content, account sharing, or circumventing rate limits), <strong>you forfeit all rights to a refund</strong>. Any remaining credits or subscription time will be immediately voided without compensation.
            </p>
            <p className="mt-3">We reserve the right to retain transaction records and usage logs associated with terminated accounts for up to 7 years for legal compliance and fraud prevention purposes.</p>
          </section>

          {/* ── SECTION 10 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Chargebacks and Payment Disputes</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
              <p className="m-0 font-medium text-amber-300">Please contact us before initiating a bank dispute.</p>
              <p className="mt-2 mb-0 text-sm">Most billing issues can be resolved quickly by our support team. Contacting us first is always faster and preserves your account in good standing.</p>
            </div>
            <p className="mt-4">You have the right to dispute charges with your bank or payment provider. However, we ask that you first contact us at <strong>support@ipulse.ai</strong> and allow us 5 business days to investigate and resolve the issue before initiating a formal chargeback.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Fraudulent chargebacks:</strong> If you initiate a chargeback for a charge that our records confirm was authorized and consumed, we will contest the chargeback with Paddle using transaction logs, usage records, and this signed Policy. A successful fraudulent chargeback may result in account suspension pending resolution.</li>
              <li><strong>Legitimate disputes:</strong> If a chargeback results in a ruling in your favor by the payment provider, we will honor the outcome. Accounts suspended during an investigation will be reviewed for reinstatement following a resolved dispute in the customer&apos;s favor.</li>
              <li><strong>Chargeback fees:</strong> For chargebacks that we successfully contest (i.e., ruled in our favor), we reserve the right to recover Paddle&apos;s chargeback processing fee from future credits or to deduct it from any future refunds owed.</li>
            </ul>
          </section>

          {/* ── SECTION 11 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Paddle as Merchant of Record</h2>
            <p>Our payment infrastructure is managed by <strong>Paddle.com</strong>, which acts as our Merchant of Record. This means Paddle is the legal seller of record for all iPulse transactions and is responsible for collecting taxes and processing payments.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Refund processing:</strong> If a refund is approved by our team, the transaction will be processed exclusively through Paddle&apos;s system back to your original payment method. Depending on your bank, it may take 5–10 business days for funds to appear.</li>
              <li><strong>Paddle-initiated refunds:</strong> In some cases, Paddle may issue a refund on their own authority in accordance with their own Buyer Protection policies (e.g., if a charge is flagged as potentially fraudulent by their risk systems). iPulse does not control or initiate these refunds, and they do not constitute an admission of liability on our part. If you receive an unexpected Paddle-initiated refund, your account access may be adjusted to reflect the refunded period.</li>
              <li><strong>Tax handling:</strong> Paddle collects and remits applicable sales tax, VAT, and GST on your behalf. Refund amounts will reflect the original charged amount; tax implications of refunds are handled by Paddle in accordance with applicable tax law.</li>
            </ul>
          </section>

          {/* ── SECTION 12 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. How to Request a Refund</h2>
            <p>To submit a refund request under the permitted exceptions (§8), please email our billing team at <strong>support@ipulse.ai</strong> or open a support ticket in your Dashboard with the following information:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your account email address.</li>
              <li>Your Paddle order/receipt number (found in your Paddle confirmation email).</li>
              <li>The date of the transaction.</li>
              <li>A clear description of the issue and the exception category you believe applies (e.g., &quot;Billing Error — double charge&quot; or &quot;System Outage — unable to access service from [date] to [date]&quot;).</li>
              <li>Any supporting evidence (e.g., screenshots of error messages, your Paddle receipt).</li>
            </ul>
            <p className="mt-4">We aim to acknowledge all refund requests within <strong>2 business days</strong> and to provide a final decision within <strong>7 business days</strong>. If approved, processing time via Paddle is an additional 5–10 business days.</p>
          </section>

          {/* ── SECTION 13 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
            <p>This Refund Policy is governed by the laws of the State of Delaware, United States, consistent with our Terms of Use. For users in the European Union or United Kingdom, mandatory statutory consumer rights under your local law continue to apply and are not excluded by this Policy. Any disputes regarding this Policy that cannot be resolved informally shall be subject to the dispute resolution process outlined in our{' '}
              <Link href="/terms-of-use" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">
                Terms of Use §12
              </Link>.
            </p>
          </section>

          {/* ── SECTION 14 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact</h2>
            <p>
              For all billing and refund inquiries: <br />
              <strong>Email:</strong> support@ipulse.ai <br />
              <strong>Subject:</strong> Refund Request — [Your Order Number] <br />
              <br />
              For legal notices related to this Policy: <br />
              <strong>Email:</strong> legal@ipulse.ai
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}