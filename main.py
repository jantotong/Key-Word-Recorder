import pyaudio
from flask import Flask
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from pydub import AudioSegment
from filt import convert_to_audioSegment
from fileLocate import fileLocate, addZeros, lang_identify, num_identify, name_identify
from io import BytesIO

import uuid

app = Flask(__name__)
THRESHOLD = 500
CHUNK_SIZE = 1024
FORMAT = pyaudio.paInt16
RATE = 44100


@app.route("/")
def welcome():
    return render_template("record.html")


@app.route("/start")
def start():
    response = make_response(redirect('/'))
    session_id = uuid.uuid4().hex
    response.set_cookie('session_id', session_id)
    return response


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    word = request.args.get('word')
    trial_number = request.args.get('trialN')
    name = request.args.get('name')

    trial_number = addZeros(trial_number)

    number = num_identify(word)
    language = lang_identify(word)

    audio_data = request.data

    # filename for server
    filename = fileLocate("\\\\Fps\\rnd\\AIot\\KWS_Data\\voices\\", number, language, name, trial_number)

    local_filename = fileLocate("C:\\Users\\jttong\\Desktop\\voices\\", number, language, name, trial_number)

    audio_data = (AudioSegment.from_file(BytesIO(audio_data)))

    audio_data = convert_to_audioSegment(audio_data)

    audio_data.export(filename, format="wav")
    audio_data.export(local_filename, format="wav")

    # with open(filename, 'wb') as f:
    #     f.write(audio_data)

    return make_response('All good')


if __name__ == "__main__":
    app.run(debug=True)
