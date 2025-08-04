const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { email, message } = data;

    // Send email via Brevo API
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'Nimbus AI Contact Form', email: 'contact@nimbusai.com' },
        to: [{ email: 'contact@nimbusai.com' }],
        subject: 'New Contact Form Submission',
        htmlContent: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        }
      }
    );

    // Add contact to Brevo list
    await axios.post(
      'https://api.brevo.com/v3/contacts',
      {
        email: email,
        listIds: [1], // Replace with your actual list ID
        attributes: {
          SOURCE: 'Website Contact Form'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submitted successfully' })
    };
  } catch (error) {
    console.error('Error processing form:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
