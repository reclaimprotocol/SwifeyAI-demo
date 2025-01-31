import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { 
  Button, 
  Container, 
  Typography, 
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  SportsEsports, // for Chess.com
  DirectionsCar, // for Uber
  ShoppingCart, // for Amazon
  Forum, // for Reddit
  FitnessCenter, // for Equinox
  MonitorHeart // for healthify.me
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const backendURL = 'http://localhost:3002/verifications/proof'; // Replace with your webhook URL

  const providers = {
    'chess.com': '7c9303b3-8e1c-405b-b3d7-d9eaf114d2ce',
    'Uber': 'e3e51528-5da9-433c-a266-96716d363012',
    'Amazon': 'f5766218-a1d4-4f53-b32f-4c00efd7f56c',
    'Reddit': 'fdaea3c3-86af-459a-bb21-1b6b90146766',
    'Equinox': 'equinox-provider-id',
    'healthify.me': 'f109ae82-3546-4536-a41b-64243b838009'
  };

  const providerIcons = {
    'chess.com': <SportsEsports />,
    'Uber': <DirectionsCar />,
    'Amazon': <ShoppingCart />,
    'Reddit': <Forum />,
    'Equinox': <FitnessCenter />,
    'healthify.me': <MonitorHeart />
  };

  async function generateVerificationRequest(provider) {
    setSelectedProvider(provider);
    
    try {
      // First, initialize verification with the backend
      const response = await fetch('http://localhost:3002/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            email: 'user@example.com' // You might want to make this dynamic
          },
          provider: provider,
          type: 'identity'
        })
      });

      const data = await response.json();
      
      if (data.nextStep?.type === 'GENERATE_PROOF') {
        setUrl(data.nextStep.requestUrl);
      } else {
        toast.error('Invalid response from server');
      }
      
    } catch (error) {
      toast.error('Failed to initialize verification');
      console.error(error);
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Swifey AI Verification Platform
        </Typography>
        
        <List sx={{ mb: 4 }}>
          {Object.keys(providers).map((provider) => (
            <ListItem
              key={provider}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                {providerIcons[provider]}
              </ListItemIcon>
              <ListItemText primary={provider} />
              <Button
                variant="contained"
                onClick={() => generateVerificationRequest(provider)}
                sx={{ ml: 2 }}
              >
                Verify
              </Button>
            </ListItem>
          ))}
        </List>

        {url && (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Scan QR Code to verify your {selectedProvider} account
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <QRCode value={url} />
            </Box>
          </Paper>
        )}
      </Box>
      <ToastContainer position="bottom-right" />
    </Container>
  );
}

export default App;
