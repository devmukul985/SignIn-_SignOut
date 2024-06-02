const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');


const app = express();
app.use(bodyParser.urlencoded({extended:true}));


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  //For deployment purpose
  ssl: {
    rejectUnauthorized: false
  }
});


app.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'User could not be created' });
  }
});


app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Sign-in successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sign-in failed' });
  }
});


const PORT = process.env.PORT || 3000;//For deployment purpose
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
