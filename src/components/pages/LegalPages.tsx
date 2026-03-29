import { useApp } from "@/context/AppContext";
import Footer from "@/components/layout/Footer";

// ─── Shared layout ────────────────────────────────────────────────────────────

function LegalHeader({
  title,
  lastUpdated,
  onBack,
}: {
  title: string;
  lastUpdated: string;
  onBack: () => void;
}) {
  return (
    <header className="bg-[#332e28] text-white py-8 px-4 md:px-8 lg:px-[76px]">
      <div className="max-w-[1280px] mx-auto">
        <button
          className="flex items-center gap-2 mb-6 hover:opacity-70 transition"
          onClick={onBack}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-bold text-3xl md:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 font-['Poppins'] text-sm opacity-80">
          Last Updated: {lastUpdated}
        </p>
      </div>
    </header>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-4">
        {heading}
      </h2>
      <div className="font-['Poppins'] text-base text-[#1C1B1F] leading-relaxed space-y-4">
        {children}
      </div>
    </section>
  );
}

// ─── Terms ────────────────────────────────────────────────────────────────────

export function TermsAndConditionsPage() {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader
        lastUpdated="February 23, 2026"
        onBack={() => setCurrentPage("landing")}
        title="Terms and Conditions"
      />

      <main className="py-12 px-4 md:px-8 lg:px-[76px]">
        <div className="max-w-[900px] mx-auto">
          <Section heading="1. Introduction">
            <p>
              Welcome to JIA Ideas. These Terms and Conditions govern your use of
              our website and services. By accessing our website or engaging our
              services, you agree to be bound by these terms.
            </p>
          </Section>

          <Section heading="2. Services">
            <p>
              JIA Ideas provides interior design and carpentry services including
              modular carpentry, renovation packages, custom furniture, and related
              design services. All services are subject to availability and
              acceptance by JIA Ideas.
            </p>
          </Section>

          <Section heading="3. Quotations and Pricing">
            <p>
              All quotations are valid for 30 days from the date of issue unless
              otherwise stated. Prices are in Singapore Dollars (SGD) and subject
              to 9% GST where applicable. Final pricing may vary based on site
              conditions, material costs, and project specifications.
            </p>
          </Section>

          <Section heading="4. Payment Terms">
            <p>
              A deposit of 50% is required upon signing of the agreement. The
              remaining balance is due upon project completion unless otherwise
              agreed in writing.
            </p>
          </Section>

          <Section heading="5. Cancellation Policy">
            <p>
              Cancellations made within 7 days of signing may incur a cancellation
              fee of up to 20% of the total project value to cover administrative
              and material costs already incurred.
            </p>
          </Section>

          <Section heading="6. Warranty">
            <p>
              JIA Ideas provides a 1-year workmanship warranty on all completed
              projects. Warranty claims must be submitted in writing within the
              warranty period.
            </p>
          </Section>

          <Section heading="7. Limitation of Liability">
            <p>
              JIA Ideas shall not be liable for any indirect, incidental, or
              consequential damages arising out of or related to the use of our
              services.
            </p>
          </Section>

          <Section heading="8. Governing Law">
            <p>
              These terms are governed by the laws of Singapore. Any disputes
              shall be subject to the exclusive jurisdiction of the Singapore
              courts.
            </p>
          </Section>
        </div>
      </main>

      <Footer
        onPrivacyClick={() => setCurrentPage("privacy")}
        onTermsClick={() => setCurrentPage("terms")}
      />
    </div>
  );
}

// ─── Privacy ─────────────────────────────────────────────────────────────────

export function PrivacyPolicyPage() {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <LegalHeader
        lastUpdated="February 23, 2026"
        onBack={() => setCurrentPage("landing")}
        title="Privacy Policy"
      />

      <main className="py-12 px-4 md:px-8 lg:px-[76px]">
        <div className="max-w-[900px] mx-auto">
          <Section heading="1. Introduction">
            <p>
              JIA Ideas ("we", "us", or "our") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your personal information in accordance with the
              Personal Data Protection Act 2012 (PDPA) of Singapore.
            </p>
            <p>
              By using our website or engaging our services, you consent to the
              collection and use of your personal data as described in this policy.
            </p>
          </Section>

          <Section heading="2. Data We Collect">
            <p>
              We may collect: name, email address, phone number, property details,
              and usage data when you interact with our website or services.
            </p>
          </Section>

          <Section heading="3. How We Use Your Data">
            <p>
              Your data is used to provide and improve our services, communicate
              project updates, process payments, and comply with legal obligations.
              We do not sell your personal data to third parties.
            </p>
          </Section>

          <Section heading="4. Data Retention">
            <p>
              We retain personal data for as long as necessary to fulfil the
              purposes outlined in this policy, or as required by law, whichever
              is longer.
            </p>
          </Section>

          <Section heading="5. Your Rights">
            <p>
              Under the PDPA, you have the right to access, correct, and withdraw
              consent for the use of your personal data. To exercise these rights,
              contact us at privacy@jiaideas.com.
            </p>
          </Section>

          <Section heading="6. Cookies">
            <p>
              We use cookies to improve your browsing experience and analyse site
              traffic. You may disable cookies in your browser settings, though
              some features may not function correctly as a result.
            </p>
          </Section>

          <Section heading="7. Contact Us">
            <p>
              If you have questions about this Privacy Policy, please email us at{" "}
              <a
                className="text-[#7b7267] underline"
                href="mailto:privacy@jiaideas.com"
              >
                privacy@jiaideas.com
              </a>
              .
            </p>
          </Section>
        </div>
      </main>

      <Footer
        onPrivacyClick={() => setCurrentPage("privacy")}
        onTermsClick={() => setCurrentPage("terms")}
      />
    </div>
  );
}
