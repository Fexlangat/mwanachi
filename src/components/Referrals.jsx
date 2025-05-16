import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { auth, db } from '../Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const Referrals = () => {
  const [user] = useAuthState(auth);
  const [referralData, setReferralData] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setReferralData(userDoc.data());
      }
    };
    fetchReferralData();
  }, []); // Runs only on mount

  // Manual refresh function
  const refreshReferrals = () => {
    setShouldRefresh(true);
    const fetchReferralData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setReferralData(userDoc.data());
      }
    };
    fetchReferralData();
    setShouldRefresh(false);
  };

  if (!referralData) return <div>Loading...</div>;

  const referralCode = referralData.referralCode || '';
  const referralLink = `https://mwananchisurveys.com/register?ref=${referralCode}`;
  const shareMessage = `Join Mwananchi Surveys and earn money by completing surveys! Use my referral code: ${referralCode}\nSign up here: ${referralLink}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Referral code copied!');
  };

  const shareViaWebShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Mwananchi Surveys!',
        text: shareMessage,
        url: referralLink,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      alert('Web Share API not supported in this browser. Use the other options to share.');
    }
  };

  const shareViaEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    const subject = encodeURIComponent('Join Mwananchi Surveys and Earn Money!');
    const body = encodeURIComponent(shareMessage);
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const shareViaSMS = () => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(recipientPhone)) {
      alert('Please enter a valid phone number (e.g., +254123456789).');
      return;
    }
    const body = encodeURIComponent(shareMessage);
    window.location.href = `sms:${recipientPhone}?body=${body}`;
  };

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaTelegram = () => {
    const message = encodeURIComponent(shareMessage);
    window.open(`https://t.me/share/url?url=${referralLink}&text=${message}`, '_blank');
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Referral Program</Card.Title>
              <Card.Text>
                Earn Ksh 40 on each survey your referral completes. Below is your referral code and link.
              </Card.Text>
              <Card.Text>
                <strong>Referral Code:</strong> {referralCode}
                <Button variant="primary" onClick={copyToClipboard} className="ms-2" disabled={!referralCode}>
                  Copy Code
                </Button>
              </Card.Text>
              <Card.Text>
                <strong>Referral Link:</strong> <a href={referralLink} target="_blank" rel="noopener noreferrer">{referralLink}</a>
              </Card.Text>
              <Card.Text>Referral Points: {referralData.referralPoints || 0}</Card.Text>
              <Card.Text>Loyalty Points: {referralData.loyaltyPoints || 0}</Card.Text>
              <Card.Text>
                Kindly note that we take time to verify referrals, which may lead to delays in referral points being reflected in your account.
              </Card.Text>

              <h5>Share Your Referral Code</h5>
              <Button variant="success" onClick={shareViaWebShare} className="mb-2 me-2">
                Share via App
              </Button>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Share via Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="mb-2"
                    />
                    <Button variant="primary" onClick={shareViaEmail}>
                      Send Email
                    </Button>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formPhone">
                    <Form.Label>Share via SMS</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number (e.g., +254123456789)"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="mb-2"
                    />
                    <Button variant="primary" onClick={shareViaSMS}>
                      Send SMS
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="success" onClick={shareViaWhatsApp} className="me-2">
                Share via WhatsApp
              </Button>
              <Button variant="info" onClick={shareViaTelegram}>
                Share via Telegram
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Button variant="secondary" onClick={refreshReferrals} className="mt-3">
        Refresh Referrals
      </Button>
    </Container>
  );
};

export default Referrals;