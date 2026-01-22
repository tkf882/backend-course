import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js';

const router = express.Router();

// Register a new user endpoint /auth/register
router.post('/register', (req, res) => {
  const {username, password} = req.body;

  // save username and hashed password
  // console.log(username, password);

  // encrypt
  const hashedPassowrd = bcrypt.hashSync(password, 8);

  // save the new user and hashed password to the db
  try {

    const insertUser = db.prepare(`
      INSERT INTO users(username, password)
      VALUES(?, ?)  
    `)
    const result = insertUser.run(username, hashedPassowrd)


    // Add an initial todo
    const defaultTodo = 'Hello, add first todo.';
    const insertTodo = db.prepare(`
      INSERT INTO todos(user_id, task)
      VALUES (?, ?)
    `)
    insertTodo.run(result.lastInsertRowid, defaultTodo);

    // Create a token
    const token = jwt.sign({id: result.lastInsertRowid}, process.env.JWT_SECRET, {expiresIn: '24h'})
    res.json({token});

  } catch(err) {
    console.log(err.message);
    res.sendStatus(503);
  }
})

router.post('/login', (req, res) => {
  // get email and look up password associated with that email in database. Hash the password to comapre.

  const {username, password} = req.body;

  try {
    const getUser = db.prepare(`
      SELECT * FROM users WHERE username = ?  
    `)
    const user = getUser.get(username);
    
    // if no user, return
    if (!user) {return res.status(404).send({message: 'User not found.'})}

    // if password doesn't match, return
    const passwordIsValid = bcrypt.compareSync(password, user.password); // hash the password and compare with hash
    if (!passwordIsValid) {return res.status(401).send({message:'Invalid password'})}

    // successful authorization
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'});
    res.json({token});



  } catch(err) {
    console.log(err.message);
    res.sendStatus(503);
  }


})

export default router;