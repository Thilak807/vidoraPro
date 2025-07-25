import { Router } from 'express';
const router = Router();

// Test endpoint
router.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'Server is working!' });
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    // Your registration logic
    res.status(201).json({ message: 'User registered!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Your login logic
    res.status(200).json({ token: 'sample-token', user: { id: 1, email: req.body.email } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

export default router;

