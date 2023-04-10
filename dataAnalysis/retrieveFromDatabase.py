from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd

import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# db_url = "sqlite:///participants.db"

db_url = "postgres://yedquxjthgznhe:f3e80b2076af073665b5e92060d10e7a44a92950e0bd320cbbbfafd19aebec87@ec2-18-215-96-22.compute-1.amazonaws.com:5432/d4h9241gbq04v1"

table_name = 'exp1_driftToMiddle_timeDelay5s_freezeWindow'


data_column_name = 'datastring'
# boilerplace sqlalchemy setup
engine = create_engine(db_url)
metadata = MetaData()
metadata.bind = engine
table = Table(table_name, metadata, autoload=True)

# make a query and loop through
s = table.select()
rows = s.execute()

data = []
#status codes of subjects who completed experiment
statuses = [3,4,5,7]
modes = 'live' # live/debug
# modes = 'debug' # live/debug

# if you have workers you wish to exclude, add them here
exclude = []
for row in rows:
    # only use subjects who completed experiment and aren't excluded
    if row['status'] in statuses and row['uniqueid'] not in exclude and row['mode']==modes:
        data.append(row[data_column_name])

# parse each participant's datastring as json object
# and take the 'data' sub-object

# data = [json.loads(eachSubjData)['data'] for eachSubjData in data]
data = [json.loads(eachSubjData)['data'] for eachSubjData in data if eachSubjData]

# insert uniqueid field into trialdata in case it wasn't added
# in experiment:
for part in data:
    for record in part:
        record['trialdata']['uniqueid'] = record['uniqueid']

# flatten nested list so we just have a list of the trialdata recorded
# each time psiturk.recordTrialData(trialdata) was called.
data = [record['trialdata'] for part in data for record in part]

# Put all subjects' trial data into a dataframe object from the
# 'pandas' python library: one option among many for analysis
data_frame = pd.DataFrame(data)
print(data_frame)
print('numOfSubj:', len(data_frame.uniqueid.unique()))

fileName = table_name + '_data.csv'
data_frame.to_csv(fileName)
