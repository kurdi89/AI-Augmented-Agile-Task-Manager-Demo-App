const jwt = require('jsonwebtoken');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      // if token is expired or invalid, we still want to continue to the next middleware
      // so that unauthenticated users can still access public routes
      next();
    }
  } else {
    next();
  }
};

module.exports = { protect };
