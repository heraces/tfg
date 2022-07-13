
import requests
import string
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer 
from tensorflow.keras.utils import to_categorical 
from tensorflow.keras.preprocessing.sequence import pad_sequences 
from tensorflow.keras import models
import tensorflowjs as tfjs

import datetime
response = requests.get('https://ocw.mit.edu/ans7870/6/6.006/s08/lecturenotes/files/t8.shakespeare.txt')

#separamos por \n
data = response.text.split('\n')

#cortamos el data por donde empieza
data = data[253:]
#queremos juntar todo el data
data = "".join(data)

#separamos las palabras limpiamos texto
def clean_text(doc):
    token = doc.split()
    table = str.maketrans('','', string.punctuation)
    token = [w.translate(table) for w in token]

    token = [word for word in token if word.isalpha()]
    token = [word.lower() for word in token]
    return token

tokens = clean_text(data)

#numero de palabras que va a tomar en cuenta para generar el output
lenght = 20 + 1
lines = []

for i in range(lenght, len(tokens)):
    seq = tokens[i-lenght:i]#toma del 0:50, 1:51, 2:52
    line = " ".join(seq)
    lines.append(line)
    if i> 400000:#por temas de ram ponemos un tope
        break

tokenizer = Tokenizer()
tokenizer.fit_on_texts(lines)

sequences = tokenizer.texts_to_sequences(lines)
sequences = np.array(sequences)

x,y = sequences[:,:-1], sequences[:,-1]

vocab_size = len(tokenizer.word_index)+1
y = to_categorical(y, num_classes= vocab_size)


seq_lenght = x.shape[1]
model = models.load_model("LSTM-30w.h5")
tfjs.converters.save_keras_model(model, "saved_model")
#seed_text la frase desde la que saldra todo el text
#n_words las palabras que tiene que adivinar
def generate_text_sequence(model, tokenizer, seed_text, nwords):
    text = []

    for _ in range(nwords):
        encoded = tokenizer.texts_to_sequences([seed_text])[0]#index de la palabra
        encoded = pad_sequences([encoded], maxlen = 30, truncating = "pre")
        y_predict = np.argmax(model.predict(encoded), axis=-1)
        predicted_word = ""

        for word, index in tokenizer.word_index.items():
            if index == y_predict:
                predicted_word = word
                break

        seed_text = seed_text + " " + predicted_word
        text.append(predicted_word)

    return " ".join(text)



if __name__ == "__main__":
    empezar = " ".join(tokens[:30])
    print(datetime.datetime.now())
    print(empezar + generate_text_sequence(model, tokenizer, " ".join(tokens[:30]), 100))
    print(datetime.datetime.now())
