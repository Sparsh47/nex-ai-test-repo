export function verifyJWT(request, reply, done) {
  // Mock JWT verification - in production this would validate a real JWT
  const authHeader = request.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  // In a real app, you would verify the token here
  // and attach the user to request.user
  request.user = {
    id: '123',
    role: 'user'
  };

  done();
}