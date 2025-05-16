import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaClock, FaMoneyBillWave, FaTag } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './SurveyCard.css';

const SurveyCard = React.memo(({ survey, disabled, isCompleted }) => {
  const navigate = useNavigate();

  const handleTakeSurvey = () => {
    if (!disabled && !isCompleted) {
      navigate(`/survey/${survey.id}`);
    }
  };

  return (
    <Card className="survey-card">
      <Card.Body>
        <div className="survey-header">
          <Card.Title>{survey.title || 'Untitled Survey'}</Card.Title>
          {isCompleted && <span className="completed-badge">Completed</span>}
        </div>
        <div className="survey-info">
          <p>
            <FaTag /> <strong>Category:</strong> {survey.category || 'General'}
          </p>
          <p>
            <FaClock /> <strong>Estimated Time:</strong> {survey.estimatedTime || '5 mins'}
          </p>
          <p>
            <FaMoneyBillWave /> <strong>Reward:</strong> Ksh {survey.reward || 0}
          </p>
          <p>
            <strong>Difficulty:</strong> {survey.difficulty || 'Medium'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleTakeSurvey}
          disabled={disabled || isCompleted}
          className="survey-button"
        >
          {isCompleted ? 'Completed' : disabled ? 'Not Available' : 'Take Survey'}
        </Button>
      </Card.Body>
    </Card>
  );
});

export default SurveyCard;