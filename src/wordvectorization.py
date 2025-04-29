from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load your custom or novel BERT model
MODEL_NAME = 'bert-base-uncased'  # Change this to any other BERT variant
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

def get_embedding(text, max_length=128, pooling='mean'):
    """
    Convert text to embedding using a custom BERT model.

    Parameters:
    - text: str
    - max_length: int, tokenizer max length
    - pooling: 'mean' or 'cls', pooling strategy

    Returns:
    - numpy array of embedding
    """
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True, max_length=max_length)
    with torch.no_grad():
        outputs = model(**inputs)

    if pooling == 'cls':
        return outputs.last_hidden_state[:, 0, :].squeeze().numpy()
    elif pooling == 'mean':
        attention_mask = inputs['attention_mask']
        embeddings = outputs.last_hidden_state
        mask = attention_mask.unsqueeze(-1).expand(embeddings.size()).float()
        masked_embeddings = embeddings * mask
        summed = masked_embeddings.sum(1)
        summed_mask = mask.sum(1)
        mean_pooled = summed / torch.clamp(summed_mask, min=1e-9)
        return mean_pooled.squeeze().numpy()
    else:
        raise ValueError("Invalid pooling type. Choose 'mean' or 'cls'.")

def rank_groups(input_text, groups):
    input_embedding = get_embedding(input_text)
    group_embeddings = [[get_embedding(text) for text in group] for group in groups]

    group_scores = [
        sum(cosine_similarity([input_embedding], group)[0]) / len(group)
        for group in group_embeddings
    ]

    ranked_groups = sorted(
        zip(groups, group_scores), key=lambda x: x[1], reverse=True
    )
    return ranked_groups

def best_match(input_text, descriptions):
    if not descriptions:
        return None
    input_embedding = get_embedding(input_text)
    desc_embeddings = np.array([get_embedding(text) for text in descriptions])
    similarities = cosine_similarity([input_embedding], desc_embeddings)[0]
    return similarities.argmax()

def top_matches(input_text, descriptions, top_n=10):
    if not descriptions:
        return []

    input_embedding = get_embedding(input_text)
    desc_embeddings = np.array([get_embedding(text) for text in descriptions])
    similarities = cosine_similarity([input_embedding], desc_embeddings)[0]
    top_indices = similarities.argsort()[-top_n:][::-1]
    return [(idx, similarities[idx]) for idx in top_indices]

def main(input_text=None, groups=None):
    if input_text is None:
        input_text = "Group meeting with friends after a long time."
    if groups is None:
        groups = [
            ["Coffee shop great for catching up with friends.", "I love meeting friends at cafes."],
            ["Had a great time with family at the park.", "Family gatherings are always fun."],
            ["Work meeting was productive and engaging.", "Team meetings can be very effective."],
            ["Had a wonderful time with friends at the beach.", "Beach outings are the best with friends."],
            ["Enjoyed a lovely dinner with family.", "Family dinners are always special."],
            ["Caught up with old friends over lunch.", "Lunch with friends is always enjoyable."],
            ["Had a fun day out with colleagues.", "Colleagues make work more enjoyable."],
            ["I can't believe how much I struggled with this.", "Learning AI takes time."]
        ]

    print("Custom BERT Vectorization Example")
    print("Comparing input text with groups of texts...")

    ranked_groups = rank_groups(input_text, groups)
    top_10_groups = ranked_groups[:10]

    for rank, (group, score) in enumerate(top_10_groups, start=1):
        print(f"Rank {rank}: Score {score:.2f}, Texts: {group}")

    return top_10_groups

if __name__ == "__main__":
    main()
