import pydub

def detect_leading_silence(sound, silence_threshold=-50.0, chunk_size=10):
    trim_ms = 0  # ms
    while sound[trim_ms:trim_ms + chunk_size].dBFS < silence_threshold:
        trim_ms += chunk_size
        if trim_ms >= len(sound):
            return trim_ms

    return trim_ms


def convert_to_audioSegment(sound):
    start_trim = detect_leading_silence(sound)
    end_trim = detect_leading_silence(sound.reverse())

    duration = len(sound)
    trimmed_sound = sound[start_trim:duration - end_trim]
    return trimmed_sound


if __name__ == '__main__':
    pass
