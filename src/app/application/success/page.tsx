import Link from 'next/link';
import Image from 'next/image';

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 my-8 text-center">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-32 h-16">
            <Image 
              src="/fbc-logo.png" 
              alt="FBC Bank Limited" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div className="relative w-16 h-16">
            <Image 
              src="/mastercard-logo.png" 
              alt="MasterCard" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        <div className="text-green-500 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-blue-800">Application Submitted Successfully!</h1>
        
        <div className="mb-8 text-gray-700">
          <p className="mb-4">Thank you for submitting your MasterCard application. Your application has been received and is being processed.</p>
          <p className="mb-4">A PDF copy of your application has been generated and sent to our processing team. You will be contacted shortly regarding the status of your application.</p>
          <p className="font-medium">Your application reference number: <span className="font-bold">{new Date().getTime().toString().slice(-8)}</span></p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded mb-8 text-left">
          <h2 className="font-bold mb-2 text-blue-800">Next Steps:</h2>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Our team will review your application within 2-3 business days.</li>
            <li>You may be contacted for additional information if required.</li>
            <li>Once approved, you will be notified to collect your MasterCard from your selected branch.</li>
          </ol>
        </div>
        
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </main>
  );
}