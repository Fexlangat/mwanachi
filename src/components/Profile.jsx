import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert, ProgressBar, Form, Modal } from 'react-bootstrap';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../Firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaGraduationCap, FaWallet, FaGift, FaCode, FaTrophy, FaHistory, FaEdit, FaMoon, FaSun,
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData(data);
        setName(data.name || '');
        setEducation(data.education || '');
      }
    }, (err) => {
      setMessage({ text: 'Error fetching user data: ' + err.message, variant: 'danger' });
    });

    return () => unsubscribe();
  }, []); // Runs only on mount, real-time updates handled by onSnapshot

  // Manual refresh function
  const refreshProfile = () => {
    setShouldRefresh(true);
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUserData(data);
        setName(data.name || '');
        setEducation(data.education || '');
      }
    }, (err) => {
      setMessage({ text: 'Error fetching user data: ' + err.message, variant: 'danger' });
    });
    setShouldRefresh(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'File size must be less than 2MB', variant: 'danger' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Only image files are allowed', variant: 'danger' });
        return;
      }
      setAvatarFile(file);
      const storageRef = ref(storage, `avatars/${user.uid}`);
      try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', user.uid), { avatar: url });
        setMessage({ text: 'Avatar updated successfully!', variant: 'success' });
      } catch (err) {
        setMessage({ text: 'Error uploading avatar: ' + err.message, variant: 'danger' });
      }
    }
  };

  const handleWithdraw = async () => {
    if (!userData || !selectedPaymentMethod) return;

    const minWithdrawal = { 'Free Account': 4500, 'Business Basic': 3000, 'Business Premium': 2500, 'Business Expert': 2000 }[userData.accountType] || 4500;
    const balance = userData.balance || 0;
    const deductionPercentage = 0.10;
    const deductionAmount = balance * deductionPercentage;
    const withdrawableAmount = balance - deductionAmount;

    if (balance < minWithdrawal) {
      setMessage({
        text: `Your balance (Ksh ${balance}) is below the minimum withdrawal amount of Ksh ${minWithdrawal} for your plan.`,
        variant: 'danger',
      });
      setShowPaymentModal(false);
      return;
    }

    const isPaymentVerified = await new Promise(resolve => setTimeout(() => resolve(true), 1000));
    if (!isPaymentVerified) {
      setMessage({ text: 'Payment verification failed. Please try again.', variant: 'danger' });
      setShowPaymentModal(false);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: withdrawableAmount,
        transactions: [...(userData.transactions || []), {
          type: 'withdrawal',
          amount: withdrawableAmount,
          deduction: deductionAmount,
          method: selectedPaymentMethod,
          date: new Date().toISOString(),
        }],
      });
      setMessage({
        text: `Successfully withdrawn Ksh ${withdrawableAmount} via ${selectedPaymentMethod}! A 10% fee of Ksh ${deductionAmount} was deducted.`,
        variant: 'success',
      });
      setShowPaymentModal(false);
      setSelectedPaymentMethod(null);
    } catch (err) {
      setMessage({
        text: 'Error processing withdrawal: ' + err.message,
        variant: 'danger',
      });
      setShowPaymentModal(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!userData || userData.loyaltyPoints < 100) {
      setMessage({ text: 'Need at least 100 loyalty points to redeem!', variant: 'danger' });
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        loyaltyPoints: userData.loyaltyPoints - 100,
        balance: (userData.balance || 0) + 50,
      });
      setMessage({ text: 'Redeemed 100 points for Ksh 50!', variant: 'success' });
    } catch (err) {
      setMessage({ text: 'Error redeeming points: ' + err.message, variant: 'danger' });
    }
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, education });
      setUserData({ ...userData, name, education });
      setEditMode(false);
      setMessage({ text: 'Profile updated successfully!', variant: 'success' });
    } catch (err) {
      setMessage({ text: 'Error updating profile: ' + err.message, variant: 'danger' });
    }
  };

  if (!userData) return <div className="text-center mt-5">Loading...</div>;

  const minWithdrawal = { 'Free Account': 4500, 'Business Basic': 3000, 'Business Premium': 2500, 'Business Expert': 2000 }[userData.accountType] || 4500;
  const balance = userData.balance || 0;
  const withdrawalProgress = Math.min((balance / minWithdrawal) * 100, 100);

  const achievements = [
    { name: 'Survey Master', condition: userData.completedSurveys?.length >= 10, icon: <FaTrophy /> },
    { name: 'Top Referrer', condition: userData.referralPoints >= 200, icon: <FaCode /> },
  ];

  return (
    <Container className={`profile-container ${darkMode ? 'bg-dark text-light' : ''}`}>
      <Button variant={darkMode ? 'light' : 'dark'} className="mb-3" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="profile-card">
          <div className="profile-header">
            <img
              src={userData.avatar || 'https://placehold.co/100'}
              alt="Profile Avatar"
              className="profile-avatar"
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            <h3>{userData.name}</h3>
            <p>{userData.accountType || 'Free Account'}</p>
          </div>
          <Card.Body className="profile-body">
            <div className="profile-info">
              <div className="profile-info-item">
                <FaUser size={20} />
                <span><strong>Name:</strong> {userData.name}</span>
              </div>
              <div className="profile-info-item">
                <FaEnvelope size={20} />
                <span><strong>Email:</strong> {userData.email}</span>
              </div>
              <div className="profile-info-item">
                <FaGraduationCap size={20} />
                <span><strong>Education:</strong> {userData.education}</span>
              </div>
              <div className="profile-info-item">
                <FaWallet size={20} />
                <span><strong>Balance:</strong> Ksh {balance}</span>
              </div>
              <div className="profile-info-item">
                <FaGift size={20} />
                <span><strong>Loyalty Points:</strong> {userData.loyaltyPoints || 0}</span>
              </div>
              <div className="profile-info-item">
                <FaCode size={20} />
                <span><strong>Referral Code:</strong> {userData.referralCode || 'N/A'}</span>
              </div>
              <div className="profile-info-item">
                <FaTrophy size={20} />
                <span><strong>Referral Points:</strong> {userData.referralPoints || 0}</span>
              </div>
            </div>

            <div className="mt-3">
              <input
                type="file"
                onChange={handleAvatarUpload}
                className="form-control mb-2"
                accept="image/*"
              />
            </div>

            <div className="progress-bar-container">
              <h5>Withdrawal Progress</h5>
              <ProgressBar
                now={withdrawalProgress}
                label={`${Math.round(withdrawalProgress)}%`}
                variant={withdrawalProgress >= 100 ? 'success' : 'info'}
                animated
                style={{ height: '25px', borderRadius: '10px' }}
              />
              <p className="mt-2">
                Minimum withdrawal: Ksh {minWithdrawal}.{' '}
                {withdrawalProgress >= 100
                  ? 'You can withdraw your earnings!'
                  : `Need Ksh ${Math.max(minWithdrawal - balance, 0)} more to withdraw.`}
              </p>
            </div>

            {message && (
              <Alert variant={message.variant} className="mt-3">
                {message.text}
              </Alert>
            )}
            <div className="d-flex gap-3 mt-3">
              <Button
                className="btn-withdraw"
                onClick={() => setShowPaymentModal(true)}
                disabled={balance < minWithdrawal}
              >
                Withdraw Earnings
              </Button>
              <Button variant="info" onClick={handleRedeemPoints} disabled={userData.loyaltyPoints < 100}>
                Redeem 100 Loyalty Points
              </Button>
            </div>

            {editMode ? (
              <div className="mt-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.trim())}
                  className="form-control mb-2"
                  placeholder="Enter your name"
                />
                <Form.Control
                  as="select"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="mb-2"
                >
                  <option value="Bachelors Degree">Bachelors Degree</option>
                  <option value="High School">High School</option>
                  <option value="Masters Degree">Masters Degree</option>
                  <option value="PhD">PhD</option>
                </Form.Control>
                <Button onClick={handleSave} variant="primary" className="me-2">
                  Save
                </Button>
                <Button onClick={() => setEditMode(false)} variant="secondary">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline-primary" className="mt-3" onClick={() => setEditMode(true)}>
                <FaEdit /> Edit Profile
              </Button>
            )}

            {achievements.length > 0 && (
              <div className="achievements mt-4">
                <h5>Achievements</h5>
                <div className="d-flex flex-wrap gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded ${achievement.condition ? 'bg-success text-white' : 'bg-light text-muted'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      {achievement.icon} {achievement.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {userData.transactions && userData.transactions.length > 0 && (
              <div className="transaction-history">
                <h5><FaHistory /> Transaction History</h5>
                {userData.transactions.map((transaction, index) => (
                  <div key={index} className="transaction-item">
                    <strong>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}:</strong>{' '}
                    Ksh {transaction.amount} (Deduction: Ksh {transaction.deduction || 0}) via {transaction.method || 'N/A'} on{' '}
                    {new Date(transaction.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      <Button variant="secondary" onClick={refreshProfile} className="mt-3">
        Refresh Profile
      </Button>

      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>A 10% fee will be deducted from your withdrawal amount.</p>
          <Form>
            <Form.Check
              type="radio"
              label="M-PESA Till (7584167)"
              name="paymentMethod"
              value="M-PESA Till"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />
            <p className="text-muted small mt-1">
              Instructions: Deposit 10% of your winnings (Ksh {Math.round((userData.balance || 0) * 0.10)}) to Safaricom Till number 7584167 using the M-PESA app or USSD (*334#). After depositing, click "Confirm" below to process the withdrawal.
            </p>
            <Form.Check
              type="radio"
              label="Google Payment"
              name="paymentMethod"
              value="Google Payment"
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="mt-2"
            />
            <p className="text-muted small mt-1">
              Instructions: Pay 10% of your winnings (Ksh {Math.round((userData.balance || 0) * 0.10)}) via Google Payment through your linked account. After payment, click "Confirm" below to process the withdrawal.
            </p>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleWithdraw} disabled={!selectedPaymentMethod}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;