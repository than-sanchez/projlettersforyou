import React from 'react';

const DonationPage: React.FC = () => {
  return (
    <div className="py-12 md:py-20 max-w-3xl mx-auto text-center animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900">Support Us</h1>
      <p className="mt-4 text-lg text-gray-600">
        LettersForYou is a community-driven platform, and your support helps us keep this space safe, ad-free, and accessible to everyone.
      </p>
      <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800">Make a Donation</h2>
        <p className="mt-4 text-gray-600">
          If you find value in this platform, please consider making a small donation. Every contribution helps us maintain our servers and continue developing new features to connect people through words.
        </p>
        <div className="mt-8">
          <a
            href="https://buymeacoffee.com/flaredmoko"
            className="inline-block bg-gray-900 text-white font-medium py-3 px-8 rounded-full hover:bg-gray-700 transition-colors"
          >
            Donate Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default DonationPage;