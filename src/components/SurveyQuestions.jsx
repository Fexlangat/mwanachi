import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

const SurveyQuestions = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [fetchError, setFetchError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyDoc = await getDoc(doc(db, 'surveys', id));
        if (!surveyDoc.exists()) throw new Error('Survey not found');
        if (!surveyDoc.data().questions?.length) throw new Error('No questions available');
        setSurvey({ id: surveyDoc.id, ...surveyDoc.data() });
      } catch (err) {
        setFetchError(err.message);
      }
    };

    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) setUserData(userDoc.data());
      }
    };

    fetchSurvey();
    fetchUserData();
  }, []); // Runs only on mount

  // Manual refresh function
  const refreshSurvey = () => {
    setShouldRefresh(true);
    const fetchSurvey = async () => {
      try {
        const surveyDoc = await getDoc(doc(db, 'surveys', id));
        if (!surveyDoc.exists()) throw new Error('Survey not found');
        if (!surveyDoc.data().questions?.length) throw new Error('No questions available');
        setSurvey({ id: surveyDoc.id, ...surveyDoc.data() });
      } catch (err) {
        setFetchError(err.message);
      }
    };
    fetchSurvey();
    setShouldRefresh(false);
  };

  const handleAnswer = async (isCorrect, payout) => {
    if (!user || !survey) return;

    const adjustedPayout =
      userData?.accountType === 'Free Account'
        ? Math.floor(Math.random() * (50 - 40 + 1)) + 40
        : Math.floor(Math.random() * (300 - 200 + 1)) + 200;

    setFeedback({
      message: isCorrect ? 'Correct!' : 'Incorrect!',
      variant: isCorrect ? 'success' : 'danger',
    });

    setTimeout(async () => {
      setFeedback(null);
      if (isCorrect) {
        const newTotalEarned = totalEarned + adjustedPayout;
        setTotalEarned(newTotalEarned);
        await updateDoc(doc(db, 'users', user.uid), {
          balance: (userData.balance || 0) + adjustedPayout,
        }).catch(err => setFetchError('Error updating balance: ' + err.message));
      }
      if (currentQuestionIndex + 1 < (survey.questions.length || 0)) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          surveysCompletedToday: (userData.surveysCompletedToday || 0) + 1,
          completedSurveys: [...(userData.completedSurveys || []), id],
        }).catch(err => setFetchError('Error updating survey status: ' + err.message));
        if (userData.accountType === 'Free Account') {
          await updateDoc(doc(db, 'users', user.uid), {
            availableSurveys: (userData.availableSurveys || 0) - 1,
          }).catch(err => setFetchError('Error updating available surveys: ' + err.message));
        }
        navigate(`/survey/${id}/summary`, {
          state: { totalEarned: totalEarned + (isCorrect ? adjustedPayout : 0), surveyTopic: survey.topic },
        });
      }
    }, 1000);
  };

  if (fetchError) return <div className="text-danger">{fetchError}</div>;
  if (!survey || !survey.questions || !survey.questions.length) return <div>No questions available for this survey.</div>;

  const currentQuestion = survey.questions[currentQuestionIndex];
  if (!currentQuestion?.text || !currentQuestion?.options?.length) return <div>Error: Invalid question data.</div>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>
            {survey.topic} - Question {currentQuestionIndex + 1} of {survey.questions.length}
          </Card.Title>
          <Card.Text>{currentQuestion.text}</Card.Text>
          {feedback && (
            <Alert variant={feedback.variant} className="mt-2">
              {feedback.message}
            </Alert>
          )}
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline-primary"
              className="m-2"
              onClick={() => handleAnswer(option.isCorrect, option.payout)}
              disabled={feedback !== null}
            >
              {option.text}
            </Button>
          ))}
          <Card.Text>Total Earned: Ksh {totalEarned}</Card.Text>
          <Button variant="secondary" onClick={refreshSurvey} className="mt-3">
            Refresh Survey
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SurveyQuestions;