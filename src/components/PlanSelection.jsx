import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Table, Spinner } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, doc, getDoc, updateDoc } from '../Firebase'; // Added db import
import './PlanSelection.css';

const PlanSelection = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const plans = [
    {
      name: 'Free Account',
      surveysPerDay: 20,
      minWithdrawal: 'Ksh 4500',
      earningsPerSurvey: 'Ksh 40 - 50',
      price: 'Free',
      availableSurveys: 20,
    },
    {
      name: 'Business Basic',
      surveysPerDay: 9999,
      earningsPerMonth: 'Ksh 8000',
      dailyIncome: 'Ksh 300',
      minWithdrawal: 'Ksh 3000',
      earningsPerSurvey: 'Ksh 200 - 300',
      price: '400 Ksh',
    },
    {
      name: 'Business Premium',
      surveysPerDay: 9999,
      earningsPerMonth: 'Ksh 15000',
      dailyIncome: 'Ksh 600',
      minWithdrawal: 'Ksh 2500',
      earningsPerSurvey: 'Ksh 200 - 300',
      price: '800 Ksh',
      recommended: true,
    },
    {
      name: 'Business Expert',
      surveysPerDay: 9999,
      earningsPerMonth: 'Ksh 30000',
      dailyIncome: 'Ksh 1200',
      minWithdrawal: 'Ksh 2000',
      earningsPerSurvey: 'Ksh 200 - 300',
      price: '1600 Ksh',
    },
  ];

  useEffect(() => {
    const savedPlan = localStorage.getItem('selectedPlan');
    if (savedPlan) {
      setSelectedPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    toast.success(`Selected plan: ${plan.name}`, { position: 'top-right' });
  };

  const handleStart = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan to proceed!', { position: 'top-right' });
      return;
    }

    if (!user) {
      navigate('/login'); // Redirect to login/register if no user is authenticated
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, { planSelected: true, accountType: selectedPlan.name });
        navigate('/');
      } else {
        toast.error('User data not found. Please contact support.', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Error processing plan: ' + err.message, { position: 'top-right' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container fluid className="plan-selection-container py-5">
      <h1 className="text-center mb-5">Choose Your Plan</h1>

      <div className="row mb-5">
        {plans.map((plan, index) => (
          <div key={index} className="col-md-3 mb-4">
            <div
              className={`plan-card ${selectedPlan === plan ? 'selected' : ''}`}
              onClick={() => handlePlanSelect(plan)}
            >
              <Card className="h-100 border-0 shadow-sm">
                {plan.recommended && (
                  <span className="recommended-badge position-absolute top-0 start-50 translate-middle bg-warning text-dark">
                    Recommended
                  </span>
                )}
                <Card.Body className="text-center">
                  <Card.Title>{plan.name}</Card.Title>
                  <Card.Text>{plan.price}</Card.Text>
                  <ul className="list-unstyled">
                    <li className="d-flex align-items-center mb-2">
                      <FaCheckCircle className="me-2 text-success" />
                      {plan.surveysPerDay === 9999 ? 'Unlimited' : plan.surveysPerDay} Surveys per Day
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <FaCheckCircle className="me-2 text-success" />
                      Min Withdrawal: {plan.minWithdrawal}
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <FaCheckCircle className="me-2 text-success" />
                      Earnings per Survey: {plan.earningsPerSurvey}
                    </li>
                    {plan.earningsPerMonth && (
                      <li className="d-flex align-items-center mb-2">
                        <FaCheckCircle className="me-2 text-success" />
                        Earnings per Month: {plan.earningsPerMonth}
                      </li>
                    )}
                    {plan.dailyIncome && (
                      <li className="d-flex align-items-center mb-2">
                        <FaCheckCircle className="me-2 text-success" />
                        Daily Income: {plan.dailyIncome}
                      </li>
                    )}
                  </ul>
                </Card.Body>
              </Card>
            </div>
          </div>
        ))}
      </div>

      {isSaving && (
        <div className="text-center mb-4">
          <Spinner animation="border" variant="primary" />
          <p>Saving...</p>
        </div>
      )}

      <Card className="mb-5 shadow-sm">
        <Card.Body>
          <h2 className="text-center mb-4">Plan Comparison</h2>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Feature</th>
                {plans.map(plan => (
                  <th key={plan.name} className="text-center">{plan.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Surveys per Day</td>
                {plans.map(plan => (
                  <td key={plan.name} className="text-center">
                    {plan.surveysPerDay === 9999 ? 'Unlimited' : plan.surveysPerDay}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Min Withdrawal</td>
                {plans.map(plan => (
                  <td key={plan.name} className="text-center">{plan.minWithdrawal}</td>
                ))}
              </tr>
              <tr>
                <td>Earnings per Survey</td>
                {plans.map(plan => (
                  <td key={plan.name} className="text-center">{plan.earningsPerSurvey}</td>
                ))}
              </tr>
              <tr>
                <td>Price</td>
                {plans.map(plan => (
                  <td key={plan.name} className="text-center">{plan.price}</td>
                ))}
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="text-center">
        <Button
          variant="primary"
          onClick={handleStart}
          disabled={!selectedPlan || isSaving}
        >
          Start Now
        </Button>
      </div>
    </Container>
  );
};

export default PlanSelection;