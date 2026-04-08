const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('../supabase');

const app = express();
app.use(cors());
app.use(express.json());

// Example route to test Supabase connection
app.get('/', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error });
    res.json(data);
});

module.exports.handler = serverless(app);