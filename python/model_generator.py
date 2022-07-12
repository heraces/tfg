
import requests
import string
import numpy as np
from tensorflow.keras.preprocessing.text import Tokenizer 
from tensorflow.keras.utils import to_categorical 
from tensorflow.keras.models import Sequential 
from tensorflow.keras.layers import Dense, LSTM, Embedding 
from tensorflow.keras.preprocessing.sequence import pad_sequences 

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
lenght = 50 + 1
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
model = Sequential()
model.add(Embedding(vocab_size,50, input_length = seq_lenght))
model.add(LSTM(100, return_sequences = True))
model.add(LSTM(100))
model.add(Dense(100, activation = "relu"))
model.add(Dense(vocab_size, activation = "softmax"))

model.compile(loss = "categorical_crossentropy", optimizer = "adam", metrics = ["accuracy"])

model.fit(x, y, batch_size = 256, epochs=100)

model.save("LSTM.h5")

