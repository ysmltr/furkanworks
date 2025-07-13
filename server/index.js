import express from 'express';
import dotenv   from 'dotenv';
import path     from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config({ path: path.resolve('./server/.env') });

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://furkanworks.vercel.app' }));
/* statik dosyalar */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '..'))); 
/* POST /api/add → SheetDB */
app.post('/api/add', async (req, res) => {
  try {
    const r = await fetch(
      `https://sheetdb.io/api/v1/${process.env.SHEETDB_ID}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );

    const txt = await r.text();
    console.log('SheetDB status:', r.status, txt);   // <-- log burada

    res.status(r.status).send(txt);
  } catch (err) {
    console.error(err);
    res.status(500).send('proxy-error');
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
