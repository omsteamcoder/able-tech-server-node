export const  mailer =async (req, res) => {
  const { fullname, email, phone, message } = req.body;

  // Basic validation (you should add more robust checks)
  if (!fullname || !email || !message) {
    return res.status(400).json({ status: 'error', message: 'Missing required form fields.' });
  }

  // 3. Setup email data
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address (must match the user in auth)
    to: 'info@abletechengineering.com', // The recipient of the contact form
    subject: `New Contact Form Submission from ${fullname}`,
    html: `
      <h2>Contact Details</h2>
      <p><strong>Name:</strong> ${fullname}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    // 4. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // You can also send a confirmation email back to the user here

    res.status(200).json({ status: 'success', message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message. Please try again later.' });
  }
}