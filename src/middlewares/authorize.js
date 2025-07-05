module.exports = (role) => {
  return (req, res, next) => {
    if (req.user?.type !== role) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }
    next();
  };
};
