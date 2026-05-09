import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Use | iPulse AI',
  description: 'Read the iPulse AI Terms of Use. Understand your rights, our acceptable use policies, voice cloning ethics, and billing terms.',
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
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-mono uppercase text-sm tracking-widest">Legal</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Terms of Use</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 8, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">

          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <p className="m-0 text-sm">
              <strong>IMPORTANT NOTICE:</strong> PLEASE READ THESE TERMS CAREFULLY. SECTION 12 CONTAINS A BINDING ARBITRATION CLAUSE AND CLASS ACTION WAIVER THAT AFFECTS YOUR LEGAL RIGHTS AND HOW DISPUTES ARE RESOLVED.
            </p>
          </div>

          <section>
            <p>
              Welcome to iPulse Labs (&quot;iPulse&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Use (the &quot;Terms&quot;) legally govern your access to and use of our AI-powered audio generation platform, website, APIs, and related software (collectively, the &quot;Service&quot;). By registering an account or otherwise accessing the Service, you signify your binding agreement to these Terms.
            </p>
          </section>

          {/* ── SECTION 1 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Eligibility and Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Age Requirement:</strong> You must be at least 18 years old, or the age of legal majority in your jurisdiction, to create an account.</li>
              <li><strong>Account Security:</strong> You are strictly responsible for maintaining the confidentiality of your login credentials. You agree to notify us immediately of any unauthorized account access. We are not liable for any losses caused by compromised accounts.</li>
              <li><strong>Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to keep your account information updated. Creating accounts with false identities or for the purpose of circumventing a prior suspension is prohibited.</li>
            </ul>
          </section>

          {/* ── SECTION 2 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Acceptable Use and Voice Cloning Ethics</h2>
            <p>iPulse is committed to the ethical advancement of AI. You agree to use the Service solely for lawful purposes. You expressly agree <strong>NOT</strong> to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Clone Voices Without Consent:</strong> Upload audio data or create synthetic voice models of any real person (living or deceased) without securing their explicit, legally binding written consent.</li>
              <li><strong>Create Malicious Deepfakes:</strong> Generate audio intended to deceive, impersonate government or public officials, commit financial fraud, manipulate elections, or spread disinformation.</li>
              <li><strong>Generate Abusive Content:</strong> Produce audio that promotes hate speech, violence, harassment, defamation, or constitutes strictly explicit (NSFW) material.</li>
              <li><strong>Interfere with the Platform:</strong> Reverse-engineer our AI models, attempt to bypass rate limits, scrape our web properties, or use automated bots to extract data.</li>
              <li>
                <strong>Use Cloned Voices in Prohibited Contexts:</strong> Regardless of consent, you may not use any voice cloned through the Service in the following high-risk contexts:
                <ul className="list-disc pl-6 mt-2 space-y-1 text-zinc-400">
                  <li>Political campaign advertisements or electoral influence operations;</li>
                  <li>Automated telephony, robocall systems, or unsolicited telemarketing;</li>
                  <li>Financial solicitations, investment advice, or impersonation of financial institutions;</li>
                  <li>Legal proceedings, sworn testimony, or court evidence without disclosure of synthetic origin;</li>
                  <li>Medical diagnosis, emergency services, or impersonation of licensed medical professionals;</li>
                  <li>Impersonation of law enforcement, government agencies, or emergency responders.</li>
                </ul>
              </li>
            </ul>

            <div className="bg-white/5 border border-white/10 rounded-lg p-5 mt-5">
              <p className="m-0 font-medium text-white">Voice Cloning Warranties</p>
              <p className="mt-2 mb-0 text-sm">By submitting any audio for voice cloning, you represent and warrant that:</p>
              <ul className="list-disc pl-6 mt-2 mb-0 space-y-1 text-sm">
                <li><strong>(a) Own Voice:</strong> If you are cloning your own voice, you are the original, sole speaker in all uploaded audio recordings;</li>
                <li><strong>(b) Third-Party Voice:</strong> If you are cloning another person&apos;s voice, you hold a valid, signed written authorization from that individual permitting the specific use you intend, and you will retain that authorization and provide it to iPulse upon request;</li>
                <li><strong>(c) No Deceptive Intent:</strong> You have no intention to use the resulting voice model to deceive, impersonate, defraud, or harm any party;</li>
                <li><strong>(d) Lawful Audio Source:</strong> All uploaded audio is lawfully obtained and does not infringe any copyright, performance right, or other intellectual property right of a third party.</li>
              </ul>
            </div>

            <p className="mt-4 text-red-400">We reserve the right to deploy automated and manual moderation tools to detect violations. Breach of this section will result in immediate, permanent account termination without refund, and may be reported to relevant law enforcement authorities.</p>
          </section>

          {/* ── SECTION 3 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Intellectual Property Rights</h2>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Your Content and Generated Output</h3>
            <p>You retain all ownership rights to the original text prompts and audio files you input into the Service (&quot;User Content&quot;). Subject to your compliance with these Terms, iPulse assigns to you all of its rights, title, and interest in and to the audio generated from your prompts (&quot;Generated Content&quot;).</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. License Granted to iPulse</h3>
            <p>By using the Service, you grant iPulse a limited, worldwide, non-exclusive, royalty-free license to host, reproduce, and process your User Content <strong>solely for the purpose of operating the Service and delivering the Generated Content to you.</strong> As stated in our Privacy Policy, we do not use your Content to train our base models.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">C. Voice Model Ownership</h3>
            <p>Custom voice models you create using the Voice Cloning feature are associated with your account. You own the right to use those models within the Service, but you acknowledge that the underlying model weights and acoustic representations are processed and stored by iPulse as part of operating the Service. You may request deletion of your voice models at any time via the dashboard or by contacting support. Upon account termination for any reason, your voice models will be destroyed in accordance with our Privacy Policy.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">D. Our Proprietary Technology</h3>
            <p>iPulse retains all rights, title, and interest in the Service, including the underlying AI models, algorithms, source code, UI/UX designs, and trademarks. You may not copy, modify, or distribute any part of our proprietary technology.</p>
          </section>

          {/* ── SECTION 4 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. DMCA and Copyright Infringement</h2>
            <p>We respect intellectual property rights. If you believe that your copyrighted work has been infringed by content residing on our Service, please submit a written notification to our Copyright Agent at <strong>legal@ipulse.ai</strong> including:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>A physical or electronic signature of the copyright owner or an authorized agent.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>A description of where the allegedly infringing material is located on our Service.</li>
              <li>Your contact information (email and phone number).</li>
              <li>A statement of good faith belief that the use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are the copyright owner or authorized to act on its behalf.</li>
            </ul>
            <p className="mt-3">For voice cloning specifically: if you believe a cloned voice model infringes a performance right or likeness right you hold, please include a description of the nature of the right and evidence of your identity as the rights holder.</p>
          </section>

          {/* ── SECTION 5 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Billing, Subscriptions, and API Usage</h2>
            <p>All payments, subscriptions, and billing cycles are processed securely via our Merchant of Record, LemonSqueezy.com. By upgrading to a paid tier, you agree to the pricing and limits specified at checkout.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Refunds:</strong> Due to the immediate and non-recoverable compute costs associated with AI generation, all purchases are generally final. Please review our{' '}
                <Link
                  href="/refund-policy"
                  target="_blank"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
                >
                  Refund Policy
                </Link>{' '}
                for specific terms.
              </li>
              <li>
                <strong>API Limits:</strong> If you utilize our API, you must adhere to the documented rate limits. We reserve the right to throttle or suspend API access if your usage degrades system performance for other users.
              </li>
              <li>
                <strong>Subscription Changes:</strong> Downgrades take effect at the end of the current billing period. Upgrades take effect immediately, with a prorated charge for the remaining billing period.
              </li>
              <li>
                <strong>Account Suspension and Billing:</strong> If your account is suspended for a violation of these Terms, you forfeit all remaining credits, generation quota, and subscription benefits for the active billing period. No refund will be issued.
              </li>
            </ul>
          </section>

          {/* ── SECTION 6 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. AI-Generated Content — Disclosure Obligations</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5">
              <p className="m-0 font-medium text-amber-300">Your Responsibility to Disclose</p>
              <p className="mt-2 mb-0 text-sm">
                You acknowledge that all audio produced by the Service is AI-synthesized. Depending on your jurisdiction and the platform or context in which you publish, distribute, or broadcast Generated Content, applicable law or platform policies may require you to disclose that the content is artificially generated. <strong>You are solely responsible for making such disclosures to your end audiences, platforms, and any applicable regulatory bodies.</strong> iPulse is not liable for your failure to comply with AI disclosure obligations, including but not limited to those arising under the EU AI Act, the US No AI FRAUD Act, or equivalent regulations.
              </p>
            </div>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li><strong>Watermarking:</strong> iPulse may, at its discretion, apply provenance watermarks or metadata to Generated Content to indicate its AI origin. You agree not to remove, alter, or obscure any such watermarks.</li>
              <li><strong>Commercial Use:</strong> You are permitted to use Generated Content for commercial purposes, subject to these Terms and applicable laws regarding AI-generated content in your jurisdiction.</li>
              <li><strong>No Misrepresentation:</strong> You may not represent Generated Content as having been created by a human performer, licensed recording artist, or other real person without appropriate disclosure.</li>
            </ul>
          </section>

          {/* ── SECTION 7 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Disclaimer of Warranties</h2>
            <p>THE SERVICE AND GENERATED CONTENT ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. IPULSE MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, BUG-FREE, OR PERFECTLY ACCURATE. WE MAKE NO WARRANTY REGARDING THE LEGAL COMPLIANCE OF ANY VOICE CLONING OPERATION YOU UNDERTAKE — THAT DETERMINATION IS SOLELY YOURS. YOU USE THE SYNTHETIC AUDIO AT YOUR OWN RISK.</p>
          </section>

          {/* ── SECTION 8 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL IPULSE LABS, ITS FOUNDERS, OR DIRECTORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN ANY WAY CONNECTED WITH YOUR USE OF THE SERVICE, INCLUDING ANY DAMAGES ARISING FROM UNAUTHORIZED USE OF A CLONED VOICE BY A THIRD PARTY. OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE GREATER OF $100 USD OR THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS.</p>
          </section>

          {/* ── SECTION 9 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Indemnification</h2>
            <p>You agree to defend, indemnify, and hold harmless iPulse Labs and its officers, directors, employees, and agents from any claims, damages, obligations, losses, liabilities, costs, or debts (including attorney&apos;s fees) arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms (specifically including unauthorized voice cloning, breach of the Voice Cloning Warranties in §2, and failure to make required AI disclosure); (c) your violation of any third-party right, including copyright, performance right, or privacy rights; or (d) any claim by a third party that a voice model you created infringes their likeness, personality right, or right of publicity.</p>
          </section>

          {/* ── SECTION 10 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications and Termination</h2>
            <p>We may modify these Terms at any time. Material changes will be communicated via email or an in-app notification at least 14 days prior to taking effect (or immediately where required for legal compliance or safety reasons). Continued use of the Service after the effective date of modified Terms constitutes your acceptance.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Termination by You:</strong> You may close your account at any time via the dashboard settings or by contacting support at legal@ipulse.ai.</li>
              <li><strong>Termination by iPulse:</strong> We reserve the right to suspend or terminate your account at any time, without notice or liability, for conduct that we determine, in our sole discretion, violates these Terms or is harmful to other users, third parties, or our business interests.</li>
              <li><strong>Effect of Termination on Voice Models:</strong> Upon termination of your account for any reason, your access to all custom voice models is immediately revoked. If the termination is initiated by you (voluntary deletion), voice model data will be permanently destroyed within 30 days. If the termination is for a violation of §2 (Acceptable Use), we may retain a minimal fingerprint of the prohibited voice model for a period not exceeding 90 days solely for the purpose of abuse prevention and legal compliance, after which it will be permanently destroyed.</li>
              <li><strong>Survival:</strong> Sections 3 (Intellectual Property), 6 (AI Disclosure), 7 (Disclaimer), 8 (Limitation of Liability), 9 (Indemnification), and 12 (Dispute Resolution) survive any termination of these Terms.</li>
            </ul>
          </section>

          {/* ── SECTION 11 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Voice Model Data Portability and Deletion</h2>
            <p>We respect your right to control your voice data. The following rights apply to custom voice models you have created within the Service:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Right to Delete:</strong> You may delete any voice model at any time from the Voice Cloning dashboard. Deletion removes the model from active use immediately; associated biometric data is permanently destroyed from all systems within 30 days.</li>
              <li><strong>Right to Access:</strong> You may request a record of all voice models associated with your account (name, creation date, status) by contacting legal@ipulse.ai.</li>
              <li>
                <strong>Export Limitations:</strong> iPulse does not currently support the export of raw voice model weights or voiceprint embeddings. This limitation exists for security reasons — raw model files could be misused to clone voices outside of our controlled, policy-enforced environment. We will re-evaluate this policy as the regulatory and technical landscape evolves.
              </li>
              <li><strong>GDPR Data Portability:</strong> If you are in the EEA or UK and require data portability of your biometric data under GDPR Article 20, please contact legal@ipulse.ai with the subject &quot;GDPR Portability Request&quot;. We will assess your request on a case-by-case basis and respond within 30 days.</li>
            </ul>
          </section>

          {/* ── SECTION 12 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Dispute Resolution, Arbitration, and Governing Law</h2>
            <p><strong>Please read this section carefully. It affects your legal rights.</strong></p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Governing Law</h3>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. For users in the European Union, mandatory consumer protection provisions of your country of residence shall also apply.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. Informal Resolution</h3>
            <p>Before initiating any formal dispute, you agree to first contact us at legal@ipulse.ai and attempt in good faith to resolve the issue informally. We will attempt to respond within 14 business days.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">C. Binding Arbitration</h3>
            <p>If informal resolution fails, any dispute, claim, or controversy arising out of or relating to these Terms shall be settled by binding arbitration administered by the <strong>American Arbitration Association (AAA)</strong> under its Consumer Arbitration Rules, rather than in court. The arbitration shall be conducted in English. The arbitrator shall have authority to award the same damages as a court of competent jurisdiction. The AAA&apos;s filing fees shall be allocated in accordance with its Consumer Arbitration Rules. Judgment on the arbitral award may be entered in any court having jurisdiction.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">D. Class Action Waiver</h3>
            <p>You and iPulse agree that any dispute resolution proceedings will be conducted only on an individual basis and NOT in a class, consolidated, or representative action. If for any reason a claim proceeds in court rather than in arbitration, you waive any right to a jury trial.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">E. Exceptions</h3>
            <p>Notwithstanding the above, either party may seek emergency injunctive or other equitable relief in a court of competent jurisdiction to prevent actual or threatened infringement of intellectual property rights, unauthorized voice cloning, or other irreparable harm.</p>
          </section>

          {/* ── SECTION 13 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between you and iPulse regarding the Service.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</li>
              <li><strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign or transfer your rights under these Terms without our prior written consent. iPulse may assign its rights to a successor in connection with a merger, acquisition, or sale of assets.</li>
              <li><strong>Force Majeure:</strong> iPulse shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including natural disasters, internet outages, or acts of government.</li>
            </ul>
          </section>

          {/* ── SECTION 14 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
            <p>
              For legal notices, DMCA takedown requests, voice cloning consent disputes, or questions regarding these Terms, please contact us at: <br />
              <strong>Email:</strong> legal@ipulse.ai <br />
              <strong>Subject Line Examples:</strong> &quot;DMCA Notice&quot;, &quot;Voice Consent Dispute&quot;, &quot;Terms Question&quot;
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}