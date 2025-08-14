import { displayTrainingBadge } from './badge.js';

document.addEventListener('DOMContentLoaded', async () => {
   // const API_URL = 'http://localhost:3000/api';
    const API_URL = 'https://traininghealthandsafety.com:4000/api';

    // Get references to DOM elements
    const logoutButton = document.getElementById('logoutButton');
    const courseView = document.getElementById('course-view');
    const quizView = document.getElementById('quiz-view');
    const courseList = document.getElementById('course-list');
    const quizTitle = document.getElementById('quiz-title');
    const videoEmbed = document.getElementById('video-embed');
    const quizQuestionsContainer = document.getElementById('quiz-questions');
    const submitQuizButton = document.getElementById('submit-quiz');
    const backToCoursesButton = document.getElementById('back-to-courses');
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    const messageIcon = document.getElementById('message-icon');
    const userNameElement = document.getElementById('userName');

    // Reference to the new badge element
    const trainingStatusBadge = document.getElementById('training-status-badge');

    let allCourses = [];
    let userProgress = {};
    let currentCourse = null;
    let userAnswers = {};
    let currentUserData = {};

    // Function to get the latest user data from the backend and update local storage
    const fetchAndUpdateUserData = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/user/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            const user = await response.json();
            currentUserData = user;
            localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
            console.error("Error fetching user data:", error);
            showMessage('Failed to update user data.', true);
        }
    };

    // Check for a logged-in user and populate currentUserData
    const checkUser = async () => {
        const localUser = localStorage.getItem('user');

        if (localUser) {
            const parsedUser = JSON.parse(localUser);

            try {
                // Fetch the latest user data from the server to ensure the badge status is correct
                const response = await fetch(`${API_URL}/user/${parsedUser.id}`);
                if (!response.ok) {
                    console.error("Failed to fetch current user data from server. Using local data.");
                    currentUserData = parsedUser;
                } else {
                    const userFromServer = await response.json();
                    currentUserData = userFromServer;
                    localStorage.setItem('user', JSON.stringify(userFromServer));
                }

                if (!currentUserData.current_level) {
                    currentUserData.current_level = 1;
                }
                return true;
            } catch (error) {
                console.error("Error fetching user data on page load:", error);
                currentUserData = parsedUser;
                return true;
            }
        } else {
            console.error("No user found. Redirecting to login page.");
            window.location.replace('index.html');
            return false;
        }
    };
    
    // Helper function to show a temporary message box
    const showMessage = (message, isError = false) => {
        messageText.textContent = message;
        messageBox.classList.remove('d-none', 'success', 'error');
        messageIcon.className = 'bi';

        if (isError) {
            messageBox.classList.add('error');
            messageIcon.classList.add('bi-x-circle-fill');
        } else {
            messageBox.classList.add('success');
            messageIcon.classList.add('bi-check-circle-fill');
        }

        messageBox.classList.add('show');

        setTimeout(() => {
            messageBox.classList.remove('show');
            setTimeout(() => {
                messageBox.classList.add('d-none');
            }, 400);
        }, 4000);
    };

    // Helper function to switch between views
    const setView = (viewName) => {
        if (viewName === 'courses') {
            courseView.classList.remove('d-none');
            quizView.classList.add('d-none');
        } else if (viewName === 'quiz') {
            courseView.classList.add('d-none');
            quizView.classList.remove('d-none');
        }
    };

    // Function to fetch courses from the backend
    const fetchCourses = async () => {
        try {
            const response = await fetch(`${API_URL}/courses`);
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            allCourses = await response.json();
        } catch (error) {
            console.error("Error fetching courses:", error);
            showMessage('Failed to load courses. Please check the backend server.', true);
        }
    };

    // Function to fetch user progress from the backend
    const fetchUserProgress = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/user-progress/${userId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    userProgress = {};
                    return;
                }
                throw new Error('Failed to fetch user progress');
            }
            const progressArray = await response.json();
            userProgress = progressArray.reduce((acc, progress) => {
                acc[progress.course_id] = progress;
                return acc;
            }, {});
        } catch (error) {
            console.error("Error fetching user progress:", error);
            showMessage('Failed to load user progress. Please check the backend server.', true);
        }
    };

    // Function to render the course cards
    const renderCourses = () => {
        courseList.innerHTML = '';
        if (allCourses.length === 0) {
            courseList.innerHTML = '<p class="text-center text-muted fs-5 my-5">No courses available. Please add courses to the database.</p>';
            return;
        }

        const sortedCourses = [...allCourses].sort((a, b) => a.level - b.level);
        const currentLevel = currentUserData.current_level;

        sortedCourses.forEach(course => {
            const courseCompleted = userProgress[course.id]?.is_completed === true;
            const isLocked = course.level > currentLevel;
            const cardStateClass = isLocked ? 'bg-light text-muted' : (courseCompleted ? 'bg-success-subtle' : '');

            const courseCard = document.createElement('div');
            courseCard.className = 'col-md-6 col-lg-4 mb-4';
            courseCard.innerHTML = `
                <div class="card h-100 shadow-sm course-card ${cardStateClass}">
                    <div class="card-body d-flex flex-column course-card-content">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title">${course.title}</h5>
                            <span class="badge bg-secondary">Level ${course.level}</span>
                        </div>
                        <p class="card-text flex-grow-1">
                            ${isLocked ? 'Complete the previous course to unlock this one.' : (courseCompleted ? 'You have completed this course.' : 'Click below to start your training!')}
                        </p>
                        <div class="mt-auto d-grid">
                            <button class="btn ${isLocked ? 'btn-secondary' : (courseCompleted ? 'btn-success' : 'btn-primary')} start-course-btn"
                                ${isLocked ? 'disabled' : ''} data-course-id="${course.id}">
                                ${isLocked ? '<i class="bi bi-lock-fill me-2"></i>Locked' : (courseCompleted ? '<i class="bi bi-check-lg me-2"></i>Completed' : 'Start Course')}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            courseList.appendChild(courseCard);

            const startCourseBtn = courseCard.querySelector('.start-course-btn');
            if (startCourseBtn && !isLocked && !courseCompleted) {
                startCourseBtn.addEventListener('click', () => startQuiz(course.id));
            }
        });
    };

    // Function to start a quiz
    const startQuiz = async (courseId) => {
        const course = allCourses.find(c => c.id === courseId);
        if (!course) {
            showMessage('Error: Course not found.', true);
            return;
        }

        currentCourse = course;
        userAnswers = {};

        quizTitle.textContent = `${course.title} Quiz`;
        videoEmbed.innerHTML = `<iframe src="https://www.youtube.com/embed/${course.video_id}?rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

        quizQuestionsContainer.innerHTML = '';
        const sortedQuestions = [...course.questions].sort((a, b) => a.id - b.id);
        sortedQuestions.forEach((q, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'card mb-3 shadow-sm';
            questionElement.innerHTML = `
                <div class="card-body">
                    <p class="fw-bold mb-3">${index + 1}. ${q.question_text}</p>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="question-${q.id}" value="A" id="q${q.id}a">
                        <label class="form-check-label" for="q${q.id}a">${q.option_a}</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="question-${q.id}" value="B" id="q${q.id}b">
                        <label class="form-check-label" for="q${q.id}b">${q.option_b}</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="question-${q.id}" value="C" id="q${q.id}c">
                        <label class="form-check-label" for="q${q.id}c">${q.option_c}</label>
                    </div>
                </div>
            `;
            quizQuestionsContainer.appendChild(questionElement);

            questionElement.querySelectorAll('input[type="radio"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    userAnswers[q.id] = e.target.value;
                });
            });
        });

        setView('quiz');
    };

    // Function to handle quiz submission
    const submitQuiz = async () => {
        const requiredAnswers = currentCourse.questions.length;
        if (Object.keys(userAnswers).length !== requiredAnswers) {
            showMessage('Please answer all the questions before submitting.', true);
            return;
        }

        let correctAnswers = 0;
        currentCourse.questions.forEach((q) => {
            if (userAnswers[q.id] === q.correct_option) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / requiredAnswers) * 100;
        const passingScore = 80;
        const passed = score >= passingScore;

        try {
            const response = await fetch(`${API_URL}/submit-quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUserData.id,
                    courseId: currentCourse.id,
                    passed: passed,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit quiz.');
            }
            
            if (passed) {
                showMessage(`Congratulations, you passed! You scored ${score.toFixed(0)}%.`, false);

                // Get the highest course level
                const maxCourseLevel = allCourses.reduce((max, course) => Math.max(max, course.level), 0);

                // Re-fetch the user data to get the latest current_level from the backend
                await fetchAndUpdateUserData(currentUserData.id);

                // Now, check if the user's new current_level is greater than the max course level
                if (currentUserData.current_level > maxCourseLevel) {
                    await fetch(`${API_URL}/complete-training`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: currentUserData.id }),
                    });
                    showMessage("Congratulations! You've completed all training modules!", false);

                    // Re-fetch user data one last time to get the final training_completed status
                    await fetchAndUpdateUserData(currentUserData.id);
                }
            } else {
                showMessage(`You scored ${score.toFixed(0)}%. Please review the materials and try again.`, true);
            }
            
            // After submitting the quiz, re-initialize the page to fetch new data and update the UI
            await init();

        } catch (error) {
            console.error("Error submitting quiz:", error);
            showMessage('An error occurred while submitting the quiz.', true);
        }
    };

    // Main initialization function
    const init = async () => {
        // Display user name
        userNameElement.textContent = currentUserData.name || "Guest";
        
        // Check and display training completion status
        displayTrainingBadge(currentUserData, trainingStatusBadge);
        
        await fetchCourses();
        await fetchUserProgress(currentUserData.id);
        renderCourses();
        setView('courses');
    };

    // Event listeners
    logoutButton.addEventListener('click', async () => {
        localStorage.removeItem('user');
        showMessage('You have been logged out successfully.', false);
        setTimeout(() => {
            window.location.replace('index.html');
        }, 1500);
    });

    submitQuizButton.addEventListener('click', submitQuiz);
    backToCoursesButton.addEventListener('click', () => {
        videoEmbed.innerHTML = '';
        setView('courses');
    });

    // Start the application only after a successful user check
    if (await checkUser()) {
        await init();
    }
});
