# -*- coding: utf-8 -*-
from flask import Flask
from flask import make_response
from flask import redirect
from flask import render_template
from flask import request
from pydub import AudioSegment

from filt import convert_to_audioSegment
from gcloudFileLocate import gcloudFileLocate
from fileLocate import fileLocate, addZeros, lang_identify, num_identify
from io import BytesIO
from google.cloud import storage
import uuid

app = Flask(__name__)

@app.route("/")
def welcome():
    return render_template("record.html")


@app.route("/start")
def start():
    response = make_response(redirect('/'))
    session_id = uuid.uuid4().hex
    response.set_cookie('session_id', session_id)
    return response


@app.route('/upload', methods=['POST'])
def upload():
    word = request.args.get('word')
    trial_number = request.args.get('trialN')
    name = request.args.get('name')

    trial_number = addZeros(trial_number)

    number = num_identify(word)
    language = lang_identify(word)

    audio_data = request.data

    gcloud_filename = gcloudFileLocate("voices/", number, language, name, trial_number)

    audio_data = (AudioSegment.from_file(BytesIO(audio_data)))

    audio_data = convert_to_audioSegment(audio_data)
    ######################################################

    storage_client = storage.Client(project="key-words-recorder")

    bucket = storage_client.bucket("key-words-recorder.appspot.com")

    blob = bucket.blob(gcloud_filename)

    #################################################

    gcloud_audio = audio_data.export()

    blob.upload_from_file(gcloud_audio, content_type='wav')

    return make_response('All good')


if __name__ == "__main__":
    app.run( ssl_context=('cert.pem', 'key.pem'), threaded=True, port=80)
