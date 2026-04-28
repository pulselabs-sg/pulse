'use client';

import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function TermsOfUse() {
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
        <h1 className="text-4xl font-mono font-bold text-white tracking-tighter">Terms of Service</h1>
        <p className="text-zinc-500 mt-2 mb-12">Last Updated: April 28, 2026</p>

        <div className="prose prose-invert max-w-none font-light text-[15.2px] leading-relaxed space-y-10 text-zinc-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing, registering for, or using the services provided by iPulse Labs (&quot;iPulse&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), including our website, APIs, and AI audio generation tools (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service. We reserve the right to modify these terms at any time, and continued use constitutes acceptance of those changes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility and Account Registration</h2>
            <p>You must be at least 18 years of age or the legal age of majority in your jurisdiction to use the Service. By creating an account, you warrant that the information you provide is accurate and complete. You are strictly responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Merchant of Record and Payments</h2>
            <p>Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle handles all billing, tax collection, payment processing, refunds, and customer service inquiries related to transactions. By making a purchase, you agree to Paddle&apos;s Checkout Buyer Terms. Subscriptions are billed in advance on a recurring basis. You may cancel your subscription at any time, but you will remain responsible for all charges incurred prior to cancellation.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use Policy (AUP)</h2>
            <p>You agree to use the Service only for lawful purposes. You are strictly prohibited from using iPulse to generate, upload, or distribute content that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Is illegal, defamatory, harassing, abusive, fraudulent, or obscene.</li>
              <li>Promotes discrimination, violence, self-harm, or hate speech against any individual or group.</li>
              <li>Involves Child Sexual Abuse Material (CSAM) or exploits minors in any way.</li>
              <li>Impersonates any person or entity without their explicit, documented consent (see Section 5).</li>
              <li>Infringes on any third-party intellectual property rights, including copyrights, trademarks, or rights of publicity.</li>
              <li>Attempts to bypass or manipulate our API limits, reverse-engineer our models, or distribute malware.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Voice Cloning, Deepfakes, and AI Ethics</h2>
            <p>Our voice cloning technology is powerful and carries significant ethical responsibilities. By using our Voice Cloning feature, you represent and warrant that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Explicit Consent:</strong> You have the explicit, verifiable, and legally binding consent of the individual whose voice you are cloning.</li>
              <li><strong>No Deception:</strong> You will not use cloned voices to deceive, commit fraud, spread misinformation, or create non-consensual deepfakes (e.g., generating fake political statements or fraudulent audio evidence).</li>
              <li><strong>Right to Revoke:</strong> Voice owners have the right to request the removal of their cloned voice models from our systems. We will comply with all valid requests immediately.</li>
            </ul>
            <p className="mt-4">Violation of these cloning rules will result in an immediate, permanent ban, forfeiture of all credits, and potential reporting to law enforcement agencies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property Rights</h2>
            <p><strong>Your Content:</strong> You retain all ownership rights to the text prompts, audio uploads, and other inputs you provide (&quot;User Content&quot;). You grant iPulse a temporary, non-exclusive license to process this content solely for the purpose of generating your requested output.</p>
            <p><strong>Generated Output:</strong> Subject to your compliance with these Terms, iPulse assigns to you all rights, title, and interest in the audio outputs generated from your prompts. You may use the outputs for both personal and commercial purposes, provided your account tier allows commercial use.</p>
            <p><strong>Our Technology:</strong> iPulse retains all rights, title, and interest in and to the Service, including all underlying AI models, algorithms, software, and branding. You may not use our generated audio to train competing machine learning models.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. No Training on User Data</h2>
            <p>Unlike many AI platforms, iPulse has a strict privacy-first architecture. We <strong>do not</strong> use your User Content, cloned voices, or generated outputs to train, fine-tune, or improve our base foundational AI models. Your data is your own.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Termination and Suspension</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, if we reasonably believe you have violated these Terms, our AUP, or for any other operational or legal reason. Upon termination, your right to use the Service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Disclaimers and Limitation of Liability</h2>
            <p><strong>&quot;AS IS&quot; Basis:</strong> The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, either express or implied, including fitness for a particular purpose or non-infringement.</p>
            <p><strong>Limitation of Liability:</strong> To the maximum extent permitted by law, in no event shall iPulse Labs, its directors, or employees be liable for any indirect, incidental, special, consequential, or punitive damages. iPulse&apos;s total aggregate liability arising out of or related to these terms shall not exceed the total amount paid by you to iPulse in the three (3) months preceding the event giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless iPulse Labs from any claims, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of your User Content, your violation of these Terms, or your violation of any rights of a third party, particularly concerning unauthorized voice cloning.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law and Jurisdiction</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the Republic of Singapore, without regard to its conflict of law principles. Any legal action or proceeding arising out of or related to these Terms shall be brought exclusively in the courts located in Singapore.</p>
          </section>
        </div>
      </div>
    </div>
  );
}