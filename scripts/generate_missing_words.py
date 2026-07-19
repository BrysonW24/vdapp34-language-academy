#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import time
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import jieba.posseg as pseg
import requests
from deep_translator import GoogleTranslator
from pypinyin import Style, lazy_pinyin
from pythainlp.corpus import tnc
from pythainlp.tag import pos_tag
from pythainlp.transliterate import romanize
from wordfreq import top_n_list


APP_DIR = Path(__file__).resolve().parents[1]
CONTENT_DIR = APP_DIR / "content" / "curriculum"

SUPPORTED_LANGS = ("zh", "de", "th")

ZH_PATTERN = re.compile(r"[\u4e00-\u9fff]+")
DE_PATTERN = re.compile(r"[A-Za-zÄÖÜäöüß]+")
TH_PATTERN = re.compile(r"[ก-๙]+")

GERMAN_HEADERS = {"User-Agent": "Mozilla/5.0"}
GERMAN_NOUNS_URL = "https://raw.githubusercontent.com/gambolputty/german-nouns/main/german_nouns/nouns.csv"
GERMAN_DICT_URL = "https://raw.githubusercontent.com/hathibelagal/German-English-JSON-Dictionary/master/german_english.json"
GERMAN_PRONUNCIATION_URL = "https://raw.githubusercontent.com/DanielSWolf/wiki-pronunciation-dict/main/dictionaries/de.json"

GREETING_KEYWORDS = {"hello", "hi", "goodbye", "bye", "thanks", "thank you", "sorry", "welcome"}
NUMBER_KEYWORDS = {"one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "hundred", "thousand", "million"}
TIME_KEYWORDS = {"day", "week", "month", "year", "today", "tomorrow", "yesterday", "time", "morning", "afternoon", "evening", "night", "hour", "minute", "second", "late", "early"}
PEOPLE_KEYWORDS = {"person", "people", "man", "woman", "child", "friend", "mother", "father", "brother", "sister", "teacher", "student", "doctor", "customer", "family"}
QUESTION_KEYWORDS = {"what", "who", "when", "where", "why", "how", "which", "question"}
FOOD_KEYWORDS = {"food", "water", "tea", "coffee", "bread", "rice", "meat", "fruit", "vegetable", "milk", "beer", "wine", "egg", "fish", "soup", "chicken"}
TRAVEL_KEYWORDS = {"go", "come", "arrive", "leave", "street", "road", "station", "airport", "hotel", "city", "train", "bus", "car", "plane", "travel", "map", "ticket"}
SHOPPING_KEYWORDS = {"buy", "sell", "money", "price", "shop", "market", "cheap", "expensive", "pay", "cash", "card", "cost"}
HOME_KEYWORDS = {"house", "home", "room", "door", "window", "kitchen", "bed", "table", "chair", "bathroom", "floor", "wall", "key"}
WORK_KEYWORDS = {"work", "job", "office", "company", "school", "study", "meeting", "project", "class", "book", "write", "read", "learn", "computer"}
HEALTH_KEYWORDS = {"health", "doctor", "hospital", "medicine", "body", "head", "hand", "eye", "heart", "pain", "sick", "healthy"}
EMOTION_KEYWORDS = {"happy", "sad", "angry", "love", "hate", "hope", "fear", "feel", "feeling", "worry", "calm", "excited", "tired"}

ZH_POS_MAP = {
    "a": "adjective",
    "ad": "adjective",
    "ag": "adjective",
    "an": "adjective",
    "b": "adjective",
    "c": "conjunction",
    "d": "adverb",
    "df": "adverb",
    "e": "interjection",
    "f": "noun",
    "i": "noun",
    "l": "noun",
    "m": "number",
    "mq": "measure-word",
    "n": "noun",
    "ng": "noun",
    "nr": "noun",
    "ns": "noun",
    "nt": "noun",
    "nz": "noun",
    "o": "interjection",
    "p": "preposition",
    "q": "measure-word",
    "r": "pronoun",
    "rr": "pronoun",
    "rz": "pronoun",
    "s": "noun",
    "t": "noun",
    "tg": "noun",
    "u": "particle",
    "ud": "particle",
    "ug": "particle",
    "uj": "particle",
    "ul": "particle",
    "uv": "particle",
    "uz": "particle",
    "v": "verb",
    "vd": "verb",
    "vg": "verb",
    "vn": "verb",
    "x": "noun",
    "y": "particle",
    "z": "adjective",
}

TH_POS_MAP = {
    "ADJ": "adjective",
    "ADP": "preposition",
    "ADV": "adverb",
    "AUX": "verb",
    "CCONJ": "conjunction",
    "DET": "pronoun",
    "INTJ": "interjection",
    "NOUN": "noun",
    "NUM": "number",
    "PART": "particle",
    "PRON": "pronoun",
    "PROPN": "noun",
    "SCONJ": "conjunction",
    "VERB": "verb",
}

ARTICLE_BY_GENDER = {
    "masculine": "der",
    "feminine": "die",
    "neuter": "das",
}

GERMAN_ARTICLE_INFO = {
    "der": ("article", "masculine"),
    "die": ("article", "feminine"),
    "das": ("article", "neuter"),
}
GERMAN_ARTICLE_FORMS = {
    "ein": "masculine",
    "eine": "feminine",
    "einen": "masculine",
    "einem": "masculine",
    "einer": "feminine",
    "eines": "neuter",
    "kein": "masculine",
    "keine": "feminine",
    "keinen": "masculine",
    "keinem": "masculine",
}

BE_VERB_WORDS = {"am", "are", "be", "been", "being", "is", "was", "were"}
MODAL_WORDS = {"can", "could", "may", "might", "must", "should", "will", "would"}
PREPOSITION_HINTS = {"about", "after", "at", "before", "between", "by", "for", "from", "in", "into", "on", "over", "through", "to", "under", "with", "without"}
CONJUNCTION_HINTS = {"and", "because", "but", "if", "or", "since", "than", "that", "though", "unless", "until", "while"}
PRONOUN_SUBJECT = {
    "he": "He",
    "her": "She",
    "him": "He",
    "i": "I",
    "it": "It",
    "me": "I",
    "she": "She",
    "them": "They",
    "they": "They",
    "us": "We",
    "we": "We",
    "you": "You",
}
ENGLISH_PRONOUN_HINTS = {
    "he", "her", "hers", "him", "his", "i", "it", "its", "me", "mine", "my", "our", "ours", "she", "their", "theirs",
    "them", "they", "this", "that", "these", "those", "us", "we", "which", "who", "whom", "whose", "you", "your", "yours",
}

GERMAN_INTERJECTIONS = {"hallo", "tschüss", "danke", "bitte"}
GERMAN_VERB_HINTS = {
    "be", "become", "begin", "bring", "build", "call", "change", "close", "come", "compare", "create", "cut",
    "develop", "do", "drive", "eat", "feel", "find", "follow", "get", "give", "go", "happen", "have", "hear",
    "help", "hold", "improve", "keep", "know", "learn", "leave", "let", "like", "live", "look", "make", "mean",
    "move", "need", "open", "pay", "play", "put", "read", "remember", "say", "see", "set", "show", "sit", "speak",
    "stand", "start", "stay", "stop", "take", "think", "try", "understand", "use", "wait", "walk", "want", "win",
    "work", "write",
}
GERMAN_ADVERB_HINTS = {"also", "already", "still", "again", "only", "often", "never", "always", "soon", "together", "here", "there", "inside", "outside", "yesterday", "today", "tomorrow", "just", "once"}
GERMAN_ADJECTIVE_HINTS = {
    "angry", "bad", "beautiful", "better", "big", "bitter", "busy", "cheap", "clear", "close", "cold", "comfortable",
    "dark", "different", "dry", "early", "easy", "empty", "expensive", "fast", "free", "full", "good", "great", "happy",
    "hard", "high", "hot", "important", "interesting", "late", "left", "local", "long", "low", "new", "old", "open",
    "political", "possible", "private", "public", "quick", "ready", "right", "sad", "sharp", "short", "similar", "slow",
    "small", "social", "soft", "strong", "sure", "sweet", "tired", "warm", "weak", "wet", "young",
}

GERMAN_WORD_OVERRIDES: dict[str, dict[str, str]] = {
    "als": {"english": "as, than, when", "partOfSpeech": "conjunction", "topic": "basics", "exampleDe": "Er ist größer als ich.", "exampleEn": "He is taller than I am."},
    "habe": {"english": "to have", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Ich habe heute Zeit.", "exampleEn": "I have time today."},
    "mal": {"english": "just, once", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Komm mal bitte her.", "exampleEn": "Come here for a moment, please."},
    "wurde": {"english": "become, be", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Es wurde schnell dunkel.", "exampleEn": "It became dark quickly."},
    "keine": {"english": "no, not any", "partOfSpeech": "article", "gender": "feminine", "topic": "basics", "exampleDe": "Ich habe keine Zeit.", "exampleEn": "I do not have any time."},
    "können": {"english": "can, to be able to", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Wir können später gehen.", "exampleEn": "We can go later."},
    "muss": {"english": "must, has to", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Ich muss jetzt arbeiten.", "exampleEn": "I have to work now."},
    "uns": {"english": "us", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Er sieht uns dort.", "exampleEn": "He sees us there."},
    "bin": {"english": "to be", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Ich bin hier.", "exampleEn": "I am here."},
    "vom": {"english": "from the", "partOfSpeech": "preposition", "topic": "travel", "exampleDe": "Ich komme vom Bahnhof.", "exampleEn": "I am coming from the station."},
    "gibt": {"english": "there is, gives", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Heute gibt es frisches Brot.", "exampleEn": "There is fresh bread today."},
    "hatte": {"english": "to have", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Ich hatte gestern wenig Zeit.", "exampleEn": "I had little time yesterday."},
    "ihre": {"english": "her, their", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Ihre Tasche steht hier.", "exampleEn": "Her bag is here."},
    "dieser": {"english": "this", "partOfSpeech": "pronoun", "topic": "basics", "exampleDe": "Dieser Zug ist pünktlich.", "exampleEn": "This train is on time."},
    "seine": {"english": "his, its", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Seine Jacke ist neu.", "exampleEn": "His jacket is new."},
    "alles": {"english": "everything", "partOfSpeech": "pronoun", "topic": "basics", "exampleDe": "Alles ist bereit.", "exampleEn": "Everything is ready."},
    "also": {"english": "so, therefore", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Es regnet, also bleibe ich zu Hause.", "exampleEn": "It is raining, so I am staying home."},
    "geht": {"english": "goes, works", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Wie geht es dir heute?", "exampleEn": "How are you today?"},
    "ab": {"english": "off, from", "partOfSpeech": "preposition", "topic": "basics", "exampleDe": "Der Zug fährt ab Berlin.", "exampleEn": "The train departs from Berlin."},
    "meine": {"english": "my", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Meine Tasche ist hier.", "exampleEn": "My bag is here."},
    "dir": {"english": "you", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Ich helfe dir heute.", "exampleEn": "I am helping you today."},
    "will": {"english": "want", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Ich will heute früh gehen.", "exampleEn": "I want to leave early today."},
    "weil": {"english": "because", "partOfSpeech": "conjunction", "topic": "basics", "exampleDe": "Ich bleibe hier, weil ich müde bin.", "exampleEn": "I am staying here because I am tired."},
    "beim": {"english": "at the, while", "partOfSpeech": "preposition", "topic": "basics", "exampleDe": "Wir sind beim Arzt.", "exampleEn": "We are at the doctor's office."},
    "war": {"english": "to be", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Früher war alles anders.", "exampleEn": "Everything used to be different."},
    "waren": {"english": "to be", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Wir waren gestern zu Hause.", "exampleEn": "We were at home yesterday."},
    "eines": {"english": "a, an (neuter genitive)", "partOfSpeech": "article", "gender": "neuter", "topic": "basics", "exampleDe": "Der Deckel eines Glases ist offen.", "exampleEn": "The lid of a glass is open."},
    "seit": {"english": "since, for", "partOfSpeech": "preposition", "topic": "time", "exampleDe": "Ich wohne seit zwei Jahren hier.", "exampleEn": "I have lived here for two years."},
    "soll": {"english": "should, is supposed to", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Er soll morgen kommen.", "exampleEn": "He is supposed to come tomorrow."},
    "selbst": {"english": "self, even", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Er hat es selbst gemacht.", "exampleEn": "He made it himself."},
    "dich": {"english": "you", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Ich sehe dich dort.", "exampleEn": "I see you there."},
    "hab": {"english": "have", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Ich hab heute Zeit.", "exampleEn": "I have time today."},
    "kommt": {"english": "comes", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Der Bus kommt gleich.", "exampleEn": "The bus is coming soon."},
    "nun": {"english": "now", "partOfSpeech": "adverb", "topic": "time", "exampleDe": "Nun können wir anfangen.", "exampleEn": "Now we can begin."},
    "würde": {"english": "would", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Ich würde gern bleiben.", "exampleEn": "I would like to stay."},
    "macht": {"english": "makes, does", "partOfSpeech": "verb", "topic": "actions", "exampleDe": "Was macht er heute?", "exampleEn": "What is he doing today?"},
    "anderen": {"english": "other", "partOfSpeech": "adjective", "topic": "descriptions", "exampleDe": "Ich nehme den anderen Weg.", "exampleEn": "I am taking the other way."},
    "deutschland": {"english": "Germany", "partOfSpeech": "noun", "article": "das", "gender": "neuter", "topic": "travel", "exampleDe": "Deutschland liegt in Europa.", "exampleEn": "Germany is in Europe."},
    "leute": {"english": "people", "partOfSpeech": "noun", "article": "die", "gender": "feminine", "topic": "people", "exampleDe": "Viele Leute warten draußen.", "exampleEn": "Many people are waiting outside."},
    "tage": {"english": "days", "partOfSpeech": "noun", "article": "der", "gender": "masculine", "topic": "time", "exampleDe": "Die Tage werden länger.", "exampleEn": "The days are getting longer."},
    "freunde": {"english": "friends", "partOfSpeech": "noun", "article": "der", "gender": "masculine", "topic": "people", "exampleDe": "Meine Freunde kommen später.", "exampleEn": "My friends are coming later."},
    "hause": {"english": "at home", "partOfSpeech": "adverb", "topic": "home", "exampleDe": "Ich bin zu Hause.", "exampleEn": "I am at home."},
    "zweite": {"english": "second", "partOfSpeech": "number", "topic": "numbers", "exampleDe": "Das ist meine zweite Tasse Kaffee.", "exampleEn": "That is my second cup of coffee."},
    "ihm": {"english": "him", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Ich gebe ihm das Buch.", "exampleEn": "I give him the book."},
    "ob": {"english": "whether", "partOfSpeech": "conjunction", "topic": "questions", "exampleDe": "Ich weiß nicht, ob er kommt.", "exampleEn": "I do not know whether he is coming."},
    "ihn": {"english": "him", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Ich kenne ihn gut.", "exampleEn": "I know him well."},
    "jahren": {"english": "years", "partOfSpeech": "noun", "gender": "neuter", "article": "das", "topic": "time", "exampleDe": "Vor vielen Jahren war ich dort.", "exampleEn": "I was there many years ago."},
    "seiner": {"english": "his, her, its", "partOfSpeech": "pronoun", "topic": "people", "exampleDe": "Wegen seiner Arbeit ist er müde.", "exampleEn": "He is tired because of his work."},
    "viele": {"english": "many", "partOfSpeech": "adjective", "topic": "numbers", "exampleDe": "Viele Menschen warten draußen.", "exampleEn": "Many people are waiting outside."},
    "jahre": {"english": "years", "partOfSpeech": "noun", "gender": "neuter", "article": "das", "topic": "time", "exampleDe": "Drei Jahre sind eine lange Zeit.", "exampleEn": "Three years is a long time."},
    "wäre": {"english": "would be", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Das wäre sehr hilfreich.", "exampleEn": "That would be very helpful."},
    "diesem": {"english": "this", "partOfSpeech": "pronoun", "topic": "basics", "exampleDe": "Mit diesem Plan geht es schneller.", "exampleEn": "With this plan, it goes faster."},
    "dieses": {"english": "this", "partOfSpeech": "pronoun", "topic": "basics", "exampleDe": "Dieses Buch ist interessant.", "exampleEn": "This book is interesting."},
    "wurden": {"english": "became, were", "partOfSpeech": "verb", "topic": "basics", "exampleDe": "Die Straßen wurden nass.", "exampleEn": "The streets became wet."},
    "einen": {"english": "a, an (masculine accusative)", "partOfSpeech": "article", "gender": "masculine", "exampleDe": "Ich habe einen Hund.", "exampleEn": "I have a dog."},
    "welches": {"english": "which", "partOfSpeech": "pronoun", "topic": "questions", "exampleDe": "Welches Buch meinst du?", "exampleEn": "Which book do you mean?"},
    "zehn": {"english": "ten", "partOfSpeech": "number", "topic": "numbers", "exampleDe": "Ich habe zehn Bücher.", "exampleEn": "I have ten books."},
    "hallo": {"english": "hello", "partOfSpeech": "interjection", "topic": "greetings", "exampleDe": "Hallo, wie geht's?", "exampleEn": "Hello, how are you?"},
    "zumindest": {"english": "at least", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Zumindest haben wir es versucht.", "exampleEn": "At least we tried."},
    "übrigens": {"english": "by the way", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Übrigens, morgen habe ich Zeit.", "exampleEn": "By the way, I have time tomorrow."},
    "nochmal": {"english": "again", "partOfSpeech": "adverb", "topic": "basics", "exampleDe": "Kannst du das nochmal sagen?", "exampleEn": "Can you say that again?"},
    "weder": {"english": "neither", "partOfSpeech": "conjunction", "topic": "basics", "exampleDe": "Ich trinke weder Tee noch Kaffee.", "exampleEn": "I drink neither tea nor coffee."},
    "acht": {"english": "eight", "partOfSpeech": "number", "topic": "numbers", "exampleDe": "Der Zug fährt um acht Uhr.", "exampleEn": "The train leaves at eight o'clock."},
    "eins": {"english": "one", "partOfSpeech": "number", "topic": "numbers", "exampleDe": "Ich nehme eins.", "exampleEn": "I will take one."},
    "okay": {"english": "okay", "partOfSpeech": "interjection", "topic": "basics", "exampleDe": "Okay, wir können gehen.", "exampleEn": "Okay, we can go."},
}

ZH_WORD_OVERRIDES: dict[str, dict[str, str]] = {
    "与": {"english": "and, with", "partOfSpeech": "conjunction", "topic": "basics", "exampleZh": "我与朋友一起去。", "exampleEn": "I am going with my friend."},
    "一个": {"english": "one, a, an", "partOfSpeech": "number", "topic": "numbers", "exampleZh": "我只要一个。", "exampleEn": "I only need one."},
    "我们": {"english": "we, us", "partOfSpeech": "pronoun", "topic": "basics", "exampleZh": "我们在这里。", "exampleEn": "We are here."},
    "中国": {"english": "China", "partOfSpeech": "noun", "topic": "travel", "exampleZh": "我喜欢中国。", "exampleEn": "I like China."},
    "他们": {"english": "they, them", "partOfSpeech": "pronoun", "topic": "people", "exampleZh": "他们在这里。", "exampleEn": "They are here."},
    "没有": {"english": "not have, there is not", "partOfSpeech": "verb", "topic": "basics", "exampleZh": "我没有时间。", "exampleEn": "I do not have time."},
    "并": {"english": "and, also", "partOfSpeech": "conjunction", "topic": "basics", "exampleZh": "她聪明，并很努力。", "exampleEn": "She is smart and very hardworking."},
    "自己": {"english": "self, oneself", "partOfSpeech": "pronoun", "topic": "people", "exampleZh": "这件事我要自己做。", "exampleEn": "I want to do this myself."},
    "问题": {"english": "question, problem", "partOfSpeech": "noun", "topic": "work", "exampleZh": "这个问题很重要。", "exampleEn": "This question is important."},
    "美国": {"english": "United States", "partOfSpeech": "noun", "topic": "travel", "exampleZh": "她住在美国。", "exampleEn": "She lives in the United States."},
    "或": {"english": "or", "partOfSpeech": "conjunction", "topic": "questions", "exampleZh": "你想喝茶或咖啡？", "exampleEn": "Do you want tea or coffee?"},
    "不是": {"english": "to not be", "partOfSpeech": "verb", "topic": "basics", "exampleZh": "这不是我的书。", "exampleEn": "This is not my book."},
    "之": {"english": "of", "partOfSpeech": "particle", "topic": "basics", "exampleZh": "成功之路不容易。", "exampleEn": "The road to success is not easy."},
    "及": {"english": "and, as well as", "partOfSpeech": "conjunction", "topic": "basics", "exampleZh": "老师及学生都到了。", "exampleEn": "The teachers and students have all arrived."},
    "由": {"english": "by, from", "partOfSpeech": "preposition", "topic": "basics", "exampleZh": "这本书由他写的。", "exampleEn": "This book was written by him."},
    "怎么": {"english": "how", "partOfSpeech": "adverb", "topic": "questions", "exampleZh": "你怎么去学校？", "exampleEn": "How do you go to school?"},
    "就是": {"english": "exactly, precisely", "partOfSpeech": "adverb", "topic": "basics", "exampleZh": "这就是我想要的。", "exampleEn": "This is exactly what I want."},
    "更": {"english": "more, even more", "partOfSpeech": "adverb", "topic": "descriptions", "exampleZh": "今天更冷。", "exampleEn": "It is even colder today."},
    "这些": {"english": "these", "partOfSpeech": "pronoun", "topic": "basics", "exampleZh": "这些都是新的。", "exampleEn": "These are all new."},
    "所": {"english": "that which, place", "partOfSpeech": "particle", "topic": "basics", "exampleZh": "我所知道的不多。", "exampleEn": "I do not know much."},
    "发展": {"english": "to develop, development", "partOfSpeech": "verb", "topic": "work", "exampleZh": "这个城市发展很快。", "exampleEn": "This city is developing quickly."},
    "开始": {"english": "to start, begin", "partOfSpeech": "verb", "topic": "actions", "exampleZh": "我们现在开始吧。", "exampleEn": "Let's begin now."},
    "这样": {"english": "like this, this way", "partOfSpeech": "pronoun", "topic": "basics", "exampleZh": "你可以这样做。", "exampleEn": "You can do it like this."},
    "它": {"english": "it", "partOfSpeech": "pronoun", "topic": "basics", "exampleZh": "它在桌子上。", "exampleEn": "It is on the table."},
    "政府": {"english": "government", "partOfSpeech": "noun", "topic": "work", "exampleZh": "政府发布了新消息。", "exampleEn": "The government released new information."},
    "可能": {"english": "may, might, possible", "partOfSpeech": "auxiliary", "topic": "basics", "exampleZh": "他可能会来。", "exampleEn": "He might come."},
    "而": {"english": "and, while", "partOfSpeech": "conjunction", "topic": "basics", "exampleZh": "他喜欢茶，而我喜欢咖啡。", "exampleEn": "He likes tea, while I like coffee."},
    "可以": {"english": "can, may", "partOfSpeech": "auxiliary", "topic": "actions", "exampleZh": "你现在可以进去。", "exampleEn": "You can go in now."},
    "于": {"english": "at, in, on", "partOfSpeech": "preposition", "topic": "time", "exampleZh": "会议于下午开始。", "exampleEn": "The meeting starts in the afternoon."},
    "日": {"english": "day, date", "partOfSpeech": "noun", "topic": "time", "exampleZh": "今天是个好日子。", "exampleEn": "Today is a good day."},
    "这个": {"english": "this", "partOfSpeech": "pronoun", "topic": "basics", "exampleZh": "这个很好。", "exampleEn": "This is very good."},
    "将": {"english": "will, going to", "partOfSpeech": "auxiliary", "topic": "time", "exampleZh": "我们将很快出发。", "exampleEn": "We will leave soon."},
}

TH_WORD_OVERRIDES: dict[str, dict[str, str]] = {
    "ที่": {"english": "at, place that", "partOfSpeech": "preposition", "topic": "basics", "exampleTh": "ตอนนี้ฉันอยู่ที่โรงเรียน", "exampleEn": "I am at school now."},
    "การ": {"english": "action, act of", "partOfSpeech": "noun", "topic": "basics", "exampleTh": "การกระทำนี้มีความสำคัญ", "exampleEn": "This action is important."},
    "เป็น": {"english": "to be", "partOfSpeech": "verb", "topic": "actions", "exampleTh": "ฉันเป็นครู", "exampleEn": "I am a teacher."},
    "ของ": {"english": "of, belonging to", "partOfSpeech": "preposition", "topic": "basics", "exampleTh": "นี่คือหนังสือของฉัน", "exampleEn": "This is my book."},
    "มี": {"english": "to have", "partOfSpeech": "verb", "topic": "actions", "exampleTh": "ฉันมีเวลา", "exampleEn": "I have time."},
    "และ": {"english": "and", "partOfSpeech": "conjunction", "topic": "basics", "exampleTh": "ฉันชอบชาและกาแฟ", "exampleEn": "I like tea and coffee."},
    "จะ": {"english": "will, going to", "partOfSpeech": "particle", "topic": "time", "exampleTh": "ฉันจะไปพรุ่งนี้", "exampleEn": "I will go tomorrow."},
    "ไม่": {"english": "not", "partOfSpeech": "particle", "topic": "basics", "exampleTh": "ฉันไม่รู้", "exampleEn": "I do not know."},
    "ให้": {"english": "to give, for", "partOfSpeech": "verb", "topic": "actions", "exampleTh": "ฉันให้หนังสือเขา", "exampleEn": "I give him the book."},
    "ว่า": {"english": "that, say", "partOfSpeech": "conjunction", "topic": "basics", "exampleTh": "เขาบอกว่าพรุ่งนี้จะมา", "exampleEn": "He said that he will come tomorrow."},
    "มา": {"english": "to come", "partOfSpeech": "verb", "topic": "travel", "exampleTh": "เพื่อนของฉันจะมาเย็นนี้", "exampleEn": "My friend will come this evening."},
    "ก็": {"english": "also, then", "partOfSpeech": "particle", "topic": "basics", "exampleTh": "ฉันก็ชอบกาแฟ", "exampleEn": "I also like coffee."},
    "ความ": {"english": "state, -ness", "partOfSpeech": "noun", "topic": "basics", "exampleTh": "ความสุขสำคัญมาก", "exampleEn": "Happiness is very important."},
    "คน": {"english": "person, people", "partOfSpeech": "noun", "topic": "people", "exampleTh": "คนนั้นเป็นครู", "exampleEn": "That person is a teacher."},
    "กับ": {"english": "with", "partOfSpeech": "preposition", "topic": "basics", "exampleTh": "ฉันไปกับเพื่อน", "exampleEn": "I am going with a friend."},
    "แล้ว": {"english": "already, then", "partOfSpeech": "particle", "topic": "time", "exampleTh": "ฉันกินข้าวแล้ว", "exampleEn": "I have already eaten."},
    "อยู่": {"english": "to be located, stay", "partOfSpeech": "verb", "topic": "home", "exampleTh": "หนังสืออยู่บนโต๊ะ", "exampleEn": "The book is on the table."},
    "หรือ": {"english": "or", "partOfSpeech": "conjunction", "topic": "questions", "exampleTh": "คุณจะเอาชาหรือกาแฟ", "exampleEn": "Will you have tea or coffee?"},
    "จาก": {"english": "from", "partOfSpeech": "preposition", "topic": "travel", "exampleTh": "เขามาจากกรุงเทพ", "exampleEn": "He comes from Bangkok."},
    "กัน": {"english": "together, each other", "partOfSpeech": "particle", "topic": "people", "exampleTh": "เราไปด้วยกัน", "exampleEn": "We go together."},
    "นี้": {"english": "this", "partOfSpeech": "pronoun", "topic": "basics", "exampleTh": "หนังสือนี้ใหม่", "exampleEn": "This book is new."},
    "แต่": {"english": "but", "partOfSpeech": "conjunction", "topic": "basics", "exampleTh": "ฉันอยากไปแต่ไม่มีเวลา", "exampleEn": "I want to go, but I do not have time."},
    "อย่าง": {"english": "kind, way, like", "partOfSpeech": "adverb", "topic": "basics", "exampleTh": "คุณทำอย่างไร", "exampleEn": "How do you do it?"},
    "ต้อง": {"english": "must, have to", "partOfSpeech": "verb", "topic": "actions", "exampleTh": "ฉันต้องทำงานวันนี้", "exampleEn": "I have to work today."},
    "ด้วย": {"english": "too, with", "partOfSpeech": "particle", "topic": "basics", "exampleTh": "ฉันไปด้วย", "exampleEn": "I am going too."},
    "ขึ้น": {"english": "up, rise", "partOfSpeech": "verb", "topic": "actions", "exampleTh": "ราคาเริ่มขึ้น", "exampleEn": "Prices are starting to rise."},
    "เขา": {"english": "he, she", "partOfSpeech": "pronoun", "topic": "people", "exampleTh": "เขาอยู่ที่นี่", "exampleEn": "He is here."},
    "นั้น": {"english": "that", "partOfSpeech": "pronoun", "topic": "basics", "exampleTh": "บ้านนั้นใหญ่", "exampleEn": "That house is big."},
    "ผู้": {"english": "person, one who", "partOfSpeech": "noun", "topic": "people", "exampleTh": "ผู้ชนะมาถึงแล้ว", "exampleEn": "The winner has arrived."},
    "ซึ่ง": {"english": "which, that", "partOfSpeech": "pronoun", "topic": "questions", "exampleTh": "หนังสือซึ่งฉันซื้ออยู่ที่นี่", "exampleEn": "The book that I bought is here."},
}


@dataclass
class WordRecord:
    rank: int
    payload: dict[str, Any]


class TranslatorPool:
    def __init__(self) -> None:
        self.cache: dict[tuple[str, str, str], str] = {}

    def translate_batch(self, texts: list[str], source: str, target: str, batch_size: int = 50) -> list[str]:
        results = [""] * len(texts)
        pending: list[tuple[int, str]] = []

        for index, text in enumerate(texts):
            key = (source, target, text)
            if key in self.cache:
                results[index] = self.cache[key]
            else:
                pending.append((index, text))

        if not pending:
            return results

        translator = GoogleTranslator(source=source, target=target)
        for start in range(0, len(pending), batch_size):
            batch_meta = pending[start:start + batch_size]
            batch = [text for _, text in batch_meta]
            try:
                translated = translator.translate_batch(batch)
            except Exception:
                translated = [self.translate_text(text, source, target) for text in batch]
            for (index, text), value in zip(batch_meta, translated):
                cleaned = clean_text(value)
                self.cache[(source, target, text)] = cleaned
                results[index] = cleaned
            time.sleep(0.12)

        return results

    def translate_text(self, text: str, source: str, target: str) -> str:
        key = (source, target, text)
        if key in self.cache:
            return self.cache[key]

        translator = GoogleTranslator(source=source, target=target)
        last_error: Exception | None = None
        for _ in range(3):
            try:
                value = clean_text(translator.translate(text))
                self.cache[key] = value
                return value
            except Exception as exc:
                last_error = exc
                time.sleep(0.4)
        raise RuntimeError(f"Translation failed for {text!r}: {last_error}")


translator_pool = TranslatorPool()


def clean_text(value: str | None) -> str:
    if not value:
        return ""
    return " ".join(str(value).split())


def get_group(rank: int) -> str:
    if rank <= 50:
        return "essential-50"
    if rank <= 150:
        return "core-100"
    if rank <= 400:
        return "everyday-250"
    if rank <= 750:
        return "confident-350"
    return "fluent-250"


def strip_parenthetical(text: str) -> str:
    return re.sub(r"\s*\([^)]*\)", "", text).strip()


def primary_english(english: str, pos: str | None = None) -> str:
    gloss = strip_parenthetical(english.split(";")[0].split(",")[0]).strip()
    gloss = re.sub(r"^(a|an|the)\s+", "", gloss, flags=re.IGNORECASE)
    gloss = gloss.replace("  ", " ")
    lowered = gloss.lower()
    if lowered in BE_VERB_WORDS:
        return "to be" if pos == "verb" else "be"
    if lowered in MODAL_WORDS:
        return lowered
    if pos == "verb" and gloss and not lowered.startswith("to "):
        return f"to {gloss}"
    return gloss or english


def noun_phrase(english: str) -> str:
    phrase = primary_english(english)
    return re.sub(r"^(a|an|the)\s+", "", phrase, flags=re.IGNORECASE).strip() or phrase


def verb_phrase(english: str) -> str:
    phrase = primary_english(english, "verb")
    return re.sub(r"^to\s+", "", phrase, flags=re.IGNORECASE).strip() or phrase


def keyword_blob(english: str) -> str:
    return re.sub(r"[^a-z\s-]", " ", english.lower())


def english_word_variants(english: str) -> set[str]:
    words = set(keyword_blob(english).split())
    variants = set(words)
    for word in list(words):
        if word.endswith("ies") and len(word) > 4:
            variants.add(f"{word[:-3]}y")
        if word.endswith("es") and len(word) > 4:
            variants.add(word[:-2])
        if word.endswith("s") and len(word) > 3:
            variants.add(word[:-1])
        if word.endswith("ed") and len(word) > 4:
            variants.add(word[:-2])
            variants.add(word[:-1])
        if word.endswith("ing") and len(word) > 5:
            variants.add(word[:-3])
    return {variant for variant in variants if variant}


def normalize_pos_from_english(pos: str, english: str) -> str:
    words = english_word_variants(english)
    if words & CONJUNCTION_HINTS:
        return "conjunction"
    if words & PREPOSITION_HINTS:
        return "preposition"
    if words & NUMBER_KEYWORDS:
        return "number"
    if primary_english(english).lower() in ENGLISH_PRONOUN_HINTS:
        return "pronoun"
    if primary_english(english).lower() == "to be":
        return "verb"
    return pos


def guess_topic(english: str, pos: str) -> str:
    blob = keyword_blob(english)
    words = english_word_variants(english)

    def has(keywords: set[str]) -> bool:
        for keyword in keywords:
            if " " in keyword and keyword in blob:
                return True
            if keyword in words:
                return True
        return False

    if has(GREETING_KEYWORDS):
        return "greetings"
    if pos == "number" or has(NUMBER_KEYWORDS):
        return "numbers"
    if has(TIME_KEYWORDS):
        return "time"
    if has(PEOPLE_KEYWORDS):
        return "people"
    if has(QUESTION_KEYWORDS):
        return "questions"
    if has(FOOD_KEYWORDS):
        return "food"
    if has(TRAVEL_KEYWORDS):
        return "travel"
    if has(SHOPPING_KEYWORDS):
        return "shopping"
    if has(HOME_KEYWORDS):
        return "home"
    if has(WORK_KEYWORDS):
        return "work"
    if has(HEALTH_KEYWORDS):
        return "health"
    if has(EMOTION_KEYWORDS):
        return "emotions"
    if pos == "verb":
        return "actions"
    if pos in {"adjective", "adverb"}:
        return "descriptions"
    return "basics"


def english_example_template(english: str, pos: str, target_word: str) -> str:
    lower = keyword_blob(english)
    primary_value = primary_english(english, pos)
    primary = primary_value.lower()

    if "because" in lower or "since" in lower:
        return "I stayed home because it was raining."
    if "if" in lower:
        return "If you have time, we can go together."
    if re.search(r"\bor\b", lower):
        return "Do you want tea or coffee?"
    if re.search(r"\band\b", lower):
        return "I bought fruit and bread."
    if "but" in lower or "however" in lower:
        return "I want to go, but I am busy today."
    if re.search(r"\bwith\b", lower):
        return "I am going with my friend."
    if "without" in lower:
        return "I cannot do it without you."
    if re.search(r"\bfrom\b", lower):
        return "She is from Bangkok."
    if re.search(r"\bof\b", lower):
        return "This is my book."
    if re.search(r"\bto\b", lower) and pos == "preposition":
        return "I am going to the station."
    if re.search(r"\bin\b", lower):
        return "The book is in the bag."
    if re.search(r"\bon\b", lower):
        return "The book is on the table."
    if re.search(r"\bat\b", lower):
        return "I am at school now."
    if re.search(r"\bfor\b", lower):
        return "This gift is for you."
    if re.search(r"\bafter\b", lower):
        return "I will call you after class."
    if re.search(r"\bbefore\b", lower):
        return "Finish your homework before dinner."
    if re.search(r"\balready\b", lower):
        return "He has already arrived."
    if re.search(r"\bstill\b", lower):
        return "She is still working."
    if re.search(r"\balso\b", lower):
        return "I also want one."
    if re.search(r"\bonly\b", lower):
        return "I only need one."
    if re.search(r"\bagain\b", lower):
        return "Please say it again."
    if "can" in lower or "able" in lower:
        return "I can do it today."
    if "should" in lower:
        return "You should rest now."
    if "must" in lower or "need to" in lower:
        return "We must leave now."
    if "question" in lower:
        return "Are you okay?"
    if "please" in lower:
        return "Please sit here."
    if "thanks" in lower or "thank you" in lower:
        return "Thank you."

    if pos == "noun":
        if primary_value[:1].isalpha() and primary_value[:1].upper() == primary_value[:1]:
            return f"I like {noun_phrase(english)}."
        if guess_topic(english, pos) == "food":
            return f"This {noun_phrase(english)} tastes good."
        return f"This {noun_phrase(english)} is important."
    if pos == "verb":
        if primary == "to be":
            return "I am a teacher."
        if primary == "to have":
            return "I have time today."
        if primary in {"no", "not"}:
            return "I do not have it."
        if primary in MODAL_WORDS:
            return "I can do it today."
        return f"I want to {verb_phrase(english)}."
    if pos == "adjective":
        return f"This place is very {primary_english(english)}."
    if pos == "adverb":
        if primary in {"no", "not"}:
            return "I do not have it."
        return f"He speaks {primary_english(english)}."
    if pos == "pronoun":
        pronoun = PRONOUN_SUBJECT.get(primary_english(english).lower(), primary_english(english).capitalize())
        if pronoun in {"I", "He", "She", "It"}:
            return f"{pronoun} is here."
        return f"{pronoun} are here."
    if pos == "number":
        return f"I have {primary_english(english)} books."
    if pos == "interjection":
        return "Hello!"
    if pos == "measure-word":
        return "I bought one bottle of water."
    return f"I use {target_word} every day."


def contains_native_word(lang: str, word: str, text: str) -> bool:
    if lang == "de":
        return word.casefold() in text.casefold()
    return word in text


def manual_zh_example(word: str, english: str, pos: str) -> tuple[str, str]:
    blob = keyword_blob(english)
    primary = primary_english(english, pos)
    if "and" in blob or "with" in blob:
        return f"我{word}朋友一起去。", "I am going with my friend."
    if "because" in blob:
        return f"我没去，{word}下雨了。", "I did not go because it was raining."
    if "if" in blob:
        return f"{word}你有时间，我们一起去。", "If you have time, we can go together."
    if "or" in blob:
        return f"你想喝茶{word}咖啡？", "Do you want tea or coffee?"
    if "of" in blob:
        return f"这是我{word}书。", "This is my book."
    if "one" in blob:
        return f"我只要{word}。", "I only need one."
    if primary.lower() == "to be":
        return f"我{word}老师。", "I am a teacher."
    if primary.lower() == "to have":
        return f"我{word}时间。", "I have time."
    if primary.lower() in {"no", "not"}:
        return f"我{word}时间。", "I do not have time."
    if pos == "noun":
        if primary[:1].isalpha() and primary[:1].upper() == primary[:1]:
            return f"我喜欢{word}。", f"I like {noun_phrase(english)}."
        return f"这个{word}很重要。", f"This {noun_phrase(english)} is important."
    if pos == "verb":
        return f"我想{word}。", f"I want to {verb_phrase(english)}."
    if pos == "adjective":
        return f"这个地方很{word}。", f"This place is very {primary_english(english)}."
    if pos == "adverb":
        return f"他{word}来了。", f"He came {primary_english(english)}."
    if pos == "pronoun":
        subject = PRONOUN_SUBJECT.get(primary_english(english).lower(), primary_english(english).capitalize())
        if subject in {"I", "He", "She", "It"}:
            return f"{word}在这里。", f"{subject} is here."
        return f"{word}在这里。", f"{subject} are here."
    if pos == "number":
        return f"我有{word}个。", f"I have {primary_english(english)}."
    if pos == "conjunction":
        return f"我想去，{word}今天很忙。", "I want to go, but I am busy today."
    if pos == "preposition":
        return f"书在{word}桌子上。", f"The book is {primary_english(english)} the table."
    if pos == "particle":
        return f"我们走{word}。", "Let's go."
    if pos == "measure-word":
        return f"我买了一{word}水。", "I bought one bottle of water."
    if pos == "auxiliary":
        return f"我{word}去。", f"I {primary_english(english)} go."
    return f"{word}很常见。", f"{word} is very common."


def manual_th_example(word: str, english: str, pos: str) -> tuple[str, str]:
    blob = keyword_blob(english)
    primary = primary_english(english, pos)
    if "because" in blob:
        return f"ฉันอยู่บ้าน{word}ฝนตก", "I stayed home because it was raining."
    if "if" in blob:
        return f"{word}คุณมีเวลา เราไปด้วยกัน", "If you have time, we can go together."
    if "and" in blob:
        return f"ฉันชอบชา{word}กาแฟ", "I like tea and coffee."
    if "or" in blob:
        return f"คุณต้องการชาหรือกาแฟ{word}", "Do you want tea or coffee?"
    if "of" in blob:
        return f"นี่คือหนังสือ{word}ฉัน", "This is my book."
    if primary.lower() == "to be":
        return f"ฉัน{word}ครู", "I am a teacher."
    if primary.lower() == "to have":
        return f"ฉัน{word}เวลา", "I have time."
    if pos == "noun":
        if primary[:1].isalpha() and primary[:1].upper() == primary[:1]:
            return f"ฉันชอบ{word}", f"I like {noun_phrase(english)}."
        return f"{word}นี้สำคัญมาก", f"This {noun_phrase(english)} is very important."
    if pos == "verb":
        return f"ฉันอยาก{word}", f"I want to {verb_phrase(english)}."
    if pos == "adjective":
        return f"ที่นี่{word}มาก", f"It is very {primary_english(english)} here."
    if pos == "adverb":
        return f"เขาพูด{word}", f"He speaks {primary_english(english)}."
    if pos == "pronoun":
        subject = PRONOUN_SUBJECT.get(primary_english(english).lower(), primary_english(english).capitalize())
        if subject in {"I", "He", "She", "It"}:
            return f"{word}อยู่ที่นี่", f"{subject} is here."
        return f"{word}อยู่ที่นี่", f"{subject} are here."
    if pos == "number":
        return f"ฉันมี{word}เล่ม", f"I have {primary_english(english)} books."
    if pos == "conjunction":
        return f"ฉันอยากไป{word}วันนี้ยุ่ง", "I want to go, but I am busy today."
    if pos == "preposition":
        return f"หนังสืออยู่{word}โต๊ะ", f"The book is {primary_english(english)} the table."
    if pos == "particle":
        return f"ไปด้วยกัน{word}", "Let's go together."
    return f"{word}ใช้บ่อยมาก", f"{word} is used very often."


def german_manual_example(word: str, english: str, pos: str, article: str | None, gender: str | None = None) -> tuple[str, str]:
    blob = keyword_blob(english)
    lower = word.casefold()
    primary = primary_english(english, pos).lower()

    if "and" in blob:
        return f"Ich trinke Tee {word} Kaffee.", "I drink tea and coffee."
    if "or" in blob:
        return f"Möchtest du Tee {word} Kaffee?", "Do you want tea or coffee?"
    if "because" in blob:
        return f"Ich bleibe zu Hause, {word} es regnet.", "I am staying home because it is raining."
    if "if" in blob:
        return f"{word.capitalize()} du Zeit hast, gehen wir zusammen.", "If you have time, we can go together."
    if "of" in blob:
        return f"Das ist das Cover {word} Buches.", "That is the cover of the book."
    if pos == "noun" and article:
        return f"{article.title()} {word} ist wichtig.", f"The {noun_phrase(english)} is important."
    if pos == "verb":
        if primary in MODAL_WORDS:
            modal_examples = {
                "can": (f"Wir {word} später gehen.", "We can go later."),
                "could": (f"Wir {word} später gehen.", "We could go later."),
                "may": (f"Du {word} jetzt gehen.", "You may go now."),
                "might": (f"Er {word} später kommen.", "He might come later."),
                "must": (f"Ich {word} jetzt arbeiten.", "I must work now."),
                "should": (f"Du {word} jetzt schlafen.", "You should sleep now."),
                "will": (f"Wir {word} morgen starten.", "We will start tomorrow."),
                "would": (f"Ich {word} gern bleiben.", "I would like to stay."),
            }
            if primary in modal_examples:
                return modal_examples[primary]
        if lower in {"bin", "bist", "ist"}:
            subject = {"bin": "Ich", "bist": "Du", "ist": "Er"}[lower]
            return f"{subject} {word} hier.", f"{PRONOUN_SUBJECT.get(subject.lower(), subject)} is here."
        if lower in {"sind", "seid"}:
            subject = {"sind": "Wir", "seid": "Ihr"}[lower]
            return f"{subject} {word} bereit.", f"{subject} are ready."
        if lower in {"war", "wäre"}:
            return f"Früher {word} alles anders.", "Everything used to be different."
        if lower in {"waren", "wären"}:
            return f"Früher {word} wir oft dort.", "We used to be there often."
        if lower in {"habe", "hast", "hat", "haben", "habt"}:
            subject = {"habe": "Ich", "hast": "Du", "hat": "Er", "haben": "Wir", "habt": "Ihr"}[lower]
            return f"{subject} {word} heute Zeit.", f"{subject} have time today."
        if lower.endswith("st"):
            return f"Du {word} das heute.", f"You {verb_phrase(english)} that today."
        if lower.endswith("t"):
            return f"Er {word} das heute.", f"He {verb_phrase(english)} that today."
        if lower.endswith("te"):
            return f"Er {word} das gestern.", f"He {verb_phrase(english)} that yesterday."
        if lower.endswith("ten"):
            return f"Sie {word} das gestern.", f"They {verb_phrase(english)} that yesterday."
        if lower.endswith("e"):
            return f"Ich {word} das später.", f"I {verb_phrase(english)} that later."
        return f"Ich möchte {word}.", f"I want to {verb_phrase(english)}."
    if pos == "pronoun":
        pronoun_examples = {
            "alles": ("Alles ist bereit.", "Everything is ready."),
            "dir": ("Ich helfe dir heute.", "I am helping you today."),
            "dich": ("Ich sehe dich dort.", "I see you there."),
            "ihm": ("Ich gebe ihm das Buch.", "I give him the book."),
            "ihn": ("Ich kenne ihn gut.", "I know him well."),
            "meine": ("Meine Tasche ist hier.", "My bag is here."),
            "seine": ("Seine Jacke ist neu.", "His jacket is new."),
            "ihre": ("Ihre Tasche steht hier.", "Her bag is here."),
            "dieser": ("Dieser Zug ist pünktlich.", "This train is on time."),
            "diesem": ("Mit diesem Plan geht es schneller.", "With this plan, it goes faster."),
            "dieses": ("Dieses Buch ist interessant.", "This book is interesting."),
            "uns": ("Er sieht uns dort.", "He sees us there."),
        }
        if lower in pronoun_examples:
            return pronoun_examples[lower]
        if lower == "wir":
            return "Wir sind hier.", "We are here."
        if lower == "sie":
            return "Sie sind hier.", "They are here."
        return f"{word.capitalize()} ist hier.", f"{PRONOUN_SUBJECT.get(primary_english(english).lower(), primary_english(english).capitalize())} is here."
    if pos == "preposition":
        return f"Das Buch liegt {word} dem Tisch.", f"The book is {primary_english(english)} the table."
    if pos == "conjunction":
        return f"Ich will gehen, {word} ich bin müde.", "I want to go, but I am tired."
    if pos == "article":
        noun_by_gender = {"masculine": "Mann", "feminine": "Frau", "neuter": "Haus"}
        return f"{word.title()} {noun_by_gender.get(gender or '', 'Wort')} ist hier.", "The article is used with this noun."
    if pos == "adjective":
        return f"Das ist sehr {word}.", f"That is very {primary_english(english)}."
    if pos == "adverb":
        return f"Er antwortet {word}.", f"He answers {primary_english(english)}."
    if pos == "number":
        return f"Ich habe {word} Bücher.", f"I have {primary_english(english)} books."
    if pos == "interjection":
        return f"{word.title()}!", "Hello!"
    return f"{word.capitalize()} ist sehr wichtig.", f"{primary_english(english).capitalize()} is very important."


def get_existing_payloads(lang: str) -> list[dict[str, Any]]:
    words_dir = CONTENT_DIR / lang / "words"
    payloads: list[dict[str, Any]] = []
    for path in sorted(words_dir.glob("word-*.json")):
        payloads.append(json.loads(path.read_text(encoding="utf-8")))
    return payloads


def zh_existing_words() -> set[str]:
    return {payload["chinese"] for payload in get_existing_payloads("zh")}


def de_existing_words() -> set[str]:
    return {payload["german"].casefold() for payload in get_existing_payloads("de")}


def th_existing_words() -> set[str]:
    return {payload["thai"] for payload in get_existing_payloads("th")}


def zh_candidates(existing: set[str]) -> list[str]:
    candidates: list[str] = []
    seen = set(existing)
    for word in top_n_list("zh", 5000):
        if not ZH_PATTERN.fullmatch(word):
            continue
        if len(word) > 4 or word in seen:
            continue
        seen.add(word)
        candidates.append(word)
    return candidates


def de_candidates(existing: set[str]) -> list[str]:
    candidates: list[str] = []
    seen = set(existing)
    for word in top_n_list("de", 5000):
        if not DE_PATTERN.fullmatch(word):
            continue
        lowered = word.casefold()
        if len(word) < 2 or lowered in seen:
            continue
        seen.add(lowered)
        candidates.append(word)
    return candidates


def th_candidates(existing: set[str]) -> list[str]:
    candidates: list[str] = []
    seen = set(existing)
    freq_pairs = [(word, freq) for word, freq in tnc.word_freqs() if TH_PATTERN.fullmatch(word) and word not in {"ๆ"}]
    freq_pairs.sort(key=lambda pair: (-pair[1], pair[0]))
    for word, _ in freq_pairs:
        if word in seen:
            continue
        seen.add(word)
        candidates.append(word)
    return candidates


def zh_part_of_speech(word: str) -> str:
    try:
        pieces = list(pseg.cut(word))
    except Exception:
        return "noun"
    if not pieces:
        return "noun"
    flag = pieces[0].flag
    if flag in ZH_POS_MAP:
        return ZH_POS_MAP[flag]
    for length in (2, 1):
        if flag[:length] in ZH_POS_MAP:
            return ZH_POS_MAP[flag[:length]]
    return "noun"


def th_part_of_speech(word: str) -> str:
    try:
        tagged = pos_tag([word], corpus="orchid_ud")
    except Exception:
        return "noun"
    if not tagged:
        return "noun"
    return TH_POS_MAP.get(tagged[0][1], "noun")


def fetch_text(url: str) -> str:
    response = requests.get(url, headers=GERMAN_HEADERS, timeout=60)
    response.raise_for_status()
    return response.text


@lru_cache(maxsize=1)
def german_nouns_lookup() -> dict[str, dict[str, str]]:
    reader = csv.DictReader(io.StringIO(fetch_text(GERMAN_NOUNS_URL)))
    lookup: dict[str, dict[str, str]] = {}
    for row in reader:
        lemma = clean_text(row.get("lemma"))
        nominative = clean_text(row.get("nominativ singular")) or clean_text(row.get("nominativ singular 1"))
        surface = nominative or lemma
        if not surface or surface.startswith("-"):
            continue
        genus_code = ""
        for field in ("genus", "genus 1", "genus 2", "genus 3", "genus 4"):
            value = clean_text(row.get(field))
            if value in {"m", "f", "n"}:
                genus_code = value
                break
        if not genus_code:
            continue
        gender = {"m": "masculine", "f": "feminine", "n": "neuter"}[genus_code]
        article = ARTICLE_BY_GENDER[gender]
        lookup.setdefault(surface.casefold(), {"word": surface, "gender": gender, "article": article})
    return lookup


@lru_cache(maxsize=1)
def german_dictionary_lookup() -> dict[str, Any]:
    return json.loads(fetch_text(GERMAN_DICT_URL))


@lru_cache(maxsize=1)
def german_pronunciations() -> dict[str, Any]:
    return json.loads(fetch_text(GERMAN_PRONUNCIATION_URL))


def german_translation(word: str) -> str:
    dictionary = german_dictionary_lookup()
    for key in (word, word.casefold(), word[:1].upper() + word[1:]):
        if key in dictionary:
            value = dictionary[key]
            if isinstance(value, list):
                value = value[0]
            return clean_text(str(value))
    return ""


def german_pronunciation(word: str) -> str:
    pronunciations = german_pronunciations()
    for key in (word.casefold(), word, word[:1].upper() + word[1:]):
        if key in pronunciations:
            value = pronunciations[key]
            if isinstance(value, list):
                value = value[0]
            return clean_text(str(value))
    return ""


def german_part_of_speech(word: str, english: str, noun_meta: dict[str, str] | None) -> str:
    lower = word.casefold()
    if lower in GERMAN_ARTICLE_INFO:
        return "article"
    if lower in GERMAN_ARTICLE_FORMS:
        return "article"
    if noun_meta:
        return "noun"

    inferred = normalize_pos_from_english("noun", english)
    if inferred != "noun":
        return inferred

    gloss = primary_english(english).lower()
    words = english_word_variants(english)
    if lower in GERMAN_INTERJECTIONS or gloss in GREETING_KEYWORDS:
        return "interjection"
    if lower.endswith(("en", "eln", "ern")) or gloss in GERMAN_VERB_HINTS or words & GERMAN_VERB_HINTS:
        return "verb"
    if gloss in GERMAN_ADVERB_HINTS or words & GERMAN_ADVERB_HINTS or gloss.endswith("ly"):
        return "adverb"
    noun_hints = PEOPLE_KEYWORDS | FOOD_KEYWORDS | TIME_KEYWORDS | TRAVEL_KEYWORDS | SHOPPING_KEYWORDS | HOME_KEYWORDS | WORK_KEYWORDS | HEALTH_KEYWORDS
    if primary_english(english)[:1].isalpha() and primary_english(english)[:1].upper() == primary_english(english)[:1]:
        return "noun"
    if words & noun_hints:
        return "noun"
    if lower.endswith(("ig", "lich", "isch", "sam", "bar", "los", "haft", "voll", "frei")) or gloss in GERMAN_ADJECTIVE_HINTS or words & GERMAN_ADJECTIVE_HINTS:
        return "adjective"
    return "adjective"


def zh_word_records(ranks: list[int]) -> list[WordRecord]:
    existing = zh_existing_words()
    words = zh_candidates(existing)[: len(ranks)]
    englishes = translator_pool.translate_batch(words, source="zh-CN", target="en")
    templates: list[str] = []
    normalized_words: list[tuple[str, str, str]] = []

    for word, raw_english in zip(words, englishes):
        override = ZH_WORD_OVERRIDES.get(word, {})
        english = override.get("english", clean_text(raw_english))
        pos = override.get("partOfSpeech", normalize_pos_from_english(zh_part_of_speech(word), english))
        template = override.get("exampleEn", english_example_template(english, pos, word))
        templates.append(template)
        normalized_words.append((word, english, pos))

    translated_examples = translator_pool.translate_batch(templates, source="en", target="zh-CN")
    records: list[WordRecord] = []

    for rank, (word, english, pos), example_en, example_zh in zip(ranks, normalized_words, templates, translated_examples):
        override = ZH_WORD_OVERRIDES.get(word, {})
        example_en = override.get("exampleEn", example_en)
        example_zh = override.get("exampleZh", example_zh)
        if not contains_native_word("zh", word, example_zh):
            example_zh, example_en = manual_zh_example(word, english, pos)

        payload = {
            "rank": rank,
            "chinese": word,
            "characters": word,
            "pinyin": " ".join(lazy_pinyin(word, style=Style.TONE)),
            "english": primary_english(english, pos),
            "pronunciation": "-".join(lazy_pinyin(word)),
            "partOfSpeech": pos,
            "exampleZh": example_zh,
            "exampleEn": example_en,
            "group": get_group(rank),
            "topic": override.get("topic", guess_topic(english, pos)),
        }
        records.append(WordRecord(rank=rank, payload=payload))

    return records


def th_word_records(ranks: list[int]) -> list[WordRecord]:
    existing = th_existing_words()
    words = th_candidates(existing)[: len(ranks)]
    englishes = translator_pool.translate_batch(words, source="th", target="en")
    templates: list[str] = []
    normalized_words: list[tuple[str, str, str]] = []

    for word, raw_english in zip(words, englishes):
        override = TH_WORD_OVERRIDES.get(word, {})
        english = override.get("english", clean_text(raw_english))
        pos = override.get("partOfSpeech", normalize_pos_from_english(th_part_of_speech(word), english))
        template = override.get("exampleEn", english_example_template(english, pos, word))
        templates.append(template)
        normalized_words.append((word, english, pos))

    translated_examples = translator_pool.translate_batch(templates, source="en", target="th")
    records: list[WordRecord] = []

    for rank, (word, english, pos), example_en, example_th in zip(ranks, normalized_words, templates, translated_examples):
        override = TH_WORD_OVERRIDES.get(word, {})
        example_en = override.get("exampleEn", example_en)
        example_th = override.get("exampleTh", example_th)
        if not contains_native_word("th", word, example_th):
            example_th, example_en = manual_th_example(word, english, pos)

        transliteration = clean_text(romanize(word))
        payload = {
            "rank": rank,
            "thai": word,
            "transliteration": transliteration,
            "english": primary_english(english, pos),
            "pronunciation": transliteration,
            "partOfSpeech": pos,
            "exampleTh": example_th,
            "exampleEn": example_en,
            "group": get_group(rank),
            "topic": override.get("topic", guess_topic(english, pos)),
        }
        records.append(WordRecord(rank=rank, payload=payload))

    return records


def de_word_records(ranks: list[int]) -> list[WordRecord]:
    existing = de_existing_words()
    candidates = de_candidates(existing)
    nouns = german_nouns_lookup()

    accepted: list[tuple[str, dict[str, str] | None, str, str, dict[str, str]]] = []
    seen_surface = set(existing)

    for candidate in candidates:
        override = GERMAN_WORD_OVERRIDES.get(candidate.casefold())
        raw_translation = override.get("english", "") if override else german_translation(candidate)
        if not raw_translation:
            raw_translation = translator_pool.translate_text(candidate, source="de", target="en")
        if not raw_translation:
            continue

        noun_meta = None
        if not override:
            candidate_pos = german_part_of_speech(candidate, raw_translation, None)
            noun_candidate = nouns.get(candidate.casefold())
            if noun_candidate and (candidate[:1].isupper() or candidate_pos == "noun"):
                noun_meta = noun_candidate

        surface = noun_meta["word"] if noun_meta else candidate
        lowered = surface.casefold()
        if lowered in seen_surface:
            continue

        if noun_meta and not override:
            raw_translation = german_translation(surface) or raw_translation

        if surface == candidate and raw_translation[:1].isalpha() and raw_translation[:1].upper() == raw_translation[:1] and not noun_meta and not override:
            continue

        pos = override.get("partOfSpeech") if override else german_part_of_speech(surface, raw_translation, noun_meta)
        accepted.append((surface, noun_meta, raw_translation, pos, override or {}))
        seen_surface.add(lowered)
        if len(accepted) == len(ranks):
            break

    if len(accepted) < len(ranks):
        raise RuntimeError(f"Only generated {len(accepted)} German records for {len(ranks)} requested ranks.")

    english_templates = [
        override.get("exampleEn", english_example_template(raw_translation, pos, surface))
        for surface, _, raw_translation, pos, override in accepted
    ]
    translated_examples = translator_pool.translate_batch(english_templates, source="en", target="de")

    records: list[WordRecord] = []
    for rank, (surface, noun_meta, raw_translation, pos, override), example_en, example_de in zip(ranks, accepted, english_templates, translated_examples):
        article = noun_meta["article"] if noun_meta else override.get("article")
        gender = noun_meta["gender"] if noun_meta else override.get("gender") or GERMAN_ARTICLE_INFO.get(surface.casefold(), ("article", GERMAN_ARTICLE_FORMS.get(surface.casefold())))[1]
        if override.get("exampleDe"):
            example_de = override["exampleDe"]
        if override.get("exampleEn"):
            example_en = override["exampleEn"]
        if pos == "article" and not override.get("exampleDe"):
            example_de, example_en = german_manual_example(surface, raw_translation, pos, article, gender)
        if not contains_native_word("de", surface, example_de):
            example_de, example_en = german_manual_example(surface, raw_translation, pos, article, gender)

        english = primary_english(raw_translation, pos)
        payload: dict[str, Any] = {
            "rank": rank,
            "german": surface,
            "english": english,
            "pronunciation": german_pronunciation(surface),
            "partOfSpeech": pos,
            "exampleDe": example_de,
            "exampleEn": example_en,
            "group": get_group(rank),
            "topic": override.get("topic", guess_topic(english, pos)),
        }
        if pos == "noun" and article and gender:
            payload["article"] = article
            payload["gender"] = gender
        elif pos == "article" and gender:
            payload["gender"] = gender
        records.append(WordRecord(rank=rank, payload=payload))

    return records


def missing_ranks(lang: str) -> list[int]:
    words_dir = CONTENT_DIR / lang / "words"
    present = {int(path.stem.split("-")[1]) for path in words_dir.glob("word-*.json")}
    return [rank for rank in range(1, 1001) if rank not in present]


def write_records(lang: str, records: list[WordRecord], overwrite: bool) -> None:
    words_dir = CONTENT_DIR / lang / "words"
    words_dir.mkdir(parents=True, exist_ok=True)
    for record in records:
        path = words_dir / f"word-{record.rank:03d}.json"
        if path.exists() and not overwrite:
            continue
        path.write_text(json.dumps(record.payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate_for_language(lang: str, limit: int | None, overwrite: bool) -> list[WordRecord]:
    ranks = missing_ranks(lang)
    if limit is not None:
        ranks = ranks[:limit]

    if not ranks:
        return []

    if lang == "zh":
        records = zh_word_records(ranks)
    elif lang == "de":
        records = de_word_records(ranks)
    elif lang == "th":
        records = th_word_records(ranks)
    else:
        raise ValueError(f"Unsupported language: {lang}")

    write_records(lang, records, overwrite=overwrite)
    return records


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate missing word JSON files for the unified language academy.")
    parser.add_argument("--lang", nargs="+", choices=SUPPORTED_LANGS, default=list(SUPPORTED_LANGS))
    parser.add_argument("--limit", type=int, default=None, help="Only generate the first N missing words per language.")
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    for lang in args.lang:
        records = generate_for_language(lang, limit=args.limit, overwrite=args.overwrite)
        print(f"{lang}: generated {len(records)} word files")
        for record in records[:3]:
            print(json.dumps(record.payload, ensure_ascii=False))


if __name__ == "__main__":
    main()
