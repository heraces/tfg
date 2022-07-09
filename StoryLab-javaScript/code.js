

function abc(){
    console.log(window.tokenizer)
}
function generate(){
    predict(base, 10);
}

const base = "from fairest creatures we desire increase that thereby beautys rose might never die but as the riper should by time decease his tender heir might bear his memory but thou contracted to thine own bright eyes feedst thy lights flame with selfsubstantial fuel making a famine where abundance lies thygrossly blood"

var tokenizer;
const startButton = document.getElementById("StartButton");

//cargamos el modelo y las palabras convertidas en tokens
const loadModel =  async() => {
    try{
        window.model = await tf.loadLayersModel('./model_json/model.json');
        await fetch("./tokens/tokenizer").then(response => response.json()).then(data => window.tokenizer = data);
        startButton.disabled = false;
    }
    catch{
        console.log("Problema al cargar el modelo")
    }
    return true;
}

// iniciamos el game
function startGame() {    
    startButton.disabled = true;//el boton de inicio solo funciona a partir de que loadmodel acabe
    loadModel();
}

//convierte una frase en una sucesion de numeros
function predict(phrase, num){
    const pre = phrase.substr(0, num)
    for(var i = 0; i<10; i++){

        const encoded = encode(phrase);
        const a = model.predict(tf.tensor([encoded]))
        const b = adivinaElIndice(a.arraySync()[0])//generamos la siguiente palabra

        phrase += " " + getTheToken(b)//añadimos la siguiente palabra


        var e = 0;//eliminamos la primera palabra
        while (phrase[e]!= " "){
            e++;
        }
        phrase = phrase.substr(e+1, phrase.length-1)

    }
    console.log(pre + " " + phrase)
}

//devuelve el indice de la palabra mas posible
function adivinaElIndice(adivina){
    var index = 0;
    var maxValue = 0;
    for (var i = 0; i< adivina.length; i++){
        if (adivina[i] > maxValue){
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