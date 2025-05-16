import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../Firebase';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, authLoading, authError] = useAuthState(auth); // Add useAuthState
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated and not coming from plan-selection, redirect
  if (!authLoading && user && location.state?.from !== '/plan-selection') {
    navigate('/', { replace: true });
    return null;
  }

  // Show loading spinner while auth state is resolving
  if (authLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </Container>
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Retrieve selected plan from location.state or localStorage
      const selectedPlan = location.state?.selectedPlan || JSON.parse(localStorage.getItem('selectedPlan'));
      if (selectedPlan) {
        const planLimits = {
          'Free Account': { surveysPerDay: 20, availableSurveys: 20 },
          'Business Basic': { surveysPerDay: 9999, availableSurveys: 9999 },
          'Business Premium': { surveysPerDay: 9999, availableSurveys: 9999 },
          'Business Expert': { surveysPerDay: 9999, availableSurveys: 9999 },
        };
        const { surveysPerDay, availableSurveys } = planLimits[selectedPlan.name] || { surveysPerDay: 20, availableSurveys: 20 };

        // Save the selected plan to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          accountType: selectedPlan.name,
          surveysPerDay,
          availableSurveys,
          planSelected: true,
        }, { merge: true });

        // Clean up localStorage
        localStorage.removeItem('selectedPlan');
      }

      toast.success('Logged in successfully!', { position: 'top-right' });
      navigate('/', { replace: true }); // Redirect to Home
    } catch (err) {
      let errorMessage = 'Invalid email or password.';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        default:
          errorMessage = 'Failed to log in. Try again.';
      }
      setError(errorMessage);
      toast.error('Error logging in: ' + err.message, { position: 'top-right' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: '400px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <img
              src="/basket-icon.png"
              alt="Kapu Surveys Logo"
              width="50"
              height="50"
              onError={(e) => (e.target.src = '/default-logo.png')}
            />
            <h2>Login</h2>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {authError && <Alert variant="danger">Authentication error: {authError.message}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <div className="text-end mb-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'SIGN IN'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <p>
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;