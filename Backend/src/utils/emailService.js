import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendNewChapterNotification = async (subscribers, novel, chapter) => {
  const emails = subscribers.map(sub => sub.email).filter(Boolean);
  
  if (emails.length === 0) return;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    bcc: emails,
    subject: `Bab Baru: ${novel.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bab Baru Tersedia!</h1>
        <h2>${novel.title}</h2>
        <p>Bab ${chapter.number}: ${chapter.title}</p>
        <p>Segera baca sekarang!</p>
        <a href="${process.env.FRONTEND_URL}/novel/${novel.slug}/${chapter.number}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Baca Sekarang
        </a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notifications sent');
  } catch (error) {
    console.error('Email error:', error);
  }
};

export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Selamat Datang di NovelHub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Selamat Datang, ${user.username}!</h1>
        <p>Terima kasih telah bergabung dengan NovelHub.</p>
        <p>Mulai jelajahi ribuan novel menarik sekarang!</p>
        <a href="${process.env.FRONTEND_URL}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Jelajahi Novel
        </a>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Welcome email error:', error);
  }
};