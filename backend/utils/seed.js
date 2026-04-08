require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User      = require('../models/User');
const Job       = require('../models/Job');
const Interview = require('../models/Interview');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Connected to MongoDB, seeding...');

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

  // Completed interview
  await Interview.create({
    jobId:       job1._id,
    candidateId: candidate._id,
    answers: [
      {
        question: 'Tell me about yourself and your background in frontend development.',
        answer: 'I have 5 years of experience with React and TypeScript. I\'ve worked at two startups and led a team of 4 engineers. My most notable project was a real-time analytics dashboard handling 100k daily users.',
        followUp: 'What was the most complex technical challenge in that dashboard?',
        followUpAnswer: 'Rendering 10k data points in real time. I switched to canvas-based rendering with virtual windowing which reduced render time from 2s to 80ms.',
      },
      {
        question: 'Describe a challenging React project you built. What architectural decisions did you make?',
        answer: 'I built a drag-and-drop kanban board with offline support using React Query and IndexedDB for sync.',
        followUp: 'How did you handle conflict resolution when syncing offline changes?',
        followUpAnswer: 'Used a last-write-wins strategy with timestamps and a manual conflict resolution UI for critical data.',
      },
      {
        question: 'How do you approach performance optimization in large React applications?',
        answer: 'I start with React DevTools profiling, identify render bottlenecks, then apply memoization, code splitting, and virtualization.',
        followUp: null, followUpAnswer: null,
      },
      {
        question: 'Explain the difference between useMemo, useCallback, and React.memo.',
        answer: 'useMemo memoizes computed values, useCallback memoizes function references, React.memo prevents re-renders when props are shallow-equal.',
        followUp: null, followUpAnswer: null,
      },
      {
        question: 'How do you handle state management in complex applications?',
        answer: 'I use Zustand for global state and React Query for server state. For very large apps I\'ve used Redux Toolkit with RTK Query.',
        followUp: null, followUpAnswer: null,
      },
    ],
    scores:         { communication: 8, technical: 9, confidence: 8 },
    feedback:       'Arjun demonstrates excellent technical depth with concrete examples. Strong React internals knowledge and performance patterns. Communication is clear and structured. High confidence evidenced by specific metrics and measurable outcomes.',
    strengths:      ['Deep React knowledge', 'Performance optimization expertise', 'Metrics-driven thinking'],
    weaknesses:     ['Limited mention of testing practices', 'Could elaborate more on team collaboration'],
    recommendation: 'hire',
    status:         'shortlisted',
    completedAt:    new Date(Date.now() - 86400000),
  });
  console.log('✅ Sample interview created');

  console.log('\n🎉 Seed complete!');
  console.log('─────────────────────────────────');
  console.log('HR login:        hr@demo.com / demo123');
  console.log('Candidate login: candidate@demo.com / demo123');
  console.log('─────────────────────────────────');
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
