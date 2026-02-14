export function getCorsOptions() {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const allowed = [FRONTEND_URL, 'http://localhost:5173', 'https://localhost:5173'];
  return {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  };
}
