from __future__ import print_function
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
from collections import defaultdict
import decimal
from games_db import get_matches_for_round
import random

print('Loading function')


def handler(event, context):
    '''Provide an event that contains the following keys:

      - operation: one of the operations in the operations dict below
      - tableName: required for operations that interact with DynamoDB
      - payload: a parameter to pass to the operation being performed
    '''
    # print("Received event: " + json.dumps(event, indent=2))
    season = int(event['season'])
    op = event['op']
    if op == 'standing':
        return query_standing(season)
    if op == 'matches':
        return get_matches(season)
    if op == 'next_round':
        return simulate_next_round(season)
    if op == 'clear_matches':
        return clear_matches()
    return None

def query_standing(season):
    
    dynamodb = boto3.resource('dynamodb')

    basic_info_by_team_id = get_teams_info()
    
    table = dynamodb.Table('SoccerMatches')
    response = table.scan(
        FilterExpression=Attr("season").eq(season)
    )['Items']

    for item in basic_info_by_team_id.values():
        item['points']=0
        item['wins'] = 0
        item['loses'] = 0
        item['draws'] = 0
        item['games'] = 0

    for item in response:
        if item['result'] == 'home':
            basic_info_by_team_id[item['homeTeamId']]['points']+=3
            basic_info_by_team_id[item['homeTeamId']]['wins']+=1
            basic_info_by_team_id[item['awayTeamId']]['loses']+=1

        elif item['result'] == 'away':
            basic_info_by_team_id[item['awayTeamId']]['points']+=3
            basic_info_by_team_id[item['awayTeamId']]['wins']+=1
            basic_info_by_team_id[item['homeTeamId']]['loses']+=1
        else:
            basic_info_by_team_id[item['awayTeamId']]['points']+=1
            basic_info_by_team_id[item['homeTeamId']]['points']+=1
            basic_info_by_team_id[item['awayTeamId']]['draws']+=1
            basic_info_by_team_id[item['homeTeamId']]['draws']+=1
        basic_info_by_team_id[item['homeTeamId']]['games']+=1
        basic_info_by_team_id[item['awayTeamId']]['games']+=1

    res = list(basic_info_by_team_id.values())
    res.sort(key = lambda x: x['points'], reverse=True)    
    return res

def get_teams_info():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('team_info')
    response = table.scan(
    )
    return {int(info['teamId']): covert_info(info) for info in response['Items']}


def get_matches(season):
    dynamodb = boto3.resource('dynamodb')
    basic_info_by_team_id = get_teams_info()
    table = dynamodb.Table('SoccerMatches')
    matches = table.scan(
        FilterExpression=Attr("season").eq(season)
    )['Items']
    results = [convertMatch(match) for match in matches]
    results.sort(key= lambda x: x['round'], reverse=True)
    next_round = int(results[0]['round'])+1 if results else 0
    next_matches = get_next_matches(season, next_round)
    if next_matches:
        results+=next_matches
        results.sort(key= lambda x: x['round'], reverse=True)
    
    for res in results:
        res['homeTeamName'] =  basic_info_by_team_id[res['homeTeamId']]['name']
        res['awayTeamName'] =  basic_info_by_team_id[res['awayTeamId']]['name']
        res['homeTeamCrestUrl'] = basic_info_by_team_id[res['homeTeamId']]['crestUrl']
        res['awayTeamCrestUrl'] = basic_info_by_team_id[res['awayTeamId']]['crestUrl']
        res['homeTeamStars'] = basic_info_by_team_id[res['homeTeamId']]['stars']
        res['awayTeamStars'] = basic_info_by_team_id[res['awayTeamId']]['stars']
        res['homeTeamUser'] = basic_info_by_team_id[res['homeTeamId']]['user']
        res['awayTeamUser'] = basic_info_by_team_id[res['awayTeamId']]['user']

    return results
        

def convertMatch(match):
    return {
     "matchId": match['matchId'],
     "round": int(match["round"]),
     "season": int(match["season"]),
     "result": match["result"],
     "awayTeamId": int(match["awayTeamId"]),
     "homeTeamId": int(match["homeTeamId"]),
     
    }

def get_next_matches(season, next_round):

    if next_round >= 37:
        return None

    next_round_matches = get_matches_for_round(next_round)
    basic_info_by_team_id = get_teams_info()
    for match in next_round_matches:
        match['season'] = season
        match['result'] = "-"
        match['matchId'] = str(match['homeTeamId']) + str(match['awayTeamId'])
        match['homeTeamName'] =  basic_info_by_team_id[match['homeTeamId']]['name']
        match['awayTeamName'] =  basic_info_by_team_id[match['awayTeamId']]['name']
        match['homeTeamCrestUrl'] = basic_info_by_team_id[match['homeTeamId']]['crestUrl']
        match['awayTeamCrestUrl'] = basic_info_by_team_id[match['awayTeamId']]['crestUrl']
        match['homeTeamStars'] = basic_info_by_team_id[match['homeTeamId']]['stars']
        match['awayTeamStars'] = basic_info_by_team_id[match['awayTeamId']]['stars']
        match['homeTeamUser'] = basic_info_by_team_id[match['homeTeamId']]['user']
        match['awayTeamUser'] = basic_info_by_team_id[match['awayTeamId']]['user']
    return next_round_matches


def covert_info(info):
    return defaultdict(int, {
        'teamId': int(info['teamId']),
        'stars': int(info['stars']),
        'crestUrl': info['crestUrl'],
        'name': info['name'],
        'user': 'computer' if 'user' not in info else info['user']
        })

def simulate_next_round(season):
    all_matches = get_matches(season)
    next_round = int(all_matches[0]['round']) if all_matches else 0
    next_matches = get_next_matches(season, next_round)
    if next_matches == None:
        raise Exception("Season is over")
    basic_info_by_team_id = get_teams_info()
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('SoccerMatches')
    with table.batch_writer() as batch:
        for match in next_matches:
            winner = decide_on_winner(basic_info_by_team_id[match['homeTeamId']]['stars'], basic_info_by_team_id[match['awayTeamId']]['stars'])
            match['result']= winner
            match['round'] = str(match['round'])
            batch.put_item(
                Item=match
            )
    return next_matches


def clear_matches():
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('SoccerMatches')
    scan = table.scan()
    with table.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key={'matchId':each['matchId'], 'round':str(each['round'])})


def decide_on_winner(home_team_strength, away_team_strength):
    home_team_strength = home_team_strength*1.2
    home_team_prob = home_team_strength/(home_team_strength+away_team_strength)
    away_team_prob = away_team_strength/(home_team_strength+away_team_strength)
    random.seed()
    if random.random() < home_team_prob:
        if random.random() <away_team_prob*0.2:
            return "draw"
        return "home"
    else:
        if random.random() < home_team_prob*0.2:
            return "draw"
        return "away"
    

