// 1) import dotenv
require('dotenv').config();

// 2) import express
const express = require('express');

// 3) import DB connection
require('./DB/connection');

// 4) import cors
const cors = require('cors');

// 5) import router
const router = require('./routes/router');
const quotationRoutes = require('./routes/quotationRoutes');
const applicationRoute = require('./routes/applicationRoute');
const paymentRoute = require('./routes/paymentRoute');
const adminRoutes=require('./routes/adminRoutes')
// 6) create express server
const pfServer = express();

// 7) use cors in pfServer
pfServer.use(cors());

// 8) use middleware to parse JSON
pfServer.use(express.json());

// 9) use the router
pfServer.use('/', router);

pfServer.use('/', quotationRoutes);
pfServer.use('/', applicationRoute);
pfServer.use('/', paymentRoute);
pfServer.use('/admin', adminRoutes);

// 10) define PORT
const PORT = 5000;

// 11) run the server
pfServer.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
});
