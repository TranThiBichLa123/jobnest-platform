package com.jobnest.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.url}")
    private String appUrl;

    public void sendVerificationEmail(String toEmail, String verificationToken) {
        try {
            String subject = "Verify Your JobNest Account";
            String verificationLink = appUrl + "/verify-email?token=" + verificationToken;
            
            String htmlContent = buildVerificationEmailTemplate(toEmail, verificationLink);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            
            // Also log to console for development
            System.out.println("==============================================");
            System.out.println("VERIFICATION EMAIL SENT");
            System.out.println("To: " + toEmail);
            System.out.println("Link: " + verificationLink);
            System.out.println("==============================================");
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            // Log the verification link to console as fallback
            System.out.println("==============================================");
            System.out.println("EMAIL SENDING FAILED - VERIFICATION LINK");
            System.out.println("User: " + toEmail);
            System.out.println("Link: " + appUrl + "/verify-email?token=" + verificationToken);
            System.out.println("==============================================");
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String subject = "Reset Your JobNest Password";
            String resetLink = appUrl + "/reset-password?token=" + resetToken;
            
            String htmlContent = buildPasswordResetEmailTemplate(toEmail, resetLink);
            
            sendHtmlEmail(toEmail, subject, htmlContent);
            
            System.out.println("==============================================");
            System.out.println("PASSWORD RESET EMAIL SENT");
            System.out.println("To: " + toEmail);
            System.out.println("Link: " + resetLink);
            System.out.println("==============================================");
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            System.out.println("==============================================");
            System.out.println("EMAIL SENDING FAILED - RESET LINK");
            System.out.println("User: " + toEmail);
            System.out.println("Link: " + appUrl + "/reset-password?token=" + resetToken);
            System.out.println("==============================================");
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    private String buildVerificationEmailTemplate(String email, String verificationLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0e7490; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #0e7490; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to JobNest!</h1>
                    </div>
                    <div class="content">
                        <h2>Email Verification Required</h2>
                        <p>Hi there,</p>
                        <p>Thank you for registering with JobNest! To complete your registration and start exploring amazing job opportunities, please verify your email address by clicking the button below.</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button" style="color: white !important;">Verify Email Address</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0e7490;">%s</p>
                        <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
                        <p>If you didn't create an account with JobNest, you can safely ignore this email.</p>
                        <p>Best regards,<br>The JobNest Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 JobNest. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(verificationLink, verificationLink);
    }

    private String buildPasswordResetEmailTemplate(String email, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0e7490; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .button { display: inline-block; padding: 12px 30px; background-color: #0e7490; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>Hi there,</p>
                        <p>We received a request to reset your JobNest password. Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="%s" class="button" style="color: white !important;">Reset Password</a>
                        </p>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0e7490;">%s</p>
                        <p><strong>Note:</strong> This reset link will expire in 1 hour.</p>
                        <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                        <p>Best regards,<br>The JobNest Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2025 JobNest. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(resetLink, resetLink);
    }
}
