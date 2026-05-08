import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | iPulse AI',
  description: 'Read the iPulse AI Refund Policy. Learn about our billing terms, subscription cancellations, and refund eligibility.',
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
          {/* <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to iPulse</span>
          </Link> */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-mono uppercase text-sm tracking-widest">Legal</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Refund Policy</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 5, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Digital Goods and Compute Costs</h2>
            <p>iPulse provides state-of-the-art, highly resource-intensive neural audio generation services. Unlike traditional software, every time you generate an audio clip, clone a voice, or process audio, our servers incur immediate, non-recoverable computational costs (GPU hours). Because the digital product is instantly delivered and the compute cost is irreversible, <strong>all sales and subscriptions are generally final and non-refundable.</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Consumed Credits and Active Usage</h2>
            <p>We do not issue refunds for accounts that have utilized their allocated credits. If you have generated audio, trained a voice model, or actively used the Service during your current billing cycle, you are not eligible for a refund, whether full or prorated.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Subscription Cancellations</h2>
            <p>You have full control over your subscription. You may cancel your subscription at any time through your account Dashboard. Cancellation provisions include:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Cancellations take effect at the end of the current paid billing period.</li>
              <li>You will retain full access to your plan's features and remaining credit quota until the cycle concludes.</li>
              <li>We do not offer prorated refunds for partial months or unused credits if you decide to cancel early.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Cooling-Off Period (EU/UK Users)</h2>
            <p>Under EU and UK consumer law, users typically have a 14-day "cooling-off" period. However, by purchasing a subscription and utilizing the generative tools (consuming credits), you expressly consent to the immediate start of the performance of the Service and acknowledge that you lose your right of withdrawal once generation begins. Unused subscriptions within 14 days of initial purchase may be eligible for a refund upon review.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Exceptions and Discretionary Refunds</h2>
            <p>We believe in fairness. While our policy is strict due to compute costs, we may grant refunds at our sole discretion in the following exceptional circumstances:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>System Outages:</strong> Major, documented technical failures on our end that entirely prevented you from using the service for a significant portion of your billing cycle.</li>
              <li><strong>Billing Errors:</strong> Double charges or accidental renewals caused by a system glitch (provided no credits from the new cycle have been used).</li>
            </ul>
            <p className="mt-4">All refund requests must be submitted within 14 days of the transaction date. We will review internal server and usage logs to verify the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Violation of Terms and Account Bans</h2>
            <p>If your account is suspended or terminated due to a violation of our Terms of Service or Acceptable Use Policy (e.g., unauthorized voice cloning, generating abusive content, sharing accounts), <strong>you forfeit all rights to a refund</strong>. Any remaining credits will be voided.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Chargebacks and Disputes</h2>
            <p>We take fraudulent chargebacks seriously. Initiating a chargeback or payment dispute with your bank or credit card provider will result in an immediate and permanent ban of your account and blacklisting of your IP/email from our platform. If you believe there is a billing issue, please contact our support team first.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Paddle as Merchant of Record</h2>
            <p>Our payment infrastructure is managed by Paddle.com, which acts as our Merchant of Record. If a refund is approved by our team, the transaction will be processed exclusively through Paddle's system back to your original payment method. Depending on your bank, it may take 5-10 business days for funds to appear.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. How to Request a Refund</h2>
            <p>To submit a refund request under the permitted exceptions, please open a support ticket in your Dashboard or email our billing team at <strong>support@ipulse.ai</strong> with:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your account email address.</li>
              <li>Your Paddle order/receipt number.</li>
              <li>A detailed explanation of the issue.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}