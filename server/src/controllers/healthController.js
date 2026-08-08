export function getHealth(_req, res) {
  res.status(200).json({
    success: true,
    message: 'AI Budget Tracker API is running',
  });
}
