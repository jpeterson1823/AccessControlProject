#!/usr/bin/env python3

import json

# load data into dictionary
json_file = "./lottery-mega-millions-winning-numbers.json"
json_data = json.loads(open(json_file, 'r').read())

# extract last 4 columns of data. that contains the info we want.
data = [x[-4:] for x in json_data['data']]

# clean the dates into YYYY-MM-DD format
for i in range(len(data)):
    data[i][0] = data[i][0][:10]


# structure each entry list into MySQL value syntax
data = [ f'("{entry[0]}","{entry[1]}","{entry[2]}","{entry[3]}")' for entry in data]
print(f'Data Structured like so: {data[0]}')

# join each entry into a single string delimited by newlines
csv = ',\n'.join(data)

# add semicolon to end of last entry
csv += ';'

# store cleaned data in a text file
with open("cleaned-lotto.txt", 'w+') as f:
    f.write(csv)
print("Cleaned Data. Stored in ./cleaned-lotto.txt")
