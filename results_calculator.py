from __future__ import print_function
import random
import boto3
import json

print('Loading function')


def handler(event, context):
    '''Provide an event that contains the following keys:

      - operation: one of the operations in the operations dict below
      - tableName: required for operations that interact with DynamoDB
      - payload: a parameter to pass to the operation being performed
    '''
    print("Received event: " + json.dumps(event, indent=2))

    home_team_strength = event['home_team_strength']
    away_team_strength = event['away_team_strength']

    return str(decide_on_winner(float(home_team_strength), float(away_team_strength)))



def decide_on_winner(home_team_strength, away_team_strength):
    home_team_strength = home_team_strength*1.2
    home_team_prob = home_team_strength/(home_team_strength+away_team_strength)
    away_team_prob = away_team_strength/(home_team_strength+away_team_strength)
    random.seed()
    if random.random() < home_team_prob:
        if random.random() <away_team_prob*0.2:
            return "Draw"
        return "Home"
    else:
        if random.random() < home_team_prob*0.2:
            return "Draw"
        return "Away"
