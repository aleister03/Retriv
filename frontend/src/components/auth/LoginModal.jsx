import { useContext, useState } from 'react';
import { Modal, Button, TextInput, Divider, Text, Box } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { ThemeContext } from '../../context/ThemeContext';
import { showError } from '../../utils/notifications';
import axios from 'axios';

export default function LoginModal({ opened, onClose }) {
  const { theme, colors } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleEmailContinue = async () => {
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/email-login', {
        email: email.toLowerCase(),
      });

      const { token, user, isNewUser } = response.data;
      window.location.href = `/auth/success?token=${token}&name=${encodeURIComponent(user.name)}&email=${user.email}&profilePicture=${encodeURIComponent(user.profilePicture || '')}&isNewUser=${isNewUser}`;
    } catch (error) {
      console.error('Email login error:', error);
      showError('Login Failed', error.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="md"
      padding="xl"
      radius="lg"
      withCloseButton={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          background: theme === 'light' ? colors.surface : colors.background,
          border: `1px solid ${colors.borders}`,
        },
      }}
    >
      <Box style={{ textAlign: 'center', padding: '1.5rem 0' }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Box
            style={{
              background: colors.primaryAccent,
              borderRadius: '12px',
              padding: '10px 14px',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              marginRight: '0.7rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            R
          </Box>
          <Box style={{ textAlign: 'left' }}>
            <Text fw={700} style={{ color: colors.textPrimary, fontSize: '1.5rem' }}>
              Retriv
            </Text>
            <Text fw={500} style={{ color: colors.textSecondary, fontSize: '0.85rem', letterSpacing: '0.2px' }}>
              Find · Trade · Connect
            </Text>
          </Box>
        </Box>
        <Text
          fw={700}
          style={{
            fontSize: '2rem',
            color: colors.textPrimary,
            marginBottom: '0.5rem',
          }}
        >
          Welcome back!
        </Text>

        <Text
          style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            marginBottom: '2rem',
          }}
        >
          Log in to your account
        </Text>
        <Button
          leftSection={<IconBrandGoogle size={20} />}
          variant="default"
          fullWidth
          size="lg"
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            marginBottom: '1.5rem',
            background: theme === 'light' ? colors.elevatedSurface : colors.surface,
            color: colors.textPrimary,
            border: `1px solid ${colors.borders}`,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          Continue with Google
        </Button>
        <Divider
          label="or"
          labelPosition="center"
          style={{
            marginBottom: '1.5rem',
            color: colors.textSecondary,
          }}
        />
        <TextInput
          placeholder="Email"
          size="lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleEmailContinue()}
          disabled={loading}
          style={{
            marginBottom: '1rem',
          }}
          styles={{
            input: {
              background: theme === 'light' ? colors.elevatedSurface : colors.surface,
              color: colors.textPrimary,
              border: `1px solid ${colors.borders}`,
              fontSize: '1rem',
            },
          }}
        />
        <Button
          fullWidth
          size="lg"
          onClick={handleEmailContinue}
          disabled={!email || loading}
          loading={loading}
          style={{
            background: email && !loading ? colors.primaryAccent : colors.borders,
            color: '#FFF',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: email && !loading ? 'pointer' : 'not-allowed',
          }}
        >
          Continue
        </Button>
      </Box>
    </Modal>
  );
}