# very simple example of word vectorization using sentence transformers
# pip install sentence-transformers
# compares the similarity of a given text with groups of texts and ranks them based on similarity scores

from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')

# Input text and groups of texts

def rank_groups(input_text, groups):
    """
    Rank groups of texts based on their similarity to the input text.
    
    Parameters:
    - input_text: str, the text to compare against
    - groups: list of lists, each containing texts to compare
    
    Returns:
    - ranked_groups: list of tuples (group, score), sorted by score
    """
    # Encode the input text and the groups of texts
    input_embedding = model.encode(input_text)
    group_embeddings = [[model.encode(text) for text in group] for group in groups]

    from sklearn.metrics.pairwise import cosine_similarity
    # Compute average similarity per group
    group_scores = [
        sum(cosine_similarity([input_embedding], group)[0]) / len(group)
        for group in group_embeddings
    ]

    ranked_groups = sorted(
        zip(groups, group_scores), key=lambda x: x[1], reverse=True
    )

    return ranked_groups


def main(input_text=None, groups=None):
    # set defaults if not provided
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

    print("Word Vectorization Example")
    print("Comparing input text with groups of texts...")

    ranked_groups = rank_groups(input_text, groups)
    top_10_groups = ranked_groups[:10]

    for rank, (group, score) in enumerate(top_10_groups, start=1):
        print(f"Rank {rank}: Score {score:.2f}, Texts: {group}")

    return top_10_groups


if __name__ == "__main__":
    main()
