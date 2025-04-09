'use client';

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  CardHeader,
  Icon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Success() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  return (
    <Container maxW="container.md" py={10}>
      <Card boxShadow="lg">
        <CardHeader bg="green.500" color="white" py={6}>
          <Heading size="lg" textAlign="center">Application Submitted Successfully</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} py={8} align="center">
            <Icon as={CheckCircleIcon} w={20} h={20} color="green.500" />
            
            <Text fontSize="xl">
              Thank you for submitting your FBC MasterCard application.
            </Text>
            
            <Box textAlign="center">
              <Text>Your application has been received and is being processed.</Text>
              <Text fontWeight="bold" mt={2}>Application Reference: {id}</Text>
            </Box>
            
            <Text>
              A confirmation email has been sent to your email address with the details of your application.
            </Text>
            
            <Button 
              as={Link} 
              href="/"
              colorScheme="blue" 
              size="lg" 
              mt={4}
            >
              Return to Home
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
}