document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const testListSection = document.getElementById('test-list');
    const testContainer = document.getElementById('test-container');
    const resultContainer = document.getElementById('result-container');
    const testTitleElement = document.getElementById('test-title');
    const questionContainer = document.getElementById('question-container');
    const resultContent = document.getElementById('result-content');
    const submitTestBtn = document.getElementById('submit-test');
    const backToTestsBtn = document.getElementById('back-to-tests');
    
    // Variables de estado
    let testsData = [];
    let currentTest = null;
    let userAnswers = [];
    
    // Cargar tests desde JSON
    fetch('tests.json')
        .then(response => response.json())
        .then(data => {
            testsData = data.tests;
            renderTestList();
        })
        .catch(error => {
            console.error('Error al cargar los tests:', error);
            testListSection.innerHTML = '<div class="error">Error al cargar los tests. Por favor, recarga la página.</div>';
        });
    
    // Renderizar lista de tests
    function renderTestList() {
        testListSection.innerHTML = testsData.map(test => `
            <div class="test-card" data-test-id="${test.id}">
                <img src="${test.image || 'assets/default-test.jpg'}" alt="${test.title}">
                <div class="test-card-content">
                    <h3>${test.title}</h3>
                    <p>${test.description}</p>
                    <div class="btn">Realizar test</div>
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a las tarjetas de test
        document.querySelectorAll('.test-card').forEach(card => {
            card.addEventListener('click', function() {
                const testId = this.getAttribute('data-test-id');
                startTest(testId);
            });
        });
    }
    
    // Iniciar un test
    function startTest(testId) {
        currentTest = testsData.find(test => test.id === testId);
        if (!currentTest) return;
        
        userAnswers = [];
        testTitleElement.textContent = currentTest.title;
        renderQuestions();
        
        // Mostrar el test y ocultar la lista
        testListSection.classList.add('hidden');
        testContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        
        // Desplazar hacia el inicio del test
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Renderizar preguntas
    function renderQuestions() {
        questionContainer.innerHTML = currentTest.questions.map((question, qIndex) => `
            <div class="question">
                <h3>${qIndex + 1}. ${question.text}</h3>
                <div class="options">
                    ${question.options.map((option, oIndex) => `
                        <label class="option">
                            <input type="radio" name="question-${qIndex}" value="${oIndex}">
                            ${option.text}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // Agregar event listeners a las opciones
        document.querySelectorAll('.option input').forEach(input => {
            input.addEventListener('change', function() {
                const questionIndex = parseInt(this.name.split('-')[1]);
                const optionIndex = parseInt(this.value);
                userAnswers[questionIndex] = optionIndex;
            });
        });
    }
    
    // Mostrar resultados
    function showResults() {
        if (!currentTest || userAnswers.length !== currentTest.questions.length) {
            alert('Por favor responde todas las preguntas antes de ver los resultados.');
            return;
        }
        
        // Calcular puntuación
        let score = 0;
        userAnswers.forEach((answer, index) => {
            score += currentTest.questions[index].options[answer].value;
        });
        
        // Determinar el resultado basado en la puntuación
        let result = currentTest.results.find(r => 
            score >= r.minScore && score <= (r.maxScore || Infinity)
        ) || currentTest.results[0];
        
        // Mostrar el resultado
        resultContent.innerHTML = `
            <h3>${result.title}</h3>
            <p>${result.description}</p>
            ${result.image ? `<img src="${result.image}" alt="${result.title}">` : ''}
            <div class="share-buttons">
                <p>Comparte tu resultado:</p>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank">Facebook</a>
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mi resultado: ${result.title} - ${window.location.href}`)}" target="_blank">Twitter</a>
            </div>
        `;
        
        // Mostrar el contenedor de resultados y ocultar el test
        testContainer.classList.add('hidden');
        resultContainer.classList.remove('hidden');
        
        // Desplazar hacia los resultados
        window.scrollTo({ top: resultContainer.offsetTop, behavior: 'smooth' });
        
        // Activar popunder de Adsterra (asegúrate de tener el código correcto)
        try {
            // Esto activará el popunder configurado en el HTML
            // Adsterra generalmente maneja esto automáticamente cuando se carga el iframe
        } catch (e) {
            console.error('Error con el anuncio:', e);
        }
    }
    
    // Volver a la lista de tests
    function backToTestList() {
        testListSection.classList.remove('hidden');
        testContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Event listeners
    submitTestBtn.addEventListener('click', showResults);
    backToTestsBtn.addEventListener('click', backToTestList);
});