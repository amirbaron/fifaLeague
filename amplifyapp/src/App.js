import React, { useState, useEffect } from "react";
import "./App.css";
import Standing from "./components/Standings";
import Match from "./components/Matches";
const App = () => {
  const [standing, setStanding] = useState([]);
  const [matches, setMatches] = useState([]);
  const [round, setRound] = useState(-1);
  useEffect(() => {
    fetchTeamsData(setStanding);
  }, [round]);
  useEffect(() => {
    fetchMatches(setMatches);
  }, [round]);

  const onNextRound = () => {
    const URL =
      "https://joybho7ii7.execute-api.eu-central-1.amazonaws.com/Prod/standing?season=1&op=next_round";
    fetch(URL, {})
      .then((response) => response.json())
      .then((response) => {
        setRound(round + 1);
      })
      .catch(() => alert("Failed to do next round. Maybe season is over?"));
  };
  const onClearMatches = () => {
    const URL =
      "https://joybho7ii7.execute-api.eu-central-1.amazonaws.com/Prod/standing?season=1&op=clear_matches";
    fetch(URL, {})
      .catch(() => alert("Failed to clear table"))
      .then(() => {
        fetchTeamsData(setStanding);
        fetchMatches(setMatches);
      });
  };

  const fetchMatches = (setMatches) => {
    const URL =
      "https://joybho7ii7.execute-api.eu-central-1.amazonaws.com/Prod/standing?season=1&op=matches";

    fetch(URL, {})
      .then((response) => response.json())
      .then((response) => {
        const rows = response.map((item, index) => {
          const {
            matchId,
            season,
            result,
            awayTeamId,
            homeTeamId,
            homeTeamStars,
            awayTeamStars,
            homeTeamName,
            awayTeamName,
            homeTeamCrestUrl,
            awayTeamCrestUrl,
            homeTeamUser,
            awayTeamUser,
            round,
          } = item;

          return {
            round,
            matchId,
            season,
            result,
            awayTeamId,
            homeTeamId,
            homeTeamStars,
            awayTeamStars,
            homeTeamName,
            awayTeamName,
            homeTeamCrestUrl,
            awayTeamCrestUrl,
            homeTeamUser,
            awayTeamUser,
          };
        });
        setMatches([...rows]);
      });
  };

  const fetchTeamsData = (setStanding) => {
    const URL =
      "https://joybho7ii7.execute-api.eu-central-1.amazonaws.com/Prod/standing?season=1&op=standing";

    fetch(URL, {})
      .then((response) => response.json())
      .then((response) => {
        const rows = response.map((item, index) => {
          const {
            name,
            wins,
            draws,
            loses,
            stars,
            user,
            games,
            points,
            crestUrl,
          } = item;

          return {
            position: index + 1,
            playedGames: games,
            won: wins,
            draw: draws,
            lost: loses,
            points: points,
            team: name,
            badge: crestUrl,
            user: user,
            stars,
          };
        });
        setStanding([...rows]);
      });
  };
  return FootbalApp({ standing, matches, round, onNextRound, onClearMatches });
};

const FootbalApp = (props) => {
  const { standing, round, onNextRound, onClearMatches, matches } = {
    ...props,
  };
  let table;

  if (standing.length > 0) {
    table = (
      <thead>
        <tr>
          <td colSpan="9">
            <h2>לה ליגה</h2>
          </td>
        </tr>
        <tr>
          <th className="position">#</th>
          <th className="team" colSpan="2">
            Team
          </th>
          <th className="player">User</th>
          <th className="stars">Stars</th>
          <th className="played">Played</th>
          <th className="won">Won</th>
          <th className="draw">Draw</th>
          <th className="lost">Lost</th>
          <th className="points">Points</th>
        </tr>
      </thead>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <div className="table-responsive mt-5">
          <table className="table">
            {table}
            <tbody>
              {standing.map((standing) => (
                <Standing
                  key={standing.position}
                  position={standing.position}
                  badge={standing.badge}
                  team={standing.team}
                  user={standing.user}
                  played={standing.playedGames}
                  won={standing.won}
                  draw={standing.draw}
                  lost={standing.lost}
                  points={standing.points}
                  stars={standing.stars}
                ></Standing>
              ))}
            </tbody>
          </table>
        </div>

        <div className="control-buttons">
          <div className="play-next-round">
            <button className="play-next-round-button" onClick={onNextRound}>
              Simluate matches for round {round + 2}
            </button>
          </div>
          <div className="clear-matches">
            <button className="clear-matches-button" onClick={onClearMatches}>
              Restart simulation
            </button>
          </div>
        </div>
        <div className="matches-container">
          <h2 reults>Results</h2>
          {matches.map((match) => (
            <Match key={match.id} {...match}></Match>
          ))}
        </div>
      </div>
    </div>
  );
};
export default App;
