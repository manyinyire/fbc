'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ApplicationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Card Application Status
    applicationStatus: 'New Card',
    oldCardNumber: '',
    replacementReason: '',
    oldCardIssuedAt: '',
    oldCardDateIssued: '',
    
    // Type of Card
    cardType: '',
    
    // Documents Supplied
    hasNationalIdentity: false,
    hasValidPassport: false,
    hasPassportPhoto: false,
    hasProofOfResidence: false,
    hasPayslip: false,
    identityNumber: '',
    
    // Source of Income
    incomeOutline: '',
    incomeSource: '',
    incomeSourceOther: '',
    monthlyIncomeAmount: '',
    
    // Customer Personal Details
    title: '',
    surname: '',
    firstName: '',
    nationalIdNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    physicalAddress: '',
    country: '',
    province: '',
    city: '',
    landlineNumber: '',
    mobileNumber: '',
    email: '',
    
    // Linked Accounts
    usdAccountNumber: '',
    zwgAccountNumber: '',
    
    // Amount to be Loaded
    amountInWords: '',
    amountInFigures: '',
    
    // Declaration
    hasAgreedToTerms: false,
    
    // Acknowledgement
    hasAcknowledgedReceipt: false,
    
    // Branch and Date
    branch: '',
    applicationDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.cardType) newErrors.cardType = 'Card type is required';
    if (!formData.surname) newErrors.surname = 'Surname is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.nationalIdNumber) newErrors.nationalIdNumber = 'National ID number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.physicalAddress) newErrors.physicalAddress = 'Physical address is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    
    // Conditional validation
    if (formData.applicationStatus === 'Replacement Card' && !formData.oldCardNumber) {
      newErrors.oldCardNumber = 'Old card number is required for replacement';
    }
    
    if (formData.applicationStatus === 'Replacement Card' && !formData.replacementReason) {
      newErrors.replacementReason = 'Replacement reason is required';
    }
    
    // Email validation if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          throw new Error('The server returned an invalid JSON response. Please try again later.');
        }
      } else {
        // Handle non-JSON responses
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        
        // Check for specific Prisma errors
        if (textResponse.includes('@prisma/client did not initialize yet')) {
          throw new Error('Database connection error: Prisma client not initialized. Please contact the administrator.');
        } else if (textResponse.includes('prisma')) {
          throw new Error('Database error occurred. Please contact the administrator.');
        } else {
          throw new Error('The server returned a non-JSON response. Please contact support.');
        }
      }
      
      if (!response.ok) {
        // Get the detailed error message from the API response
        throw new Error(responseData?.error || `Failed to submit application (Status: ${response.status})`);
      }
      
      // Check if there are any warnings but the submission was successful
      if (responseData.warning) {
        // Show warning but still proceed with success
        alert(`Application submitted successfully with a note: ${responseData.warning}`);
      }
      
      setSubmitSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        router.push('/application/success');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Provide more detailed error messages based on error type
      let errorMessage = 'Please try again.';
      
      if (error instanceof Error) {
        // Check if it's a JSON parsing error
        if (error.message.includes('JSON')) {
          errorMessage = 'The server returned an invalid response format. This might be due to a server error. Please try again later or contact support.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Display the specific error message to the user
      alert(`There was an error submitting your application: ${errorMessage}`);
      
      // If this is a server error, you might want to log it or notify administrators
      if (error instanceof Error && (error.message.includes('server') || error.message.includes('Status: 5'))) {
        // In a production app, you might want to log this to a monitoring service
        console.error('Server error detected:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
          <p className="mb-4">Your MasterCard application has been received. We are processing your application and will contact you soon.</p>
          <p className="text-sm text-gray-500">Redirecting to success page...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-8 my-8">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-48 h-20">
            <Image 
              src="/fbc-logo.png" 
              alt="FBC Bank Limited" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-center text-blue-800">FBC MASTERCARD PREMIUM CARDS APPLICATION FORM</h1>
          <div className="relative w-24 h-20">
            <Image 
              src="/mastercard-logo.png" 
              alt="MasterCard" 
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Branch and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FBC Bank Branch:</label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
              <input
                type="date"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Card Application Status */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">CARD APPLICATION STATUS (tick appropriately)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="newCard"
                  name="applicationStatus"
                  value="New Card"
                  checked={formData.applicationStatus === 'New Card'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="newCard">New Card</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="replacementCard"
                  name="applicationStatus"
                  value="Replacement Card"
                  checked={formData.applicationStatus === 'Replacement Card'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="replacementCard">Replacement Card</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="oldCardSubmitted"
                  name="oldCardSubmitted"
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="oldCardSubmitted">Old card has been submitted with this application (Y/N)</label>
              </div>
            </div>

            {formData.applicationStatus === 'Replacement Card' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Please indicate old card number:</label>
                  <input
                    type="text"
                    name="oldCardNumber"
                    value={formData.oldCardNumber}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.oldCardNumber ? 'border-red-500' : ''}`}
                  />
                  {errors.oldCardNumber && <p className="text-red-500 text-xs mt-1">{errors.oldCardNumber}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Replacement Reason:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="expired"
                        name="replacementReason"
                        value="Expired"
                        checked={formData.replacementReason === 'Expired'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="expired">Expired</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="lost"
                        name="replacementReason"
                        value="Lost"
                        checked={formData.replacementReason === 'Lost'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="lost">Lost</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="stolen"
                        name="replacementReason"
                        value="Stolen"
                        checked={formData.replacementReason === 'Stolen'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="stolen">Stolen</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="other"
                        name="replacementReason"
                        value="Other"
                        checked={formData.replacementReason === 'Other'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="other">Other (specify)</label>
                    </div>
                  </div>
                  {errors.replacementReason && <p className="text-red-500 text-xs mt-1">{errors.replacementReason}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Old card issued at (branch):</label>
                    <input
                      type="text"
                      name="oldCardIssuedAt"
                      value={formData.oldCardIssuedAt}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued:</label>
                    <input
                      type="date"
                      name="oldCardDateIssued"
                      value={formData.oldCardDateIssued}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Type of Card */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">TYPE OF CARD (tick appropriately)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="worldBlackDebit"
                  name="cardType"
                  value="World Black Debit"
                  checked={formData.cardType === 'World Black Debit'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="worldBlackDebit">World Black Debit</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="worldBlackPrepaid"
                  name="cardType"
                  value="World Black Prepaid"
                  checked={formData.cardType === 'World Black Prepaid'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="worldBlackPrepaid">World Black Prepaid</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="platinumPrepaid"
                  name="cardType"
                  value="Platinum Prepaid"
                  checked={formData.cardType === 'Platinum Prepaid'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="platinumPrepaid">Platinum Prepaid</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="goldPrepaid"
                  name="cardType"
                  value="Gold Prepaid"
                  checked={formData.cardType === 'Gold Prepaid'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="goldPrepaid">Gold Prepaid</label>
              </div>
            </div>
            {errors.cardType && <p className="text-red-500 text-xs mt-1">{errors.cardType}</p>}
          </div>

          {/* Documents Supplied */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">DOCUMENTS SUPPLIED BY CARDHOLDER (tick appropriately)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasNationalIdentity"
                  name="hasNationalIdentity"
                  checked={formData.hasNationalIdentity}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasNationalIdentity">National Identity</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasValidPassport"
                  name="hasValidPassport"
                  checked={formData.hasValidPassport}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasValidPassport">Passport (valid)</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPassportPhoto"
                  name="hasPassportPhoto"
                  checked={formData.hasPassportPhoto}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasPassportPhoto">Passport Photo</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasProofOfResidence"
                  name="hasProofOfResidence"
                  checked={formData.hasProofOfResidence}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasProofOfResidence">Proof of Residence</label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPayslip"
                  name="hasPayslip"
                  checked={formData.hasPayslip}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="hasPayslip">Payslip (if applicable)</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National Identity/Passport Number:</label>
                <input
                  type="text"
                  name="identityNumber"
                  value={formData.identityNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Source of Income */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">SOURCE OF INCOME</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Briefly outline:</label>
              <textarea
                name="incomeOutline"
                value={formData.incomeOutline}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Source of Income:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="employed"
                    name="incomeSource"
                    value="Employed (Permanent)"
                    checked={formData.incomeSource === 'Employed (Permanent)'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="employed">Employed (Permanent)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="contractual"
                    name="incomeSource"
                    value="Contractual"
                    checked={formData.incomeSource === 'Contractual'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="contractual">Contractual</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="self"
                    name="incomeSource"
                    value="Self"
                    checked={formData.incomeSource === 'Self'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="self">Self</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="other"
                    name="incomeSource"
                    value="Other"
                    checked={formData.incomeSource === 'Other'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="other">Other</label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income Amount:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="monthlyIncomeAmount"
                  value={formData.monthlyIncomeAmount}
                  onChange={handleChange}
                  className="w-full pl-7 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Customer Personal Details */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">CUSTOMER PERSONAL DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Mr/Mrs/Miss/Prof):</label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Title</option>
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Miss">Miss</option>
                  <option value="Prof">Prof</option>
                  <option value="Dr">Dr</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surname:</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.surname ? 'border-red-500' : ''}`}
                />
                {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name(s):</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National Identity Number:</label>
                <input
                  type="text"
                  name="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.nationalIdNumber ? 'border-red-500' : ''}`}
                />
                {errors.nationalIdNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalIdNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender:</label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="male">Male</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <label htmlFor="female">Female</label>
                  </div>
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status:</label>
                <input
                  type="text"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physical Address:</label>
                <input
                  type="text"
                  name="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.physicalAddress ? 'border-red-500' : ''}`}
                />
                {errors.physicalAddress && <p className="text-red-500 text-xs mt-1">{errors.physicalAddress}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country:</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.country ? 'border-red-500' : ''}`}
                />
                {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Province:</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City:</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Landline Number:</label>
                <input
                  type="text"
                  name="landlineNumber"
                  value={formData.landlineNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number:</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.mobileNumber ? 'border-red-500' : ''}`}
                />
                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail Address:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="example@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Accounts to be Linked */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">ACCOUNTS TO BE LINKED FOR THE DUAL DEBIT CARD</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">USD Account Number:</label>
                <input
                  type="text"
                  name="usdAccountNumber"
                  value={formData.usdAccountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZWG Account Number:</label>
                <input
                  type="text"
                  name="zwgAccountNumber"
                  value={formData.zwgAccountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Amount to be Loaded */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">AMOUNT TO BE LOADED FOR THE PREPAID CARD PRODUCTS</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Words:</label>
              <input
                type="text"
                name="amountInWords"
                value={formData.amountInWords}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount in Figures:</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  name="amountInFigures"
                  value={formData.amountInFigures}
                  onChange={handleChange}
                  className="w-full pl-7 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">TERMS AND CONDITIONS OF USE FOR THE FBC BANK MASTERCARD CARD</h2>
            <div className="text-sm mb-4 max-h-60 overflow-y-auto p-4 bg-white rounded">
              <p className="font-bold mb-2">The card has been issued by FBC BANK Limited on the following conditions:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>The card remains the property of FBC Bank and upon cancellation, must be surrendered to FBC Bank or any FBCH offices.</li>
                <li>The card is not transferable and may only be used by the cardholder.</li>
                <li>FBC Bank is authorized to debit the cardholder's account linked to the card or the card account itself with all such withdrawals and purchases done by the card and the related fees. FBC Bank, at its sole discretion, is entitled to select any funded account belonging to the cardholder to be debited if the linked account is not sufficiently funded.</li>
                <li>The card does not entitle the cardholder to automatic overdraft facilities.</li>
                <li>A cardholder must exercise all due care to prevent:
                  <ol className="list-[lower-alpha] pl-5 space-y-1">
                    <li>The loss of the card.</li>
                    <li>Disclosure of card number and PIN to third parties.</li>
                    <li>The use of the card, card number and PIN by third parties.</li>
                    <li>The cardholder will be held completely liable for fraud losses on all card-based transactions as it is the cardholder's responsibility to ensure non-disclosure of the PIN, the CVC2 and the card number to any third party in any manner.</li>
                  </ol>
                </li>
                <li>If the card is lost, stolen, the card number or PIN has become known to an unauthorized person, the cardholder must notify FBC Bank of such a loss, theft or disclosure. Any verbal communication must be confirmed in writing within seven days. The cardholder shall remain liable for any transactions done by any unauthorized user prior to receipt by FBC Bank of notification of such a loss, theft or disclosure.</li>
                <li>The cardholder shall pay for all outstanding amounts/transactions done through the card before its closure. FBC Bank is entitled to institute legal proceedings to recover outstanding funds using details supplied by the cardholder on application.</li>
                <li>FBC Bank Limited through MasterCard encourages you to transact with your MasterCard card number only on Internet sites that request for your CVC2 or Card Verification Code or check digit number. (The three digits at the back of the card).FBC Bank Limited will not be held liable for any losses that occur on your card on Internet as a result of fraud.</li>
                <li>The cardholder is obligated to provide FBC Bank with updated contact details each time there is a change of his/her contact details.</li>
                <li>FBC Bank is free to change card and service fees at any time as may be necessary without consulting the cardholder.</li>
                <li>The card shall not be used for money laundering purposes by the cardholder.</li>
                <li>The cardholder may cancel the card at any time by returning it to FBC Bank.</li>
                <li>FBC Bank at its discretion may cancel the card without consulting the cardholder if it discovers that the card is being used contrary to any of the foregoing conditions.</li>
                <li>These conditions have been drawn up in accordance with the laws of Zimbabwe</li>
              </ol>
            </div>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="hasAgreedToTerms"
                name="hasAgreedToTerms"
                checked={formData.hasAgreedToTerms}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="hasAgreedToTerms" className="text-sm">I have read and understood the foregoing Terms and Conditions of FBC Bank MasterCard card use as set out by FBC Bank and agree to be bound as outlined.</label>
            </div>
          </div>

          {/* Acknowledgement */}
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold text-blue-800 mb-4">ACKNOWLEDGEMENT OF RECEIPT OF MASTERCARD CARD</h2>
            <p className="mb-4 text-sm">I acknowledge receipt of the above mentioned MasterCard Debit/Prepaid Card and confirm further that I having read, understood and agreeing to be bound as applicable thereto. I commit during usage of this card to act within and be governed by the Terms and Conditions outlined above in this application.</p>
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="hasAcknowledgedReceipt"
                name="hasAcknowledgedReceipt"
                checked={formData.hasAcknowledgedReceipt}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="hasAcknowledgedReceipt" className="text-sm">I acknowledge receipt of the MasterCard and agree to the terms.</label>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )};