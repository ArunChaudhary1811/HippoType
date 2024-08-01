const words = 'where is light key and you are the feet should name right left tree play night scale light dark place me i table generator code man blue fight train sky bike on might in the cable gone world had may many the wrong interested up blow bottom red garden hello because you have to two cycle phenomena indian economy be there good human bag development incorrect this concept notebook pen bat playing cricket fleet nice main index zebra volvo lying bus kinaur kalpa is the best place and there flight went fiscal bright word loop and many going floor night day'.split(' ');


const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

function addClass(el, name){
    el.className += ' ' + name;
}

function removeClass(el, name){
    el.className = el.className.replace(name, '');
}

function randomWord(){
    const randomIndex = Math.ceil(Math.random() * wordsCount);
    return words[randomIndex - 1];
}

function formatWord(word){
    return `<div class = "word"><span class = "letter">${word.split('').join('</span><span class = "letter">')}</span></div>`;
}

function newGame(){
    document.getElementById('words').innerHTML = '';
    for(let i = 0; i < 200; i++){
        document.getElementById('words').innerHTML += formatWord(randomWord());
    }
    
    addClass(document.querySelector('.word'), 'current');
    addClass(document.querySelector('.letter'), 'current');
    document.getElementById('info').innerHTML = (gameTime / 1000) + '';
    window.timer = null;

    const isOver = document.querySelector('#game.over');
    if(isOver){
        removeClass(isOver, 'over');
    }
    cursor.style.top = 178 + 'px';
    cursor.style.left = 11 + 'px';
}


function getWpm(){
    const words = [...document.querySelectorAll('.word')];
    const lastTypedWord = document.querySelector('.word.current');
    const lastTypedWordIndex = words.indexOf(lastTypedWord);
    const typedWords = words.slice(0, lastTypedWordIndex);
    const correctWords = typedWords.filter(word => {
        const letters = [...word.children];
        const incorrectLetters = letters.filter(letter => letter.className.includes('incorrect'));
        const correctLetters = letters.filter(letter => letter.className.includes('correct'));
        return incorrectLetters.length === 0 && correctLetters.length === letters.length;
    });
    
    return correctWords.length / gameTime * 60000;
}


function gameOver(){
    clearInterval(window.timer);
    window.gameStart = null;
    addClass(document.getElementById('game'), 'over');
    const result = getWpm();
    document.getElementById('info').innerHTML = `WPM: ${result}`;
}


document.getElementById('game').addEventListener('keyup', ev => {
    const key = ev.key;
    const currentWord = document.querySelector('.word.current');
    const currentLetter = document.querySelector('.letter.current');
    const expected = currentLetter?.innerHTML || ' ';
    const isLetter = key.length === 1 && key !== ' ';
    const isSpace = key === ' ';
    const isBackspace = key === 'Backspace';
    const isFirstLetter = currentLetter === currentWord.firstChild;

    if(document.querySelector('#game.over')){
        return;
    }

    console.log({key, expected});

    if(!window.timer && (isLetter || isSpace)){
        window.timer = setInterval(() => {
            if(!window.gameStart){
                window.gameStart = (new Date()).getTime();
            }
            const currentTime = (new Date()).getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = (gameTime / 1000) - sPassed;
            if(sLeft <= 0){
                gameOver();
                return;
            }
            document.getElementById('info').innerHTML = sLeft + '';
        }, 1000);
    }

    if(isLetter){
        if(currentLetter){
            addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
            removeClass(currentLetter, 'current');
            if(currentLetter.nextSibling){
                addClass(currentLetter.nextSibling, 'current');
            }
        }
        else{
            const incorrectLetter = document.createElement('span');
            incorrectLetter.innerHTML = key;
            incorrectLetter.className = 'letter incorrect extra';
            currentWord.appendChild(incorrectLetter);
        }
    }

    if(isSpace){
        if(expected !== ' '){
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
            lettersToInvalidate.forEach(letter => {
                addClass(letter, 'incorrect');
            });
        }
        removeClass(currentWord, 'current');
        addClass(currentWord.nextSibling, 'current');
        if(currentLetter){
            removeClass(currentLetter, 'current');
        }
        addClass(currentWord.nextSibling.firstChild, 'current');
    }
    
    if(isBackspace){
        if(currentLetter && isFirstLetter){
            // Make previous word current, last letter current
            removeClass(currentWord, 'current');
            addClass(currentWord.previousSibling, 'current');
            removeClass(currentLetter, 'current');
            addClass(currentWord.previousSibling.lastChild, 'current');
            removeClass(currentWord.previousSibling.lastChild, 'incorrect');
            removeClass(currentWord.previousSibling.lastChild, 'correct');
            const extraLetter = document.querySelector('.letter.current.extra');
            if(extraLetter){
                removeClass(extraLetter, 'letter');
                removeClass(extraLetter, 'current');
                removeClass(extraLetter, 'extra');
                currentWord.previousSibling.removeChild(currentWord.previousSibling.lastChild);
            }
        }
        if(currentLetter && !isFirstLetter){
            // Move back one letter, invalidate letter
            removeClass(currentLetter, 'current');
            addClass(currentLetter.previousSibling, 'current');
            removeClass(currentLetter.previousSibling, 'incorrect');
            removeClass(currentLetter.previousSibling, 'correct');
        }
        if(!currentLetter){
            addClass(currentWord.lastChild, 'current');
            removeClass(currentWord.lastChild, 'incorrect');
            removeClass(currentWord.lastChild, 'correct');
            const extraLetter = document.querySelector('.letter.current.extra');
            if(extraLetter){
                removeClass(extraLetter, 'letter');
                removeClass(extraLetter, 'current');
                removeClass(extraLetter, 'extra');
                currentWord.removeChild(currentWord.lastChild);
            }
        }
    }


    // Move lines / words
    if(currentWord.getBoundingClientRect().top > 220){
        const words = document.getElementById('words');
        const margin = parseInt(words.style.marginTop || '0px') ;
        words.style.marginTop = (margin - 35) + 'px';
    }


    // Move cursor
    const nextLetter = document.querySelector('.letter.current');
    const nextWord = document.querySelector('.word.current');
    const cursor = document.getElementById('cursor');
    if(nextLetter){
        cursor.style.top = nextLetter.getBoundingClientRect().top + 2 +  'px';
        cursor.style.left = nextLetter.getBoundingClientRect().left + 'px';
    }
    else{
        cursor.style.top = nextWord.getBoundingClientRect().top + 6 +  'px';
        cursor.style.left = nextWord.getBoundingClientRect().right + 'px';
    }
});


document.getElementById('newGameBtn').addEventListener('click', () => {
    const isOver = document.querySelector('#game.over');
    if(!isOver){
        gameOver();
    }
    newGame();
});

newGame();
