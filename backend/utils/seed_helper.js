const mongoose = require('mongoose');
const User      = require('../models/User');
const Job       = require('../models/Job');
const Interview = require('../models/Interview');

async function seed() {
  console.log('🌱 Seeding demo data...');

  // Clean slate
  await Promise.all([User.deleteMany(), Job.deleteMany(), Interview.deleteMany()]);

  // Users
  const [hr, candidate] = await User.create([
    { name: 'Priya Sharma',  email: 'hr@demo.com',        password: 'demo123', role: 'hr' },
    { name: 'Arjun Mehta',   email: 'candidate@demo.com', password: 'demo123', role: 'candidate' },
  ]);
  console.log('✅ Users created');

  // Jobs
  const [job1, job2] = await Job.create([
    {
      title: 'Senior Frontend Engineer',
      description: 'We need a skilled React developer with 4+ years of experience building scalable web apps.',
      createdBy: hr._id,
      questions: [
        'Tell me about yourself and your background in frontend development.',
        'Describe a challenging React project you built. What architectural decisions did you make?',
        'How do you approach performance optimization in large React applications?',
        'Explain the difference between useMemo, useCallback, and React.memo.',
        'How do you handle state management in complex applications?',
      ],
      evaluationCriteria: { communication: true, technical: true, confidence: true },
    },
    {
      title: 'Product Manager',
      description: 'Looking for an experienced PM to lead our growth products.',
      createdBy: hr._id,
      questions: [
        'Walk me through your product management experience.',
        'How do you prioritize features when you have limited engineering resources?',
        'Describe a time you had to make a decision with incomplete data.',
        'How do you measure the success of a product feature?',
        'Tell me about a product failure and what you learned from it.',
      ],
      evaluationCriteria: { communication: true, technical: false, confidence: true },
    },
  ]);
  console.log('✅ Jobs created');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('HR login:        hr@demo.com / demo123');
  console.log('Candidate login: candidate@demo.com / demo123');
  console.log('─────────────────────────────────');
}

module.exports = { seed };
