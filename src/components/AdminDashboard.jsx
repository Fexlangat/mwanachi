import React, { useState, useEffect } from 'react';
import { Container, Button, Table, Form, Alert } from 'react-bootstrap';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../Firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [user] = useAuthState(auth);
  const [surveys, setSurveys] = useState([]);
  const [newSurvey, setNewSurvey] = useState({ topic: '', questions: [] });
  const [newQuestion, setNewQuestion] = useState({ text: '', options: [] });
  const [error, setError] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || !userDoc.data().isAdmin) throw new Error('Unauthorized access');
        const surveySnapshot = await getDocs(collection(db, 'surveys'));
        const surveyList = surveySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSurveys(surveyList);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSurveys();
  }, []); // Runs only on mount

  // Manual refresh function
  const refreshSurveys = () => {
    setShouldRefresh(true);
    const fetchSurveys = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || !userDoc.data().isAdmin) throw new Error('Unauthorized access');
        const surveySnapshot = await getDocs(collection(db, 'surveys'));
        const surveyList = surveySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSurveys(surveyList);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSurveys();
    setShouldRefresh(false);
  };

  const handleAddSurvey = async () => {
    if (!newSurvey.topic.trim()) {
      setError('Survey topic is required');
      return;
    }
    if (!newSurvey.questions.length || !newSurvey.questions.some(q => q.options.some(o => o.isCorrect))) {
      setError('At least one question with a correct option is required');
      return;
    }
    try {
      await addDoc(collection(db, 'surveys'), newSurvey);
      setSurveys([...surveys, newSurvey]);
      setNewSurvey({ topic: '', questions: [] });
      setNewQuestion({ text: '', options: [] });
      setError(null);
    } catch (err) {
      setError('Error adding survey: ' + err.message);
    }
  };

  const handleDeleteSurvey = async (id) => {
    try {
      await deleteDoc(doc(db, 'surveys', id));
      setSurveys(surveys.filter(survey => survey.id !== id));
      setError(null);
    } catch (err) {
      setError('Error deleting survey: ' + err.message);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.text.trim()) {
      setError('Question text is required');
      return;
    }
    if (newQuestion.options.length < 2) {
      setError('At least two options are required');
      return;
    }
    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, { ...newQuestion, options: [...newQuestion.options] }]
    });
    setNewQuestion({ text: '', options: [] });
    setError(null);
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [
        ...newQuestion.options,
        { text: '', isCorrect: false, payout: 0 }
      ]
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = { ...newOptions[index], [field]: field === 'payout' ? Number(value) : value };
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  if (!user) return <div>Please log in to access the admin dashboard.</div>;
  if (error && error.includes('Unauthorized')) return <div>{error}</div>;

  return (
    <Container className="mt-4">
      <h2>Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <h4>Add New Survey</h4>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Survey Topic</Form.Label>
          <Form.Control
            type="text"
            value={newSurvey.topic}
            onChange={(e) => setNewSurvey({ ...newSurvey, topic: e.target.value })}
          />
        </Form.Group>
        <h5>Add Question</h5>
        <Form.Group className="mb-3">
          <Form.Label>Question Text</Form.Label>
          <Form.Control
            type="text"
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
          />
        </Form.Group>
        {newQuestion.options.map((option, index) => (
          <div key={index} className="mb-3">
            <Form.Group>
              <Form.Label>Option {index + 1}</Form.Label>
              <Form.Control
                type="text"
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Is Correct"
              checked={option.isCorrect}
              onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
            />
            {option.isCorrect && (
              <Form.Group>
                <Form.Label>Payout (Ksh)</Form.Label>
                <Form.Control
                  type="number"
                  value={option.payout}
                  onChange={(e) => updateOption(index, 'payout', e.target.value)}
                />
              </Form.Group>
            )}
          </div>
        ))}
        <Button variant="secondary" onClick={addOption} className="mb-3">
          Add Option
        </Button>
        <Button variant="primary" onClick={addQuestion} className="mb-3 ms-2">
          Add Question
        </Button>
        <br />
        <Button variant="primary" onClick={handleAddSurvey}>
          Save Survey
        </Button>
      </Form>
      <h4 className="mt-4">Existing Surveys</h4>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Questions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map(survey => (
            <tr key={survey.id}>
              <td>{survey.topic}</td>
              <td>{survey.questions?.length || 0}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleDeleteSurvey(survey.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button variant="secondary" onClick={refreshSurveys} className="mt-3">
        Refresh Surveys
      </Button>
    </Container>
  );
};

export default AdminDashboard;