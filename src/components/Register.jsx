import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where, updateDoc } from 'firebase/firestore';
import { auth, db } from '../Firebase';
import { toast } from 'react-toastify';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [education, setEducation] = useState('Bachelors Degree');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateInputs()) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if email already exists in Firestore
      const usersRef = collection(db, 'users');
      const emailQuery = query(usersRef, where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setError('This email is already registered.');
        setIsLoading(false);
        toast.error('Email already in use', { position: 'top-right' });
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Retrieve selected plan from localStorage or location.state
      const selectedPlan = location.state?.selectedPlan || JSON.parse(localStorage.getItem('selectedPlan'));
      if (!selectedPlan) {
        setError('Please select a plan first');
        setIsLoading(false);
        toast.error('No plan selected', { position: 'top-right' });
        return;
      }

      // Define plan limits
      const planLimits = {
        'Free Account': { surveysPerDay: 20, availableSurveys: 20 },
        'Business Basic': { surveysPerDay: 9999, availableSurveys: 9999 },
        'Business Premium': { surveysPerDay: 9999, availableSurveys: 9999 },
        'Business Expert': { surveysPerDay: 9999, availableSurveys: 9999 },
      };
      const { surveysPerDay, availableSurveys } = planLimits[selectedPlan.name] || { surveysPerDay: 20, availableSurveys: 20 };

      // Handle referral logic
      const searchParams = new URLSearchParams(location.search);
      const referralCode = searchParams.get('ref');
      let referrerId = null;

      if (referralCode) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referralCode', '==', referralCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          referrerId = querySnapshot.docs[0].id;
          await updateDoc(doc(db, 'users', referrerId), {
            referralPoints: (querySnapshot.docs[0].data().referralPoints || 0) + 40,
          });
        }
      }

      // Generate a new referral code for the user
      const newReferralCode = Math.random().toString(36).substring(2, 9).toUpperCase();

      // Save user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: `${firstName.trim()} ${lastName.trim()}`,
        email,
        education,
        accountType: selectedPlan.name,
        surveysPerDay,
        availableSurveys,
        balance: 0,
        loyaltyPoints: 0,
        referralCode: newReferralCode,
        referralPoints: 0,
        transactions: [],
        surveysCompletedToday: 0,
        lastSurveyDate: new Date().toISOString().split('T')[0],
        completedSurveys: [],
        referredBy: referrerId,
        planSelected: true,
        isAdmin: false,
        createdAt: new Date().toISOString(),
      });

      // Clean up localStorage
      localStorage.removeItem('selectedPlan');
      toast.success('Registered successfully! Please verify your email.', { position: 'top-right' });
      navigate('/'); // Redirect to Home
    } catch (err) {
      let errorMessage = 'Failed to register. Try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      }
      setError(errorMessage);
      toast.error('Error registering: ' + err.message, { position: 'top-right' });
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
            <h2>Register</h2>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleRegister}>
            <Form.Group controlId="formFirstName" className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group controlId="formLastName" className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Form.Group controlId="formEducation" className="mb-3">
              <Form.Label>Level of Education</Form.Label>
              <Form.Control
                as="select"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
                disabled={isLoading}
              >
                <option>Bachelors Degree</option>
                <option>High School</option>
                <option>Masters Degree</option>
                <option>PhD</option>
              </Form.Control>
            </Form.Group>
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
            <Form.Group controlId="formTerms" className="mb-3">
              <Form.Check
                type="checkbox"
                label={
                  <span>
                    I accept the <Link to="/terms">Terms and Conditions</Link>
                  </span>
                }
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                disabled={isLoading}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Signing Up...' : 'SIGN UP'}
            </Button>
          </Form>
          <div className="text-center mt-3">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;