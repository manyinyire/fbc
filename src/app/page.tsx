'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  VStack,
  HStack,
  Checkbox,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Flex,
  Image as ChakraImage,
  Divider as ChakraDivider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Radio,
  RadioGroup,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormInputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {}

export default function Home() {
  const toast = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicationStatus: 'New Card',
    branch: '',
    applicationDate: new Date().toISOString().split('T')[0],
    cardType: '',
    title: '',
    firstName: '',
    surname: '',
    nationalIdNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    physicalAddress: '',
    country: 'Zimbabwe',
    province: '',
    city: '',
    landlineNumber: '',
    mobileNumber: '',
    email: '',
    usdAccountNumber: '',
    zwgAccountNumber: '',
    amountInWords: '',
    amountInFigures: '',
    incomeSource: '',
    incomeOutline: '',
    monthlyIncomeAmount: '',
    hasNationalIdentity: false,
    hasValidPassport: false,
    hasPassportPhoto: false,
    hasProofOfResidence: false,
    hasPayslip: false,
    identityNumber: '',
    hasAgreedToTerms: false,
    hasAcknowledgedReceipt: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: FormSubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Application submitted.',
          description: 'Your application has been successfully submitted.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Redirect to success page or clear form
        router.push(`/success?id=${data.id}`);
      } else {
        toast({
          title: 'Submission failed.',
          description: data.error || 'An error occurred while submitting your application.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission failed.',
        description: 'An error occurred while submitting your application.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" py={10}>
      <Card mb={8} boxShadow="lg">
        <CardHeader bg="brand.700" color="white" py={4}>
          <Flex justify="space-between" align="center">
            <Heading size="lg">FBC MASTERCARD APPLICATION</Heading>
            <ChakraImage 
              src="/fbc-logo.png" 
              alt="FBC Logo" 
              height="50px" 
              fallback={<Box bg="gray.200" width="150px" height="50px" display="flex" alignItems="center" justifyContent="center">FBC BANK</Box>} 
            />
          </Flex>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing="8" align="stretch">
              {/* Application Status Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">CARD APPLICATION STATUS</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={6}>
                  <FormControl isRequired>
                    <FormLabel>Application Status</FormLabel>
                    <Select 
                      name="applicationStatus" 
                      value={formData.applicationStatus}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    >
                      <option value="New Card">New Card</option>
                      <option value="Replacement Card">Replacement Card</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Branch</FormLabel>
                    <Input 
                      name="branch" 
                      value={formData.branch}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
                
                {formData.applicationStatus === 'Replacement Card' && (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacingX={6} spacingY={6} mt={4}>
                    <FormControl>
                      <FormLabel>Old Card Number</FormLabel>
                      <Input 
                        name="oldCardNumber" 
                        value={formData.oldCardNumber || ''}
                        onChange={handleChange}
                        bg="white"
                        borderColor="gray.300"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Replacement Reason</FormLabel>
                      <Input 
                        name="replacementReason" 
                        value={formData.replacementReason || ''}
                        onChange={handleChange}
                        bg="white"
                        borderColor="gray.300"
                      />
                    </FormControl>
                  </SimpleGrid>
                )}
              </Box>
              
              <Divider />
              
              {/* Card Type Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">TYPE OF CARD</Heading>
                <FormControl isRequired>
                  <FormLabel>Card Type</FormLabel>
                  <Select 
                    name="cardType" 
                    value={formData.cardType}
                    onChange={handleChange}
                    bg="white"
                    borderColor="gray.300"
                  >
                    <option value="">Select Card Type</option>
                    <option value="World Black Debit">World Black Debit</option>
                    <option value="Platinum Debit">Platinum Debit</option>
                    <option value="Gold Debit">Gold Debit</option>
                    <option value="Standard Debit">Standard Debit</option>
                  </Select>
                </FormControl>
              </Box>
              
              <Divider />
              
              {/* Documents Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">DOCUMENTS SUPPLIED BY CARDHOLDER</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="start" spacing={3}>
                    <Checkbox 
                      name="hasNationalIdentity" 
                      isChecked={formData.hasNationalIdentity}
                      onChange={handleChange}
                      colorScheme="blue"
                    >
                      National Identity
                    </Checkbox>
                    
                    <Checkbox 
                      name="hasValidPassport" 
                      isChecked={formData.hasValidPassport}
                      onChange={handleChange}
                      colorScheme="blue"
                    >
                      Passport (valid)
                    </Checkbox>
                    
                    <Checkbox 
                      name="hasPassportPhoto" 
                      isChecked={formData.hasPassportPhoto}
                      onChange={handleChange}
                      colorScheme="blue"
                    >
                      Passport Photo
                    </Checkbox>
                  </VStack>
                  
                  <VStack align="start" spacing={3}>
                    <Checkbox 
                      name="hasProofOfResidence" 
                      isChecked={formData.hasProofOfResidence}
                      onChange={handleChange}
                      colorScheme="blue"
                    >
                      Proof of Residence
                    </Checkbox>
                    
                    <Checkbox 
                      name="hasPayslip" 
                      isChecked={formData.hasPayslip}
                      onChange={handleChange}
                      colorScheme="blue"
                    >
                      Payslip
                    </Checkbox>
                    
                    <FormControl>
                      <FormLabel>Identity Number</FormLabel>
                      <Input 
                        name="identityNumber" 
                        value={formData.identityNumber}
                        onChange={handleChange}
                        bg="white"
                        borderColor="gray.300"
                      />
                    </FormControl>
                  </VStack>
                </SimpleGrid>
              </Box>
              
              <Divider />
              
              {/* Income Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">SOURCE OF INCOME</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Income Outline</FormLabel>
                    <Input 
                      name="incomeOutline" 
                      value={formData.incomeOutline}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Source</FormLabel>
                    <Input 
                      name="incomeSource" 
                      value={formData.incomeSource}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Monthly Income Amount</FormLabel>
                    <Input 
                      name="monthlyIncomeAmount" 
                      value={formData.monthlyIncomeAmount}
                      onChange={handleChange}
                      type="number"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              <Divider />
              
              {/* Personal Details Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">CUSTOMER PERSONAL DETAILS</Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Select 
                      name="title" 
                      value={formData.title}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    >
                      <option value="">Select Title</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>First Name(s)</FormLabel>
                    <Input 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Surname</FormLabel>
                    <Input 
                      name="surname" 
                      value={formData.surname}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={4}>
                  <FormControl isRequired>
                    <FormLabel>National ID Number</FormLabel>
                    <Input 
                      name="nationalIdNumber" 
                      value={formData.nationalIdNumber}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input 
                      name="dateOfBirth" 
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      type="date"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup 
                      name="gender" 
                      value={formData.gender}
                      onChange={(value) => setFormData({...formData, gender: value})}
                    >
                      <Stack direction="row">
                        <Radio value="Male" colorScheme="blue">Male</Radio>
                        <Radio value="Female" colorScheme="blue">Female</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
                  <FormControl isRequired>
                    <FormLabel>Marital Status</FormLabel>
                    <Select 
                      name="maritalStatus" 
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Physical Address</FormLabel>
                    <Textarea 
                      name="physicalAddress" 
                      value={formData.physicalAddress}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={4}>
                  <FormControl isRequired>
                    <FormLabel>Country</FormLabel>
                    <Input 
                      name="country" 
                      value={formData.country}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Province</FormLabel>
                    <Input 
                      name="province" 
                      value={formData.province}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>City</FormLabel>
                    <Input 
                      name="city" 
                      value={formData.city}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mt={4}>
                  <FormControl>
                    <FormLabel>Landline Number</FormLabel>
                    <Input 
                      name="landlineNumber" 
                      value={formData.landlineNumber}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Mobile Number</FormLabel>
                    <Input 
                      name="mobileNumber" 
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              <Divider />
              
              {/* Linked Accounts Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">ACCOUNTS TO BE LINKED</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>USD Account Number</FormLabel>
                    <Input 
                      name="usdAccountNumber" 
                      value={formData.usdAccountNumber}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>ZWG Account Number</FormLabel>
                    <Input 
                      name="zwgAccountNumber" 
                      value={formData.zwgAccountNumber}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              <Divider />
              
              {/* Amount Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">AMOUNT TO BE LOADED</Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Amount in Words</FormLabel>
                    <Input 
                      name="amountInWords" 
                      value={formData.amountInWords}
                      onChange={handleChange}
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Amount in Figures</FormLabel>
                    <Input 
                      name="amountInFigures" 
                      value={formData.amountInFigures}
                      onChange={handleChange}
                      type="number"
                      bg="white"
                      borderColor="gray.300"
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>
              
              <Divider />
              
              {/* Declaration Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">DECLARATION</Heading>
                <FormControl isRequired>
                  <Checkbox 
                    name="hasAgreedToTerms" 
                    isChecked={formData.hasAgreedToTerms}
                    onChange={handleChange}
                    colorScheme="blue"
                    size="lg"
                  >
                    I agree to the terms and conditions
                  </Checkbox>
                </FormControl>
              </Box>
              
              <Divider />
              
              {/* Acknowledgement Section */}
              <Box>
                <Heading size="md" mb={4} color="brand.700">ACKNOWLEDGEMENT</Heading>
                <FormControl isRequired>
                  <Checkbox 
                    name="hasAcknowledgedReceipt" 
                    isChecked={formData.hasAcknowledgedReceipt}
                    onChange={handleChange}
                    colorScheme="blue"
                    size="lg"
                  >
                    I acknowledge receipt of the card
                  </Checkbox>
                </FormControl>
              </Box>
              
              <Button 
                type="submit" 
                colorScheme="blue" 
                size="lg" 
                isLoading={isSubmitting}
                loadingText="Submitting"
                mt={4}
              >
                Submit Application
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
}
