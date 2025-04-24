from midpoint_finder import calculate_midpoint, find_nearby
from wordvectorization import rank_groups
import argparse
import requests

def getNearby(arr=None):
    if(arr is None):
        arr = [(37.7749, -122.4194), (34.0522, -118.2437), (40.7128, -74.0060)]
    midpoint = calculate_midpoint(arr)
    s = find_nearby(midpoint[0], midpoint[1])
    for i in s:
        print("hi")
        print(f" - {i['name']} at ({i['lat']:.6f}, {i['lon']:.6f})")
    print(f"Midpoint: ({midpoint[0]:.6f}, {midpoint[1]:.6f})")
    return s

def wordVectorization(input_text=None, groups=None):
    if input_text is None:
        input_text = "Group meeting with friends after a long time."
    
    if groups is None:
        groups = []
        groups.append(["Coffee shop great for catching up with friends.", "I love meeting friends at cafes."])
        groups.append(["Had a great time with family at the park.", "Family gatherings are always fun."])
        groups.append(["Work meeting was productive and engaging.", "Team meetings can be very effective."])
        groups.append(["Had a wonderful time with friends at the beach.", "Beach outings are the best with friends."])
        groups.append(["Enjoyed a lovely dinner with family.", "Family dinners are always special."])
        groups.append(["Caught up with old friends over lunch.", "Lunch with friends is always enjoyable."])
        groups.append(["Had a fun day out with colleagues.", "Colleagues make work more enjoyable."])
        groups.append(["I can't believe how much I struggled with this.", "Learning AI takes time."])
        groups.append(["Exploring new places is always exciting.", "Traveling opens up new perspectives."])
        groups.append(["Reading books can be a great escape.", "Books transport you to different worlds."])
    

    ranked_groups = rank_groups(input_text, groups)
    top_10_groups = ranked_groups[:10]
    count = 0
    for rank, (group, score) in enumerate(ranked_groups, start=1):
        print(f"Rank {rank}: Score {score:.2f}, Texts: {group}")
        count += 1
        if count == 10:
            break
    return top_10_groups


getNearby([(37.7749, -122.4194), (34.0522, -118.2437), (40.7128, -74.0060)])