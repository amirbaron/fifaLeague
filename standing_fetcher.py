from __future__ import print_function
import boto3
from boto3.dynamodb.conditions import Key, Attr
import json
from collections import defaultdict
import decimal

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

def covert_info(info):
    return defaultdict(int, {
        'teamId': int(info['teamId']),
        'stars': int(info['stars']),
        'crestUrl': info['crestUrl'],
        'name': info['name'],
        'user': 'computer' if 'user' not in info else info['user']
        })




    

