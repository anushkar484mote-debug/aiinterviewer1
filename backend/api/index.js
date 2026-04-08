const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('../supabase');

const app = express();
app.use(cors());
app.use(express.json());

// Main API Route
app.get('/api', (req, res) => {
    res.json({ message: "InterviewAI API is running" });
});

// Example route to test Supabase connection
app.get('/api/users', async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export for Vercel
module.exports = app;