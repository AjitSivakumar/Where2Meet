import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, model_name: str = 'sentence-transformers/all-MiniLM-L6-v2'):
        self.model_name = model_name
        self._model: Optional[object] = None
    
    def _load_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
            logger.info(f"Loaded AI model: {self.model_name}")
        return self._model

    def rank_venues(self, query: str, venues: List[Dict]) -> List[Dict]:
        if not venues:
            return []
        model = self._load_model()
        texts = [query] + [v.get('name', '') + ' ' + v.get('category', '') for v in venues]
        embs = model.encode(texts, convert_to_tensor=False)
        q = embs[0]
        scores = []
        for i, v in enumerate(venues, start=1):
            score = float((q @ embs[i]) / ((q @ q) ** 0.5 * (embs[i] @ embs[i]) ** 0.5 + 1e-9))
            v2 = dict(v)
            v2['score'] = score
            scores.append(v2)
        return sorted(scores, key=lambda x: x['score'], reverse=True)
