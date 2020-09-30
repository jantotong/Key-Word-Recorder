import os.path


def fileLocate(location, keyword, language, trial):
    location = location + keyword + "\\" + language + "\\"
    for i in range(1, 10000):
        tId = str(i)
        while (len(tId) != 4):
            tId = "0" + tId
        tId = location + tId + "_" + trial + ".wav"
        if not (os.path.isfile(tId)):
            return tId


def addZeros(trial):
    while (len(trial) != 2):
        trial = "0" + trial
    return trial


numb_dict = {
    "One": "1",
    "一": "1",
    "Two": "2",
    "二": "2",
    "Three": "3",
    "三": "3",
    "Four": "4",
    "四": "4",
    "Five": "5",
    "五": "5",
    "Six": "6",
    "六": "6",
    "Seven": "7",
    "七": "7",
    "Eight": "8",
    "八": "8",
    "Nine": "9",
    "九": "9",
    "Ten": "10",
    "十": "10",
}
english_chars = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"]
chinese_chars = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
lang_dict = {}
for i in chinese_chars:
    lang_dict[i] = "Mandarin"
for i in english_chars:
    lang_dict[i] = "English"


def lang_identify(word):
    language = lang_dict[word]
    return language


def num_identify(num):
    numba = numb_dict[num]
    return numba


if __name__ == "__main__":
    fileLocate.run()
