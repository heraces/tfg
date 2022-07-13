
function abc(){
    outputText.innerText =  "predict(base, 1"
}
function generate(){
    startButton.disabled = true;
    var size = 0;
    if (duration.value == "short"){
        size = 20;
    }
    else{
        if(duration.value == "medium"){
            size = 50
        }
        else{
            size = 100
        }
    }
    text = "once upon a time in England"
    
    if(model_type == "Shakesperean"){
        textDeliverShakespear(size);
    }
    else if (model_type == "Informal"){
        textDeliverInformal(size);
    }
    else{
        textDeliverMix(size);
    }

    
    startButton.disabled = false;
}

function textDeliverShakespear(size){
    for (var i = 0; i< size; i++){
        setTimeout(() => {
            text += predict50(text);
            outputText.innerText = text;}, 75);
    }
}

function textDeliverInformal(size){
    for (var i = 0; i< size; i++){
        setTimeout(() => {
            text += predict30(text);
            outputText.innerText = text;}, 75);
    }
}


function textDeliverMix(size){
    for (var i = 0; i< size; i++){
        setTimeout(() => {
            if(Math.random() < 0.5){
                text += predict30(text);
            }
            else{
                text += predict50(text);
            }
            outputText.innerText = text;}, 75);
    }
}

var text = "";
const base = "from fairest creatures we desire increase that thereby beautys rose might never die but as the riper should by time decease his tender heir might bear his memory but thou contracted to thine own bright eyes feedst thy lights flame with selfsubstantial fuel making a famine where abundance lies thygrossly blood"

var tokenizer;
const startButton = document.getElementById("StartButton");
const outputText = document.getElementById("outputText");

const duration = document.getElementById("duration");
const model_type = document.getElementById("duration");

//cargamos el modelo y las palabras convertidas en tokens
const loadModel =  async() => {
        window.model50 = await tf.loadLayersModel('https://raw.githubusercontent.com/heraces/tfg/main/StoryLab-javaScript/model_json/model.json');
        window.model30 = await tf.loadLayersModel('https://raw.githubusercontent.com/heraces/tfg/main/StoryLab-javaScript/model_json30/model.json');
        await fetch("./tokens/tokenizer").then(response => response.json()).then(data => window.tokenizer = data);
        startButton.disabled = false;
    return true;
}

// iniciamos el game
function startGame() {    
    startButton.disabled = true;//el boton de inicio solo funciona a partir de que loadmodel acabe
    loadModel();
}

//convierte una frase en una sucesion de numeros
function predict50(phrase){
    var encoded = encode(phrase);
    if(encoded.length < 50){//si la phrase es desmasiado corta le añadimos ceros
        const h = []
        while (encoded.length + h.length < 50){
            h.push(0)
        }
        encoded = h.concat(encoded)
    }
    if(encoded.length>50){//si es demasiado larga la acortamos
        encoded = encoded.slice(encoded.length-51,encoded.length-1)
    }
    const a = model50.predict(tf.tensor([encoded]))
    const b = adivinaElIndice(a.arraySync()[0])//generamos la siguiente palabra

    return " " + getTheToken(b)
}

function predict30(phrase){
    var encoded = encode(phrase);
    if(encoded.length < 30){//si la phrase es desmasiado corta le añadimos ceros
        const h = []
        while (encoded.length + h.length < 30){
            h.push(0)
        }
        encoded = h.concat(encoded)
    }
    if(encoded.length>30){//si es demasiado larga la acortamos
        encoded = encoded.slice(encoded.length-31,encoded.length-1)
    }
    const a = model30.predict(tf.tensor([encoded]))
    const b = adivinaElIndice(a.arraySync()[0])//generamos la siguiente palabra

    return " " + getTheToken(b)
}


//devuelve el indice de la palabra mas posible
function adivinaElIndice(adivina){
    var index = 0;
    var maxValue = 0;
    for (var i = 0; i< adivina.length; i++){
        if (adivina[i] > maxValue && Math.random() < 0.5){
            maxValue = adivina[i];
            index = i;
        }
    }

    return index
}

//devuelve la palabra especificada por un numero
function getTheToken(numero){
    for (const [key, value] of Object.entries(window.tokenizer)) {
  
        if(value == numero){
            return key;
        }
    }

    return "n"
}

//convierte un string en una lista de indices
function encode(frase){
    var divided = frase.split(" ")
    var endPhrase = []
    divided.forEach(element => {
        for (const [key, value] of Object.entries(window.tokenizer)) {
      
            if(key == element){
                endPhrase.push(value);
                continue
            }
        }
    });

    return endPhrase;
}

  
  
window.onload = startGame();//al iniciar la ventana, iniciamos el game