const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendWelcomeEmail(email) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Task Manager!',
        text: 'Thank you for registering. Welcome aboard!',
        html: '<h1>Welcome!</h1><p>Thank you for registering with Task Manager.</p>',
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent: %s', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  async sendTaskNotification(taskId, userEmail) {
    try {
      setImmediate(async () => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: userEmail,
          subject: `Task Created: ${taskId}`,
          text: `A new task with ID ${taskId} has been created.`,
          html: `<h1>Task Notification</h1><p>A new task with ID <strong>${taskId}</strong> has been created.</p>`,
        };

        const info = await this.transporter.sendMail(mailOptions);
        console.log('Task notification email sent: %s', info.messageId);
      });

      return true;
    } catch (error) {
      console.error('Error queuing task notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;