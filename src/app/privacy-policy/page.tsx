'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-zinc-300">
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Back to iPulse</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="font-mono uppercase text-sm tracking-widest">Legal</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Privacy Policy</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: April 28, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">
          <section>
            <p>At iPulse Labs (&quot;iPulse&quot;), protecting your privacy and biometric data is our highest priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI audio generation platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. The Golden Rule: Model Training Policy</h2>
            <p><strong>We do not use your data to train our base AI models.</strong> We understand the sensitivity of voice data. Any text prompts you submit, audio files you upload, voice clones you create, and the outputs you generate are used <strong>strictly</strong> to provide the Service to you. They are never pooled into datasets to train or improve our foundational AI engines.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Information You Provide:</strong> 
                <ul className="list-circle pl-6 mt-2">
                  <li><strong>Account Data:</strong> Name, email address, profile picture (via OAuth like Google), and authentication credentials.</li>
                  <li><strong>Generative Data:</strong> Text prompts, uploaded audio samples for cloning, and specific generation settings.</li>
                  <li><strong>Support Data:</strong> Information you provide when contacting customer support.</li>
                </ul>
              </li>
              <li><strong>Information Collected Automatically:</strong>
                <ul className="list-circle pl-6 mt-2">
                  <li><strong>Usage Data:</strong> Interaction logs, generation history, credits consumed, and feature utilization.</li>
                  <li><strong>Device & Technical Data:</strong> IP addresses, browser types, operating systems, and session timestamps to ensure security and prevent abuse.</li>
                </ul>
              </li>
              <li><strong>Financial Data:</strong> We do not collect or store full credit card numbers. All payment processing is securely handled by Paddle.com. We only receive billing status and subscription tier information.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Data</h2>
            <p>We use your data exclusively to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Process your generative requests and deliver audio outputs.</li>
              <li>Manage your account, subscription, and billing cycle.</li>
              <li>Provide customer support and respond to technical issues.</li>
              <li>Enforce our Terms of Service and prevent fraud, abuse, or unauthorized voice cloning.</li>
              <li>Comply with legal obligations and respond to lawful requests from authorities.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Third-Party Subprocessors</h2>
            <p>We do not sell your personal data. We only share minimal data with strictly vetted third-party subprocessors necessary to run the Service:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Paddle.com:</strong> Acts as our Merchant of Record for billing, invoicing, and tax compliance.</li>
              <li><strong>Cloud Infrastructure (AWS / GCP):</strong> We host our application and process inferences on secure cloud environments. Data is encrypted in transit and at rest.</li>
              <li><strong>Legal & Compliance:</strong> We may disclose information if required by law or if we believe in good faith that such action is necessary to protect the safety of the public or prevent illegal activities (e.g., investigating malicious deepfakes).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Retention and Deletion</h2>
            <p>We retain your account data for as long as your account is active. You may delete your account at any time from your Dashboard. Upon deletion:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Your profile data, custom voice clones, and generation history will be permanently deleted from our active servers within 30 days.</li>
              <li>Transient audio uploads used for immediate processing are automatically purged shortly after generation.</li>
              <li>We may retain certain transactional records as required by law for accounting and tax purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Security Measures</h2>
            <p>We employ enterprise-grade security protocols, including AES-256 encryption at rest and TLS 1.3 in transit. Access to production environments is strictly limited to authorized personnel. Despite these measures, no system over the internet is completely immune to breaches. You are responsible for securing your account credentials.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Privacy Rights (GDPR, CCPA, etc.)</h2>
            <p>Depending on your location, you may have specific rights regarding your personal data:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>The right to <strong>Access</strong> the personal data we hold about you.</li>
              <li>The right to <strong>Rectification</strong> of inaccurate data.</li>
              <li>The right to <strong>Erasure</strong> (&quot;Right to be Forgotten&quot;).</li>
              <li>The right to <strong>Restrict or Object</strong> to processing.</li>
              <li>The right to <strong>Data Portability</strong>.</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, please contact our Data Protection Officer via the support portal in your dashboard. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Children&apos;s Privacy</h2>
            <p>iPulse is explicitly not intended for children under 18 years of age. We do not knowingly collect personal data from minors. If we discover a user is under 18, we will immediately terminate the account and delete all associated data.</p>
          </section>
        </div>
      </div>
    </div>
  );
}