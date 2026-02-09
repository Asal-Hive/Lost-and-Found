import math
import re
from dataclasses import dataclass
from typing import Dict, List, Tuple, Iterable, Optional

# --- Minimal Persian/English normalization & tokenization ---

_ARABIC_TO_PERSIAN = str.maketrans({
    "ي": "ی",
    "ك": "ک",
    "ة": "ه",
    "أ": "ا",
    "إ": "ا",
    "ؤ": "و",
    "ئ": "ی",
})

_PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
_EN_DIGITS = "0123456789"
_DIGIT_MAP = str.maketrans({p: e for p, e in zip(_PERSIAN_DIGITS, _EN_DIGITS)})

# Very small bilingual stopword lists (keep it short; we want recall)
STOPWORDS_FA = {
    "و", "یا", "از", "به", "در", "با", "برای", "این", "اون", "آن", "یک", "هم", "را", "که",
    "روی", "کنار", "نزدیک", "حدود", "لطفا", "لطفاً", "میشه", "می‌شه", "میخوام", "می‌خوام",
    "گم", "گمشده", "پیدا", "پیدا شده", "پیداشده",
}
STOPWORDS_EN = {
    "the", "a", "an", "and", "or", "to", "in", "on", "at", "of", "for", "with",
    "please", "lost", "found",
}

_TOKEN_RE = re.compile(r"[A-Za-z0-9\u0600-\u06FF]+", re.UNICODE)


def normalize_text(text: str) -> str:
    if not text:
        return ""
    t = text.strip()
    t = t.translate(_ARABIC_TO_PERSIAN)
    t = t.translate(_DIGIT_MAP)
    # normalize half-space variants
    t = t.replace("\u200c", " ")
    # lowercase English
    t = t.lower()
    return t


def tokenize(text: str) -> List[str]:
    t = normalize_text(text)
    tokens = _TOKEN_RE.findall(t)
    out = []
    for tok in tokens:
        tok = tok.strip()
        if not tok:
            continue
        # remove very short tokens
        if len(tok) <= 1:
            continue
        if tok in STOPWORDS_FA or tok in STOPWORDS_EN:
            continue
        out.append(tok)
    return out


@dataclass
class Doc:
    item_id: int
    title: str
    status: str
    location_name: str
    text: str   # combined text for retrieval


class TfidfIndex:
    def __init__(self) -> None:
        self.N: int = 0
        self.df: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.doc_vecs: Dict[int, Dict[str, float]] = {}
        self.doc_norm: Dict[int, float] = {}
        self.docs: Dict[int, Doc] = {}

    def build(self, docs: Iterable[Doc]) -> None:
        docs = list(docs)
        self.docs = {d.item_id: d for d in docs}
        self.N = len(docs)
        self.df.clear()
        self.idf.clear()
        self.doc_vecs.clear()
        self.doc_norm.clear()

        # DF
        for d in docs:
            seen = set(tokenize(d.text))
            for tok in seen:
                self.df[tok] = self.df.get(tok, 0) + 1

        # IDF (smooth)
        for tok, df in self.df.items():
            self.idf[tok] = math.log((self.N + 1) / (df + 1)) + 1.0

        # TF-IDF vectors
        for d in docs:
            tf: Dict[str, int] = {}
            for tok in tokenize(d.text):
                tf[tok] = tf.get(tok, 0) + 1
            vec: Dict[str, float] = {}
            for tok, c in tf.items():
                if tok in self.idf:
                    vec[tok] = (1.0 + math.log(c)) * self.idf[tok]
            self.doc_vecs[d.item_id] = vec
            self.doc_norm[d.item_id] = math.sqrt(sum(v * v for v in vec.values())) or 1.0

    def query_vec(self, query: str) -> Tuple[Dict[str, float], float]:
        tf: Dict[str, int] = {}
        for tok in tokenize(query):
            tf[tok] = tf.get(tok, 0) + 1
        vec: Dict[str, float] = {}
        for tok, c in tf.items():
            if tok in self.idf:
                vec[tok] = (1.0 + math.log(c)) * self.idf[tok]
        norm = math.sqrt(sum(v * v for v in vec.values())) or 1.0
        return vec, norm

    def cosine(self, qvec: Dict[str, float], qnorm: float, doc_id: int) -> float:
        dvec = self.doc_vecs.get(doc_id, {})
        dnorm = self.doc_norm.get(doc_id, 1.0)
        if not dvec:
            return 0.0
        # dot product on intersection
        dot = 0.0
        for tok, w in qvec.items():
            if tok in dvec:
                dot += w * dvec[tok]
        return dot / (qnorm * dnorm)

    def search(self, query: str, top_k: int = 5) -> List[Tuple[int, float]]:
        qvec, qnorm = self.query_vec(query)
        scores: List[Tuple[int, float]] = []
        for item_id in self.docs.keys():
            s = self.cosine(qvec, qnorm, item_id)
            scores.append((item_id, s))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores[:top_k]


def apply_rules(query: str, doc: Doc, base_score: float) -> float:
    """
    Very small rule-based boosts:
    - if query hints lost/found, prefer matching item.status
    - if query mentions location_name tokens, boost
    """
    q = normalize_text(query)

    boost = 0.0

    # Status hint
    wants_lost = ("گمشده" in q) or ("گم" in q) or ("lost" in q)
    wants_found = ("پیدا" in q) or ("پیداشده" in q) or ("found" in q)

    if wants_lost and doc.status == "lost":
        boost += 0.08
    if wants_found and doc.status == "found":
        boost += 0.08

    # Location overlap boost
    q_toks = set(tokenize(q))
    loc_toks = set(tokenize(doc.location_name))
    if loc_toks:
        overlap = len(q_toks & loc_toks)
        if overlap >= 1:
            boost += min(0.05 * overlap, 0.10)

    return base_score + boost
