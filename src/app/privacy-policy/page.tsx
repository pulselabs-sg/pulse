import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | iPulse AI',
  description: 'Read the iPulse AI Privacy Policy. Learn how we collect, use, and protect your personal and biometric data.',
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
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Privacy Policy</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: May 5, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">
          <section>
            <p>At iPulse Labs ("iPulse", "we", "us", or "our"), protecting your privacy and sensitive biometric data is our fundamental commitment. This Privacy Policy outlines our practices regarding the collection, use, disclosure, and safeguarding of your information when you use our website, APIs, and AI audio generation services (collectively, the "Service").</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Our Core Promise: AI Model Training Policy</h2>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <p className="m-0"><strong>We do not use your personal data or user-generated content to train our foundational AI models.</strong></p>
              <p className="mt-2 mb-0">We recognize the profound sensitivity of voice and audio data. Any text prompts you submit, audio files you upload, voice clones you create, and the resulting audio outputs are utilized <strong>strictly</strong> to provide the Service directly to you. Your data is isolated and never pooled into shared datasets to improve our base generative AI engines.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Categories of Information We Collect</h2>
            <p>Depending on how you interact with our Service, we may collect the following categories of information:</p>
            <ul className="list-disc pl-6 mt-3 space-y-3">
              <li>
                <strong>Identifiers & Account Data:</strong> Name, email address, username, account password, and authentication tokens (e.g., Google OAuth data).
              </li>
              <li>
                <strong>Biometric Information (Voice Data):</strong> When you use our voice cloning features, you may upload audio recordings of a voice. We process these recordings to extract acoustic and vocal characteristics (a "voiceprint") solely to map and synthesize the requested audio output.
              </li>
              <li>
                <strong>User Content:</strong> Text prompts, generated audio files, project settings, and any customer support communications.
              </li>
              <li>
                <strong>Commercial Information:</strong> Subscription tier, transaction history, and service usage. (Note: Full payment details are processed directly by Paddle, our Merchant of Record; we only retain billing status and limited identifiers).
              </li>
              <li>
                <strong>Internet & Network Activity:</strong> IP addresses, browser types, device identifiers, operating systems, log data, and interaction metrics with our platform.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Biometric Data Notice and Consent</h2>
            <p>Compliance with laws such as the Illinois Biometric Information Privacy Act (BIPA) and similar regulations is a priority.</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Purpose:</strong> Voiceprints are created and used <em>exclusively</em> to provide the voice synthesis and cloning features you explicitly request.</li>
              <li><strong>Consent:</strong> By uploading audio for cloning, you certify that you have the explicit legal right and consent from the speaker to process their biometric data.</li>
              <li><strong>Retention & Destruction:</strong> We retain your custom voice models only for as long as your account is active and you choose to keep the model. If you delete a voice model or your account, the associated voiceprints and biometric identifiers are permanently destroyed from our systems within 30 days. In no event will biometric data be kept for more than 3 years after your last interaction with the Service.</li>
              <li><strong>No Disclosure:</strong> We do not sell, lease, trade, or otherwise profit from your biometric data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. How We Use Your Information</h2>
            <p>We process your information for the following legitimate business purposes:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>To provide, operate, and maintain the Service.</li>
              <li>To process payments and manage your subscription via Paddle.</li>
              <li>To detect, prevent, and address technical issues, fraud, or violations of our Terms of Service (e.g., detecting unauthorized deepfakes).</li>
              <li>To communicate with you regarding updates, security alerts, and support.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Subprocessors and Data Sharing</h2>
            <p>We share information only with trusted third parties necessary to operate iPulse:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Cloud Infrastructure Providers:</strong> (e.g., AWS, Google Cloud) for secure data hosting and GPU processing.</li>
              <li><strong>Payment Processors:</strong> Paddle.com acts as our Merchant of Record and processes all transactions safely.</li>
              <li><strong>Law Enforcement:</strong> We may disclose data if legally required by a valid subpoena, court order, or to protect the safety and rights of iPulse, our users, or the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Regional Privacy Rights</h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-2">A. European Economic Area (EEA) and UK (GDPR)</h3>
            <p>If you are located in the EEA or UK, you have the following rights regarding your personal data: Right to Access, Right to Rectification, Right to Erasure ("Right to be Forgotten"), Right to Restrict Processing, Right to Data Portability, and Right to Object.</p>
            <p className="mt-2">Our legal bases for processing include: performance of a contract (delivering the Service), legitimate interests (security and fraud prevention), and compliance with legal obligations.</p>

            <h3 className="text-lg font-medium text-white mt-6 mb-2">B. United States Privacy Laws (California CCPA/CPRA, Virginia, Colorado, etc.)</h3>
            <p>If you are a resident of certain US states, you may have the right to request: disclosure of the categories and specific pieces of personal information we have collected; deletion of your personal information; correction of inaccuracies; and the right to opt-out of the "sale" or "sharing" of personal data. <strong>iPulse does not sell your personal data.</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Security and International Transfers</h2>
            <p>We implement robust, industry-standard security measures, including AES-256 encryption at rest and TLS 1.3 in transit. However, no internet transmission is 100% secure. By using the Service, you acknowledge that your data may be transferred to, stored, and processed in the United States or other countries where our subprocessors operate, utilizing Standard Contractual Clauses (SCCs) where applicable.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
            <p>iPulse is intended for a general audience and is not directed at children under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal data, we will take immediate steps to delete such information and terminate the account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the updated policy on this page and updating the "Last Updated" date. Continued use of the Service constitutes your acceptance of the changes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p>
              To exercise your privacy rights, request data deletion, or ask questions about this Privacy Policy, please contact our Data Protection Officer at: <br />
              <br />
              <strong>Email:</strong> legal@ipulse.ai <br />
              <strong>Subject:</strong> Privacy / Data Rights Request
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}