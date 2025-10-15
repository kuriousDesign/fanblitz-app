"use server";

import { Resend } from 'resend';
import { getCurrentPlayer } from "./getActions";

export const sendEmailInvite = async (email: string): Promise<void> => {
  // Get the current player
  const player = await getCurrentPlayer();
  if (!player || !player._id) {
    //return { success: false, error: "No player found" };
  }

  const emailSubject = `FanBlitz Invite from ${player.name || "a friend"}`;
  const emailBody = `
    <h1>Join FanBlitz!</h1>
    <p>Join FanBlitz and start making your game picks for a chance to win $100,000! It's free to play and easy to get started.</p>
    <p><a href="https://fanblitz.app/sign-up">Click here to sign up</a> and start playing today!</p>
    <p>Best,<br/>The FanBlitz Team</p>
  `;

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "FanBlitz <gardner.761@gmail.com>",
      to: email,
      subject: emailSubject,
      html: emailBody,
    });
    //return { success: true };
    console.log("Email sent successfully to", email);
  } catch (error) {
    console.error("Failed to send email:", error);
    //return { success: false, error: "Failed to send email" };
  }
};