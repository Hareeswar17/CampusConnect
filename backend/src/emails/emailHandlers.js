import { resendClient, sender } from "../lib/resend.js";
import {
  createTeacherVerificationEmailTemplate,
  createWelcomeEmailTemplate,
} from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to Chatify!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};

export const sendTeacherVerificationEmail = async (email, name, code, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Verify your teacher access",
    html: createTeacherVerificationEmailTemplate(name, code, clientURL),
  });

  if (error) {
    console.error("Error sending teacher verification email:", error);
    throw new Error("Failed to send teacher verification email");
  }

  console.log("Teacher verification email sent successfully", data);
};
