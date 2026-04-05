import emailjs from 'emailjs-com';

/**
 * Sends a trip update email using EmailJS.
 * You will need to provide your Service ID, Template ID, and Public Key for this to work in production.
 * @param {Object} tripData - The complete trip state to be sent.
 * @param {string} userEmail - Destination email address.
 * @param {string} updateType - label e.g., 'Route Change' or 'Periodic Update'.
 */
export const sendTripUpdate = async (tripData, userEmail, updateType = 'Periodic Update') => {
  if (!userEmail) {
    console.warn('No user email defined for trip updates.');
    return;
  }

  // Format the data for the EmailJS template
  const templateParams = {
    email: userEmail,
    name: 'Traveler', // Or a user name if available
    title: `${tripData.origin} to ${tripData.destination}`,
    update_type: updateType,
    last_updated: new Date().toLocaleString(),
    details: `
      Route: ${tripData.origin} to ${tripData.destination}
      Total Distance: ${tripData.distance}
      Duration: ${tripData.duration}
      Number of People: ${tripData.numPersons}
      
      Budget Breakdown:
      - Fuel: Rs. ${tripData.fuelCost?.toLocaleString() || 0}
      - Hotels: Rs. ${tripData.totalHotels?.toLocaleString() || 0}
      - Food: Rs. ${tripData.totalFood?.toLocaleString() || 0}
      - Total: Rs. ${tripData.grandTotal?.toLocaleString() || 0}
      - Cost Per Person: Rs. ${tripData.perPerson?.toLocaleString() || 0}
    `.trim()
  };

  try {
    const result = await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || 'default_service',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_paktrip',
      templateParams,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'user_placeholder'
    );
    console.log('Trip update email sent successfully:', result.text);
    return result;
  } catch (error) {
    console.error('Failed to send trip update email:', error);
    // Suppress error in dev if keys are not set
    if (import.meta.env.DEV) return;
    throw error;
  }
};
