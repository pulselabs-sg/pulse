import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | iPulse AI',
  description: 'Read the iPulse AI Privacy Policy. Learn how we collect, use, protect, and delete your personal, biometric, and voice data.',
  alternates: {
    canonical: 'https://ipulselabs.net/privacy-policy',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Privacy Policy</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 8, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">

          <section>
            <p>At iPulse Labs (&quot;iPulse&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), protecting your privacy and sensitive biometric data is our fundamental commitment. This Privacy Policy outlines our practices regarding the collection, use, disclosure, and safeguarding of your information when you use our website, APIs, and AI audio generation services (collectively, the &quot;Service&quot;). This Policy is incorporated by reference into our{' '}
              <Link href="/terms-of-use" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">Terms of Use</Link>.
            </p>
          </section>

          {/* ── SECTION 1 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Our Core Promise: AI Model Training Policy</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="m-0"><strong>We do not use your personal data or user-generated content to train our foundational AI models.</strong></p>
              <p className="mt-2 mb-0">We recognize the profound sensitivity of voice and audio data. Any text prompts you submit, audio files you upload, voice clones you create, and the resulting audio outputs are utilized <strong>strictly</strong> to provide the Service directly to you. Your data is isolated and never pooled into shared datasets to improve our base generative AI engines.</p>
            </div>
          </section>

          {/* ── SECTION 2 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Categories of Information We Collect</h2>
            <p>Depending on how you interact with our Service, we may collect the following categories of information:</p>
            <ul className="list-disc pl-6 mt-3 space-y-3">
              <li>
                <strong>Identifiers &amp; Account Data:</strong> Name, email address, username, account password (stored as a secure hash), and authentication tokens (e.g., Google OAuth tokens).
              </li>
              <li>
                <strong>Biometric Information (Voice Data):</strong> When you use our voice cloning features, you may upload audio recordings of a voice. We process these recordings to extract acoustic and vocal characteristics (a &quot;voiceprint&quot;) solely to map and synthesize the requested audio output. This category of data is treated with the highest level of protection under this Policy.
              </li>
              <li>
                <strong>User Content:</strong> Text prompts, generated audio files, project settings, voice model names, and any customer support communications.
              </li>
              <li>
                <strong>Commercial Information:</strong> Subscription tier, transaction history, and service usage metrics. (Note: Full payment card details are processed directly by Lemon Squeezy, our Merchant of Record; we only retain billing status and limited transaction identifiers.)
              </li>
              <li>
                <strong>Internet &amp; Network Activity:</strong> IP addresses, browser types, device identifiers, operating systems, log data, session duration, and interaction metrics with our platform.
              </li>
              <li>
                <strong>Inference and Usage Logs:</strong> API call timestamps, character counts, voice model IDs used, and generation parameters (e.g., language, speed, format). This data is used for billing accuracy, rate limit enforcement, and abuse detection.
              </li>
            </ul>
          </section>

          {/* ── SECTION 3 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Biometric Data Notice and Consent</h2>
            <p>Compliance with laws such as the Illinois Biometric Information Privacy Act (BIPA), the Texas Capture or Use of Biometric Identifier Act (CUBI), and equivalent regulations is a priority for iPulse.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Purpose:</strong> Voiceprints are created and used <em>exclusively</em> to provide the voice synthesis and cloning features you explicitly request. They are never sold, licensed, or used for any other purpose.</li>
              <li><strong>Consent:</strong> By uploading audio for cloning, you certify that: (a) if the voice is your own, you are the speaker; or (b) if the voice belongs to another person, you hold valid written authorization from that individual permitting the processing of their biometric data for this specific purpose.</li>
              <li><strong>Retention &amp; Destruction:</strong> We retain your custom voice models only for as long as your account is active and you choose to keep the model. If you delete a voice model or your account, the associated voiceprints and biometric identifiers are permanently destroyed from our systems within 30 days. In no event will biometric data be kept for more than 3 years after your last interaction with the Service.</li>
              <li><strong>No Disclosure:</strong> We do not sell, lease, trade, or otherwise profit from your biometric data. Biometric data is shared only with the subprocessors listed in §5, strictly as necessary to provide voice synthesis, and under equivalent data protection obligations.</li>
              <li><strong>Security Standards:</strong> Voiceprints and associated acoustic features are stored in encrypted, access-controlled environments isolated from general-purpose data stores. Access is restricted to authorized engineering personnel on a need-to-know basis.</li>
            </ul>
          </section>

          {/* ── SECTION 4 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
            <p>We process your information for the following legitimate business purposes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>To provide, operate, and maintain the Service, including processing TTS requests and managing voice clone models.</li>
              <li>To process payments and manage your subscription via Lemon Squeezy.</li>
              <li>To detect, investigate, and prevent fraud, abuse, policy violations, and unauthorized voice cloning activity (e.g., detecting deepfakes generated in violation of §2 of our Terms of Use).</li>
              <li>To enforce our Terms of Use, including investigating reports of unauthorized voice cloning or misuse of Generated Content.</li>
              <li>To communicate with you regarding service updates, security alerts, billing notices, and support.</li>
              <li>To generate anonymized, aggregated analytics about platform usage (e.g., average session length, popular language settings) that cannot be used to identify you.</li>
              <li>To comply with applicable legal obligations, court orders, and regulatory requirements.</li>
            </ul>
          </section>

          {/* ── SECTION 5 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Subprocessors and Data Sharing</h2>
            <p>We share information only with trusted third parties strictly necessary to operate iPulse. We do not sell your data. Our current subprocessors include:</p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 font-medium text-white">Subprocessor</th>
                    <th className="text-left py-2 pr-4 font-medium text-white">Category</th>
                    <th className="text-left py-2 font-medium text-white">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-2 pr-4">AWS / Google Cloud</td>
                    <td className="py-2 pr-4 text-zinc-400">Infrastructure</td>
                    <td className="py-2 text-zinc-400">Secure data hosting, GPU inference, storage</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Modal.com</td>
                    <td className="py-2 pr-4 text-zinc-400">AI Compute</td>
                    <td className="py-2 text-zinc-400">Serverless voice cloning inference backend</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">x.ai</td>
                    <td className="py-2 pr-4 text-zinc-400">AI API</td>
                    <td className="py-2 text-zinc-400">Text-to-speech synthesis engine</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">LemonSqueezy.com</td>
                    <td className="py-2 pr-4 text-zinc-400">Payments</td>
                    <td className="py-2 text-zinc-400">Merchant of Record; processes all transactions</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Supabase / PostgreSQL</td>
                    <td className="py-2 pr-4 text-zinc-400">Database</td>
                    <td className="py-2 text-zinc-400">User accounts, voice model metadata</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">We may disclose your data to law enforcement if legally required by a valid subpoena, court order, or to protect the safety and rights of iPulse, our users, or the public. We will, where legally permitted, notify you of such a request before complying.</p>
          </section>

          {/* ── SECTION 6 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies, Tracking, and Analytics</h2>
            <p>We use a minimal set of tracking technologies to operate and improve the Service. We do not use advertising cookies or sell browsing data to third parties.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">A. Types of Cookies We Use</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential / Functional Cookies:</strong> Required for the Service to operate. These include session authentication tokens (e.g., Supabase auth cookies) and CSRF protection tokens. These cannot be disabled without breaking core functionality.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Store your settings such as theme preference or last-used voice model. These are session-local and expire when you close your browser.
              </li>
              <li>
                <strong>Analytics Cookies (Optional):</strong> We may use privacy-respecting, cookie-free analytics tools (e.g., Plausible Analytics or equivalent) to understand aggregate usage patterns. These tools do not use persistent cross-site tracking cookies and do not collect personally identifiable information.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">B. Cookie Consent</h3>
            <p>Where required by law (e.g., under the EU ePrivacy Directive), we will present a cookie consent notice before setting non-essential cookies. You may update your cookie preferences at any time via your account settings.</p>

            <h3 className="text-lg font-medium text-white mt-4 mb-2">C. Do Not Track</h3>
            <p>We honor browser-level &quot;Do Not Track&quot; (DNT) signals for analytics purposes. When DNT is enabled, we do not load optional analytics scripts.</p>
          </section>

          {/* ── SECTION 7 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Regional Privacy Rights</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-2">A. European Economic Area (EEA) and UK (GDPR / UK GDPR)</h3>
            <p>If you are located in the EEA or UK, you have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Right to Access (Art. 15):</strong> Obtain a copy of your personal data we hold.</li>
              <li><strong>Right to Rectification (Art. 16):</strong> Correct inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure — &quot;Right to be Forgotten&quot; (Art. 17):</strong> Request deletion of your data where we no longer have a lawful basis to retain it.</li>
              <li><strong>Right to Restrict Processing (Art. 18):</strong> Temporarily limit how we use your data while a dispute is pending.</li>
              <li><strong>Right to Data Portability (Art. 20):</strong> Receive your account data in a structured, machine-readable format.</li>
              <li><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests.</li>
              <li><strong>Rights related to Automated Decision-Making (Art. 22):</strong> We do not make automated decisions with significant legal effect on individuals based solely on automated processing.</li>
            </ul>
            <p className="mt-3">Our legal bases for processing include: performance of a contract (delivering the Service), legitimate interests (security and fraud prevention), explicit consent (biometric data), and compliance with legal obligations. To exercise your GDPR rights, contact legal@ipulse.ai with the subject line &quot;GDPR Rights Request&quot;. We will respond within 30 days.</p>

            <h3 className="text-lg font-medium text-white mt-6 mb-2">B. United States — California (CCPA/CPRA), Virginia, Colorado, and Other State Laws</h3>
            <p>If you are a resident of certain US states, you may have the right to request:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Disclosure of the categories and specific pieces of personal information we have collected about you;</li>
              <li>Deletion of your personal information (subject to certain exceptions);</li>
              <li>Correction of inaccuracies in your personal information;</li>
              <li>The right to opt-out of the &quot;sale&quot; or &quot;sharing&quot; of personal data. <strong>iPulse does not sell or share your personal data for advertising purposes.</strong></li>
              <li>Non-discrimination: We will not discriminate against you for exercising your privacy rights.</li>
            </ul>
            <p className="mt-3">For biometric data specifically, we comply with BIPA (Illinois), CUBI (Texas), and equivalent state laws, including obtaining consent before collection and honoring deletion requests within the timeframes specified in §3 of this Policy. To submit a US state privacy request, contact legal@ipulse.ai with the subject line &quot;US Privacy Rights Request&quot; and specify your state of residence.</p>

            <h3 className="text-lg font-medium text-white mt-6 mb-2">C. Singapore and Southeast Asia (PDPA)</h3>
            <p>For users in Singapore, we comply with the Personal Data Protection Act 2012 (PDPA). You have the right to access and correct your personal data. To make a request, contact legal@ipulse.ai.</p>
          </section>

          {/* ── SECTION 8 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Data Security and International Transfers</h2>
            <p>We implement robust, industry-standard security measures including:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Encryption at Rest:</strong> AES-256 encryption for all stored user data and voice models.</li>
              <li><strong>Encryption in Transit:</strong> TLS 1.3 for all data transmitted between your browser, our servers, and our subprocessors.</li>
              <li><strong>Access Controls:</strong> Role-based access controls (RBAC) limit internal access to user data; biometric data is access-restricted to a minimal set of authorized engineers.</li>
              <li><strong>Incident Response:</strong> We maintain an incident response plan. In the event of a data breach affecting your personal data, we will notify you and relevant supervisory authorities as required by applicable law (e.g., within 72 hours under GDPR).</li>
            </ul>
            <p className="mt-4">By using the Service, you acknowledge that your data may be transferred to, stored, and processed in the United States or other countries where our subprocessors operate. For transfers of personal data from the EEA/UK, we utilize Standard Contractual Clauses (SCCs) approved by the European Commission to ensure an adequate level of protection.</p>
          </section>

          {/* ── SECTION 9 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Data Retention</h2>
            <p>We retain different categories of data for different periods, based on operational necessity and legal requirements:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Account Data:</strong> Retained for the life of your account, plus up to 90 days after account deletion to resolve disputes and comply with legal obligations.</li>
              <li><strong>Biometric Data (Voiceprints):</strong> Deleted within 30 days of your deletion request or account closure, or after 3 years of inactivity — whichever comes first.</li>
              <li><strong>Generated Audio Files:</strong> Stored per your dashboard settings. You can delete individual files at any time. Files are permanently removed within 30 days of deletion.</li>
              <li><strong>Billing and Transaction Records:</strong> Retained for 7 years as required by financial and tax regulations.</li>
              <li><strong>Security and Audit Logs:</strong> Retained for up to 12 months for fraud investigation and abuse prevention purposes.</li>
            </ul>
          </section>

          {/* ── SECTION 10 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Children&apos;s Privacy</h2>
            <p>iPulse is intended for users who are at least 18 years of age and is not directed at children. We do not knowingly collect personal information from minors under 18. If we become aware that a minor has provided us with personal data — including biometric data — we will take immediate steps to delete such information and terminate the account. If you believe a child has created an account, please notify us at legal@ipulse.ai.</p>
          </section>

          {/* ── SECTION 11 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, subprocessors, or legal requirements. We will notify you of any material changes by:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Posting the updated policy on this page and updating the &quot;Last Updated&quot; date at the top;</li>
              <li>Sending an email notification to your registered email address at least 14 days before material changes take effect (except where shorter notice is required by law).</li>
            </ul>
            <p className="mt-3">For material changes to how we handle biometric data, we will seek fresh explicit consent before applying those changes to your existing data. Continued use of the Service after the effective date of an updated Policy constitutes acceptance of the non-material portions of the changes.</p>
          </section>

          {/* ── SECTION 12 ── */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact Us — Data Protection Officer</h2>
            <p>
              To exercise your privacy rights, report a potential privacy violation, request data deletion, or ask questions about this Privacy Policy, please contact our Data Protection Officer at: <br />
              <br />
              <strong>Email:</strong> legal@ipulse.ai <br />
              <strong>Subject:</strong> Privacy / Data Rights Request <br />
              <br />
              We aim to respond to all privacy inquiries within <strong>5 business days</strong> and to complete substantive requests within <strong>30 calendar days</strong>. If you are in the EEA and are not satisfied with our response, you have the right to lodge a complaint with your local Data Protection Authority (DPA).
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}