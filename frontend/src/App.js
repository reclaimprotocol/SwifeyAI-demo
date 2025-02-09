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
  ListItemText,
  CircularProgress
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
  const [isLoading, setIsLoading] = useState(false);

  const availableProviders = {
    'chess.com': <SportsEsports />,
    'Uber': <DirectionsCar />,
    'Amazon': <ShoppingCart />,
    'Reddit': <Forum />,
    'Equinox': <FitnessCenter />,
    'healthify.me': <MonitorHeart />
  };

  async function generateVerificationRequest(provider) {
    setSelectedProvider(provider);
    setIsLoading(true);
    // Clear previous QR code when starting new verification
    setUrl('');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/reclaim/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.WLXxpR08RWvKtIcr6cUkiRY4p_o-fScNUlOqGE-N2UM',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          metadata: {
            email: 'user@example.com'
          },
          provider: provider,
          type: 'identity'
        })
      });

      const result = await response.json();
      
      if (result.data.nextStep?.type === 'GENERATE_PROOF') {
        setUrl(result.data.nextStep.requestUrl);
        checkProofStatus(result.data.nextStep.statusUrl);
      } else {
        toast.error('Invalid response from server');
      }
      
    } catch (error) {
      toast.error('Failed to initialize verification');
      console.error(error);
      setIsLoading(false);
    }
  }

  const checkProofStatus = async (statusUrl) => {
    try {
      const response = await fetch(statusUrl);
      const data = await response.json();

      if (data.session.statusV2 === 'PROOF_SUBMITTED') {
        setIsLoading(false);
        toast.success('Proof generated successfully!');
        return;
      }

      // Check again after 2 seconds if proof is not yet submitted
      setTimeout(() => checkProofStatus(statusUrl), 2000);
    } catch (error) {
      console.error('Error checking proof status:', error);
      setIsLoading(false);
      toast.error('Failed to check proof status');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Swifey AI Verification Platform
        </Typography>
        
        <List sx={{ mb: 4 }}>
          {Object.keys(availableProviders).map((provider) => (
            <ListItem
              key={provider}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                maxWidth: '80%',
                margin: 'auto',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemIcon>
                {availableProviders[provider]}
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

        {(url || isLoading) && (
          <Paper elevation={3} sx={{ p: 1, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              {url ? `Scan QR Code to verify your ${selectedProvider} account` : 'Generating QR Code...'}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              {url ? (
                <QRCode value={url} />
              ) : (
                <CircularProgress />
              )}
              {isLoading && url && (
                <Box sx={{ mt: 2 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 1 }}>
                    Waiting for proof submission...
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </Box>
      <ToastContainer position="bottom-right" />
    </Container>
  );
}

export default App;
