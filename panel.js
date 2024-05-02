// Here update the API KEY generated on awanllm
const AWANLLM_API_KEY = "YOUR_API_KEY";

// Add a listener to all network requests
chrome.devtools.network.onRequestFinished.addListener((req) => {
    // Filter requests from menti which gives us the whole content of the presentation
    if (req.request.url.startsWith("https://www.menti.com/core/vote-keys")) {
        req.getContent((content, _encoding) => {
            let questions = JSON.parse(content).questions;
            if (!questions) {return;}
            // Filter the quiz related questions and map it to a simple readable object
            let realQuizQuestions = questions.filter(question => ["quiz", "quiz_open"].includes(question.type));
            let formattedQuiz = realQuizQuestions.map(question => ({question: question.question, isOpen: question.type === "quiz_open", responses: question.choices?.map(choice => choice.label) || []}));
            // This function is asynchronous, we start it before processing the questions formatting to save time
            getResponsesFromLLM(formattedQuiz).then((validAnswers) => addAnswersToPage(validAnswers));
            addQuestionsToPage(formattedQuiz);
        });
    }
});

// Function to add the questions in the panel by formatting them
function addQuestionsToPage(formattedQuiz) {
    var questionList = document.getElementById('questions');
    questionList.innerHTML = "";
    formattedQuiz.forEach((item) => {
        var questionDiv = document.createElement('div');
        questionDiv.innerHTML = '<h3>' + item.question + (item.isOpen ? " Good answers to type:" : "") + '</h3>';

        var responsesList = document.createElement('ul');
        item.responses.forEach((response) => {
            var responseItem = document.createElement('li');
            responseItem.textContent = response;
            responsesList.appendChild(responseItem);
        });

        questionDiv.appendChild(responsesList);
        questionList.appendChild(questionDiv);
    });
}

// Async function doing the API call to the LLM model
// The expected format of the answer is an array of {question: 'initialQuestion', response: 'correctResponse'}
async function getResponsesFromLLM(formattedQuiz) {
    let questionsToSend = formattedQuiz.filter(question => !question.isOpen).map(question => ({question: question.question, responses: question.responses}));
    const prompt = `Here are some questions with potential responses, please return the list of answers the correct one and return to me in the same format but with only the correct answer under the 'response' value and as a string instead of an array: ${JSON.stringify(questionsToSend)}`;
    const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${AWANLLM_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "Meta-Llama-3-8B-Instruct-Dolfin-v0.1",
            messages: [{role: "user", content: prompt}],
        })
    });

    const llmResponse = await response.json();
    // The response is returned as {}, {} so we force it as an array
    // This is a big point of failure now because the format is not always returned by LLM as the correct one - this could be improved by putting a better prompt
    try {
        const validAnswers = JSON.parse(`\[${llmResponse.choices[0].message.content}\]`);
        return validAnswers;
    } catch (e) {
        console.error('Response from LLM was not formatted properly');
        return [];
    }
}

// Function to add the answers in the panel by formatting them
function addAnswersToPage(validAnswers) {
    var answersList = document.getElementById('responses');
    answersList.innerHTML = "";
    validAnswers.forEach((answer) => {
        var answerDiv = document.createElement('div');
        answerDiv.innerHTML = '<h3>' + answer.question + '</h3>' + '<span>' + answer.response + '</span>';
        answersList.appendChild(answerDiv);
    });
}