import json
import random

random_samples = {
	"documents": []
}

for i in range(200):
	new_sample = {
		"id": "twitter_handle_ayy"+str(i),
		"user": "twitter_handle_ayy"+str(i),
		"type": "activity",
		"vote": random.choice(["true", "false"]),
		"lat": str(random.uniform(56.0, 58.0)),
		"lng": str(random.uniform(21.0, 28.0)),
		"photo_link": "This is my photo!"
	}
	random_samples["documents"].append(new_sample)

print json.dumps(random_samples)