// ~/Firezone/mwananchi-survey/scripts/addSurveyQuestions.cjs

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Path to your service account key
const serviceAccount = require('./serviceAccountKey.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

const surveyQuestions = [
  {
    topic: 'KFC',
    questions: [
      {
        text: 'What is KFC’s main product?',
        options: [
          { text: 'Fried Chicken', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Pizza', isCorrect: false }
        ]
      },
      {
        text: 'Where was KFC founded?',
        options: [
          { text: 'Kentucky, USA', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Texas, USA', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Naivas',
    questions: [
      {
        text: 'What type of store is Naivas?',
        options: [
          { text: 'Supermarket', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Clothing Store', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Diet & Food',
    questions: [
      {
        text: 'Which food is low in carbohydrates?',
        options: [
          { text: 'Broccoli', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Bread', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Nakuru County',
    questions: [
      {
        text: 'What is the capital of Nakuru County?',
        options: [
          { text: 'Nakuru City', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Nairobi', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Smart/Electronic TVs',
    questions: [
      {
        text: 'What technology is used in smart TVs?',
        options: [
          { text: 'Internet Connectivity', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Steam Power', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Facebook',
    questions: [
      {
        text: 'Who founded Facebook?',
        options: [
          { text: 'Mark Zuckerberg', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Bill Gates', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Safaricom Home Fibre',
    questions: [
      {
        text: 'What does Safaricom Home Fibre provide?',
        options: [
          { text: 'Internet Service', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Mobile Phones', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Coca Cola',
    questions: [
      {
        text: 'What is the main ingredient in Coca Cola?',
        options: [
          { text: 'Carbonated Water', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Milk', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Optiven',
    questions: [
      {
        text: 'What does Optiven specialize in?',
        options: [
          { text: 'Real Estate', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Technology', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Social Media',
    questions: [
      {
        text: 'Which is a social media platform?',
        options: [
          { text: 'Twitter', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Microsoft Word', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Starting your day',
    questions: [
      {
        text: 'What is a common morning activity?',
        options: [
          { text: 'Drinking Coffee', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Swimming', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Cooking',
    questions: [
      {
        text: 'What is used to cook food?',
        options: [
          { text: 'Stove', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Refrigerator', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Mental health',
    questions: [
      {
        text: 'What helps improve mental health?',
        options: [
          { text: 'Exercise', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Smoking', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Access to clean water',
    questions: [
      {
        text: 'What ensures clean water?',
        options: [
          { text: 'Filtration', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Pollution', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Women Rights',
    questions: [
      {
        text: 'What is a key women’s right?',
        options: [
          { text: 'Equal Pay', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'No Voting', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Political Stability',
    questions: [
      {
        text: 'What promotes political stability?',
        options: [
          { text: 'Fair Elections', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Corruption', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Fresha Milk',
    questions: [
      {
        text: 'What is Fresha Milk?',
        options: [
          { text: 'Dairy Product', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Soft Drink', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Laptop Purchasing',
    questions: [
      {
        text: 'What to check when buying a laptop?',
        options: [
          { text: 'Specifications', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Color Only', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Healthcare access',
    questions: [
      {
        text: 'What improves healthcare access?',
        options: [
          { text: 'More Clinics', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Fewer Doctors', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Robotics',
    questions: [
      {
        text: 'What is robotics?',
        options: [
          { text: 'Study of Robots', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Cooking Method', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Hotel Industry',
    questions: [
      {
        text: 'What is key in the hotel industry?',
        options: [
          { text: 'Customer Service', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Farming', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'KPLC(Kenya Power)',
    questions: [
      {
        text: 'What does KPLC provide?',
        options: [
          { text: 'Electricity', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Water', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Shopping',
    questions: [
      {
        text: 'What is a common shopping item?',
        options: [
          { text: 'Clothes', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Rocks', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Cars',
    questions: [
      {
        text: 'What powers a car?',
        options: [
          { text: 'Engine', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Wind', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Television',
    questions: [
      {
        text: 'What is a TV used for?',
        options: [
          { text: 'Entertainment', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Cooking', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Furniture',
    questions: [
      {
        text: 'What is furniture made from?',
        options: [
          { text: 'Wood', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Glass', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Home Design',
    questions: [
      {
        text: 'What improves home design?',
        options: [
          { text: 'Good Lighting', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Dark Rooms', isCorrect: false }
        ]
      }
    ]
  },
  {
    topic: 'Hotel Industry', // Second instance (different payout)
    questions: [
      {
        text: 'What is essential for hotel rooms?',
        options: [
          { text: 'Cleanliness', isCorrect: true, payout: Math.floor(Math.random() * (100 - 50 + 1)) + 50 },
          { text: 'Noise', isCorrect: false }
        ]
      }
    ]
  }
];

const addQuestionsToFirestore = async () => {
  try {
    for (const survey of surveyQuestions) {
      const querySnapshot = await db.collection('surveys').get();
      const existingSurvey = querySnapshot.docs.find(doc => doc.data().topic === survey.topic);
      if (existingSurvey) {
        await db.collection('surveys').doc(existingSurvey.id).update({ questions: survey.questions });
        console.log(`Updated survey: ${survey.topic}`);
      } else {
        await db.collection('surveys').add({ ...survey, questions: survey.questions });
        console.log(`Added survey: ${survey.topic}`);
      }
    }
    console.log('All surveys with questions added successfully!');
  } catch (error) {
    console.error('Error adding surveys with questions:', error);
  }
};

addQuestionsToFirestore();