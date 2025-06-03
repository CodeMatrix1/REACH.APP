const axios = require('axios');

exports.handler = async function(event, context) {
  // Get the category query parameter
  const category = event.queryStringParameters?.category;
  const alertsData = new Map();

  // Function to fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/alerts');  // You may need to update this URL for deployment

      const categorizedAlerts = response.data;
      let allAlerts = [];

      for (const category in categorizedAlerts) {
        const alerts = categorizedAlerts[category]?.product?.results || [];
        allAlerts = allAlerts.concat(alerts);
      }

      return allAlerts;
    } catch (error) {
      return { error: 'Error fetching alerts: ' + error.message };
    }
  };

  // Fetch the alerts
  const allAlerts = await fetchAlerts();

  // If an error occurred while fetching alerts
  if (allAlerts.error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: allAlerts.error })
    };
  }

  // Filter the alerts by category if provided
  if (category) {
    const filteredAlerts = allAlerts.filter(alert => alert.category === category);
    return {
      statusCode: 200,
      body: JSON.stringify({ alerts: filteredAlerts })
    };
  }

  // If no category, return all alerts
  return {
    statusCode: 200,
    body: JSON.stringify({ alerts: allAlerts })
  };
};
