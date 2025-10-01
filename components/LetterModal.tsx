
import React, { useEffect, useState } from 'react';
import type { Letter } from '../types';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { CloseIcon } from './icons/CloseIcon';
import { DownloadIcon } from './icons/DownloadIcon';

// To satisfy typescript for the global html2canvas from the CDN script
declare const html2canvas: any;

interface LetterModalProps {
  letter: Letter | null;
  onClose: () => void;
}

const LetterModal: React.FC<LetterModalProps> = ({ letter, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleSave = async () => {
    if (!letter || typeof html2canvas === 'undefined') {
      console.error("Letter data is missing or html2canvas is not loaded.");
      return;
    }

    setIsSaving(true);

    const captureId = `letter-capture-${letter.id}-${Date.now()}`;
    const captureWrapper = document.createElement('div');
    captureWrapper.style.position = 'absolute';
    captureWrapper.style.left = '-9999px';
    captureWrapper.style.top = '0';
    // Preload fonts by applying them to the off-screen wrapper
    captureWrapper.style.fontFamily = `'Inter', sans-serif`;
    captureWrapper.style.fontFamily = `'Hedvig Letters Serif', serif`;

    const formattedDate = new Date(letter.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
    const safeTo = escapeHtml(letter.to);
    const safeContent = escapeHtml(letter.content).replace(/\n/g, '<br/>');
    
    captureWrapper.innerHTML = `
      <div id="${captureId}" style="width: 1000px; height: 1000px; background-color: white; display: flex; flex-direction: column; padding: 80px; box-sizing: border-box; font-family: 'Inter', sans-serif;">
        
        <!-- Letter Header -->
        <div style="display: flex; align-items: center; color: #6B7280; margin-bottom: 48px; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="height: 24px; width: 24px; margin-right: 12px; flex-shrink: 0;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          <span style="font-weight: 500; font-size: 24px;">To: ${safeTo}</span>
        </div>

        <!-- Letter Content Wrapper: Centers the content block -->
        <div style="flex-grow: 1; display: flex; justify-content: center; align-items: center; overflow: hidden;">
            <!-- Actual Content Block: Left-aligned text -->
            <div style="color: #374151; font-size: 22px; line-height: 1.7; text-align: left; max-width: 100%; max-height: 100%;">
                ${safeContent}
            </div>
        </div>

        <!-- Footer / Watermark -->
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #F3F4F6; text-align: center; color: #9CA3AF;">
          <p style="font-size: 14px; margin: 0 0 8px 0;">${formattedDate}</p>
          <p style="font-family: 'Hedvig Letters Serif', serif; font-size: 16px; margin: 0;">sent from lettersforyou</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(captureWrapper);

    const elementToCapture = document.getElementById(captureId);
    
    // A short delay to ensure the element and its fonts are fully rendered in the DOM before capturing.
    await new Promise(resolve => setTimeout(resolve, 100)); 

    if (!elementToCapture) {
      console.error('Error: Could not find the element to capture for image generation.');
      if (document.body.contains(captureWrapper)) {
        document.body.removeChild(captureWrapper);
      }
      setIsSaving(false);
      return;
    }

    try {
      const canvas = await html2canvas(elementToCapture, {
          useCORS: true,
          scale: 2, // for better resolution
          backgroundColor: '#ffffff', // Explicitly set white background
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `letter-to-${letter.to.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      if (document.body.contains(captureWrapper)) {
        document.body.removeChild(captureWrapper);
      }
      setIsSaving(false);
    }
  };

  if (!letter) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="letter-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center text-gray-600">
            <EnvelopeIcon className="h-5 w-5 mr-3" />
            <span id="letter-modal-title" className="font-medium text-lg">To: {letter.to}</span>
          </div>
        </div>
        <div className="p-6 md:p-8 flex-grow overflow-y-auto">
          <p className="font-bold text-gray-900 mb-6">Theres someone write about you</p>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{letter.content}</p>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
                {new Date(letter.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
            </p>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Save letter as image"
            >
              <DownloadIcon className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close letter view"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default LetterModal;
