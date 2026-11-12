import Link from "next/link";
import LegalPage from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata = { title: "Terms of Service · Dev Passport", description: "The rules for using Dev Passport." };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are the agreement between you and {LEGAL.operator} for using the Dev Passport website and service (the “Service”).
          By signing in or using the Service you agree to them. If you don&apos;t agree, please don&apos;t use it.
        </p>
      }
      sections={[
        {
          id: "service",
          title: "The service",
          body: <p>Dev Passport lets you build a public portfolio of “stamps” that describe your work, with proof links. The Service is free, open source and provided by volunteers.</p>,
        },
        {
          id: "account",
          title: "Your account",
          body: (
            <ul>
              <li>You sign in with GitHub and must be at least 13 years old.</li>
              <li>You are responsible for your account and for everything you publish.</li>
              <li>One person, one passport. Do not impersonate anyone or create passports for others without their permission.</li>
            </ul>
          ),
        },
        {
          id: "content",
          title: "Your content",
          body: (
            <>
              <p>You own what you publish. You give us a limited, worldwide, non-exclusive licence to store it and display it as part of the Service, for example on your public passport and in link previews, for as long as you keep it on the Service.</p>
              <p>You promise that your content is accurate to the best of your knowledge, that you have the right to share it, and that it does not break the law or anyone&apos;s rights. Do not share confidential employer or client information.</p>
            </>
          ),
        },
        {
          id: "verification",
          title: "Verified and self-reported stamps",
          body: (
            <>
              <p>A <strong>Verified</strong> stamp means Dev Passport confirmed a specific fact using a trusted source, for example that a repository is public and owned by your GitHub account, or that GitHub reports a number of private contributions. It does <strong>not</strong> mean we have checked the quality of your work, your skills, your employment or your identity.</p>
              <p><strong>Self-reported</strong> stamps are entered by the owner and are not checked by us. Anyone relying on a passport, including employers and recruiters, should do their own checks.</p>
            </>
          ),
        },
        {
          id: "rules",
          title: "Acceptable use",
          body: (
            <>
              <p>Do not:</p>
              <ul>
                <li>post false or misleading claims, or try to fake verified status;</li>
                <li>harass, threaten or discriminate against anyone, or post unlawful or offensive content;</li>
                <li>scrape, overload or attack the Service, or bypass its limits and security;</li>
                <li>use the Service to send spam or to collect people&apos;s data for unrelated purposes.</li>
              </ul>
              <p>You can report a problem passport with our <Link href="/report">report form</Link>.</p>
            </>
          ),
        },
        {
          id: "moderation",
          title: "Moderation and ending your use",
          body: <p>We may remove content, hide a passport or suspend an account that breaks these terms or puts others at risk. You can stop using the Service and delete your account at any time in <Link href="/settings">Settings</Link>.</p>,
        },
        {
          id: "opensource",
          title: "Open source",
          body: <p>The Dev Passport source code is released under the MIT license and is available in the project repository. These terms apply to the hosted Service run by us; they do not limit the rights the MIT license gives you over the code.</p>,
        },
        {
          id: "disclaimer",
          title: "No warranty",
          body: <p>The Service is provided “as is” and “as available”, without warranties of any kind. We don&apos;t promise it will be uninterrupted or error-free, or that the content on it is accurate.</p>,
        },
        {
          id: "liability",
          title: "Limit of liability",
          body: <p>To the extent the law allows, we are not liable for indirect or consequential losses, or for loss of data, profit or opportunity arising from your use of the Service or from relying on a passport. Nothing in these terms limits liability that cannot be limited by law.</p>,
        },
        {
          id: "changes",
          title: "Changes, law and contact",
          body: (
            <>
              <p>We may update these terms. If the changes are important we will update the date above and, where appropriate, tell you in the app. Continuing to use the Service after a change means you accept it.</p>
              {LEGAL.jurisdiction && <p>These terms are governed by the laws of {LEGAL.jurisdiction}.</p>}
              <p>Questions about these terms? See the contact details at the bottom of this page.</p>
            </>
          ),
        },
      ]}
    />
  );
}
