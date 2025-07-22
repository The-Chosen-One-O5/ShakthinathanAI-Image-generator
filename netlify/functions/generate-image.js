[⚠️ Suspicious Content] // This is the complete backend code.
// Put this file in: netlify/functions/generate-image.js

const fetch = require('node-fetch');

exports.handler = async function(event) {
    // This is a security check. It only allows the function to be called via a POST request.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { model, prompt, num_images, size } = JSON.parse(event.body);

        // This securely gets your API key from the Netlify settings.
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
             // This check helps debug if the API_KEY is missing in Netlify's settings.
             throw new Error("API key is not set in the serverless function environment.");
        }

        // This calls the actual AI image API.
        const response = await fetch("https://api.infip.pro/v1/images/generations", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ model, prompt, num_images, size })
        });
        
        const data = await response.json();

        // This checks if the AI API itself returned an error.
        if (!response.ok) {
            const errorMessage = data?.error?.message || `The AI API returned an error with status: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        // If everything is successful, send the image data back to your React app.
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // If any error happens in our function, send back a clean JSON error message.
        // This prevents the "<!DOCTYPE" error.
        console.error("Serverless Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
