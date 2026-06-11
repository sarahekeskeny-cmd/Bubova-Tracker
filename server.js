const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = 'https://ocslsxghpsaljtxeaohx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jc2xzeGdocHNhbGp0eGVhb2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODc5MTUsImV4cCI6MjA5Njc2MzkxNX0.XC9ZFNVGclf4roJ5r6CYoDW8M645o3IvY8jOabeKN6A';
const TABLE = 'tracker';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

app.use(express.json());
app.use(express.static('public'));

// GET — load data from Supabase
app.get('/api/data', async (req, res) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.1&select=data`, { headers });
    const rows = await response.json();
    if (rows && rows.length > 0) {
      res.json(JSON.parse(rows[0].data));
    } else {
      res.json({});
    }
  } catch (e) {
    console.error('GET error', e);
    res.status(500).json({ error: 'Could not read data' });
  }
});

// POST — save data to Supabase
app.post('/api/data', async (req, res) => {
  try {
    const payload = JSON.stringify(req.body);
    // Upsert — insert if not exists, update if exists
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id: 1, data: payload })
    });
    if (response.ok) {
      res.json({ ok: true });
    } else {
      const err = await response.text();
      console.error('Supabase error', err);
      res.status(500).json({ error: err });
    }
  } catch (e) {
    console.error('POST error', e);
    res.status(500).json({ error: 'Could not save data' });
  }
});

app.listen(PORT, () => console.log(`Bubova tracker running on port ${PORT}`));
