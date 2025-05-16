import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../Firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const SurveySummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const { totalEarned, surveyTopic } = location.state || { totalEarned: 0, surveyTopic: 'Unknown' };
  const [nextSurvey, setNextSurvey] = useState(null);
  const [redirectDelay, setRedirectDelay] = useState(3);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const fetchNextSurvey = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const completedSurveys = userData.completedSurveys || [];
          const surveySnapshot = await getDocs(collection(db, 'surveys'));
          const surveyList = surveySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const availableSurveys = surveyList.filter(survey => !completedSurveys.includes(survey.id));
          const maxSurveys = userData.surveysPerDay || 20;
          const availableSurveysCount = userData.availableSurveys || 0;
          const surveysCompletedToday = userData.surveysCompletedToday || 0;
          const canTakeSurvey =
            surveysCompletedToday < maxSurveys &&
            (userData.accountType === 'Free Account' ? availableSurveysCount > 0 : true);

          if (canTakeSurvey && availableSurveys.length > 0) {
            setNextSurvey(availableSurveys[0]);
          }
        }
      }
    };

    fetchNextSurvey();
  }, []); // Runs only on mount

  // Manual refresh function
  const refreshSummary = () => {
    setShouldRefresh(true);
    const fetchNextSurvey = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const completedSurveys = userData.completedSurveys || [];
          const surveySnapshot = await getDocs(collection(db, 'surveys'));
          const surveyList = surveySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));

          const availableSurveys = surveyList.filter(survey => !completedSurveys.includes(survey.id));
          const maxSurveys = userData.surveysPerDay || 20;
          const availableSurveysCount = userData.availableSurveys || 0;
          const surveysCompletedToday = userData.surveysCompletedToday || 0;
          const canTakeSurvey =
            surveysCompletedToday < maxSurveys &&
            (userData.accountType === 'Free Account' ? availableSurveysCount > 0 : true);

          if (canTakeSurvey && availableSurveys.length > 0) {
            setNextSurvey(availableSurveys[0]);
          }
        }
      }
    };
    fetchNextSurvey();
    setShouldRefresh(false);
  };

  useEffect(() => {
    if (nextSurvey) {
      const timer = setTimeout(() => navigate(`/survey/${nextSurvey.id}`), redirectDelay * 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => navigate('/'), redirectDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [nextSurvey, navigate, redirectDelay]); // Controlled by nextSurvey change

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Congratulations!</Card.Title>
          <Card.Text>
            You have completed the <strong>{surveyTopic || 'Unknown'}</strong> survey.
            <br />
            You earned: <strong>Ksh {totalEarned || 0}</strong>
            <br />
            {nextSurvey ? (
              <span>
                Redirecting to next survey: <strong>{nextSurvey.topic}</strong> in{' '}
                <input
                  type="number"
                  value={redirectDelay}
                  onChange={(e) => setRedirectDelay(Math.max(1, Number(e.target.value)))}
                  style={{ width: '50px' }}
                />{' '}
                seconds...
              </span>
            ) : (
              <span>Redirecting to Home in{' '}
                <input
                  type="number"
                  value={redirectDelay}
                  onChange={(e) => setRedirectDelay(Math.max(1, Number(e.target.value)))}
                  style={{ width: '50px' }}
                />{' '}
                seconds...</span>
            )}
          </Card.Text>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="secondary" onClick={refreshSummary} className="ms-2 mt-3">
            Refresh Summary
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SurveySummary;