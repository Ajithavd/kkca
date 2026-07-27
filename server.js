const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// API endpoint to handle prayer request submissions
app.post('/api/prayer-request', async (req, res) => {
  try {
    const { full_name, mobile, city, prayer_request } = req.body;

    // 1. Validation
    if (!full_name || !mobile || !prayer_request) {
      return res.status(400).json({
        success: false,
        message: "Failed to send prayer request. Required fields are missing."
      });
    }

    // Trim and sanitize inputs slightly (escape HTML tags to prevent injection in emails)
    const sanitize = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    const sName = sanitize(full_name.trim());
    const sMobile = sanitize(mobile.trim());
    const sCity = sanitize(city ? city.trim() : 'Not Provided');
    const sRequest = sanitize(prayer_request.trim());

    // 2. Generate current date and time (IST / India time zone)
    const now = new Date();
    const current_date = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const current_time = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 3. Construct Email Body (Plain Text format requested)
    const emailBody = `A new prayer request has been submitted.

--------------------------------

Name:
${sName}

Mobile:
${sMobile}

City:
${sCity}

Prayer Request:

${sRequest}

--------------------------------

Submitted from KKCA Website

Date:
${current_date}
` + `
Time:
${current_time}`;

    // 4. Check if Gmail credentials are placeholder values
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass || emailUser === 'yourgmail@gmail.com' || emailPass === 'your_google_app_password') {
      console.warn('--- MOCK MODE / DRY RUN ACTIVE ---');
      console.log('Gmail credentials are not configured in .env. Showing email payload below:\n');
      console.log(`To: ${emailUser}`);
      console.log(`Subject: 🙏 New Prayer Request`);
      console.log(`Body:\n${emailBody}`);
      console.log('----------------------------------');
      
      // Return success in mock mode to allow frontend testing without configured email
      return res.status(200).json({
        success: true,
        message: "Prayer request sent successfully."
      });
    }

    // 5. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: emailUser,
    pass: emailPass
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

    // 6. Send the Email
    const mailOptions = {
      from: emailUser,
      to: emailUser, // Send to themselves as requested
      subject: '🙏 New Prayer Request',
      text: emailBody
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Success] Prayer request email sent successfully to ${emailUser}`);

    return res.status(200).json({
      success: true,
      message: "Prayer request sent successfully."
    });

  } catch (error) {
    console.error('[Error sending email via Nodemailer]:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to send prayer request."
    });
  }
});

// Fallback: Route all other requests to index.html for static serving
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
