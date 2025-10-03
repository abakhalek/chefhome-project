import Notification from '../models/Notification.js';

const toRecipientRoom = (recipient) => {
  if (!recipient) {
    return null;
  }
  if (typeof recipient === 'string') {
    return recipient;
  }
  if (typeof recipient.toString === 'function') {
    return recipient.toString();
  }
  return String(recipient);
};

export const sendNotification = async ({
  io,
  recipient,
  sender,
  type,
  title,
  message,
  data = {},
  actionUrl,
  priority = 'medium',
  channels
}) => {
  const payloadChannels = Array.isArray(channels) && channels.length > 0 ? channels : ['in_app'];

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    data,
    actionUrl,
    priority,
    channels: payloadChannels
  });

  const jsonPayload = notification.toJSON();
  const recipientRoom = toRecipientRoom(recipient);

  if (io && recipientRoom) {
    io.to(`user-${recipientRoom}`).emit('notification:new', jsonPayload);
  }

  return jsonPayload;
};

export const sendNotifications = async ({ io, recipients = [], ...rest }) => {
  const results = [];
  for (const recipient of recipients) {
    const notification = await sendNotification({ io, recipient, ...rest });
    results.push(notification);
  }
  return results;
};

export default {
  sendNotification,
  sendNotifications
};
