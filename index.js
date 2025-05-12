const express = require('express');
const fs=require('fs');
const path = require('path');
const app = express();
const multer=require('multer');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const port = 3000;
const session = require('express-session');
const cors=require('cors');
const db = new sqlite3.Database('db.sqlite3');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    itemname TEXT,
    mfg_date DATE,
    exp_date DATE,
    barcode number,
    FOREIGN KEY (username) REFERENCES users(username)
  )`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);
});

// Middleware
app.use(session({
  secret: 'smartstock-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure:false , sameSite:'lax'}
}));
//for alert generation
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

var users = {
'palabindelabhanuprakash@gmail.com':'qwert123','oilpuller@gmail.com': '123','aljihadh@gmail.com':'786','abcd@gmail.com':'a1b2c3'
 };

// API to fetch logged-in username
app.get('/api/profile', (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  const displayName = req.session.username.replace('@gmail.com', '');
  res.json({ username: displayName });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "login.html"), (err) => {
    if (err) res.status(500).send('Error loading page');
  });
});

// app.get('/',function(req,res){
  //   res.render('login');
  // });
  app.get('/sorry',(req,res)=>{
    res.send('<h2>Sorry :) can\'t help<h2> <form action="/" method="GET"><button type="submit">login again</button></form>')
  });
  
  
  app.post('/checklogin', (req, res) => {
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).send('DB error');
      }
      if (!row) {
        return res.status(401).send('User does not exist <form action="/" method="GET"><button type="submit">login again</button></form>');
      }
      if (row.password !== password) {
        return res.status(401).send('Incorrect password <form action="/" method="GET"><button type="submit">login again</button></form>');
      }
      req.session.username = username;
      //redirect to React dashboard route
      res.redirect('http://localhost:5173/');
    });
    // if (!users[username]) {
    //   return res.status(401).send('User does not exist <form action="/" method="GET"><button type="submit">login again</button></form>');
    // }
    
    // if (users[username] !== password) {
    //   return res.status(401).send('Incorrect password <form action="/" method="GET"><button type="submit">login again</button></form>');
    // }
    
    // req.session.username = username;
    
    // //redirect to React dashboard route
    // res.redirect('http://localhost:5173/');
    
  });
  app.use('/react-dashboard', express.static(path.join(__dirname, 'frontend')));
  app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'signup.html'), (err) => {
      if (err) res.status(500).send('Error loading page');
    });
  });

  app.post('/checksignup', (req, res) => {
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], (err, row) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).send('DB error');
      }
      if (row) {
        return res.status(401).send('User already exists <form action="/signup" method="GET"><button type="submit">signup again</button></form>');
      }
      const insertSql = `INSERT INTO users (username, password) VALUES (?, ?)`;
      db.run(insertSql, [username, password], function(err) {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).send('DB error');
        }
        req.session.username = username;
        res.redirect('http://localhost:5173/');
      });
    });
  });
  
  app.post('/add_item_manual_way', (req, res) => {
    const { name, mfg_date, exp_date } = req.body;

  const sql = `INSERT INTO items (name, mfg_date, exp_date) VALUES (?, ? , ?)`;
  db.run(sql, [name, mfg_date, exp_date], function (err) {
    if (err) return res.status(500).send('DB insert failed');
    res.send(`<h3>Item added successfully!</h3><a href="http://localhost:5173/additem">Add another</a>`);
  });
});
// ========== Image Upload ==========
//old way
app.post('/add_item_image_way', upload.fields([{ name: 'front' }, { name: 'label' }]), async (req, res) => {
  try {
    const frontImagePath = req.files['front'][0].path;
    const labelImagePath = req.files['label'][0].path;
    console.log(req.files);
    const frontImageBase64 = fs.readFileSync(frontImagePath, { encoding: 'base64' });
    const labelImageBase64 = fs.readFileSync(labelImagePath, { encoding: 'base64' });
    // Send images to PythonAnywhere ML API
    const mlResponse = await axios.post('http://127.0.0.1:5000/extract', {
      // Replace with your ML API's format:
      front: frontImageBase64,
      label: labelImageBase64
    });
    
    const { product_name, mfg_date, exp_date } = mlResponse.data;
    console.log(product_name, mfg_date, exp_date);
    
    // Clean up files
    fs.unlinkSync(frontImagePath);
    fs.unlinkSync(labelImagePath);
    //res to react
    res.json({
      product_name,
      mfg_date,
      exp_date
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to process image or connect to ML model.');
  }
});
//get items
app.get('/get_items', (req, res) => {
  const sql = "SELECT * FROM items ORDER BY exp_date DESC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).send('Failed to retrieve items');
    res.json(rows);
  });
});
//delete items
app.post('/remove_item', (req, res) => {
  const { id } = req.body;
  // console.log(req.body);
  const sql = `DELETE FROM items WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ success: false });
    if (this.changes === 0) {
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

// Check Username Availability (API Endpoint)
app.get('/check-username', (req, res) => {
  const { username } = req.query;
  res.json({ available: !users[username] });
});

// Signup Form Submission
app.post('/checksignup', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username]) {
    return res.status(400).send('Username already taken');
  }
  
  users[username] = password; // Store user (in memory)
  res.send('Account created successfully! <button a=\'/login\'>Click for login</button>');
});


//for sending email
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'palabindelabhanuprakash@gmail.com',        // your sender email
    pass: 'oaca gnow zvbr hfus'            // Gmail App Password
  }
});

//func
function sendEmail(subject, text, recipientEmail) {
  let mailOptions = {
    from: '> Team Smart_Stock\nGrocery-Management-System <',
    to: recipientEmail,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error('Email failed:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
//check for expiry
function checkAndSendExpiryAlerts() {
  const email = 'vinaymarri419@gmail.com';
  const username = 'Palabindelabhanuprakash';

  db.all(`SELECT id, name, exp_date FROM items`, [], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return;
    }

    const today = new Date();
    const itemsWithDiff = rows.map(item => {
      const expDate = new Date(item.exp_date);
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...item, diffDays };
    });

    let messageParts = [];

    // 7 days category
    let items7Days = itemsWithDiff.filter(item => item.diffDays > 4 && item.diffDays <= 7);
    if (items7Days.length) {
      messageParts.push(`The following items will expire in 7 days:\n` +
        items7Days.map(item => `id number: ${item.id} -> item name: ${item.name}\n`).join(', ') +
        `\nSell them as soon as possible.\n`);
    }


    let items4Days = itemsWithDiff.filter(item => item.diffDays > 2 && item.diffDays <= 4);
    if (items4Days.length) {
      messageParts.push(`The following items expire in 4 days:\n` +
        items4Days.map(item => `id number: ${item.id} -> item name:${item.name}\n`).join(', ') +
        `\nSell them with a maximum discount of 30%.\n`);
    }


    let items2Days = itemsWithDiff.filter(item => item.diffDays >= 0 && item.diffDays <= 2);
    if (items2Days.length) {
      messageParts.push(`The following items expire in 2 days:\n` +
        items2Days.map(item => `id number: ${item.id} -> item name: ${item.name}\n`).join(', ') +
        `\nSell them with a maximum discount of 45%.\n`);
    }

    // expired items
    let expiredItems = itemsWithDiff.filter(item => item.diffDays < 0);
    if (expiredItems.length) {
      messageParts.push(`The following items are expired:\n` +
        expiredItems.map(item => `id number:${item.id} -> item name: ${item.name}\n`).join(', ') +
        `\nRemove them immediately.\n`);

      // Delete expired items from database
      const expiredIds = expiredItems.map(item => item.id);
      const placeholders = expiredIds.map(() => '?').join(',');
      db.run(`DELETE FROM items WHERE id IN (${placeholders})`, expiredIds, function(deleteErr) {
        if (deleteErr) {
          console.error('Failed to delete expired items:', deleteErr);
        } else {
          console.log(`${this.changes} expired items removed from the database.`);
        }
      });
    }

    // If any relevant messages, send the mail
    if (messageParts.length > 0) {
      const finalMessage = `Hey ${username},\n\n` + messageParts.join('\n');
      sendEmail('Smart_Stock Expiry Alert', finalMessage, email);
    } else {
      console.log('No expiring items found — no email sent.');
    }
  });
}

// Run this every 6 hours (adjust as needed)
setInterval(checkAndSendExpiryAlerts, 6 * 60 * 60 * 1000); // 6 hours

checkAndSendExpiryAlerts();


app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Server error:', err);
});