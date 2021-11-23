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
    if (this.props.result == 'home'){
      result = 1;
    }
    else if (this.props.result == 'away'){
      result = 2;
    }
    return (
      <div className="match-container">
        <div className="badge">
          <img src={this.props.homeTeamCrestUrl} alt={this.props.homeTeamName} />
        </div>
        <div className="match-team-name">
          {this.props.homeTeamName}
        </div>
        <div className="match-score">
          {result}
        </div>
        <div className="badge">
          <img src={this.props.awayTeamCrestUrl} alt={this.props.awayTeamName} />
        </div>
        <div className="match-team-name">
          {this.props.awayTeamName}
        </div>
      </div>
    );
  }
}

export default Match;
