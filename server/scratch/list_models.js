const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // The SDK might have a way to list models.
    // However, we can also try the REST API directly to be sure.
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    // We don't have node-fetch installed probably, let's use standard https
    const https = require('https');

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      method: 'GET'
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => {
        data += d;
      });
      res.on('end', () => {
        console.log('Available Models:');
        try {
            const parsed = JSON.parse(data);
            if (parsed.models) {
                parsed.models.forEach(m => console.log(`- ${m.name}`));
            } else {
                console.log(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
            console.log(data);
        }
      });
    });

    req.on('error', error => {
      console.error(error);
    });

    req.end();

  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
