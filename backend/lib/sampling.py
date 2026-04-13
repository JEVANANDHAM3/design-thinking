import numpy as np

def sample_objects(objects, n, score_fn, replace=False):
    print(f'{objects=}, {n=}, {replace=}')

    if not objects:
        return []

    n = min(n, len(objects)) if not replace else n

    scores = np.array([score_fn(obj) for obj in objects], dtype=float)

    total = scores.sum()
    if total == 0:
        probs = np.ones_like(scores) / len(scores)
    else:
        probs = scores / total

    indices = np.random.choice(len(objects), size=n, replace=replace, p=probs)
    
    return [objects[i] for i in indices]