const express = require('express');
const mongoose = require('mongoose');
const route = require('./route/route')
const app = express();
const multer=require('multer')

app.use(express.json());

app.use(multer().any())

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://shivamp2001:shivamp2001@mycluster.au9iv5p.mongodb.net/group13Database', { useNewUrlParser: true })
  .then(() => console.log('MongoDb is connected'))
  .catch(err => console.log(err));

app.use('/', route)

app.use((req, res) => {
  res.status(400).send({ status: false, message: 'Invalid URL' })
})

app.listen( 3000, () => console.log('Express app is running on port 3000'));
