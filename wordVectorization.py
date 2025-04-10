#very simple example of word vectorization using sentence transformers
#pip install sentence-transformers
#compares the similarity of a given text with groups of texts and ranks them based on similarity scores

from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

# Input text and groups of texts
input_text = "Group meeting with friends after a long time."
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

# Generate embeddings
input_embedding = model.encode(input_text)
group_embeddings = [[model.encode(text) for text in group] for group in groups]

# Calculate average similarity scores for each group
from sklearn.metrics.pairwise import cosine_similarity

group_scores = [sum(cosine_similarity([input_embedding], group)[0]) / len(group) for group in group_embeddings]

# Rank groups by similarity
ranked_groups = sorted(zip(groups, group_scores), key=lambda x: x[1], reverse=True)

# Output ranked groups
for rank, (group, score) in enumerate(ranked_groups, start=1):
    print(f"Rank {rank}: Score {score:.2f}, Texts: {group}")
