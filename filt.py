import json
import sys
from io import BytesIO

from pydub import AudioSegment
import pydub


def detect_leading_silence(sound, silence_threshold=-55.0, chunk_size=10):
    '''
    sound is a pydub.AudioSegment
    silence_threshold in dB
    chunk_size in ms
    iterate over chunks until you find the first one with sound
    '''
    trim_ms = 0  # ms
    while sound[trim_ms:trim_ms + chunk_size].dBFS < silence_threshold:
        trim_ms += chunk_size

    return trim_ms


def convert_to_audioSegment(mars):
    sound = (AudioSegment.from_file(BytesIO(mars)))

    start_trim = detect_leading_silence(sound)
    end_trim = detect_leading_silence(sound.reverse())

    duration = len(sound)
    trimmed_sound = sound[start_trim:duration - end_trim]
    return trimmed_sound


if __name__ == '__main__':
    pass
