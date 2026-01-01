const cron = require('node-cron');
const RentalTracking = require('../models/RentalTracking');
const { sendNotificationToUser } = require('../config/socket');

// Run every day at 9:00 AM
const startRentalNotificationCron = (io) => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running rental notification cron job...');

    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      // Find all active rentals
      const activeRentals = await RentalTracking.find({
        isCompleted: false,
        returnStatus: 'active',
      })
        .populate('post', 'title')
        .populate('renter', 'name');

      for (const rental of activeRentals) {
        const endDate = new Date(rental.endDate);
        endDate.setHours(0, 0, 0, 0);

        const daysRemaining = Math.ceil(
          (endDate - now) / (1000 * 60 * 60 * 24)
        );

        // Send notification if not sent today
        const lastNotificationDate = rental.lastNotificationSent
          ? new Date(rental.lastNotificationSent)
          : null;
        
        const shouldSendNotification =
          !lastNotificationDate ||
          lastNotificationDate.toDateString() !== now.toDateString();

        if (shouldSendNotification) {
          let notificationTitle = '';
          let notificationMessage = '';
          let notificationType = 'rental_reminder';

          if (daysRemaining < 0) {
            // Overdue
            const daysOverdue = Math.abs(daysRemaining);
            notificationTitle = '⚠️ Rental Overdue';
            notificationMessage = `Your rental "${rental.post.title}" is ${daysOverdue} day(s) overdue. Please return it immediately!`;
            notificationType = 'rental_overdue';

            // Update status to overdue
            rental.returnStatus = 'overdue';
          } else if (daysRemaining === 0) {
            notificationTitle = '🔔 Rental Due Today';
            notificationMessage = `Your rental "${rental.post.title}" is due for return today!`;
          } else if (daysRemaining <= 3) {
            notificationTitle = '⏰ Rental Return Reminder';
            notificationMessage = `Your rental "${rental.post.title}" is due in ${daysRemaining} day(s)`;
          } else if (daysRemaining <= 7) {
            notificationTitle = '📅 Rental Return Reminder';
            notificationMessage = `Your rental "${rental.post.title}" is due in ${daysRemaining} days`;
          } else {
            // Only send for 7 days or less remaining
            continue;
          }

          // Send notification
          await sendNotificationToUser(io, rental.renter._id, {
            recipient: rental.renter._id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            post: rental.post._id,
          });

          // Update last notification sent
          rental.lastNotificationSent = now;
          await rental.save();

          console.log(
            `Sent rental reminder to user ${rental.renter._id} for post ${rental.post._id}`
          );
        }
      }

      console.log('Rental notification cron job completed');
    } catch (error) {
      console.error('Rental notification cron error:', error);
    }
  });

  console.log('Rental notification cron job scheduled (daily at 9:00 AM)');
};

module.exports = { startRentalNotificationCron };