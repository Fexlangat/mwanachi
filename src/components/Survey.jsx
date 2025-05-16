import React, { useState, useEffect } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../Firebase';
import { doc, getDoc } from 'firebase/firestore';

const Survey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const surveyDoc = await getDoc(doc(db, 'surveys', id));
        if (!surveyDoc.exists()) throw new Error('Survey not found');
        setSurvey({ id: surveyDoc.id, ...surveyDoc.data() });
      } catch (err) {
        setFetchError(err.message);
      }
    };
    fetchSurvey();
  }, [id]);

  const handleStartSurvey = () => {
    navigate(`/survey/${id}/questions`);
  };

  if (fetchError) return <div className="text-danger">{fetchError}</div>;
  if (!survey) return <div>Loading survey...</div>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>{survey.topic || 'Untitled Survey'}</Card.Title>
          <Card.Text>Amount: Ksh {survey.payout || 0}</Card.Text>
          <Card.Text>YOU ARE ABOUT TO TAKE {survey.topic || 'Untitled'} SURVEY</Card.Text>
          <ul>
            <li>Give authentic & honest feedback</li>
            <li>EARN MONEY AND HAVE FUN</li>
          </ul>
          <Button variant="primary" onClick={handleStartSurvey}>
            START SURVEY
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Survey;