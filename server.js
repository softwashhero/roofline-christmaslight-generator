// Roofline Light Designer — relay server
// Forwards image-edit requests to OpenAI server-side so the API key
// never has to live in the browser, and so the browser never has to
// call api.openai.com directly (which blocks all direct browser calls).

import express from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();
const upload = multer(); // in-memory storage

// Allow requests from anywhere. Since this is a personal tool behind your
// own API key, you can lock this down later to your specific domain if you
// ever host the tool somewhere permanent.
app.use(cors());

app.get('/', (req, res) => {
  res.send('Roofline Light Designer relay is running.');
});

app.post('/generate-lights', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'mask', maxCount: 1 },
]), async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY environment variable.' });
    }
    if (!req.files || !req.files.image || !req.files.mask) {
      return res.status(400).json({ error: 'Both "image" and "mask" files are required.' });
    }

    const { model, prompt, size, quality, n } = req.body;

    const imageFile = req.files.image[0];
    const maskFile = req.files.mask[0];

    const form = new FormData();
    form.append('model', model || 'gpt-image-1.5');
    form.append('image', new Blob([imageFile.buffer], { type: imageFile.mimetype || 'image/png' }), 'photo.png');
    form.append('mask', new Blob([maskFile.buffer], { type: maskFile.mimetype || 'image/png' }), 'mask.png');
    form.append('prompt', prompt || '');
    form.append('size', size || '1024x1024');
    form.append('quality', quality || 'medium');
    form.append('n', n || '1');

    const openaiResp = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });

    const data = await openaiResp.json();
    res.status(openaiResp.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Relay listening on port ${PORT}`));
