import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email
export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `Chef@Home <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #F59E0B;">Bienvenue sur Chef@Home !</h1>
      <p>Bonjour ${name},</p>
      <p>Merci de vous être inscrit sur Chef@Home. Nous sommes ravis de vous accueillir dans notre communauté culinaire.</p>
      <p>Vous pouvez maintenant explorer nos chefs talentueux et réserver des expériences culinaires exceptionnelles.</p>
      <p>À bientôt,<br>L'équipe Chef@Home</p>
    </div>
  `,

  bookingConfirmation: (booking, chef, client) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #F59E0B;">Réservation confirmée !</h1>
      <p>Bonjour ${client.name},</p>
      <p>Votre réservation avec le chef ${chef.user.name} a été confirmée.</p>
      <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h3>Détails de la réservation :</h3>
        <p><strong>Date :</strong> ${new Date(booking.eventDetails.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> ${booking.eventDetails.startTime}</p>
        <p><strong>Durée :</strong> ${booking.eventDetails.duration}h</p>
        <p><strong>Invités :</strong> ${booking.eventDetails.guests}</p>
        <p><strong>Montant :</strong> ${booking.pricing.totalAmount}€</p>
      </div>
      <p>Le chef vous contactera prochainement pour finaliser les détails.</p>
      <p>Excellente expérience culinaire !<br>L'équipe Chef@Home</p>
    </div>
  `,

  chefApproval: (chef) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10B981;">Félicitations ! Votre profil chef a été approuvé</h1>
      <p>Bonjour ${chef.user.name},</p>
      <p>Excellente nouvelle ! Votre candidature pour devenir chef partenaire sur Chef@Home a été approuvée.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Recevoir des demandes de réservation</li>
        <li>Gérer votre planning</li>
        <li>Développer votre clientèle</li>
      </ul>
      <p>Connectez-vous à votre espace chef pour commencer à recevoir vos premières missions.</p>
      <p>Bienvenue dans la famille Chef@Home !<br>L'équipe Chef@Home</p>
    </div>
  `
};