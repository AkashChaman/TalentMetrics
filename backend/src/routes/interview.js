/**
 * interview.js — Interview Routes
 * TalentMetrics Backend
 *
 * POST /api/interview/start-interview    — start session, return questions
 * POST /api/interview/submit-answers     — score + store result
 * GET  /api/interview/get-results/:id    — fetch one result
 * GET  /api/interview/get-ranking/:jobId — leaderboard
 * GET  /api/interview/my-results         — all results for current candidate
 * GET  /api/interview/all-candidates     — recruiter: all submissions
 */

const express = require('express');
const router  = express.Router();
const { getDB, admin }              = require('../config/firebase');
const { verifyToken, requireRole }  = require('../middleware/auth');

/* ─────────────────────────────────────────────────────
   QUESTION BANK  (server-side — client never sees answers)
───────────────────────────────────────────────────── */
const QUESTION_BANK = {
  1: [ // Software Engineer
    { id:'q1', type:'mcq',  text:'What is the time complexity of binary search on a sorted array?',           options:['O(n)','O(log n)','O(n²)','O(1)'],                                                          correct:1, points:12 },
    { id:'q2', type:'mcq',  text:'Which of the following is NOT a JavaScript primitive type?',                 options:['String','Boolean','Object','Symbol'],                                                       correct:2, points:12 },
    { id:'q3', type:'text', text:'Explain the core principles of RESTful APIs. How do they differ from SOAP?',                                                                                                       points:15 },
    { id:'q4', type:'mcq',  text:'What does the SOLID acronym represent in software engineering?',             options:['Object-oriented design principles','A programming language','A DB model','A test method'],  correct:0, points:12 },
    { id:'q5', type:'mcq',  text:'Which HTTP status code indicates a resource was successfully created?',      options:['200 OK','201 Created','204 No Content','404 Not Found'],                                    correct:1, points:12 },
    { id:'q6', type:'text', text:'Describe the difference between synchronous and asynchronous programming with real-world examples.',                                                                               points:15 },
    { id:'q7', type:'mcq',  text:'What is a JavaScript closure?',                                              options:['A function with access to its outer scope variables','A way to close browser tabs','A CSS selector','A DB transaction'], correct:0, points:12 },
    { id:'q8', type:'text', text:'How would you diagnose and optimize a slow SQL query on a table with 10 million rows? Walk through each step.',                                                                    points:10 },
  ],
  2: [ // Data Analyst
    { id:'q1', type:'mcq',  text:'What does SQL GROUP BY do?',                                                 options:['Sorts data alphabetically','Groups rows sharing a common value','Filters rows','Joins tables'],   correct:1, points:12 },
    { id:'q2', type:'mcq',  text:'Which chart type best shows the distribution of a continuous variable?',     options:['Bar chart','Pie chart','Histogram','Line chart'],                                               correct:2, points:12 },
    { id:'q3', type:'text', text:'Explain the difference between LEFT JOIN and INNER JOIN in SQL. Give an example for each.',                                                                                            points:15 },
    { id:'q4', type:'mcq',  text:'What is the main purpose of database normalization?',                        options:['Speed up all queries','Reduce data redundancy','Increase storage','Add more tables'],            correct:1, points:12 },
    { id:'q5', type:'mcq',  text:'Which Python library is the industry standard for tabular data manipulation?',options:['NumPy','Pandas','Matplotlib','Scikit-learn'],                                                  correct:1, points:12 },
    { id:'q6', type:'text', text:'How would you handle missing values in a dataset before ML training? Describe 3 strategies with trade-offs.',                                                                          points:15 },
    { id:'q7', type:'mcq',  text:'A p-value < 0.05 in an A/B test indicates?',                                 options:['The test failed','Statistical significance','Sample too small','Run the test longer'],           correct:1, points:12 },
    { id:'q8', type:'text', text:'Website conversions dropped 20% last Tuesday. Walk through your full data investigation process.',                                                                                      points:10 },
  ],
  3: [ // Product Manager
    { id:'q1', type:'mcq',  text:'What does a product roadmap primarily communicate?',                         options:['Exact feature specifications','Strategic direction and priorities','Budget allocations','Team structure'],  correct:1, points:12 },
    { id:'q2', type:'mcq',  text:'Which metric best measures product-market fit?',                             options:['Page views','Net Promoter Score','Daily Active Users','Conversion rate'],                                   correct:1, points:12 },
    { id:'q3', type:'text', text:'How do you prioritize features when stakeholders have conflicting requirements? Describe your framework.',                                                                                          points:15 },
    { id:'q4', type:'mcq',  text:'What is the purpose of a MVP (Minimum Viable Product)?',                    options:['Build the cheapest product','Validate assumptions with minimal effort','Ship faster','Reduce team size'],  correct:1, points:12 },
    { id:'q5', type:'mcq',  text:'Which framework is commonly used for prioritization?',                       options:['Agile','RICE scoring','Kanban','Waterfall'],                                                               correct:1, points:12 },
    { id:'q6', type:'text', text:'Describe how you would define success metrics for a new feature launch.',                                                                                                                          points:15 },
    { id:'q7', type:'mcq',  text:'User retention is dropping. What is your first step?',                       options:['Add new features','Investigate the cause with data','Lower the price','Increase marketing'],               correct:1, points:12 },
    { id:'q8', type:'text', text:'Tell me about a product decision you made with incomplete data. What was your process?',                                                                                                            points:10 },
  ],
  4: [ // UX Designer
    { id:'q1', type:'mcq',  text:'What is the primary goal of user research?',                                 options:['Make designs look beautiful','Understand user needs and behaviors','Speed up development','Reduce cost'],   correct:1, points:12 },
    { id:'q2', type:'mcq',  text:'Which UX deliverable maps the full customer journey?',                       options:['Wireframe','Prototype','Journey Map','Style Guide'],                                                        correct:2, points:12 },
    { id:'q3', type:'text', text:'Explain the difference between usability testing and A/B testing. When would you use each?',                                                                                                       points:15 },
    { id:'q4', type:'mcq',  text:'What does "information architecture" refer to in UX?',                       options:['Visual design system','Organization of content and navigation','Coding structure','Database schema'],       correct:1, points:12 },
    { id:'q5', type:'mcq',  text:'Hick\'s Law states that:',                                                   options:['Users read left to right','More choices increase decision time','Color affects emotion','Motion aids memory'], correct:1, points:12 },
    { id:'q6', type:'text', text:'Describe your design process from brief to final handoff. What tools do you use at each stage?',                                                                                                   points:15 },
    { id:'q7', type:'mcq',  text:'What is the key principle of "Progressive Disclosure" in UX?',               options:['Show all features upfront','Reveal information gradually as needed','Use animations everywhere','Minimize text'], correct:1, points:12 },
    { id:'q8', type:'text', text:'Walk me through a design decision where you had to push back on a stakeholder request. How did you handle it?',                                                                                    points:10 },
  ],
  5: [ // DevOps Engineer
    { id:'q1', type:'mcq',  text:'What does CI/CD stand for?',                                                 options:['Continuous Integration / Continuous Delivery','Code Integration / Code Deployment','Core Infrastructure / Cloud Deployment','None of the above'],  correct:0, points:12 },
    { id:'q2', type:'mcq',  text:'Which tool is used for container orchestration?',                            options:['Docker','Jenkins','Kubernetes','Terraform'],                                                                  correct:2, points:12 },
    { id:'q3', type:'text', text:'Explain Blue-Green deployment. What are its advantages and when would you choose it?',                                                                                                              points:15 },
    { id:'q4', type:'mcq',  text:'What is Infrastructure as Code (IaC)?',                                      options:['Writing app code on servers','Managing infra via config files/scripts','A cloud pricing model','A monitoring tool'], correct:1, points:12 },
    { id:'q5', type:'mcq',  text:'Which command shows real-time resource usage in Linux?',                      options:['ls -la','grep','top','chmod'],                                                                               correct:2, points:12 },
    { id:'q6', type:'text', text:'Your production service goes down at 3am. Walk through your incident response process step by step.',                                                                                               points:15 },
    { id:'q7', type:'mcq',  text:'What is the purpose of a load balancer?',                                    options:['Store application data','Distribute network traffic across servers','Monitor application logs','Encrypt data'], correct:1, points:12 },
    { id:'q8', type:'text', text:'How would you design a zero-downtime deployment pipeline for a microservices application?',                                                                                                         points:10 },
  ],
  6: [ // Marketing Analyst
    { id:'q1', type:'mcq',  text:'What does CAC stand for in marketing?',                                      options:['Customer Acquisition Cost','Content Analytics Channel','Conversion and Click','Campaign Attribution Cost'],  correct:0, points:12 },
    { id:'q2', type:'mcq',  text:'Which metric measures email campaign effectiveness?',                        options:['Page views','Open rate','Server uptime','Bounce rate on ads'],                                              correct:1, points:12 },
    { id:'q3', type:'text', text:'How would you design an experiment to measure the impact of a new ad campaign on brand awareness?',                                                                                                points:15 },
    { id:'q4', type:'mcq',  text:'What is the marketing funnel\'s top stage called?',                          options:['Conversion','Retention','Awareness','Decision'],                                                           correct:2, points:12 },
    { id:'q5', type:'mcq',  text:'Which analysis helps identify most valuable customer segments?',             options:['RFM Analysis','SWOT Analysis','Porter\'s Five Forces','PEST Analysis'],                                    correct:0, points:12 },
    { id:'q6', type:'text', text:'Describe how you would build a marketing attribution model for a multi-channel campaign.',                                                                                                         points:15 },
  ],
};

function getQuestions(jobId) {
  return QUESTION_BANK[jobId] || QUESTION_BANK[1];
}

// Remove correct answers before sending to client
function sanitize(questions) {
  return questions.map(({ correct, ...q }) => q);
}

/* ─────────────────────────────────────────────────────
   POST /api/interview/start-interview
   Body: { jobId, jobTitle }
   Creates a session in Firestore, returns sanitized questions
───────────────────────────────────────────────────── */
router.post('/start-interview', verifyToken, async (req, res) => {
  try {
    const { jobId, jobTitle } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId is required.' });

    const db = getDB();

    // Check if already completed
    const done = await db.collection('interviews')
      .where('candidateId', '==', req.user.uid)
      .where('jobId', '==', Number(jobId))
      .where('status', '==', 'completed')
      .limit(1).get();

    if (!done.empty) {
      const doc = done.docs[0].data();
      return res.status(409).json({
        error: 'You have already completed this interview.',
        resultId: doc.resultId || null,
      });
    }

    const questions  = getQuestions(Number(jobId));
    const sessionRef = db.collection('interviews').doc();

    await sessionRef.set({
      sessionId:      sessionRef.id,
      candidateId:    req.user.uid,
      candidateEmail: req.user.email,
      jobId:          Number(jobId),
      jobTitle:       jobTitle || 'General Interview',
      status:         'in_progress',
      startedAt:      admin.firestore.FieldValue.serverTimestamp(),
      completedAt:    null,
      totalQuestions: questions.length,
      score:          null,
    });

    return res.status(201).json({
      sessionId:      sessionRef.id,
      questions:      sanitize(questions),
      jobTitle:       jobTitle || 'General Interview',
      totalQuestions: questions.length,
    });
  } catch (err) {
    console.error('start-interview error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   POST /api/interview/submit-answers
   Body: { sessionId, jobId, answers: {q1:0, q2:"text"...}, timeTaken }
   Scores answers, stores result in Firestore
───────────────────────────────────────────────────── */
router.post('/submit-answers', verifyToken, async (req, res) => {
  try {
    const { sessionId, jobId, answers, timeTaken } = req.body;
    if (!sessionId || !answers) {
      return res.status(400).json({ error: 'sessionId and answers are required.' });
    }

    const db = getDB();

    // Validate session
    const sessionRef = db.collection('interviews').doc(sessionId);
    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) return res.status(404).json({ error: 'Session not found.' });

    const session = sessionDoc.data();
    if (session.candidateId !== req.user.uid) return res.status(403).json({ error: 'Session mismatch.' });
    if (session.status === 'completed') {
      return res.status(409).json({
        error: 'Interview already submitted.',
        resultId: session.resultId || null,
      });
    }

    // ── Score Calculation ──
    const questions  = getQuestions(Number(jobId));
    let totalPoints  = 0;
    let earnedPoints = 0;
    const feedback   = [];

    questions.forEach(q => {
      totalPoints += q.points;
      const ans    = answers[q.id];
      let passed   = false;
      let comment  = '';

      if (q.type === 'mcq') {
        passed  = Number(ans) === q.correct;
        comment = passed
          ? 'Correct answer selected.'
          : `Incorrect. The correct answer was option ${String.fromCharCode(65 + q.correct)}.`;
        if (passed) earnedPoints += q.points;
      } else {
        const words = (ans || '').trim().split(/\s+/).filter(Boolean).length;
        if      (words >= 50) { earnedPoints += q.points;                        passed = true;  comment = 'Well-detailed answer demonstrating strong understanding.'; }
        else if (words >= 20) { earnedPoints += Math.round(q.points * 0.6);     passed = true;  comment = 'Adequate answer. More detail and examples would improve the score.'; }
        else if (words >= 5)  { earnedPoints += Math.round(q.points * 0.25);    passed = false; comment = 'Answer too brief. Expand with specific examples and reasoning.'; }
        else                  {                                                   passed = false; comment = 'No meaningful answer provided for this question.'; }
      }

      feedback.push({ questionId: q.id, questionText: q.text, type: q.type, passed, points: q.points, comment });
    });

    const score  = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= 60;

    // ── AI-style overall feedback ──
    let aiFeedback;
    if      (score >= 85) aiFeedback = 'Outstanding performance! You demonstrated exceptional technical depth and clear communication. You are a top-tier candidate for this role.';
    else if (score >= 70) aiFeedback = 'Excellent result. Solid understanding of core concepts across the board. A few areas could use more depth, but you are a strong candidate.';
    else if (score >= 60) aiFeedback = 'Good effort — you cleared the passing threshold. Your foundational knowledge is sound. Focus on strengthening the areas flagged in the detailed feedback.';
    else                  aiFeedback = 'This attempt did not reach the 60% passing threshold. Review the flagged topics carefully and consider re-attempting after further preparation.';

    // ── Store result in Firestore ──
    const resultRef = db.collection('results').doc();
    await resultRef.set({
      resultId:       resultRef.id,
      sessionId,
      candidateId:    req.user.uid,
      candidateEmail: req.user.email,
      jobId:          Number(jobId),
      jobTitle:       session.jobTitle,
      score,
      passed,
      earnedPoints,
      totalPoints,
      timeTaken:      timeTaken || 0,
      feedback,
      aiFeedback,
      answers,
      submittedAt:    admin.firestore.FieldValue.serverTimestamp(),
      rank:           null,
    });

    // ── Mark session completed ──
    await sessionRef.update({
      status:      'completed',
      score,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      resultId:    resultRef.id,
    });

    // ── Update user doc ──
    await db.collection('users').doc(req.user.uid).update({
      completedInterviews: admin.firestore.FieldValue.arrayUnion(Number(jobId)),
      updatedAt:           admin.firestore.FieldValue.serverTimestamp(),
    });

    // ── Calculate rank ──
    const allResults = await db.collection('results')
      .where('jobId', '==', Number(jobId))
      .orderBy('score', 'desc')
      .get();

    let rank = 1;
    allResults.forEach(doc => {
      if (doc.id !== resultRef.id && doc.data().score > score) rank++;
    });

    await resultRef.update({ rank });

    return res.status(201).json({
      resultId: resultRef.id,
      score,
      passed,
      rank,
      earnedPoints,
      totalPoints,
      aiFeedback,
      feedback,
      timeTaken: timeTaken || 0,
    });
  } catch (err) {
    console.error('submit-answers error:', err);
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/interview/get-results/:resultId
───────────────────────────────────────────────────── */
router.get('/get-results/:resultId', verifyToken, async (req, res) => {
  try {
    const doc = await getDB().collection('results').doc(req.params.resultId).get();
    if (!doc.exists) return res.status(404).json({ error: 'Result not found.' });

    const data = doc.data();
    if (req.user.role === 'candidate' && data.candidateId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/interview/get-ranking/:jobId
───────────────────────────────────────────────────── */
router.get('/get-ranking/:jobId', verifyToken, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const snap  = await getDB().collection('results')
      .where('jobId', '==', jobId)
      .orderBy('score', 'desc')
      .orderBy('timeTaken', 'asc')
      .limit(50).get();

    const leaderboard = snap.docs.map((doc, idx) => {
      const d = doc.data();
      return {
        rank:           idx + 1,
        candidateId:    d.candidateId,
        candidateEmail: req.user.role === 'recruiter' ? d.candidateEmail : (d.candidateId === req.user.uid ? d.candidateEmail : '***'),
        score:          d.score,
        passed:         d.passed,
        timeTaken:      d.timeTaken,
        isYou:          d.candidateId === req.user.uid,
      };
    });

    const you = leaderboard.find(l => l.isYou);
    return res.json({
      jobId,
      leaderboard,
      yourRank:     you?.rank || null,
      yourScore:    you?.score || null,
      totalEntries: leaderboard.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/interview/my-results  — candidate's own results
───────────────────────────────────────────────────── */
router.get('/my-results', verifyToken, async (req, res) => {
  try {
    const snap = await getDB().collection('results')
      .where('candidateId', '==', req.user.uid)
      .orderBy('submittedAt', 'desc').get();

    const results = snap.docs.map(doc => {
      const d = doc.data();
      return {
        resultId:    doc.id,
        jobId:       d.jobId,
        jobTitle:    d.jobTitle,
        score:       d.score,
        passed:      d.passed,
        rank:        d.rank,
        timeTaken:   d.timeTaken,
        aiFeedback:  d.aiFeedback,
        submittedAt: d.submittedAt?.toDate?.() || null,
      };
    });

    return res.json({ results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────
   GET /api/interview/all-candidates  — recruiter only
───────────────────────────────────────────────────── */
router.get('/all-candidates', verifyToken, requireRole('recruiter'), async (req, res) => {
  try {
    const snap = await getDB().collection('results')
      .orderBy('score', 'desc').limit(100).get();

    const candidates = snap.docs.map(doc => {
      const d = doc.data();
      return {
        resultId:       doc.id,
        candidateId:    d.candidateId,
        candidateEmail: d.candidateEmail,
        jobId:          d.jobId,
        jobTitle:       d.jobTitle,
        score:          d.score,
        passed:         d.passed,
        rank:           d.rank,
        timeTaken:      d.timeTaken,
        aiFeedback:     d.aiFeedback,
        submittedAt:    d.submittedAt?.toDate?.() || null,
      };
    });

    return res.json({ candidates, total: candidates.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
