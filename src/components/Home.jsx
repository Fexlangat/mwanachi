import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import { db, auth } from '../Firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { toast } from 'react-toastify';
import SurveyCard from './SurveyCard';
import './Home.css';

const Home = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [canTakeSurvey, setCanTakeSurvey] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Define fetchUserData at the component level
  const fetchUserData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        const today = new Date().toISOString().split('T')[0];
        if (data.lastSurveyDate !== today) {
          await updateDoc(doc(db, 'users', user.uid), {
            surveysCompletedToday: 0,
            lastSurveyDate: today,
          });
          data.surveysCompletedToday = 0;
          data.lastSurveyDate = today;
        }

        const maxSurveys = data.surveysPerDay || 20;
        const availableSurveys = data.availableSurveys || 0;
        const surveysCompletedToday = data.surveysCompletedToday || 0;

        setCanTakeSurvey(
          surveysCompletedToday < maxSurveys &&
          (data.accountType === 'Free Account' ? availableSurveys > 0 : true)
        );

        if (surveysCompletedToday >= maxSurveys) {
          toast.warn('You have reached your daily survey limit!', { position: 'top-right' });
        }

        if (data.accountType === 'Free Account' && availableSurveys <= 0 && !dontShowAgain) {
          setShowUpgradeModal(true);
          toast.info('Upgrade to a paid plan to continue earning!', { position: 'top-right' });
        }

        toast.success(`Welcome back, ${data.name || user.email}!`, { position: 'top-right' });
      } else {
        toast.error('User data not found. Please contact support.', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Error fetching user data: ' + err.message, { position: 'top-right' });
    }
  };

  // Define fetchSurveys at the component level
  const fetchSurveys = async () => {
    try {
      const surveySnapshot = await getDocs(collection(db, 'surveys'));
      const surveyList = surveySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString(),
      }));
      setSurveys(surveyList);
      setFilteredSurveys(surveyList);
    } catch (err) {
      toast.error('Error fetching surveys: ' + err.message, { position: 'top-right' });
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchUserData();
      await fetchSurveys();
      setIsLoading(false);
    };
    fetchData();
  }, [user]); // Depend on user to refetch if auth state changes

  // Manual refresh function
  const refreshData = async () => {
    setShouldRefresh(true);
    setIsLoading(true);
    await fetchUserData();
    await fetchSurveys();
    setShouldRefresh(false);
    setIsLoading(false);
  };

  // Filter and sort logic
  useEffect(() => {
    let updatedSurveys = [...surveys];

    if (categoryFilter !== 'All') {
      updatedSurveys = updatedSurveys.filter(survey => survey.category === categoryFilter);
    }

    if (sortOption === 'newest') {
      updatedSurveys.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'reward') {
      updatedSurveys.sort((a, b) => (b.reward || 0) - (a.reward || 0));
    } else if (sortOption === 'time') {
      updatedSurveys.sort((a, b) => (a.estimatedTime || 0) - (b.estimatedTime || 0));
    }

    setFilteredSurveys(updatedSurveys);
  }, [surveys, categoryFilter, sortOption]); // Remove shouldRefresh dependency

  const handleCloseUpgradeModal = () => setShowUpgradeModal(false);
  const handleUpgrade = () => {
    navigate('/plan-selection');
    setShowUpgradeModal(false);
  };

  const getTotalSurveysLimit = () => {
    if (userData?.accountType === 'Free Account') return 20;
    return userData?.surveysPerDay || 9999;
  };

  const getCategories = () => {
    const categories = new Set(surveys.map(survey => survey.category || 'General'));
    return ['All', ...categories];
  };

  const progressPercentage = userData
    ? Math.round(((userData.surveysCompletedToday || 0) / getTotalSurveysLimit()) * 100)
    : 0;

  if (isLoading) {
    return (
      <Container className="home-container text-center mt-5">
        <p>Loading...</p>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container className="home-container text-center mt-5">
        <p>No user data available. Please try again or contact support.</p>
      </Container>
    );
  }

  return (
    <Container className="home-container">
      <div className="welcome-section">
        <h2>Welcome, {userData?.name || user?.email || 'User'}</h2>
        <p>Account Type: {userData?.accountType || 'Free Account'}</p>
        <p>Available Surveys: {userData?.accountType === 'Free Account' ? userData?.availableSurveys || 0 : 'Unlimited'}</p>
      </div>

      <div className="progress-circle-container">
        <div style={{ width: 150, height: 150 }}>
          <CircularProgressbar
            value={progressPercentage}
            text={`${userData?.surveysCompletedToday || 0} / ${getTotalSurveysLimit()}`}
            styles={buildStyles({
              pathColor: `hsl(111, 95%, 40%)`,
              textColor: '#333',
              trailColor: '#d6d6d6',
              backgroundColor: '#3e98c7',
            })}
          />
        </div>
      </div>

      {!canTakeSurvey && userData?.accountType === 'Free Account' && userData?.availableSurveys > 0 && (
        <p className="text-danger text-center">You have reached your daily survey limit for today.</p>
      )}
      {!canTakeSurvey && userData?.accountType !== 'Free Account' && (
        <p className="text-danger text-center">You have reached your daily survey limit for today.</p>
      )}

      <div className="filters-section">
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filter by Category</Form.Label>
              <Form.Control
                as="select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Sort By</Form.Label>
              <Form.Control
                as="select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="reward">Highest Reward</option>
                <option value="time">Shortest Time</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {filteredSurveys.length === 0 ? (
        <p className="text-center mt-4">No surveys available at the moment.</p>
      ) : (
        <div className="survey-row">
          {filteredSurveys.map(survey => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              disabled={!canTakeSurvey}
              isCompleted={userData?.completedSurveys?.includes(survey.id)}
            />
          ))}
        </div>
      )}

      <Button variant="secondary" onClick={refreshData} className="mt-3" disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </Button>

      <Modal show={showUpgradeModal} onHide={handleCloseUpgradeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Upgrade Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You have completed all 20 free surveys. To continue earning, please upgrade to a paid plan.
        </Modal.Body>
        <Modal.Footer>
          <Form.Check
            type="checkbox"
            label="Don’t show again"
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <Button variant="secondary" onClick={handleCloseUpgradeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpgrade}>
            Upgrade Now
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Home;