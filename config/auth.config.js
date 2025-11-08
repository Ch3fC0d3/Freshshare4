// Ensure JWT_SECRET is configured in environment variables
// On Railway, env vars are injected directly, not from .env file
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error('FATAL: JWT_SECRET environment variable is not set!');
    console.error('Please configure JWT_SECRET in Railway environment variables or .env file for security.');
    console.error('Current NODE_ENV:', process.env.NODE_ENV);
    console.error('Available env vars:', Object.keys(process.env).filter(k => !k.includes('SECRET')).join(', '));
    process.exit(1);
  }
  
  return secret;
};

module.exports = {
  secret: getJWTSecret()
};
