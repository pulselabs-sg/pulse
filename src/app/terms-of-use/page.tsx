import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Use | iPulse AI',
  description: 'Read the iPulse AI Terms of Use. Understand your rights, our acceptable use policies, and billing terms.',
  alternates: {
    canonical: 'https://ipulselabs.net/terms-of-use',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfUse() {
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
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Terms of Use</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 5, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <p className="m-0 text-sm">
              <strong>IMPORTANT NOTICE:</strong> PLEASE READ THESE TERMS CAREFULLY. SECTION 11 CONTAINS A BINDING ARBITRATION CLAUSE AND CLASS ACTION WAIVER THAT AFFECTS YOUR LEGAL RIGHTS AND HOW DISPUTES ARE RESOLVED.
            </p>
          </div>

          <section>
            <p>
              Welcome to iPulse Labs ("iPulse", "we", "our", or "us"). These Terms of Use (the "Terms") legally govern your access to and use of our AI-powered audio generation platform, website, APIs, and related software (collectively, the "Service"). By registering an account or otherwise accessing the Service, you signify your binding agreement to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Eligibility and Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Age Requirement:</strong> You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account.</li>
              <li><strong>Account Security:</strong> You are strictly responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized account access. We are not liable for any losses caused by compromised accounts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Acceptable Use and Voice Cloning Ethics</h2>
            <p>iPulse is committed to the ethical advancement of AI. You agree to use the Service solely for lawful purposes. You expressly agree <strong>NOT</strong> to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Clone Voices Without Consent:</strong> Upload audio data or create synthetic voice models of any real person (living or deceased) without securing their explicit, legally binding consent.</li>
              <li><strong>Create Malicious Deepfakes:</strong> Generate audio intended to deceive, impersonate government officials, commit financial fraud, or spread disinformation.</li>
              <li><strong>Generate Abusive Content:</strong> Produce audio that promotes hate speech, violence, harassment, defamation, or constitutes strictly explicit (NSFW) material.</li>
              <li><strong>Interfere with the Platform:</strong> Reverse-engineer our AI models, attempt to bypass rate limits, scrape our web properties, or use automated bots to extract data.</li>
            </ul>
            <p className="mt-3 text-red-400">We reserve the right to deploy automated and manual moderation tools to detect violations. Breach of this section will result in immediate, permanent account termination without refund.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Intellectual Property Rights</h2>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Your Content and Generated Output</h3>
            <p>You retain all ownership rights to the original text prompts and audio files you input into the Service ("User Content"). Subject to your compliance with these Terms, iPulse assigns to you all of its rights, title, and interest in and to the audio generated from your prompts ("Generated Content").</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. License Granted to iPulse</h3>
            <p>By using the Service, you grant iPulse a limited, worldwide, non-exclusive, royalty-free license to host, reproduce, and process your User Content <strong>solely for the purpose of operating the Service and delivering the Generated Content to you.</strong> As stated in our Privacy Policy, we do not use your Content to train our base models.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">C. Our Proprietary Technology</h3>
            <p>iPulse retains all rights, title, and interest in the Service, including the underlying AI models, algorithms, source code, UI/UX designs, and trademarks. You may not copy, modify, or distribute any part of our proprietary technology.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. DMCA and Copyright Infringement</h2>
            <p>We respect intellectual property rights. If you believe that your copyrighted work has been infringed by content residing on our Service, please submit a written notification to our Copyright Agent at <strong>legal@ipulse.ai</strong> including:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>A physical or electronic signature of the copyright owner.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>A description of where the allegedly infringing material is located on our Service.</li>
              <li>Your contact information (email and phone number).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Billing, Subscriptions, and API Usage</h2>
            <p>All payments, subscriptions, and billing cycles are processed securely via our Merchant of Record, Paddle.com. By upgrading to a paid tier, you agree to the pricing and limits specified at checkout.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Refunds:</strong> Due to the immediate and non-recoverable compute costs associated with AI generation, all purchases are generally final. Please review our{' '}
                <Link
                  href="/refund-policy"
                  target='_blank'
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                >
                  Refund Policy
                </Link>{' '}
                for specific terms.
              </li>
              <li>
                <strong>API Limits:</strong> If you utilize our API, you must adhere to the documented rate limits. We reserve the right to throttle or suspend API access if your usage degrades system performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Disclaimer of Warranties</h2>
            <p>THE SERVICE AND GENERATED CONTENT ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. IPULSE MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, OR PERFECTLY ACCURATE. YOU USE THE SYNTHETIC AUDIO AT YOUR OWN RISK.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL IPULSE LABS, ITS FOUNDERS, OR DIRECTORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN ANY WAY CONNECTED WITH YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE GREATER OF $100 USD OR THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless iPulse Labs from any claims, damages, obligations, losses, liabilities, costs, or debts (including attorney's fees) arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms (specifically including unauthorized voice cloning); or (c) your violation of any third-party right, including copyright or privacy rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Dispute Resolution and Arbitration</h2>
            <p><strong>Please read this section carefully. It affects your legal rights.</strong></p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Binding Arbitration:</strong> Any dispute, claim, or controversy arising out of or relating to these Terms or the breach thereof shall be settled by binding arbitration, rather than in court.</li>
              <li><strong>Class Action Waiver:</strong> You and iPulse agree that any dispute resolution proceedings will be conducted only on an individual basis and NOT in a class, consolidated, or representative action.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications and Termination</h2>
            <p>We may modify these Terms at any time. Material changes will be communicated via email or an in-app notification. We reserve the right to suspend or terminate your account at any time, without notice or liability, for conduct that we determine, in our sole discretion, violates these Terms or is harmful to other users or our business interests.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Contact Information</h2>
            <p>
              For legal notices, DMCA takedown requests, or questions regarding these Terms, please contact us at: <br />
              <strong>Email:</strong> legal@ipulse.ai
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}