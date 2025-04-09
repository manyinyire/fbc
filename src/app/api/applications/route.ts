import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

const prisma = new PrismaClient();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER, // Updated to match .env.local variable name
    pass: process.env.EMAIL_SERVER_PASSWORD, // Updated to match .env.local variable name
  },
});

// Import necessary email sending library
import { sendEmail } from '@/lib/email'; // Make sure this path is correct

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Save application to database using Prisma
    const application = await prisma.application.create({
      data: {
        // Add all required fields from your Prisma schema
        applicationStatus: data.applicationStatus || 'New Application',
        branch: data.branch || '',
        applicationDate: data.applicationDate || new Date().toISOString(),
        cardType: data.cardType || '',
        
        // Customer details
        title: data.title || '',
        firstName: data.firstName || '',
        surname: data.surname || '',
        nationalIdNumber: data.nationalIdNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        maritalStatus: data.maritalStatus || '',
        
        // Contact information
        physicalAddress: data.physicalAddress || '',
        country: data.country || '',
        province: data.province || '',
        city: data.city || '',
        landlineNumber: data.landlineNumber || '',
        mobileNumber: data.mobileNumber || '',
        email: data.email || '',
        
        // Account information
        usdAccountNumber: data.usdAccountNumber || '',
        zwgAccountNumber: data.zwgAccountNumber || '',
        
        // Amount information
        amountInWords: data.amountInWords || '',
        amountInFigures: data.amountInFigures ? parseFloat(data.amountInFigures) : 0,
        
        // Income information - Adding the missing required field
        incomeSource: data.incomeSource || '',
        incomeOutline: data.incomeOutline || '',
        monthlyIncomeAmount: data.monthlyIncomeAmount ? parseFloat(data.monthlyIncomeAmount) : 0,
        
        // Agreements
        hasAgreedToTerms: data.hasAgreedToTerms || false,
        hasAcknowledgedReceipt: data.hasAcknowledgedReceipt || false,
        
        // Document information
        hasNationalIdentity: data.hasNationalIdentity || false,
        hasValidPassport: data.hasValidPassport || false,
        hasPassportPhoto: data.hasPassportPhoto || false,
        hasProofOfResidence: data.hasProofOfResidence || false,
        hasPayslip: data.hasPayslip || false,
        identityNumber: data.identityNumber || '',
        
        // Additional fields for replacement cards if needed
        oldCardNumber: data.oldCardNumber || '',
        replacementReason: data.replacementReason || '',
        oldCardIssuedAt: data.oldCardIssuedAt || '',
        oldCardDateIssued: data.oldCardDateIssued || '',
      },
    });
    
    // Generate PDF
    const pdfBytes = await generatePDF(data);
    
    // Save PDF to file
    const pdfDir = path.join(process.cwd(), 'public', 'pdfs');
    await fsPromises.mkdir(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, `application-${application.id}.pdf`);
    await fsPromises.writeFile(pdfPath, pdfBytes);
    
    // Try to send email and catch any errors specifically from email sending
    let emailError = null;
    try {
      if (data.email) {
        console.log('Attempting to send email to:', data.email);
        // Option 1: Use the imported sendEmail function
        await sendEmail({
          to: data.email,
          subject: 'FBC MasterCard Application Confirmation',
          text: `Dear ${data.firstName} ${data.surname},\n\nThank you for submitting your FBC MasterCard application. Your application has been received and is being processed.\n\nApplication Reference: ${application.id}\n\nRegards,\nFBC Bank Limited`,
          html: `<p>Dear ${data.firstName} ${data.surname},</p>
                <p>Thank you for submitting your FBC MasterCard application. Your application has been received and is being processed.</p>
                <p>Application Reference: <strong>${application.id}</strong></p>
                <p>Regards,<br>FBC Bank Limited</p>`
        });
        console.log('Email sent successfully');
      } else {
        emailError = 'No email address provided';
        console.log('Email error:', emailError);
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      emailError = error instanceof Error ? error.message : 'Unknown email error';
    }
    
    // Return success with warning if email failed
    if (emailError) {
      return Response.json({ 
        success: true, 
        id: application.id,
        warning: 'Your application was saved, but we encountered an issue sending the confirmation email.'
      });
    }
    
    // Return success if everything worked
    return Response.json({ success: true, id: application.id });
    
  } catch (error) {
    console.error('Application submission error:', error);
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to submit application' 
    }, { status: 500 });
  }
}

async function generatePDF(formData: any) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a page to the document
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  
  // Get the font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Set some properties for easy positioning
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;
  const lineHeight = 15;
  
  // Add logos
  // Note: In a real implementation, you would embed the actual logo images
  // For this example, we'll just add placeholder text for the logos
  page.drawText('FBC BANK LIMITED', {
    x: margin,
    y: y,
    size: 16,
    font: boldFont,
    color: rgb(0, 0, 0.8),
  });
  
  page.drawText('MASTERCARD', {
    x: width - margin - 100,
    y: y,
    size: 16,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });
  
  y -= 40;
  
  // Add title
  page.drawText('FBC MASTERCARD PREMIUM CARDS APPLICATION FORM', {
    x: margin,
    y: y,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0.8),
  });
  
  y -= 30;
  
  // Add application details
  // Branch and Date
  page.drawText(`Branch: ${formData.branch || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  page.drawText(`Date: ${formData.applicationDate || 'N/A'}`, {
    x: width / 2,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Card Application Status
  page.drawText('CARD APPLICATION STATUS:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Status: ${formData.applicationStatus}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  if (formData.applicationStatus === 'Replacement Card') {
    y -= lineHeight;
    page.drawText(`Old Card Number: ${formData.oldCardNumber || 'N/A'}`, {
      x: margin,
      y: y,
      size: 10,
      font,
    });
    
    y -= lineHeight;
    page.drawText(`Replacement Reason: ${formData.replacementReason || 'N/A'}`, {
      x: margin,
      y: y,
      size: 10,
      font,
    });
    
    y -= lineHeight;
    page.drawText(`Old Card Issued At: ${formData.oldCardIssuedAt || 'N/A'}`, {
      x: margin,
      y: y,
      size: 10,
      font,
    });
    
    y -= lineHeight;
    page.drawText(`Old Card Date Issued: ${formData.oldCardDateIssued || 'N/A'}`, {
      x: margin,
      y: y,
      size: 10,
      font,
    });
  }
  
  y -= lineHeight * 2;
  
  // Type of Card
  page.drawText('TYPE OF CARD:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Card Type: ${formData.cardType || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Documents Supplied
  page.drawText('DOCUMENTS SUPPLIED BY CARDHOLDER:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`National Identity: ${formData.hasNationalIdentity ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Passport (valid): ${formData.hasValidPassport ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Passport Photo: ${formData.hasPassportPhoto ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Proof of Residence: ${formData.hasProofOfResidence ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Payslip: ${formData.hasPayslip ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Identity Number: ${formData.identityNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Source of Income
  page.drawText('SOURCE OF INCOME:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Income Outline: ${formData.incomeOutline || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Source: ${formData.incomeSource || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Monthly Income Amount: $${formData.monthlyIncomeAmount || '0.00'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Customer Personal Details
  page.drawText('CUSTOMER PERSONAL DETAILS:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Title: ${formData.title || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Surname: ${formData.surname || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`First Name(s): ${formData.firstName || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`National ID Number: ${formData.nationalIdNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Date of Birth: ${formData.dateOfBirth || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Gender: ${formData.gender || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Marital Status: ${formData.maritalStatus || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Physical Address: ${formData.physicalAddress || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Country: ${formData.country || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Province: ${formData.province || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`City: ${formData.city || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Landline Number: ${formData.landlineNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Mobile Number: ${formData.mobileNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Email: ${formData.email || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Linked Accounts
  page.drawText('ACCOUNTS TO BE LINKED:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`USD Account Number: ${formData.usdAccountNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`ZWG Account Number: ${formData.zwgAccountNumber || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Amount to be Loaded
  page.drawText('AMOUNT TO BE LOADED:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Amount in Words: ${formData.amountInWords || 'N/A'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight;
  
  page.drawText(`Amount in Figures: $${formData.amountInFigures || '0.00'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Declaration
  page.drawText('DECLARATION:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Agreed to Terms and Conditions: ${formData.hasAgreedToTerms ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Acknowledgement
  page.drawText('ACKNOWLEDGEMENT:', {
    x: margin,
    y: y,
    size: 12,
    font: boldFont,
  });
  
  y -= lineHeight;
  
  page.drawText(`Acknowledged Receipt: ${formData.hasAcknowledgedReceipt ? 'Yes' : 'No'}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  y -= lineHeight * 2;
  
  // Application Date
  page.drawText(`Application Date: ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: y,
    size: 10,
    font,
  });
  
  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

async function sendApplicationEmail(application: any, pdfPath: string) {
  // Email content
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: application.email, // Changed from data.email to application.email
    subject: 'FBC MasterCard Application Confirmation',
    text: `Dear ${application.firstName} ${application.surname},\n\nThank you for submitting your FBC MasterCard application. Your application has been received and is being processed.\n\nApplication Reference: ${application.id}\n\nRegards,\nFBC Bank Limited`,
    html: `<p>Dear ${application.firstName} ${application.surname},</p>
            <p>Thank you for submitting your FBC MasterCard application. Your application has been received and is being processed.</p>
            <p>Application Reference: <strong>${application.id}</strong></p>
            <p>Regards,<br>FBC Bank Limited</p>`,
    attachments: [
      {
        filename: 'application.pdf',
        path: pdfPath
      }
    ]
  };
  
  // Send the email
  return transporter.sendMail(mailOptions);
}