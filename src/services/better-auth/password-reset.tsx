import * as React from 'react';
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';

interface PasswordResetEmailProps {
    name?: string;
    resetUrl: string;
}

const PasswordResetEmail = ({ name = 'there', resetUrl }: PasswordResetEmailProps) => {
    const currentYear = new Date().getFullYear();

    return (
        <Html>
            <Head />
            <Preview>Reset your password - Action required</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white  rounded-[8px] mx-auto p-[20px] max-w-[600px]">
                        <Section>
                            <Heading className="text-[24px] font-bold text-gray-800 m-0 mb-[16px]">
                                Password Reset Request
                            </Heading>
                            <Text className="text-[16px] text-gray-600 mb-[24px]">
                                Hi {name},
                            </Text>
                            <Text className="text-[16px] text-gray-600 mb-[24px]">
                                We received a request to reset your password. Click the button below to create a new password:
                            </Text>
                            <Section className="text-center my-[32px]">
                                <Button
                                    className="bg-gray-900 text-white font-bold no-underline text-center px-[24px] py-[16px] rounded-[8px] box-border"
                                    href={resetUrl}
                                >
                                    Reset Password
                                </Button>
                            </Section>
                            <Text className="text-[16px] text-gray-600 mb-[24px]">
                                If you didn&apos;t request a password reset, you can safely ignore this email. Your password will remain unchanged.
                            </Text>
                            <Text className="text-[14px] text-gray-500 mb-[24px]">
                                For security reasons, this link will expire in 1 hour.
                            </Text>
                            <Text className="text-[16px] text-gray-600">
                                Best regards,<br />
                                The Team
                            </Text>
                        </Section>
                        <Hr className="border-gray-200 my-[24px]" />
                        <Section>
                            <Text className="text-[14px] text-gray-500 m-0">
                                © {currentYear} Our Company. All rights reserved.
                            </Text>
                            <Text className="text-[14px] text-gray-500 m-0">
                                123 Main St, Anytown, AT 12345
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

PasswordResetEmail.PreviewProps = {
    name: 'Sarah',
    resetUrl: 'https://example.com/reset-password?token=abc123',
};

export default PasswordResetEmail;
