import os.path
import re


def fileLocate(location, keyword, language, name, trial):
    location = location + keyword + "\\" + language + "\\"
    for i in range(1, 10000):
        flag = 0
        numb = str(i)
        while len(numb) != 4:
            numb = "0" + numb

        #Must be a new number
        if int(trial) == 1:
            for filepath in os.listdir(location):
                if re.match(numb, filepath):
                    flag = 1
            if flag == 0:
                return location + numb + "_" + name + "_" + trial + ".wav"
        #Must not be a new number
        else:
            #find next number, if doesn't exist, this is the one
            temp = int(numb) + 1
            stemp = str(temp)
            while len(stemp) != 4:

                stemp = "0" + stemp
            for filepath in os.listdir(location):
                if re.match(stemp, filepath):
                    flag = 1
            if flag == 0:
                return location + numb + "_" + name + "_" + trial + ".wav"


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
    "Hi UMEC": "hi_UMEC",
    "你好 UMEC": "hi_UMEC",
    "UMEC" : "UMEC",
}
english_chars = ["One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Hi UMEC", "UMEC"]
chinese_chars = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "你好 UMEC"]
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
