const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

exports.awardReferralPoints = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, _context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Check if completedSurveys has changed
    const newCompletedSurveys = newData.completedSurveys || [];
    const oldCompletedSurveys = oldData.completedSurveys || [];
    if (newCompletedSurveys.length <= oldCompletedSurveys.length) {
      return null; // No new survey completed
    }

    // Check if the user was referred
    const referredBy = newData.referredBy;
    if (!referredBy) {
      return null; // No referrer
    }

    // Award 40 referral points to the referrer
    const referrerDocRef = db.collection('users').doc(referredBy);
    await referrerDocRef.update({
      referralPoints: admin.firestore.FieldValue.increment(40),
    });

    return null;
  });