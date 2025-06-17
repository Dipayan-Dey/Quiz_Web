        // Quiz Data
        const questions = [
            {
                question: "What is the full form of POP in programming?",
                options: ["Popular Oriented Programming", "Proper Object Programming", " Procedural Oriented Programming", "Precompiled Object Program"],
                correct: 3
            },
            {
                question: " Which of the following languages is easier for humans to understand?",
                options: ["Low Level", "High Level", " Binary Code", "Assembly"],
                correct: 2
            },
            {
                question: "What is the purpose of a translator in programming?",
                options: ["Convert machine code to Englis", "Compile and run games", " Convert human-readable code to machine code", " Write code for the programmer"],
                correct: 3
            },
            {
                question: "Which is an example of an interpreted language?",
                options: ["Java", "Python", "Dart", "C++"],
                correct: 2
            },
            {
                question: "In object-oriented programming, a car is an example of a ?",
                options: ["Variable", "Object", "Loop", "Function"],
                correct: 2
            },
            {
                question: "What is the main difference between compiled and interpreted languages?",
                options: [" Interpreted languages are faster", "Compiled languages are translated all at once; interpreted line-by-line", " Compiled languages only run on Windows", "Interpreted languages cannot use functions"],
                correct: 2
            },
            {
                question: "Which language uses both compilation and interpretation?",
                options: ["Python", "Java", "C", "Laravel"],
                correct: 1
            },
            {
                question: "What does a 'medium level language' typically refer to?Which country is home to the Great Wall?",
                options: [" Close to machine language", "Only used in mobile apps", "Balance between human and machine readability", " Cannot be compiled"],
                correct: 3
            },
            {
                question: "In the hybrid model of translation (like Java), what is the intermediate code called?",
                options: ["Bytecode", "Assembly", "Binary", "Source code"],
                correct: 1
            },
            {
                question: "Why are high-level languages typically slower than low-level languages?",
                options: ["They need more RAM", "They require external power", "They require translation to machine code before execution", "They run only on virtual machines"],
                correct: 3
            }
        ];

        // Global Variables
        let currentQuestion = 0;
        let answers = [];
        let timeLeft = 1800; // 30 minutes
        let timer;
        let studentName = '';
        let studentEmail = '';
        let quizStartTime;
        let cheatingWarnings = 0;
        let isFullscreen = false;
        let tabSwitchCount = 0;
        let mouseInactiveTime = 0;
        let lastMouseMove = Date.now();

        // Security and Anti-Cheating
        function initializeSecurity() {
            // Disable right-click
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Disable key combinations
            document.addEventListener('keydown', function(e) {
                // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                    (e.ctrlKey && e.key === 'u') ||
                    (e.ctrlKey && e.key === 'c') ||
                    (e.ctrlKey && e.key === 'v') ||
                    (e.ctrlKey && e.key === 'a') ||
                    (e.ctrlKey && e.key === 's') ||
                    (e.altKey && e.key === 'Tab') ||
                    e.key === 'Escape') {
                    e.preventDefault();
                    showCheatingWarning();
                }
            });

            // Monitor tab visibility
            document.addEventListener('visibilitychange', function() {
                if (document.hidden && document.getElementById('quizContainer').style.display !== 'none') {
                    tabSwitchCount++;
                    showCheatingWarning();
                    if (tabSwitchCount >= 2) {
                        autoSubmitQuiz('Tab switching detected');
                    }
                }
            });

            // Monitor fullscreen changes
            document.addEventListener('fullscreenchange', function() {
                if (!document.fullscreenElement && document.getElementById('quizContainer').style.display !== 'none') {
                    showCheatingWarning();
                    setTimeout(() => {
                        if (!document.fullscreenElement) {
                            autoSubmitQuiz('Exited fullscreen mode');
                        }
                    }, 3000);
                }
            });

            // Monitor mouse activity
            document.addEventListener('mousemove', function() {
                lastMouseMove = Date.now();
            });

            // Check mouse inactivity
            setInterval(function() {
                if (Date.now() - lastMouseMove > 60000) { // 1 minute inactive
                    mouseInactiveTime++;
                    if (mouseInactiveTime > 3) {
                        showCheatingWarning();
                    }
                }
            }, 60000);

            // Disable text selection
            document.onselectstart = function() { return false; };
            document.onmousedown = function() { return false; };

            // Monitor browser focus
            window.addEventListener('blur', function() {
                if (document.getElementById('quizContainer').style.display !== 'none') {
                    showCheatingWarning();
                }
            });
        }

        function showCheatingWarning() {
            cheatingWarnings++;
            const banner = document.getElementById('warningBanner');
            banner.style.display = 'block';
            banner.innerHTML = `⚠️ WARNING: Suspicious activity detected! (${cheatingWarnings}/3)`;
            
            setTimeout(() => {
                banner.style.display = 'none';
            }, 5000);

            if (cheatingWarnings >= 3) {
                autoSubmitQuiz('Multiple cheating attempts detected');
            }
        }

        function autoSubmitQuiz(reason) {
            const overlay = document.createElement('div');
            overlay.className = 'cheating-detected';
            overlay.innerHTML = `
                <h2>🚫 QUIZ AUTO-SUBMITTED</h2>
                <p>Reason: ${reason}</p>
                <p>Your quiz has been automatically submitted due to suspicious activity.</p>
            `;
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                submitQuiz();
            }, 3000);
        }

        function enterFullscreen() {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            isFullscreen = true;
        }

        function startQuiz() {
            const name = document.getElementById('studentName').value.trim();
            const email = document.getElementById('studentEmail').value.trim();
            
            if (!name || !email) {
                alert('Please fill in all required fields!');
                return;
            }

            if (!validateEmail(email)) {
                alert('Please enter a valid email address!');
                return;
            }

            studentName = name;
            studentEmail = email;
            quizStartTime = new Date();

            // Force fullscreen
            enterFullscreen();
            
            // Initialize security after a short delay
            setTimeout(initializeSecurity, 1000);

            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('quizContainer').style.display = 'block';
            document.getElementById('studentInfo').innerHTML = `👤 ${name} | 📧 ${email}`;

            // Initialize quiz
            shuffleQuestions();
            displayQuestion();
            startTimer();
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function shuffleQuestions() {
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        }

        function displayQuestion() {
            const q = questions[currentQuestion];
            document.getElementById('questionNumber').textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
            document.getElementById('questionText').textContent = q.question;
            
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = '';
            
            q.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.innerHTML = `
                    <input type="radio" name="answer" value="${index}" id="option${index}">
                    <label for="option${index}">${option}</label>
                `;
                optionDiv.onclick = () => selectOption(index);
                optionsContainer.appendChild(optionDiv);
            });

            // Restore previous answer
            if (answers[currentQuestion] !== undefined) {
                selectOption(answers[currentQuestion]);
            }

            updateNavigation();
            updateProgress();
        }

        function selectOption(index) {
            // Clear previous selections
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            document.querySelectorAll('input[name="answer"]').forEach(input => input.checked = false);
            
            // Select current option
            document.getElementById(`option${index}`).checked = true;
            document.querySelector(`#option${index}`).closest('.option').classList.add('selected');
            
            answers[currentQuestion] = index;
        }

        function nextQuestion() {
            if (currentQuestion < questions.length - 1) {
                currentQuestion++;
                displayQuestion();
            }
        }

        function previousQuestion() {
            if (currentQuestion > 0) {
                currentQuestion--;
                displayQuestion();
            }
        }

        function updateNavigation() {
            document.getElementById('prevBtn').disabled = currentQuestion === 0;
            
            if (currentQuestion === questions.length - 1) {
                document.getElementById('nextBtn').style.display = 'none';
                document.getElementById('submitBtn').style.display = 'block';
            } else {
                document.getElementById('nextBtn').style.display = 'block';
                document.getElementById('submitBtn').style.display = 'none';
            }
        }

        function updateProgress() {
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        function startTimer() {
            timer = setInterval(() => {
                timeLeft--;
                updateTimerDisplay();
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    autoSubmitQuiz('Time expired');
                }
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timeLeft').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        function submitQuiz() {
            clearInterval(timer);
            
            // Calculate score
            let score = 0;
            for (let i = 0; i < questions.length; i++) {
                if (answers[i] === questions[i].correct) {
                    score++;
                }
            }
            
            const percentage = Math.round((score / questions.length) * 100);
            const endTime = new Date();
            const timeTaken = Math.round((endTime - quizStartTime) / 1000 / 60); // minutes
            
            // Store results
            const result = {
                name: studentName,
                email: studentEmail,
                score: score,
                total: questions.length,
                percentage: percentage,
                timeTaken: timeTaken,
                timestamp: endTime.toISOString(),
                cheatingWarnings: cheatingWarnings,
                tabSwitches: tabSwitchCount
            };
            
            storeResult(result);
            showResults(result);
        }

        function storeResult(result) {
            let results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            results.push(result);
            localStorage.setItem('quizResults', JSON.stringify(results));
        }

        function showResults(result) {
            document.getElementById('quizContainer').style.display = 'none';
            document.getElementById('resultsContainer').style.display = 'block';
            
            document.getElementById('scoreDisplay').textContent = `${result.score}/${result.total} (${result.percentage}%)`;
            
            // Generate detailed answer review
            const answerReview = generateAnswerReview();
            
            document.getElementById('resultDetails').innerHTML = `
                <p><strong>👤 Name:</strong> ${result.name}</p>
                <p><strong>📧 Email:</strong> ${result.email}</p>
                <p><strong>⏱️ Time Taken:</strong> ${result.timeTaken} minutes</p>
                <p><strong>📊 Score:</strong> ${result.score} out of ${result.total} questions</p>
                <p><strong>📈 Percentage:</strong> ${result.percentage}%</p>
                <p><strong>⚠️ Security Events:</strong> ${result.cheatingWarnings} warnings, ${result.tabSwitches} tab switches</p>
                <p><strong>🕐 Completed:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                <div style="margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 10px; border-left: 4px solid #4CAF50;">
                    <p><strong>📱 WhatsApp Status:</strong> <span id="whatsappStatus">Sending results...</span></p>
                </div>
                ${answerReview}
            `;
            
            // Automatically send to WhatsApp
            autoSendToWhatsApp(result);
        }

        function generateAnswerReview() {
            let reviewHTML = '<div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;"><h3>📋 Answer Review</h3>';
            
            questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.correct;
                const isCorrect = userAnswer === correctAnswer;
                
                reviewHTML += `
                    <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${isCorrect ? '#4CAF50' : '#f44336'}; background: white; border-radius: 5px;">
                        <div style="font-weight: bold; margin-bottom: 10px;">
                            ${isCorrect ? '✅' : '❌'} Question ${index + 1}: ${question.question}
                        </div>
                        <div style="margin: 8px 0;">
                            <span style="color: #666;">Your Answer:</span> 
                            <span style="color: ${isCorrect ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                                ${userAnswer !== undefined ? question.options[userAnswer] : 'Not answered'}
                            </span>
                        </div>
                        <div style="margin: 8px 0;">
                            <span style="color: #666;">Correct Answer:</span> 
                            <span style="color: #4CAF50; font-weight: bold;">
                                ${question.options[correctAnswer]}
                            </span>
                        </div>
                        ${!isCorrect ? `<div style="margin-top: 8px; padding: 8px; background: #fff3cd; border-left: 3px solid #ffc107; color: #856404; font-size: 0.9em;">
                            ${getExplanation(index)}
                        </div>` : ''}
                    </div>
                `;
            });
            
            reviewHTML += '</div>';
            return reviewHTML;
        }

        function getExplanation(questionIndex) {
            // Add explanations for each question (you can customize these)
            const explanations = [
                "💡 Paris is the capital and most populous city of France.",
                "💡 Mars appears red due to iron oxide (rust) on its surface.",
                "💡 Basic arithmetic: 2 + 2 = 4",
                "💡 Leonardo da Vinci painted the Mona Lisa between 1503-1519.",
                "💡 The Pacific Ocean covers about 46% of the world's water surface.",
                "💡 Nitrogen makes up about 78% of Earth's atmosphere.",
                "💡 Cheetahs can reach speeds up to 70 mph (112 km/h).",
                "💡 The Great Wall of China was built over many centuries starting from the 7th century BC.",
                "💡 2 is the smallest and only even prime number.",
                "💡 William Shakespeare wrote Romeo and Juliet around 1594-1596."
            ];
            
            return explanations[questionIndex] || "💡 Review this concept for better understanding.";
        }

        function downloadResults() {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            if (results.length === 0) return;
            
            const csv = generateCSV(results);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }

        function generateCSV(results) {
            const headers = ['Name', 'Email', 'Score', 'Total', 'Percentage', 'Time Taken (min)', 'Timestamp', 'Warnings', 'Tab Switches'];
            const rows = results.map(r => [
                r.name, r.email, r.score, r.total, r.percentage, r.timeTaken, r.timestamp, r.cheatingWarnings, r.tabSwitches
            ]);
            
            return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        }

        function autoSendToWhatsApp(result) {
            // Create comprehensive message with results
            const message = createWhatsAppMessage(result);
            
            // Update status
            const statusElement = document.getElementById('whatsappStatus');
            statusElement.innerHTML = '📤 Opening WhatsApp...';
            
            // Multiple sending attempts for better reliability
            setTimeout(() => {
                // Method 1: Direct WhatsApp Web link
                const whatsappUrl = `https://wa.me/918389806944?text=${encodeURIComponent(message)}`;
                
                // Try to open in same tab first (most reliable)
                try {
                    window.location.href = whatsappUrl;
                    statusElement.innerHTML = '✅ WhatsApp opened successfully!';
                } catch (error) {
                    // Fallback: Open in new tab
                    try {
                        window.open(whatsappUrl, '_blank');
                        statusElement.innerHTML = '✅ WhatsApp opened in new tab!';
                    } catch (error2) {
                        // Final fallback: Show link for manual opening
                        statusElement.innerHTML = `❌ Auto-send failed. <a href="${whatsappUrl}" target="_blank" style="color: #4CAF50; text-decoration: underline;">Click here to send manually</a>`;
                    }
                }
            }, 2000);
            
            // Alternative methods for mobile devices
            setTimeout(() => {
                if (isMobileDevice()) {
                    // Try mobile-specific WhatsApp schemes
                    const mobileSchemes = [
                        `whatsapp://send?phone=918389806944&text=${encodeURIComponent(message)}`,
                        `https://api.whatsapp.com/send?phone=918389806944&text=${encodeURIComponent(message)}`
                    ];
                    
                    mobileSchemes.forEach((scheme, index) => {
                        setTimeout(() => {
                            try {
                                window.location.href = scheme;
                            } catch (e) {
                                console.log(`Mobile scheme ${index + 1} failed:`, e);
                            }
                        }, index * 1000);
                    });
                }
            }, 1000);
        }

        function createWhatsAppMessage(result) {
            const message = `🎓 QUIZ RESULTS - SECURE ASSESSMENT

👤 Student Details:
Name: ${result.name}
Email: ${result.email}

📊 Performance Summary:
Score: ${result.score}/${result.total} questions
Percentage: ${result.percentage}%
Time Taken: ${result.timeTaken} minutes

🔐 Security Report:
Cheating Warnings: ${result.cheatingWarnings}
Tab Switches: ${result.tabSwitches}
Status: ${result.cheatingWarnings === 0 ? '✅ Clean Assessment' : '⚠️ Security Violations Detected'}

⏰ Assessment Details:
Completed: ${new Date(result.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Quiz ID: QZ-${Date.now().toString().slice(-6)}

📋 Answer Summary:
${generateAnswerSummaryForWhatsApp()}

---
Generated by Dipayan Dey
📧 Contact: dipayandey49@gmail.com`;

            return message;
        }

        function generateAnswerSummaryForWhatsApp() {
            let summary = '';
            let correctCount = 0;
            
            questions.forEach((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.correct;
                const isCorrect = userAnswer === correctAnswer;
                
                if (isCorrect) correctCount++;
                
                const status = isCorrect ? '✅' : '❌';
                const userAnswerText = userAnswer !== undefined ? question.options[userAnswer] : 'Not answered';
                
                summary += `\nQ${index + 1}: ${status} ${userAnswerText}`;
            });
            
            return `Correct: ${correctCount}/${questions.length}\n${summary}`;
        }

        function isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }

        function showAdmin() {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            const adminPanel = document.getElementById('adminPanel');
            const allResults = document.getElementById('allResults');
            
            adminPanel.style.display = 'block';
            
            if (results.length === 0) {
                allResults.innerHTML = '<p>No results found.</p>';
                return;
            }
            
            let html = '<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">';
            html += '<tr style="background: #f0f0f0;"><th style="border: 1px solid #ddd; padding: 8px;">Name</th><th style="border: 1px solid #ddd; padding: 8px;">Email</th><th style="border: 1px solid #ddd; padding: 8px;">Score</th><th style="border: 1px solid #ddd; padding: 8px;">%</th><th style="border: 1px solid #ddd; padding: 8px;">Time</th><th style="border: 1px solid #ddd; padding: 8px;">Date</th></tr>';
            
            results.forEach(result => {
                html += `<tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${result.name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${result.email}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${result.score}/${result.total}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${result.percentage}%</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${result.timeTaken}m</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${new Date(result.timestamp).toLocaleDateString()}</td>
                </tr>`;
            });
            
            html += '</table>';
            allResults.innerHTML = html;
        }

        function manualWhatsAppSend() {
            const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
            const latestResult = results[results.length - 1];
            
            if (!latestResult) return;
            
            const message = createWhatsAppMessage(latestResult);
            const whatsappUrl = `https://wa.me/918389806944?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }

        function exportAllResults() {
            downloadResults();
        }
        document.addEventListener('DOMContentLoaded', function() {
            // Show admin panel if accessed with admin parameter
            if (window.location.search.includes('admin=true')) {
                showAdmin();
            }
        });

        // Prevent mobile app switching
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        // Disable zoom
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });

        // Monitor page focus for mobile
        window.addEventListener('pagehide', function() {
            if (document.getElementById('quizContainer').style.display !== 'none') {
                // Store that user tried to minimize
                localStorage.setItem('quizInterrupted', 'true');
            }
        });

        window.addEventListener('pageshow', function() {
            if (localStorage.getItem('quizInterrupted') === 'true') {
                localStorage.removeItem('quizInterrupted');
                showCheatingWarning();
            }
        });
