
import React from 'react';

const TermsPage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="py-12 md:py-20 max-w-3xl mx-auto animate-fadeIn">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Terms of Service</h1>
        <p className="mt-4 text-gray-500">Last updated: {lastUpdatedDate}</p>
      </div>

      <div className="mt-12 space-y-8 text-gray-700 leading-relaxed">
        <p>Welcome to LettersForYou. By accessing or using our platform, you agree to comply with the following Terms of Submission, Terms of Use, and Privacy Policy. Please read them carefully.</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">1. Terms of Submission</h2>
          <p>By submitting a letter through the "Write" page, you acknowledge and agree to the following:</p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Public Submission:</strong> By submitting a letter, you agree that it may be made publicly available for others to read on our platform. Submissions are stored securely on our servers with encryption. A reference to your submissions is also kept in your browser's local storage, allowing you to view them in your "History".</li>
            <li><strong>Anonymity:</strong> Submissions are anonymous by design. We do not require account creation or any personal information to use the service.</li>
            <li><strong>Content Responsibility:</strong> You are solely responsible for the content you write. You agree not to submit any content that:
              <ul className="list-disc list-inside space-y-1 pl-6 mt-2">
                <li>Reveals your own or someone else’s personal identity, contact details, or sensitive information.</li>
                <li>Contains abusive, harmful, threatening, illegal, or otherwise objectionable material.</li>
              </ul>
            </li>
            <li><strong>No Deletion:</strong> As stated on the submission page, once a letter is sent, it cannot be deleted. Please write mindfully, knowing it may be read by others.</li>
          </ul>
           <p>We reserve the right to review, moderate, or remove any letter that violates these terms, without prior notice, to maintain a safe platform.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">2. Terms of Use</h2>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Anonymous Access:</strong> LettersForYou does not require registration. All submissions are handled anonymously.</li>
            <li><strong>Public Nature of Letters:</strong> To foster a community of shared experiences, letters you submit are considered public and may be displayed anonymously on the "Browse" page for others to read. While submissions are anonymous, please do not include any personal information you would not want to be seen publicly.</li>
            <li><strong>Prohibited Actions:</strong> You agree not to use this platform to:
               <ul className="list-disc list-inside space-y-1 pl-6 mt-2">
                    <li>Reveal or attempt to reveal another person’s identity.</li>
                    <li>Share confidential, private, or personally identifiable information.</li>
                    <li>Engage in harassment, spam, or any unlawful activities.</li>
                </ul>
            </li>
             <li><strong>Enforcement:</strong> Violation of these terms may result in restriction of access to the platform and removal of your content.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 font-serif">3. Privacy Policy</h2>
           <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Data Collection:</strong> We collect and store the anonymous content of the letters you submit. This data is encrypted on our servers. We do not collect or associate any personally identifiable information (such as name, email, or IP address) with your submissions.</li>
            <li><strong>No Accounts Required:</strong> You can submit and read your letters without creating an account.</li>
            <li><strong>Data Retention:</strong> Your letters are stored on our servers. The references in your local storage, which allow you to see your history, remain until you clear your browser's data.</li>
            <li><strong>Third Parties:</strong> We do not sell, trade, or share your letter content with third parties.</li>
          </ul>
        </section>
        
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">4. Changes to These Terms</h2>
            <p>LettersForYou may update these Terms and Privacy Policy from time to time. Any changes will be effective upon posting on this page.</p>
        </section>

        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 font-serif">5. Contact Us</h2>
            <p>For questions or concerns about these Terms or Privacy Policy, please contact us at [Insert Email Address].</p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
