# Menti hacker

This chrome extension is meant to give replies to the quizzes created on the website menti.com.

## Overview

Behind the scene it's reading the API calls to get the questions and potential answers (sent at any time by menti) and it's displaying them in the extension panel. 
It's also doing an API call to an LLM to get the correct answers amongst the possible replies (it could also do it without the answers but since we already have them, let's use them!)

## Running this extension

1. Clone this repository.
2. Generate an API key on [Awan LLM](https://www.awanllm.com) and put it in panel.js
3. Load this directory in Chrome as an [unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).
4. Navigate to a menti.com quiz and open the devtools window and pick "Menti hacker" tab

## Possible improvements

* The API calls are performed many times as menti.com does many calls with the same content, we could filter and refresh only if something changes
* This only works with text, if images are sent in the quiz, it will not be handled
* Error management hasn't been done properly as this was done as a POC for fun
* Separate everything in service / helpers / etc
* If Awan LLM changes their API or models, everything will fail, maybe having a backup plan is good
* Prompt to LLM is not reliable as of now, sometimes the syntax of the reply is not exploitable by the JSON parser
* UI could be improved:
  - globally it's very light for now (no css)
  - questions and answers could be merged in a better way to make it easier to read
  - answers to open questions are not displayed in the answers section (we receive directly the possible answers from the menti API call)