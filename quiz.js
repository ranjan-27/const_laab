function resetQuiz() {
    location.href = 'quiz.html'; // Reloads the quiz page
  }
  
  function submitQuiz() {
    let score = 0;
  
    // Correct answers for the 10 questions
    let correctAnswers = {
      q1: '1', // Article 14
      q2: '3', // Part IVA
      q3: '3', // Article 21
      q4: '2', // Article 356
      q5: '2', // Part IV
      q6: '3', // Article 368
      q7: '2', // Part IX
      q8: '2', // Article 17
      q9: '2', // Fourth Schedule
      q10: '1' // Article 324
    };
  
    // Iterate through all 10 questions
    for (let i = 1; i <= 10; i++) {
      let selectedOption = document.querySelector(`input[name="q${i}"]:checked`);
      if (selectedOption) {
        if (selectedOption.value === correctAnswers[`q${i}`]) {
          score += 5; // Correct answer adds 5 points
        } else {
          score -= 2; // Wrong answer deducts 2 points
        }
      }
    }
  
    // Store the score in local storage to access it on the result page
  // save attempt with timestamp
  const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
  attempts.unshift({ score, date: new Date().toISOString() });
  // keep only last 10 attempts
  localStorage.setItem('quizAttempts', JSON.stringify(attempts.slice(0,10)));
  localStorage.setItem('quizScore', score);
  
    // Redirect to the submit (results) page
    location.href = 'submit.html';
  }
  