import { useEffect, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, Center, Text, Box } from '@mantine/core';
import { AuthContext } from '../context/AuthContext';
import { showSuccess, showInfo } from '../utils/notifications';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const profilePicture = searchParams.get('profilePicture');
    const isNewUser = searchParams.get('isNewUser') === 'true';
    
    console.log('AuthSuccess - Received params:', { 
      token: token?.substring(0, 20) + '...',
      name,
      email,
      profilePicture,
      isNewUser
    });
    
    if (token && name && email) {
      hasProcessed.current = true;
      
      const userData = {
        name: decodeURIComponent(name),
        email,
        profilePicture: profilePicture ? decodeURIComponent(profilePicture) : '',
      };
      
      console.log('Logging in with userData:', userData); 
      
      login(token, userData);
      
      if (isNewUser) {
        showInfo('Welcome to Retriv!', `Hi ${name}! Your account has been created successfully 🎉`);
      } else {
        showSuccess('Welcome Back!', `Good to see you again, ${name}!`);
      }
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } else {
      console.error('Missing required auth params');
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <Center style={{ 
      height: '100vh', 
      backgroundColor: 'var(--bg-color)',
      transition: 'background-color 0.3s ease'
    }}>
      <Box style={{ textAlign: 'center' }}>
        <Loader size="lg" color="var(--primary-accent)" />
        <Text mt="lg" size="lg" style={{ color: 'var(--text-primary)' }}>
          Completing login...
        </Text>
      </Box>
    </Center>
  );
}
