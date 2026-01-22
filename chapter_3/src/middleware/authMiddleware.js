import jwt from 'jsonwebtoken'

function authMiddleware (req, res, next) {
  const token = req.headers['authorization']

  if (!token) {return res.status(401).json({message:'No token provided'})};

  // verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {return res.status(401).json({message:'Invalid token'})}
    // decoded gives core parameters of user, assign to the request

    req.userId = decoded.id;
    next(); // head to the endpoint
    // this is done in middleware since we can reuse this for every authentication endpoint
  })

}

export default authMiddleware;