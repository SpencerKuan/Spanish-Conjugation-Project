
let reflexive;
let pick = list => list[Math.floor(Math.random()*list.length)];


class wordGrid {
    constructor(generator, size = 20, cellSize = 600 / size) {
        this.rows = size;
        this.cols = size;
        this.grid = [];
        this.cellSize = cellSize;

        this.createGrid(generator);
    }

    createGrid(generator = () => " "){
        this.grid = [];
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                this.grid.push(generator(i, j));
            }
        }
    }

    write(word, x, y, dx, dy, override = false){
        let isSameOrEmpty = true;
        for(let i = 0; i < word.length; i++) {
            const letter = this.grid[(y + i * dy) * this.cols + x + i * dx];
            isSameOrEmpty = isSameOrEmpty && (letter === " " || letter === word[i]);
        }

        if (
            (x + word.length * dx > this.cols || x + word.length * dx < 0) || 
            (y + word.length * dy > this.rows || y + word.length * dy < 0) || 
            !isSameOrEmpty && !override
        ) return false;

        for(let i = 0; i < word.length; i++){
            this.grid[(y + i * dy) * this.cols + x + i * dx] = word[i];
        }

        return true;
    }

    writeHorizontal = (word, x, y, override = false) => this.write(word, x, y, 1, 0, override)
    writeVertical = (word, x, y, override = false) => this.write(word, x, y, 0, 1, override)
    writeDiagonal = (word, x, y, override = false) => this.write(word, x, y, 1, 1, override)

    findSpace(word, maxIterations = 10){
        let x, y, dx, dy;
        let found = false;
        let i = 0;

        while(!found){
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
            dx = Math.floor(Math.random() * 2);
            dy = Math.floor(Math.random() * 2);

            if (dx === 0 && dy === 0) continue;

            found = this.write(word, x, y, dx, dy);
            if (++i > maxIterations) return false;
        }

        return {x, y, dx, dy};
    }

    draw(){
        textSize(9);
        textAlign(CENTER, CENTER);

        stroke(255);
        for(let i = 0; i < this.rows; i++){
            let y = i * this.cellSize;
            line(0, y, this.cols * this.cellSize, y);
        }
        for(let i = 0; i < this.cols; i++){
            let x = i * this.cellSize;
            line(x, 0, x, this.rows * this.cellSize);
        }

        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                let x = j * this.cellSize;
                let y = i * this.cellSize;

                fill(255);
                text(this.grid[i * this.cols + j], x + this.cellSize/2*1.5, y + this.cellSize/2*1.5);
            }
        }
    }

    static randomLetter(){
        return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
};

// word grid
const grid = new wordGrid();

// words to add
var words = [];

// used words
let wordsAdded = [];

// all tasks to run async in the draw loop
const tasks = new Set();

function generate(){

    let num = 0;
    words = reflexive.reflexiveWords.map(x => {
        const pronoun = pick(reflexive.pronouns);
        const word = reflexive.conjugateReflexive(x.word, pronoun, x.irregular).replaceAll(" ", "");

        return {
            word: Array(word.length).fill(++num),
            hint: reflexive.pronounMap[pronoun].english + "; " + x.english.join(" ")
        }
    });
    wordsAdded = [];

    grid.createGrid();

    const propogate = createSpreadTask(propogateWords);
    propogate.then(x => {
        console.log("done", x);

        renderWordList(x);

        // replace each empty square with a random letter
        // grid.grid = grid.grid.map(x => x === " " ? pick("abcdefghijklmnopqrstuvwxyz".split('')) : x);
    })
}

let canvas;
async function setup(){
    noStroke();

    canvas = createCanvas(600, 600);
    canvas.canvas.classList.add("output-canvas");

    await loadDependencies();
    generate();
}


let propogateWords = (() => {    
    let iterations = 0;

    return function propogateWords(){
        for(var i = 0; i < 100; i ++){
            if (words.length){
                let wordIndex = Math.floor(Math.random() * words.length);
                let word = words[wordIndex];
                let found = !!grid.findSpace(word.word, 10);
            
                if (found) {
                    wordsAdded.push(word);
                    words.splice(wordIndex, 1);
                }
            }
        }
    
        if(!words.length || ++iterations >= 60) return wordsAdded;
    }
})();


tasks.add(function render(){
    background(0);
    grid.draw();
})

function draw (){
    for(let task of tasks){
        task(task);
    }
}


// --- utils --- //

function randomVerb(){
    var pronoun = pick(reflexive.pronouns);
    var word = pick(reflexive.reflexiveWords);
    
    return reflexive.conjugateReflexive(word.word, pronoun, word.irregular);
}

function renderWordList(words){
    let element = document.getElementById("wordListItems");
    element.innerHTML = "";

    words.forEach(word => {
        let li = document.createElement("li");
        li.innerHTML = word.hint;
        element.appendChild(li);
    });
}

// load dependencies
async function loadDependencies(){
    reflexive = await import ("./reflexive.js");
    console.log(reflexive.pronouns);
}

function createSpreadTask(work, maxIts = null){
    let iterations = 0;

    const promise = new Promise((resolve, reject) => {
        const task = function(){
            const done = work();

            if (done) {
                tasks.delete(task);
                resolve(done);
            } else if (maxIts && ++iterations > maxIts){
                tasks.delete(task);
                reject("Max iterations reached");
            }
        }

        tasks.add(task);
    });
    
    return promise;
}