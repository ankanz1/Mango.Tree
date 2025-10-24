import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3';
import { auth } from '../middlewares/auth';
import { User } from '../models/user';
import { config } from '../config';

const router = Router();
const web3 = new Web3(config.web3Provider);

// Generate nonce for wallet connection
router.post('/nonce', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const normalizedAddress = web3.utils.toChecksumAddress(address);
    
    let user = await User.findOne({ address: normalizedAddress });
    const nonce = uuidv4();

    if (!user) {
      user = new User({
        address: normalizedAddress,
        nonce
      });
      await user.save();
    } else {
      user.nonce = nonce;
      await user.save();
    }

    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ error: 'Error generating nonce' });
  }
});

// Verify signature and authenticate
router.post('/verify', async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: 'Address and signature are required' });
    }

    const normalizedAddress = web3.utils.toChecksumAddress(address);
    const user = await User.findOne({ address: normalizedAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify signature
    const msg = `Mango.Tree Authentication\nNonce: ${user.nonce}`;
    const recoveredAddress = web3.eth.accounts.recover(msg, signature);

    if (normalizedAddress.toLowerCase() !== recoveredAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Generate new nonce for next login
    user.nonce = uuidv4();
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error verifying signature' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-nonce');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

export const authRoutes = router;
