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
      const user = await prisma.User.findUnique({
        where: { id: decoded.id },
      });
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

module.exports = { protect };
