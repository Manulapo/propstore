import React from "react";

const TermsOfUse = () => {
  return (
    <main className="prose mx-auto px-6 py-8 dark:prose-invert bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>

      <p className="mb-6">
        Welcome to <span className="font-semibold">PropoStore</span>! Please read these Terms of Use carefully
        before using this website. By accessing or using this site, you agree to be bound by these terms.
        If you do not agree with any part of these Terms, please do not use this site.
      </p>

      <h2 className="text-2xl font-semibold mb-3">1. Project Nature</h2>
      <p className="mb-6">
        This website is a <strong>demonstration project</strong> created by <em>Manuel La Porta</em>.
        It is intended for educational and portfolio purposes only and is <strong>not</strong> a live
        e-commerce platform. No actual transactions or purchases will be processed.
      </p>

      <h2 className="text-2xl font-semibold mb-3">2. No Real Service</h2>
      <p className="mb-6">
        All product listings, prices, and promotional materials are fictitious.
        Any images, descriptions, or interactive elements are for design testing
        and user-experience demonstration only. This site does not sell, ship,
        or rent any physical goods.
      </p>

      <h2 className="text-2xl font-semibold mb-3">3. Limitation of Liability</h2>
      <p className="mb-6">
        In no event shall <em>Manuel La Porta</em> or any affiliates be liable for any
        direct, indirect, incidental, consequential, or punitive damages arising
        out of your access to, use of, or inability to use this site. You
        acknowledge and agree that your use of the site is at your own risk.
      </p>

      <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
      <p className="mb-6">
        All design assets, code, logos, and illustrations on this site are the
        intellectual property of <em>Manuel La Porta</em> unless otherwise noted.
        You may not reproduce, distribute, or create derivative works without
        written permission.
      </p>

      <h2 className="text-2xl font-semibold mb-3">5. Changes to These Terms</h2>
      <p className="mb-6">
        We reserve the right to modify these Terms of Use at any time. Changes
        will be posted here with an updated “Last Updated” date. Your continued
        use of the site after any such changes constitutes acceptance of the
        new Terms.
      </p>

      <p className="text-sm text-gray-500">
        <em>Last updated: April 29, 2025</em>
      </p>
    </main>
  );
};

export default TermsOfUse;
