import nodemailer from 'nodemailer';

// Create email transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development email configuration (Ethereal for testing)
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

// Email templates
export const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Bienvenue sur Chef@Home !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #F59E0B; margin-bottom: 10px;">Bienvenue sur Chef@Home !</h1>
          <p style="color: #6B7280; font-size: 16px;">La plateforme qui connecte gourmets et chefs talentueux</p>
        </div>
        
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #374151;">Bonjour <strong>${userName}</strong>,</p>
          <p style="color: #374151; line-height: 1.6;">
            Merci de vous être inscrit sur Chef@Home. Nous sommes ravis de vous accueillir dans notre communauté culinaire.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            Vous pouvez maintenant explorer nos chefs talentueux et réserver des expériences culinaires exceptionnelles.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">À bientôt,<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  }),

  bookingConfirmation: (booking, chef, client) => ({
    subject: 'Réservation confirmée !',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10B981; margin-bottom: 10px;">Réservation confirmée !</h1>
        </div>
        
        <p style="color: #374151;">Bonjour <strong>${client.name}</strong>,</p>
        <p style="color: #374151; line-height: 1.6;">
          Votre réservation avec le chef <strong>${chef.user.name}</strong> a été confirmée.
        </p>
        
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Détails de la réservation :</h3>
          <table style="width: 100%; color: #374151;">
            <tr><td><strong>Date :</strong></td><td>${new Date(booking.eventDetails.date).toLocaleDateString('fr-FR')}</td></tr>
            <tr><td><strong>Heure :</strong></td><td>${booking.eventDetails.startTime}</td></tr>
            <tr><td><strong>Durée :</strong></td><td>${booking.eventDetails.duration}h</td></tr>
            <tr><td><strong>Invités :</strong></td><td>${booking.eventDetails.guests}</td></tr>
            <tr><td><strong>Montant :</strong></td><td>${booking.pricing.totalAmount}€</td></tr>
          </table>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          Le chef vous contactera prochainement pour finaliser les détails.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">Excellente expérience culinaire !<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  }),

  chefApproval: (chef) => ({
    subject: 'Félicitations ! Votre profil chef a été approuvé',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10B981; margin-bottom: 10px;">Félicitations ! Votre profil chef a été approuvé</h1>
        </div>
        
        <p style="color: #374151;">Bonjour <strong>${chef.user.name}</strong>,</p>
        <p style="color: #374151; line-height: 1.6;">
          Excellente nouvelle ! Votre candidature pour devenir chef partenaire sur Chef@Home a été approuvée.
        </p>
        
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
          <h3 style="color: #065F46; margin-top: 0;">Vous pouvez maintenant :</h3>
          <ul style="color: #374151; line-height: 1.6;">
            <li>Recevoir des demandes de réservation</li>
            <li>Gérer votre planning et vos disponibilités</li>
            <li>Créer vos offres culinaires</li>
            <li>Développer votre clientèle</li>
          </ul>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          Connectez-vous à votre espace chef pour commencer à recevoir vos premières missions.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">Bienvenue dans la famille Chef@Home !<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  }),

  bookingReminder: (booking, isChef = false) => ({
    subject: 'Rappel de prestation - Demain',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin-bottom: 10px;">Rappel de prestation</h1>
        </div>
        
        <p style="color: #374151;">
          Bonjour <strong>${isChef ? booking.chef.user.name : booking.client.name}</strong>,
        </p>
        <p style="color: #374151; line-height: 1.6;">
          Nous vous rappelons que vous avez une prestation prévue demain.
        </p>
        
        <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
          <h3 style="color: #1E40AF; margin-top: 0;">Détails de la prestation :</h3>
          <table style="width: 100%; color: #374151;">
            <tr><td><strong>Date :</strong></td><td>${new Date(booking.eventDetails.date).toLocaleDateString('fr-FR')}</td></tr>
            <tr><td><strong>Heure :</strong></td><td>${booking.eventDetails.startTime}</td></tr>
            <tr><td><strong>Lieu :</strong></td><td>${booking.location.address}, ${booking.location.city}</td></tr>
            <tr><td><strong>Invités :</strong></td><td>${booking.eventDetails.guests} personnes</td></tr>
            ${isChef ? 
              `<tr><td><strong>Client :</strong></td><td>${booking.client.name} - ${booking.client.phone}</td></tr>` :
              `<tr><td><strong>Chef :</strong></td><td>${booking.chef.user.name} - ${booking.chef.user.phone}</td></tr>`
            }
          </table>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          ${isChef ? 
            'N\'hésitez pas à contacter votre client si vous avez des questions.' :
            'Votre chef vous contactera si nécessaire pour les derniers détails.'
          }
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">Excellente prestation !<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  }),

  reviewRequest: (booking) => ({
    subject: 'Évaluez votre expérience culinaire',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #8B5CF6; margin-bottom: 10px;">Comment s'est passée votre expérience ?</h1>
        </div>
        
        <p style="color: #374151;">Bonjour <strong>${booking.client.name}</strong>,</p>
        <p style="color: #374151; line-height: 1.6;">
          Nous espérons que vous avez passé un excellent moment avec le chef <strong>${booking.chef.user.name}</strong>.
        </p>
        
        <div style="background: #F5F3FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6;">
          <p style="color: #374151; margin: 0; line-height: 1.6;">
            Votre avis est précieux pour nous aider à améliorer notre service et pour guider les futurs clients dans leur choix.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Évaluer mon expérience
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">Merci pour votre confiance !<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  }),

  disputeNotification: (dispute, isChef = false) => ({
    subject: 'Nouveau litige signalé',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #EF4444; margin-bottom: 10px;">Litige signalé</h1>
        </div>
        
        <p style="color: #374151;">
          Bonjour <strong>${isChef ? dispute.chef : dispute.client}</strong>,
        </p>
        <p style="color: #374151; line-height: 1.6;">
          Un litige a été signalé concernant votre réservation du ${new Date(dispute.date).toLocaleDateString('fr-FR')}.
        </p>
        
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3 style="color: #991B1B; margin-top: 0;">Motif du litige :</h3>
          <p style="color: #374151; margin: 0;">${dispute.issue}</p>
        </div>
        
        <p style="color: #374151; line-height: 1.6;">
          Notre équipe va examiner cette situation et vous contacter sous 24h pour résoudre ce problème.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6B7280;">Nous nous engageons à résoudre ce litige rapidement.<br><strong>L'équipe Chef@Home</strong></p>
        </div>
      </div>
    `
  })
};

export { createTransporter };