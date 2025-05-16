import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../Firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [hasSelectedPlan, setHasSelectedPlan] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkPlanSelection = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setHasSelectedPlan(userDoc.data().planSelected || false);
          } else {
            setHasSelectedPlan(false);
          }
        } catch (err) {
          console.error('Error checking plan selection:', err);
          setHasSelectedPlan(false);
        }
      } else {
        setHasSelectedPlan(false);
      }
    };
    checkPlanSelection();
  }, [user]); // Re-run when user changes

  if (loading || hasSelectedPlan === null) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Don't redirect to /plan-selection if coming from /login
  if (!hasSelectedPlan && location.state?.from !== '/login') {
    return <Navigate to="/plan-selection" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;