import React, { Component } from "react";

class Match extends Component {
  // matchId,
  //           season,
  //           homeTeamScore,
  //           awayTeamId,
  //           homeTeamId,
  //           homeTeamStars,
  //           awayTeamStars,
  //           homeTeamName,
  //           awayTeamName,
  //           homeTeamCrestUrl,
  //           awayTeamCrestUrl,
  //           homeTeamUser,
  //           awayTeamUser,

  render() {
    let result = 0;
    if (this.props.result === 'home'){
      result = 1;
    }
    else if (this.props.result === 'away'){
      result = 2;
    }else if (this.props.result === 'draw'){
      result = 0;
    }else{
      result = "-";
    }
    let homeTeamNameClass = "match-team-name";
    let awayTeamNameClass = "match-team-name";
    if (result == 1){
      homeTeamNameClass += " bold"
    }
    if (result == 2){
      awayTeamNameClass += " bold"
    }
    return (
      <div className="match-container">
        <div className="match-round">
          Round {this.props.round}
        </div>
        <div className="badge">
          <img src={this.props.homeTeamCrestUrl} alt={this.props.homeTeamName} />
        </div>
        <div className={homeTeamNameClass}>
          {this.props.homeTeamName}
        </div>
        <div className="match-score">
          {result}
        </div>
        <div className="badge">
          <img src={this.props.awayTeamCrestUrl} alt={this.props.awayTeamName} />
        </div>
        <div className={awayTeamNameClass}>
          {this.props.awayTeamName}
        </div>
      </div>
    );
  }
}

export default Match;
